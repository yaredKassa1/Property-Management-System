const { ProcurementWorkflow, Request, AuditLog } = require('../models');

// Two workflow types:
// 'existing_asset': pending_approval → pending_property_officer → completed
// 'new_item':       pending_approval → pending_vp_approval → pending_property_officer
//                   → purchase_notification_sent → pending_qa_inspection → item_ready → completed

const VALID_TRANSITIONS = {
  // existing_asset path
  'pending_approval':            ['pending_property_officer', 'pending_vp_approval', 'rejected'],
  // new_item path
  'pending_vp_approval':         ['pending_property_officer', 'rejected'],
  'pending_property_officer':    ['completed', 'purchase_notification_sent'],
  'purchase_notification_sent':  ['pending_qa_inspection'],
  'pending_qa_inspection':       ['qa_approved', 'qa_rejected'],
  'qa_rejected':                 ['pending_qa_inspection'],
  'qa_approved':                 ['item_ready'],
  'item_ready':                  ['completed'],
  'completed':                   [],
  'rejected':                    []
};

/**
 * Workflow Service
 * Orchestrates procurement workflow state machine
 */
class WorkflowService {
  /**
   * Validate if a state transition is valid
   * @param {string} currentState - Current workflow state
   * @param {string} nextState - Desired next state
   * @returns {boolean} Whether transition is valid
   */
  validateTransition(currentState, nextState) {
    return VALID_TRANSITIONS[currentState]?.includes(nextState) ?? false;
  }

  /**
   * Create a new procurement workflow
   * @param {string} requestId - ID of request
   * @param {string} workflowType - 'existing_asset' or 'new_item'
   * @param {Object} transaction - Database transaction
   * @returns {Promise<Object>} Created workflow
   */
  async createWorkflow(requestId, workflowType = 'new_item', transaction) {
    const workflow = await ProcurementWorkflow.create({
      requestId,
      currentState: 'pending_approval',
      workflowType
    }, { transaction });

    await this.createAuditLog({
      entityType: 'workflow',
      entityId: workflow.id,
      action: 'workflow_created',
      actorId: 'system',
      actorRole: 'system',
      newState: { currentState: 'pending_approval' },
      metadata: { requestId, workflowType },
      transaction
    });

    return workflow;
  }

  /**
   * Process an approval action
   * @param {string} workflowId - ID of workflow
   * @param {Object} action - Approval action details
   * @param {Object} transaction - Database transaction
   * @returns {Promise<Object>} Updated workflow
   */
  async processApproval(workflowId, action, transaction) {
    const { actorId, actorRole, decision, comments, permittedAmount } = action;

    const workflow = await ProcurementWorkflow.findByPk(workflowId, { transaction });
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const previousState = workflow.currentState;
    let nextState;
    const updateData = {};

    // Determine next state based on current state, decision, and workflow type
    switch (workflow.currentState) {
      case 'pending_approval':
        if (decision === 'approve') {
          // existing_asset skips VP and goes straight to property officer
          nextState = workflow.workflowType === 'existing_asset'
            ? 'pending_property_officer'
            : 'pending_vp_approval';
        } else {
          nextState = 'rejected';
        }
        updateData.approvalAuthorityId = actorId;
        updateData.approvalAuthorityDecision = decision;
        updateData.approvalAuthorityComments = comments;
        updateData.approvalAuthorityTimestamp = new Date();
        if (permittedAmount !== undefined && permittedAmount !== null) {
          updateData.permittedAmount = permittedAmount;
        }
        break;

      case 'pending_vp_approval':
        if (decision === 'approve') {
          nextState = 'pending_property_officer';
        } else {
          nextState = 'rejected';
        }
        updateData.vpId = actorId;
        updateData.vpDecision = decision;
        updateData.vpComments = comments;
        updateData.vpTimestamp = new Date();
        break;

      default:
        throw new Error(`Cannot process approval in state: ${workflow.currentState}`);
    }

    // Validate transition
    if (!this.validateTransition(previousState, nextState)) {
      throw new Error(`Invalid state transition from ${previousState} to ${nextState}`);
    }

    // Update workflow
    updateData.currentState = nextState;
    if (nextState === 'completed' || nextState === 'rejected') {
      updateData.completedAt = new Date();
    }

    await workflow.update(updateData, { transaction });

    // Create audit log
    await this.createAuditLog({
      entityType: 'workflow',
      entityId: workflowId,
      action: `${actorRole}_${decision}`,
      actorId,
      actorRole,
      previousState: { currentState: previousState },
      newState: { currentState: nextState },
      metadata: { comments, decision },
      transaction
    });

    return workflow;
  }

  /**
   * Advance workflow to next stage (for system events)
   * @param {string} workflowId - ID of workflow
   * @param {Object} event - Workflow event
   * @param {Object} transaction - Database transaction
   * @returns {Promise<Object>} Updated workflow
   */
  async advanceWorkflow(workflowId, event, transaction) {
    const { type, data, triggeredBy } = event;

    console.log('advanceWorkflow called:', { workflowId, type, data, triggeredBy });

    const workflow = await ProcurementWorkflow.findByPk(workflowId, { transaction });
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    console.log('Current workflow state:', workflow.currentState);

    const previousState = workflow.currentState;
    let nextState;
    const updateData = {};

    switch (type) {
      case 'property_officer_complete':
      case 'property_officer_completed':
        if (workflow.currentState !== 'pending_property_officer') {
          throw new Error('Invalid state for property officer completion');
        }
        // existing_asset: complete directly; new_item: notify purchase dept
        nextState = workflow.workflowType === 'existing_asset'
          ? 'completed'
          : 'purchase_notification_sent';
        updateData.propertyOfficerId = triggeredBy;
        updateData.propertyOfficerTimestamp = new Date();
        if (nextState === 'purchase_notification_sent') {
          updateData.purchaseDepartmentNotifiedAt = new Date();
        }
        if (nextState === 'completed') {
          updateData.completedAt = new Date();
        }
        break;

      case 'item_procured':
        if (workflow.currentState !== 'purchase_notification_sent') {
          throw new Error('Invalid state for item procurement');
        }
        nextState = 'pending_qa_inspection';
        updateData.itemProcuredAt = new Date();
        updateData.procurementDetails = data.procurementDetails;
        break;

      case 'qa_completed':
        if (workflow.currentState !== 'pending_qa_inspection') {
          throw new Error(`Invalid state for QA inspection. Current state: ${workflow.currentState}, expected: pending_qa_inspection`);
        }
        const qaDecision = data.qaDecision || data.decision;
        if (!qaDecision || !['approve', 'reject'].includes(qaDecision)) {
          throw new Error(`Invalid QA decision value: ${qaDecision}. Must be "approve" or "reject"`);
        }
        if (qaDecision === 'approve' || data.decision === 'approve') {
          nextState = 'qa_approved';
        } else {
          nextState = 'qa_rejected';
        }
        if (!triggeredBy) {
          throw new Error('QA inspector ID (triggeredBy) is required');
        }
        updateData.qaInspectorId = triggeredBy;
        updateData.qaDecision = qaDecision;
        updateData.qaComments = data.qaComments || data.comments;
        updateData.qaTimestamp = new Date();
        break;

      case 'item_stored':
        if (workflow.currentState !== 'qa_approved') {
          throw new Error('Invalid state for item storage');
        }
        nextState = 'item_ready';
        break;

      case 'item_collected':
        if (workflow.currentState !== 'item_ready') {
          throw new Error('Invalid state for item collection');
        }
        nextState = 'completed';
        updateData.completedAt = new Date();
        break;

      default:
        throw new Error(`Unknown event type: ${type}`);
    }

    // Validate transition
    if (!this.validateTransition(previousState, nextState)) {
      throw new Error(`Invalid state transition from ${previousState} to ${nextState}`);
    }

    // Update workflow
    updateData.currentState = nextState;
    console.log('Updating workflow with:', updateData);
    await workflow.update(updateData, { transaction });
    console.log('Workflow updated successfully');

    // Create audit log
    await this.createAuditLog({
      entityType: 'workflow',
      entityId: workflowId,
      action: type,
      actorId: triggeredBy || 'system',
      actorRole: 'system',
      previousState: { currentState: previousState },
      newState: { currentState: nextState },
      metadata: data,
      transaction
    });

    return workflow;
  }

  /**
   * Get workflow status with history
   * @param {string} workflowId - ID of workflow
   * @returns {Promise<Object>} Workflow with history
   */
  async getWorkflowStatus(workflowId) {
    const workflow = await ProcurementWorkflow.findByPk(workflowId);
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Get audit history
    const auditLogs = await AuditLog.findAll({
      where: {
        entityType: 'workflow',
        entityId: workflowId
      },
      order: [['timestamp', 'ASC']]
    });

    return {
      ...workflow.toJSON(),
      stateHistory: auditLogs.map(log => ({
        fromState: log.previousState?.currentState,
        toState: log.newState?.currentState,
        action: log.action,
        triggeredBy: log.actorId,
        role: log.actorRole,
        timestamp: log.timestamp,
        metadata: log.metadata
      }))
    };
  }

  /**
   * Create an audit log entry
   * @param {Object} logData - Audit log data
   * @returns {Promise<Object>} Created audit log
   */
  async createAuditLog(logData) {
    const { transaction, entityType, entityId, action, actorId, actorRole, previousState, newState, metadata } = logData;

    return await AuditLog.create({
      userId: actorId !== 'system' ? actorId : null,
      action,
      entityType,
      entityId,
      details: {
        actorRole,
        previousState,
        newState,
        ...(metadata || {})
      },
      timestamp: new Date()
    }, { transaction });
  }
}

module.exports = new WorkflowService();

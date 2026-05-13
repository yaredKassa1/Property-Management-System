const { Request, User, sequelize } = require('../models');
const workflowService = require('./workflowService');
const notificationService = require('./notificationService');
const inventoryService = require('./inventoryService');
const assignmentService = require('./assignmentService');

async function notify({ recipientId, recipientRole, subject, message, requestId }) {
  return notificationService.sendNotification({ recipientId, recipientRole, subject, message, metadata: { requestId } });
}

class ApprovalHandlers {

  async handleApprovalAuthorityAction(workflowId, action) {
    return await sequelize.transaction(async (transaction) => {
      const { actorId, decision, comments, permittedAmount } = action;
      const workflow = await workflowService.processApproval(workflowId, { actorId, actorRole: 'approval_authority', decision, comments, permittedAmount }, transaction);
      const request = await Request.findByPk(workflow.requestId, { transaction });
      const requestor = await User.findByPk(request.requestedBy);
      const requestorName = `${requestor?.firstName || ''} ${requestor?.lastName || ''}`.trim();
      const qtyNote = workflow.permittedAmount && workflow.permittedAmount < request.quantity ? ` (permitted qty: ${workflow.permittedAmount} of ${request.quantity} requested)` : '';

      if (decision === 'approve') {
        if (workflow.workflowType === 'existing_asset') {
          await notify({ recipientRole: 'property_officer', subject: 'Asset Request Approved — Assign Asset', message: `${requestorName} requested "${request.itemName}"${qtyNote}. Approved by Approval Authority. Please assign the asset.`, requestId: request.id });
        } else {
          await notify({ recipientRole: 'vice_president', subject: 'Purchase Request Awaiting Your Approval', message: `${requestorName} requested "${request.itemName}"${qtyNote} (not in store). Approved by Approval Authority. Please review and permit purchase.`, requestId: request.id });
        }
        await notify({ recipientId: request.requestedBy, subject: 'Your Request Was Approved', message: `Your request for "${request.itemName}" has been approved${qtyNote} and is being processed.`, requestId: request.id });
      } else {
        await request.update({ status: 'rejected' }, { transaction });
        await notify({ recipientId: request.requestedBy, subject: 'Your Request Was Rejected', message: `Your request for "${request.itemName}" was rejected by the Approval Authority.${comments ? ' Reason: ' + comments : ''}`, requestId: request.id });
      }
      return workflow;
    });
  }

  async handleVPAction(workflowId, action) {
    return await sequelize.transaction(async (transaction) => {
      const { actorId, decision, comments } = action;
      const workflow = await workflowService.processApproval(workflowId, { actorId, actorRole: 'vice_president', decision, comments }, transaction);
      const request = await Request.findByPk(workflow.requestId, { transaction });
      const requestor = await User.findByPk(request.requestedBy);
      const requestorName = `${requestor?.firstName || ''} ${requestor?.lastName || ''}`.trim();
      const qtyNote = workflow.permittedAmount && workflow.permittedAmount < request.quantity ? ` (permitted qty: ${workflow.permittedAmount})` : '';

      if (decision === 'approve') {
        await notify({ recipientRole: 'property_officer', subject: 'Purchase Permitted by VP — Action Required', message: `VP approved purchase of "${request.itemName}"${qtyNote} for ${requestorName}. Please complete and notify Purchase Department.`, requestId: request.id });
        await notify({ recipientId: request.requestedBy, subject: 'Purchase Approved by Vice President', message: `The Vice President approved the purchase of "${request.itemName}"${qtyNote}. It is now being processed.`, requestId: request.id });
      } else {
        await request.update({ status: 'rejected' }, { transaction });
        await notify({ recipientId: request.requestedBy, subject: 'Purchase Request Rejected by VP', message: `The Vice President rejected the purchase of "${request.itemName}".${comments ? ' Reason: ' + comments : ''}`, requestId: request.id });
      }
      return workflow;
    });
  }

  async handlePropertyOfficerAction(workflowId, action) {
    return await sequelize.transaction(async (transaction) => {
      const { actorId } = action;
      const workflow = await workflowService.advanceWorkflow(workflowId, { type: 'property_officer_completed', data: { completedBy: actorId }, triggeredBy: actorId }, transaction);
      const request = await Request.findByPk(workflow.requestId, { transaction });
      const requestor = await User.findByPk(request.requestedBy);
      const requestorName = `${requestor?.firstName || ''} ${requestor?.lastName || ''}`.trim();
      const qtyNote = workflow.permittedAmount ? ` (qty: ${workflow.permittedAmount})` : ` (qty: ${request.quantity})`;

      if (workflow.workflowType === 'existing_asset') {
        if (request.assetId) {
          await assignmentService.assignItem(request.assetId, request.requestedBy, request.id, transaction);
        }
        await request.update({ status: 'completed', completionDate: new Date() }, { transaction });
        await notify({ recipientId: request.requestedBy, subject: 'Your Item Is Ready for Collection', message: `Your request for "${request.itemName}" has been processed. Please collect your item from the Property Officer.`, requestId: request.id });
      } else {
        await notify({ recipientRole: 'purchase_department', subject: 'New Purchase Order', message: `Please procure "${request.itemName}"${qtyNote} for ${requestorName}. Approved by Approval Authority and VP. Justification: ${request.purpose || 'N/A'}`, requestId: request.id });
        await notify({ recipientId: request.requestedBy, subject: 'Purchase Order Sent to Purchase Department', message: `Your request for "${request.itemName}"${qtyNote} has been forwarded to the Purchase Department.`, requestId: request.id });
      }
      return workflow;
    });
  }

  async handlePurchaseDepartmentAction(workflowId, action) {
    return await sequelize.transaction(async (transaction) => {
      const { actorId, procurementDetails } = action;
      const workflow = await workflowService.advanceWorkflow(workflowId, { type: 'item_procured', data: { procuredBy: actorId, procurementDetails, procurementDate: new Date() }, triggeredBy: actorId }, transaction);
      const request = await Request.findByPk(workflow.requestId, { transaction });
      await notify({ recipientRole: 'quality_assurance', subject: 'Item Procured — QA Inspection Required', message: `"${request.itemName}" has been procured and requires quality inspection before being stored in inventory.`, requestId: request.id });
      await notify({ recipientId: request.requestedBy, subject: 'Item Procured — Awaiting QA Inspection', message: `"${request.itemName}" has been procured and is now undergoing quality inspection.`, requestId: request.id });
      return workflow;
    });
  }

  async handleQAInspectionAction(workflowId, action) {
    return await sequelize.transaction(async (transaction) => {
      const { actorId, decision, comments, inspectionDetails } = action;
      const workflow = await workflowService.advanceWorkflow(workflowId, { type: 'qa_completed', data: { qaInspectorId: actorId, qaDecision: decision, qaComments: comments, inspectionDetails }, triggeredBy: actorId }, transaction);
      const request = await Request.findByPk(workflow.requestId, { transaction });

      if (decision === 'approve') {
        const item = await inventoryService.storeItem({ itemType: request.itemName, itemName: request.itemName, specifications: request.specifications, quantity: workflow.permittedAmount || request.quantity }, workflow.id, transaction, actorId);
        await workflowService.advanceWorkflow(workflowId, { type: 'item_stored', data: { itemId: item.id }, triggeredBy: 'system' }, transaction);
        await request.update({ assignedItemId: item.id, status: 'item_ready' }, { transaction });
        await notify({ recipientId: request.requestedBy, subject: 'Your Item Passed QA — Ready for Collection', message: `"${request.itemName}" has passed quality inspection and is ready for collection. Please visit the Property Officer to collect your item.`, requestId: request.id });
      } else {
        await notify({ recipientRole: 'purchase_department', subject: 'QA Rejected — Re-procurement Required', message: `"${request.itemName}" failed QA inspection.${comments ? ' Reason: ' + comments : ''} Please re-procure the item.`, requestId: request.id });
        await notify({ recipientId: request.requestedBy, subject: 'QA Inspection Failed — Re-procurement in Progress', message: `"${request.itemName}" failed quality inspection. The Purchase Department has been notified to re-procure.`, requestId: request.id });
      }
      return workflow;
    });
  }

  async handleItemCollection(requestId, requestorId) {
    return await sequelize.transaction(async (transaction) => {
      const request = await Request.findByPk(requestId, { transaction });
      if (!request) throw new Error('Request not found');
      if (request.requestedBy !== requestorId) throw new Error('Unauthorized: Only the requestor can collect the item');
      if (request.status !== 'item_ready') throw new Error('Item is not ready for collection');
      if (!request.assignedItemId) throw new Error('No item assigned to this request');

      const assignment = await assignmentService.assignItem(request.assignedItemId, requestorId, requestId, transaction);
      await request.update({ status: 'completed', completionDate: new Date() }, { transaction });
      if (request.workflowId) {
        await workflowService.advanceWorkflow(request.workflowId, { type: 'item_collected', data: { collectedBy: requestorId }, triggeredBy: requestorId }, transaction);
      }
      return { request, assignment };
    });
  }
}

module.exports = new ApprovalHandlers();


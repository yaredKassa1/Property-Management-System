const { Request, User, sequelize } = require('../models');
const inventoryService = require('./inventoryService');
const assignmentService = require('./assignmentService');
const workflowService = require('./workflowService');
const notificationService = require('./notificationService');

/**
 * Request Service
 * Orchestrates request submission and fulfillment
 */
class RequestService {
  /**
   * Submit a new request
   * @param {string} requestorId - ID of requestor
   * @param {Object} itemDetails - Item details
   * @returns {Promise<Object>} Created request
   */
  async submitRequest(requestorId, itemDetails) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await sequelize.transaction(async (transaction) => {
          // Validate request data
          this.validateRequestData(itemDetails);

          // Create request
          const request = await Request.create({
            requestedBy: requestorId,
            requestType: itemDetails.requestType || 'purchase',
            itemName: itemDetails.itemType || itemDetails.itemName,
            quantity: itemDetails.quantity || 1,
            estimatedCost: itemDetails.estimatedCost,
            priority: itemDetails.urgency || itemDetails.priority || 'medium',
            workUnit: itemDetails.workUnit || '',
            approvalAuthorityId: itemDetails.approvalAuthorityId || null,
            purpose: itemDetails.purpose || itemDetails.justification || '',
            justification: itemDetails.justification,
            specifications: itemDetails.specifications,
            requesterSignature: itemDetails.requesterSignature,
            assetId: itemDetails.assetId || null,
            status: 'pending',
            requestDate: new Date()
          }, { transaction });

          // Check inventory availability
          // If assetId is explicitly provided, always go through approval workflow
          // (existing_asset type) — never skip approval for direct assignment
          let availabilityResult = { available: false };
          if (!itemDetails.assetId) {
            availabilityResult = await inventoryService.checkAvailability(itemDetails);
          }

          if (availabilityResult.available) {
            // Direct fulfillment path
            await this.handleDirectFulfillment(
              request,
              availabilityResult.itemId,
              requestorId,
              transaction
            );
          } else {
            // Procurement path
            await this.handleProcurementPath(
              request,
              requestorId,
              transaction
            );
          }

          return await Request.findByPk(request.id, { transaction });
        });
      } catch (error) {
        attempt++;
        
        // Check if it's a race condition error
        if (error.message.includes('no longer available') && attempt < maxRetries) {
          console.log(`Race condition detected, retrying... (attempt ${attempt}/${maxRetries})`);
          continue;
        }
        
        throw error;
      }
    }

    throw new Error('Failed to submit request after multiple attempts');
  }

  /**
   * Validate request data
   * @param {Object} itemDetails - Item details to validate
   * @throws {Error} If validation fails
   */
  validateRequestData(itemDetails) {
    if (!itemDetails.itemType && !itemDetails.itemName) {
      throw new Error('Item type or name is required');
    }
    if (itemDetails.quantity && itemDetails.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
  }

  /**
   * Handle direct fulfillment (item available in inventory)
   * @param {Object} request - Request object
   * @param {string} itemId - ID of available item
   * @param {string} requestorId - ID of requestor
   * @param {Object} transaction - Database transaction
   */
  async handleDirectFulfillment(request, itemId, requestorId, transaction) {
    // Reserve the item
    const reservationResult = await inventoryService.reserveItem(
      itemId,
      request.id,
      transaction
    );

    if (!reservationResult.success) {
      throw new Error(reservationResult.error);
    }

    // Assign the item
    await assignmentService.assignItem(
      itemId,
      requestorId,
      request.id,
      transaction
    );

    // Update request
    await request.update({
      fulfillmentPath: 'direct',
      assignedItemId: itemId,
      status: 'completed',
      completionDate: new Date()
    }, { transaction });

    // Send notification to requestor
    const requestor = await User.findByPk(requestorId);
    const notificationContent = notificationService.buildNotificationContent('item_assigned', {
      requestId: request.id,
      requestorName: requestor.name,
      itemName: request.itemName
    });

    await notificationService.sendNotification({
      recipientId: requestorId,
      type: 'item_assigned',
      ...notificationContent,
      metadata: { requestId: request.id, itemId }
    });
  }

  /**
   * Handle procurement path (item not available)
   * @param {Object} request - Request object
   * @param {string} requestorId - ID of requestor
   * @param {Object} transaction - Database transaction
   */
  async handleProcurementPath(request, requestorId, transaction) {
    // Determine workflow type based on whether an existing asset was selected
    const workflowType = request.assetId ? 'existing_asset' : 'new_item';

    const workflow = await workflowService.createWorkflow(request.id, workflowType, transaction);

    await request.update({
      fulfillmentPath: 'procurement',
      workflowId: workflow.id,
      status: 'in_progress'
    }, { transaction });

    const requestor = await User.findByPk(requestorId);
    const requestorName = `${requestor?.firstName || ''} ${requestor?.lastName || ''}`.trim();

    // Notify the specific approval authority if assigned, otherwise notify all
    const notifTarget = request.approvalAuthorityId
      ? { recipientId: request.approvalAuthorityId }
      : { recipientRole: 'approval_authority' };

    await notificationService.sendNotification({
      ...notifTarget,
      subject: workflowType === 'existing_asset'
        ? 'Asset Request Awaiting Your Approval'
        : 'New Purchase Request Awaiting Your Approval',
      message: workflowType === 'existing_asset'
        ? `${requestorName} requested "${request.itemName}" from inventory. Please review and approve.`
        : `${requestorName} requested "${request.itemName}" which is not in store. Please review and approve for purchase.`,
      metadata: { requestId: request.id, workflowId: workflow.id, workflowType }
    });
  }

  /**
   * Cancel a request
   * @param {string} requestId - ID of request
   * @param {string} requestorId - ID of requestor
   * @returns {Promise<void>}
   */
  async cancelRequest(requestId, requestorId) {
    return await sequelize.transaction(async (transaction) => {
      const request = await Request.findByPk(requestId, { transaction });

      if (!request) {
        throw new Error('Request not found');
      }

      if (request.requestedBy !== requestorId) {
        throw new Error('Unauthorized to cancel this request');
      }

      // Check if request can be cancelled
      if (['item_ready', 'completed'].includes(request.status)) {
        throw new Error('Cannot cancel request in current state');
      }

      // Update request status
      await request.update({
        status: 'cancelled'
      }, { transaction });

      // If workflow exists, mark it as rejected
      if (request.workflowId) {
        const workflow = await workflowService.getWorkflowStatus(request.workflowId);
        if (workflow && !['completed', 'rejected'].includes(workflow.currentState)) {
          await workflowService.advanceWorkflow(
            request.workflowId,
            {
              type: 'request_cancelled',
              data: { reason: 'Cancelled by requestor' },
              triggeredBy: requestorId
            },
            transaction
          );
        }
      }

      // Send notifications to involved users
      const notificationContent = notificationService.buildNotificationContent('request_cancelled', {
        requestId: request.id,
        itemName: request.itemName
      });

      await notificationService.sendNotification({
        recipientRole: 'approval_authority',
        type: 'request_cancelled',
        ...notificationContent,
        metadata: { requestId: request.id }
      });
    });
  }

  /**
   * Get request status
   * @param {string} requestId - ID of request
   * @returns {Promise<Object>} Request with related data
   */
  async getRequestStatus(requestId) {
    const request = await Request.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    if (!request) {
      throw new Error('Request not found');
    }

    let workflow = null;
    if (request.workflowId) {
      workflow = await workflowService.getWorkflowStatus(request.workflowId);
    }

    return {
      ...request.toJSON(),
      workflow
    };
  }

  /**
   * Get user's requests
   * @param {string} userId - ID of user
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} User's requests
   */
  async getUserRequests(userId, filters = {}) {
    const where = { requestedBy: userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.fulfillmentPath) {
      where.fulfillmentPath = filters.fulfillmentPath;
    }

    const requests = await Request.findAll({
      where,
      order: [['requestDate', 'DESC']],
      limit: filters.limit || 50
    });

    return requests;
  }
}

module.exports = new RequestService();

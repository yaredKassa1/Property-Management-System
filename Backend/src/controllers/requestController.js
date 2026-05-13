const { Op } = require('sequelize');
const db = require('../models');
const { createNotification } = require('./notificationController');
const requestService = require('../services/requestService');
const { 
  notifyRequestCreated, 
  notifyRequestApproved, 
  notifyRequestRejected, 
  notifyRequestCompleted 
} = require('../utils/emailService');

// @desc    Get all requests with filtering
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const {
      status,
      requestType,
      priority,
      workUnit,
      requestedBy,
      page = 1,
      limit = 10,
      sortBy = 'requestDate',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (requestType) where.requestType = requestType;
    if (priority) where.priority = priority;
    if (workUnit) where.workUnit = workUnit;
    if (requestedBy) where.requestedBy = requestedBy;

    // Role-based filtering: Staff and regular users only see their own requests
    // Property officers, approval authorities, admins, and vice presidents see all
    const allowedToSeeAll = ['property_officer', 'approval_authority', 'administrator', 'vice_president', 'purchase_department', 'quality_assurance'];
    if (!allowedToSeeAll.includes(req.user.role)) {
      where.requestedBy = req.user.id;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.Request.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: db.Asset,
          as: 'asset',
          required: false,
          attributes: ['id', 'assetId', 'name', 'serialNumber', 'category']
        },
        {
          model: db.User,
          as: 'requester',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'workUnit']
        },
        {
          model: db.User,
          as: 'approvalAuthority',
          required: false,
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
        },
        {
          model: db.User,
          as: 'approver',
          required: false,
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
        },
        {
          model: db.ProcurementWorkflow,
          as: 'procurementWorkflow',
          required: false,
          attributes: [
            'id', 'currentState', 'workflowType', 'permittedAmount',
            'approvalAuthorityDecision', 'approvalAuthorityComments', 'approvalAuthorityTimestamp',
            'vpDecision', 'vpComments', 'vpTimestamp',
            'qaDecision', 'qaComments', 'qaTimestamp',
            'itemProcuredAt', 'completedAt'
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await db.Request.findByPk(id, {
      include: [
        {
          model: db.Asset,
          as: 'asset'
        },
        {
          model: db.User,
          as: 'requester',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit']
        },
        {
          model: db.User,
          as: 'approvalAuthority',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res, next) => {
  try {
    const {
      requestType,
      assetId,
      itemName,
      quantity,
      estimatedCost,
      priority,
      workUnit,
      approvalAuthorityId,
      purpose,
      justification,
      specifications,
      requesterSignature
    } = req.body;

    // Validate approval authority if provided
    if (approvalAuthorityId) {
      const approvalAuthority = await db.User.findByPk(approvalAuthorityId);
      if (!approvalAuthority) {
        return res.status(404).json({ success: false, message: 'Approval authority not found' });
      }
      if (!['approval_authority', 'vice_president'].includes(approvalAuthority.role)) {
        return res.status(400).json({ success: false, message: 'Selected user is not an approval authority' });
      }
    }

    // Use requestService to handle inventory check + workflow creation
    const createdRequest = await requestService.submitRequest(req.user.id, {
      requestType: requestType || 'purchase',
      assetId,
      itemType: itemName,
      itemName,
      quantity: quantity || 1,
      estimatedCost,
      urgency: priority || 'medium',
      priority: priority || 'medium',
      workUnit: workUnit || req.user.workUnit,
      approvalAuthorityId,
      purpose,
      justification,
      specifications,
      requesterSignature
    });

    // Send email notification to approval authority
    try {
      const fullRequest = await db.Request.findByPk(createdRequest.id, {
        include: [
          { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit'] },
          { model: db.User, as: 'approvalAuthority', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email'] }
        ]
      });
      if (fullRequest?.approvalAuthority) {
        await notifyRequestCreated(fullRequest, fullRequest.requester, fullRequest.approvalAuthority);
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: createdRequest.fulfillmentPath === 'direct'
        ? 'Request fulfilled directly from inventory'
        : 'Request submitted — sent to Approval Authority for review',
      data: createdRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request
// @route   PUT /api/requests/:id
// @access  Private (requester or administrator)
const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const request = await db.Request.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Only requester or admin can update
    if (request.requestedBy !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own requests'
      });
    }

    // Can only update pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending requests'
      });
    }

    await request.update(updates);

    const updatedRequest = await db.Request.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review request (change to under_review)
// @route   POST /api/requests/:id/review
// @access  Private (approval_authority, vice_president, administrator)
const reviewRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await db.Request.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot review request with status: ${request.status}`
      });
    }

    await request.update({
      status: 'under_review',
      reviewDate: new Date()
    });

    const updatedRequest = await db.Request.findByPk(id, {
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Request is now under review',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve request
// @route   POST /api/requests/:id/approve
// @access  Private (approval_authority, vice_president, administrator)
const approveRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approvalNotes, permittedAmount, approverSignature } = req.body;

    const request = await db.Request.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if the current user is the assigned approval authority
    if (request.approvalAuthorityId && request.approvalAuthorityId !== req.user.id) {
      // Allow administrators and vice presidents to override
      if (!['administrator', 'vice_president'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to approve this request. This request is assigned to another approval authority.'
        });
      }
    }

    if (request.status !== 'in_progress' && request.status !== 'pending' && request.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${request.status}`
      });
    }

    await request.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvalDate: new Date(),
      approvalNotes,
      permittedAmount,
      approverSignature
    });

    const updatedRequest = await db.Request.findByPk(id, {
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email'] },
        { model: db.User, as: 'approver', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    // Send email notification to requester
    try {
      await notifyRequestApproved(updatedRequest, updatedRequest.requester, updatedRequest.approver);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    // In-app notification to requester
    try {
      await createNotification({
        userIds: updatedRequest.requestedBy,
        title: 'Request Approved',
        message: `Your request for "${updatedRequest.itemName}" has been approved.`,
        type: 'request',
        relatedId: updatedRequest.id,
      });
    } catch (e) { console.error('Notification error:', e); }

    res.status(200).json({
      success: true,
      message: 'Request approved successfully',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject request
// @route   POST /api/requests/:id/reject
// @access  Private (approval_authority, vice_president, administrator)
const rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const request = await db.Request.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if the current user is the assigned approval authority
    if (request.approvalAuthorityId && request.approvalAuthorityId !== req.user.id) {
      // Allow administrators and vice presidents to override
      if (!['administrator', 'vice_president'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to reject this request. This request is assigned to another approval authority.'
        });
      }
    }

    if (request.status !== 'in_progress' && request.status !== 'pending' && request.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${request.status}`
      });
    }

    await request.update({
      status: 'rejected',
      approvedBy: req.user.id,
      approvalDate: new Date(),
      rejectionReason
    });

    const updatedRequest = await db.Request.findByPk(id, {
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email'] },
        { model: db.User, as: 'approver', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    // Send email notification to requester
    try {
      await notifyRequestRejected(updatedRequest, updatedRequest.requester, rejectionReason);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    // In-app notification to requester
    try {
      await createNotification({
        userIds: updatedRequest.requestedBy,
        title: 'Request Rejected',
        message: `Your request for "${updatedRequest.itemName}" was rejected. Reason: ${rejectionReason}`,
        type: 'request',
        relatedId: updatedRequest.id,
      });
    } catch (e) { console.error('Notification error:', e); }

    res.status(200).json({
      success: true,
      message: 'Request rejected',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark request as completed
// @route   POST /api/requests/:id/complete
// @access  Private (property_officer, purchase_department, administrator)
const completeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { completerSignature } = req.body;

    const request = await db.Request.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete request with status: ${request.status}. Request must be approved first.`
      });
    }

    // Update request status with completer info
    await request.update({
      status: 'completed',
      completedBy: req.user.id,
      completionDate: new Date(),
      completerSignature
    });

    // If it's a withdrawal request and has an associated asset, update the asset assignment
    if (request.requestType === 'withdrawal' && request.assetId) {
      const asset = await db.Asset.findByPk(request.assetId);
      if (asset) {
        await asset.update({
          status: 'assigned',
          assignedTo: request.requestedBy,
          workUnit: request.workUnit
        });
      }
    }

    // If it's a purchase request with an asset, trigger QA inspection workflow
    if (request.requestType === 'purchase' && request.assetId) {
      try {
        // 1. Create ProcurementInspection record
        await db.ProcurementInspection.create({
          requestId: request.id,
          assetId: request.assetId,
          status: 'pending'
        });

        // 2. Set asset to pending_qa
        await db.Asset.update(
          { status: 'pending_qa' },
          { where: { id: request.assetId } }
        );

        // 3. Notify all active QA officers
        const qaOfficers = await db.User.findAll({
          where: { role: 'quality_assurance', isActive: true },
          attributes: ['id']
        });
        if (qaOfficers.length) {
          await createNotification({
            userIds: qaOfficers.map(u => u.id),
            title: 'New Asset Awaiting QA Inspection',
            message: `Asset "${request.itemName}" has been delivered and requires quality inspection.`,
            type: 'general',
            relatedId: request.id
          });
        }
      } catch (qaError) {
        console.error('Failed to create QA inspection:', qaError);
        // Don't fail the entire request completion if QA setup fails
      }
    }

    const updatedRequest = await db.Request.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email'] }
      ]
    });

    // Get completer info
    const completer = await db.User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'firstName', 'middleName', 'lastName']
    });

    // Send email notification to requester
    try {
      await notifyRequestCompleted(updatedRequest, updatedRequest.requester, completer);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    // In-app notification to requester
    try {
      await createNotification({
        userIds: updatedRequest.requestedBy,
        title: 'Request Completed',
        message: `Your request for "${updatedRequest.itemName}" has been completed.`,
        type: 'request',
        relatedId: updatedRequest.id,
      });
    } catch (e) { console.error('Notification error:', e); }

    res.status(200).json({
      success: true,
      message: 'Request marked as completed',
      data: updatedRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel request
// @route   DELETE /api/requests/:id
// @access  Private (requester or administrator)
const cancelRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await db.Request.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Only requester or admin can cancel
    if (request.requestedBy !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own requests'
      });
    }

    // Can only cancel pending or under_review requests
    if (request.status !== 'pending' && request.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending or under review requests'
      });
    }

    await request.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get purchase requests for procurement dashboard
// @route   GET /api/requests/procurement
// @access  Private (purchase_department, administrator)
const getProcurementRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = { requestType: 'purchase' };
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { count, rows } = await db.Request.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['requestDate', 'DESC']],
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'firstName', 'middleName', 'lastName', 'workUnit'] },
        { model: db.User, as: 'approver', attributes: ['id', 'firstName', 'middleName', 'lastName'] },
        { model: db.User, as: 'processor', attributes: ['id', 'firstName', 'middleName', 'lastName'] },
        { model: db.Asset, as: 'asset', attributes: ['id', 'assetId', 'name', 'status'] }
      ]
    });

    // Stats
    const stats = await db.Request.findAll({
      where: { requestType: 'purchase' },
      attributes: ['status', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });
    const statsMap = { total: count, approved: 0, procurement_in_progress: 0, purchased: 0, delivered: 0, completed: 0 };
    stats.forEach(s => { if (statsMap.hasOwnProperty(s.status)) statsMap[s.status] = parseInt(s.count); });

    res.status(200).json({
      success: true,
      data: rows,
      stats: statsMap,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update procurement status of a purchase request
// @route   POST /api/requests/:id/procurement
// @access  Private (purchase_department, administrator)
const processProcurement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      procurementStatus,
      supplierName,
      supplierContact,
      quotationAmount,
      purchaseOrderNumber,
      procurementNotes,
      expectedDeliveryDate,
      actualDeliveryDate
    } = req.body;

    if (!procurementStatus) {
      return res.status(400).json({ success: false, message: 'Procurement status is required' });
    }

    const validStatuses = ['procurement_in_progress', 'purchased', 'delivered'];
    if (!validStatuses.includes(procurementStatus)) {
      return res.status(400).json({ success: false, message: `Invalid procurement status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const request = await db.Request.findByPk(id, {
      include: [{ model: db.User, as: 'requester', attributes: ['id', 'firstName', 'lastName'] }]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.requestType !== 'purchase') {
      return res.status(400).json({ success: false, message: 'Only purchase requests can be processed for procurement' });
    }

    // Must be approved before procurement can start
    const allowedFromStatuses = ['approved', 'procurement_in_progress', 'purchased'];
    if (!allowedFromStatuses.includes(request.status)) {
      return res.status(400).json({ success: false, message: `Cannot process procurement for request with status: ${request.status}. Request must be approved first.` });
    }

    const updateData = {
      status: procurementStatus,
      procurementStatus,
      processedBy: req.user.id,
      procurementNotes,
      supplierName,
      supplierContact,
      quotationAmount,
      purchaseOrderNumber,
      expectedDeliveryDate: expectedDeliveryDate || null,
    };

    if (procurementStatus === 'procurement_in_progress') {
      updateData.procurementDate = new Date();
    }
    if (procurementStatus === 'delivered') {
      updateData.actualDeliveryDate = actualDeliveryDate || new Date();
    }

    await request.update(updateData);

    // Notify property officers and QA when delivered
    try {
      const processorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
      const statusLabels = {
        procurement_in_progress: 'In Progress',
        purchased: 'Purchased',
        delivered: 'Delivered'
      };

      if (procurementStatus === 'delivered') {
        // Notify property officers
        const propertyOfficers = await db.User.findAll({ where: { role: 'property_officer', isActive: true }, attributes: ['id'] });
        if (propertyOfficers.length) {
          await createNotification({
            userIds: propertyOfficers.map(u => u.id),
            title: 'Asset Delivered — Ready for QA',
            message: `"${request.itemName}" has been delivered by Purchase Dept. Please complete the request to trigger QA inspection.`,
            type: 'request',
            relatedId: request.id
          });
        }
        // Notify QA officers
        const qaOfficers = await db.User.findAll({ where: { role: 'quality_assurance', isActive: true }, attributes: ['id'] });
        if (qaOfficers.length) {
          await createNotification({
            userIds: qaOfficers.map(u => u.id),
            title: 'Asset Incoming for QA',
            message: `"${request.itemName}" has been delivered and will soon be ready for quality inspection.`,
            type: 'general',
            relatedId: request.id
          });
        }
      }

      // Always notify the requester
      await createNotification({
        userIds: request.requestedBy,
        title: `Procurement Update: ${statusLabels[procurementStatus]}`,
        message: `Your request for "${request.itemName}" is now ${statusLabels[procurementStatus].toLowerCase()}.`,
        type: 'request',
        relatedId: request.id
      });
    } catch (notifError) {
      console.error('Notification error:', notifError);
    }

    // Audit log
    try {
      await db.AuditLog.create({
        userId: req.user.id,
        action: `PROCUREMENT_${procurementStatus.toUpperCase()}`,
        entityType: 'Request',
        entityId: request.id,
        details: { procurementStatus, supplierName, purchaseOrderNumber }
      });
    } catch (auditError) {
      console.error('Audit log error:', auditError);
    }

    const updatedRequest = await db.Request.findByPk(id, {
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'firstName', 'middleName', 'lastName', 'workUnit'] },
        { model: db.User, as: 'processor', attributes: ['id', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    res.status(200).json({ success: true, message: `Procurement status updated to ${procurementStatus}`, data: updatedRequest });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  reviewRequest,
  approveRequest,
  rejectRequest,
  completeRequest,
  cancelRequest,
  processProcurement,
  getProcurementRequests
};

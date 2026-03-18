const { Op } = require('sequelize');
const db = require('../models');
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
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
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

    // If assetId provided, verify it exists
    if (assetId) {
      const asset = await db.Asset.findByPk(assetId);
      if (!asset) {
        return res.status(404).json({
          success: false,
          message: 'Asset not found'
        });
      }
    }

    // Validate approval authority if provided
    if (approvalAuthorityId) {
      const approvalAuthority = await db.User.findByPk(approvalAuthorityId);
      if (!approvalAuthority) {
        return res.status(404).json({
          success: false,
          message: 'Approval authority not found'
        });
      }
      // Verify the user is actually an approval authority
      if (!['approval_authority', 'vice_president'].includes(approvalAuthority.role)) {
        return res.status(400).json({
          success: false,
          message: 'Selected user is not an approval authority'
        });
      }
    }

    // Create request with status 'in_progress' and requestor signature
    const request = await db.Request.create({
      requestType,
      assetId,
      itemName,
      quantity: quantity || 1,
      estimatedCost,
      priority: priority || 'medium',
      status: 'in_progress',
      requestedBy: req.user.id,
      workUnit: workUnit || req.user.workUnit,
      approvalAuthorityId,
      purpose,
      justification,
      specifications,
      requesterSignature,
      requestDate: new Date()
    });

    // Fetch with relations
    const createdRequest = await db.Request.findByPk(request.id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit'] },
        { model: db.User, as: 'approvalAuthority', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email'] }
      ]
    });

    // Send email notification to approval authority
    try {
      if (createdRequest.approvalAuthority) {
        await notifyRequestCreated(createdRequest, createdRequest.requester, createdRequest.approvalAuthority);
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
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

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  reviewRequest,
  approveRequest,
  rejectRequest,
  completeRequest,
  cancelRequest
};

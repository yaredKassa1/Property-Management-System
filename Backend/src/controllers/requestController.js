const { Op } = require('sequelize');
const db = require('../models');

// @desc    Get all requests with filtering
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const {
      status,
      requestType,
      priority,
      department,
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
    if (department) where.department = department;
    if (requestedBy) where.requestedBy = requestedBy;

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
          attributes: ['id', 'username', 'fullName', 'department']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'username', 'fullName', 'role']
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
          attributes: ['id', 'username', 'fullName', 'email', 'department']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'username', 'fullName', 'role']
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
      department,
      purpose,
      justification,
      specifications
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

    // Create request
    const request = await db.Request.create({
      requestType,
      assetId,
      itemName,
      quantity: quantity || 1,
      estimatedCost,
      priority: priority || 'medium',
      requestedBy: req.user.id,
      department: department || req.user.department,
      purpose,
      justification,
      specifications,
      requestDate: new Date()
    });

    // Fetch with relations
    const createdRequest = await db.Request.findByPk(request.id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'fullName'] }
      ]
    });

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
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'fullName'] }
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
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'fullName'] }
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
    const { approvalNotes } = req.body;

    const request = await db.Request.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending' && request.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${request.status}`
      });
    }

    await request.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvalDate: new Date(),
      approvalNotes
    });

    const updatedRequest = await db.Request.findByPk(id, {
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'approver', attributes: ['id', 'username', 'fullName'] }
      ]
    });

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

    if (request.status !== 'pending' && request.status !== 'under_review') {
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
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'approver', attributes: ['id', 'username', 'fullName'] }
      ]
    });

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

    const request = await db.Request.findByPk(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'approved' && request.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete request with status: ${request.status}`
      });
    }

    await request.update({
      status: 'completed',
      completionDate: new Date()
    });

    const updatedRequest = await db.Request.findByPk(id, {
      include: [
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'fullName'] }
      ]
    });

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

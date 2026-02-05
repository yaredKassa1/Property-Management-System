const { Op } = require('sequelize');
const db = require('../models');

// @desc    Get all transfers with filtering
// @route   GET /api/transfers
// @access  Private
const getTransfers = async (req, res, next) => {
  try {
    const {
      status,
      toUserId,
      fromUserId,
      assetId,
      page = 1,
      limit = 10,
      sortBy = 'requestDate',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (toUserId) where.toUserId = toUserId;
    if (fromUserId) where.fromUserId = fromUserId;
    if (assetId) where.assetId = assetId;

    const offset = (page - 1) * limit;

    const { count, rows } = await db.Transfer.findAndCountAll({
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
          as: 'fromUser',
          attributes: ['id', 'username', 'fullName', 'department']
        },
        {
          model: db.User,
          as: 'toUser',
          attributes: ['id', 'username', 'fullName', 'department']
        },
        {
          model: db.User,
          as: 'requester',
          attributes: ['id', 'username', 'fullName', 'role']
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

// @desc    Get single transfer by ID
// @route   GET /api/transfers/:id
// @access  Private
const getTransferById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transfer = await db.Transfer.findByPk(id, {
      include: [
        {
          model: db.Asset,
          as: 'asset'
        },
        {
          model: db.User,
          as: 'fromUser',
          attributes: ['id', 'username', 'fullName', 'email', 'department']
        },
        {
          model: db.User,
          as: 'toUser',
          attributes: ['id', 'username', 'fullName', 'email', 'department']
        },
        {
          model: db.User,
          as: 'requester',
          attributes: ['id', 'username', 'fullName', 'role']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'username', 'fullName', 'role']
        }
      ]
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transfer request
// @route   POST /api/transfers
// @access  Private (staff and above)
const createTransfer = async (req, res, next) => {
  try {
    const {
      assetId,
      fromUserId,
      toUserId,
      fromLocation,
      toLocation,
      fromDepartment,
      toDepartment,
      reason,
      notes
    } = req.body;

    // Check if asset exists and is available for transfer
    const asset = await db.Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if asset is already in transfer
    if (asset.status === 'in_transfer') {
      return res.status(400).json({
        success: false,
        message: 'Asset is already in transfer'
      });
    }

    // Verify toUser exists
    const toUser = await db.User.findByPk(toUserId);
    if (!toUser) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found'
      });
    }

    // Verify fromUser if provided
    if (fromUserId) {
      const fromUser = await db.User.findByPk(fromUserId);
      if (!fromUser) {
        return res.status(404).json({
          success: false,
          message: 'Sender user not found'
        });
      }
    }

    // Create transfer
    const transfer = await db.Transfer.create({
      assetId,
      fromUserId,
      toUserId,
      fromLocation,
      toLocation,
      fromDepartment,
      toDepartment,
      reason,
      notes,
      requestedBy: req.user.id,
      requestDate: new Date()
    });

    // Fetch with relations
    const createdTransfer = await db.Transfer.findByPk(transfer.id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'fromUser', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'toUser', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Transfer request created successfully',
      data: createdTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve transfer
// @route   POST /api/transfers/:id/approve
// @access  Private (vice_president, administrator)
const approveTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const transfer = await db.Transfer.findByPk(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve transfer with status: ${transfer.status}`
      });
    }

    // Update transfer status
    await transfer.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvalDate: new Date(),
      notes: notes || transfer.notes
    });

    // Update asset status
    const asset = await db.Asset.findByPk(transfer.assetId);
    await asset.update({ status: 'in_transfer' });

    const updatedTransfer = await db.Transfer.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'fromUser', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'toUser', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'approver', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Transfer approved successfully',
      data: updatedTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject transfer
// @route   POST /api/transfers/:id/reject
// @access  Private (vice_president, administrator)
const rejectTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const transfer = await db.Transfer.findByPk(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject transfer with status: ${transfer.status}`
      });
    }

    await transfer.update({
      status: 'rejected',
      approvedBy: req.user.id,
      approvalDate: new Date(),
      rejectionReason
    });

    const updatedTransfer = await db.Transfer.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'toUser', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'approver', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Transfer rejected',
      data: updatedTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete transfer
// @route   POST /api/transfers/:id/complete
// @access  Private (property_officer, administrator)
const completeTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transfer = await db.Transfer.findByPk(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    if (transfer.status !== 'approved' && transfer.status !== 'in_transit') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete transfer with status: ${transfer.status}`
      });
    }

    // Update transfer
    await transfer.update({
      status: 'completed',
      completionDate: new Date()
    });

    // Update asset
    const asset = await db.Asset.findByPk(transfer.assetId);
    await asset.update({
      status: 'assigned',
      assignedTo: transfer.toUserId,
      location: transfer.toLocation,
      department: transfer.toDepartment
    });

    const updatedTransfer = await db.Transfer.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'toUser', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      data: updatedTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel transfer
// @route   DELETE /api/transfers/:id
// @access  Private (requester, administrator)
const cancelTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transfer = await db.Transfer.findByPk(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Only requester or admin can cancel
    if (transfer.requestedBy !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own transfer requests'
      });
    }

    // Can only cancel pending transfers
    if (transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending transfers'
      });
    }

    await transfer.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: 'Transfer cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransfers,
  getTransferById,
  createTransfer,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  cancelTransfer
};

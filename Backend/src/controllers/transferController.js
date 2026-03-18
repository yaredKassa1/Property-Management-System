const { Op } = require('sequelize');
const db = require('../models');
const { 
  notifyTransferInitiated, 
  notifyTransferApproved, 
  notifyTransferCompleted, 
  notifyTransferRejected 
} = require('../utils/emailService');
const { logTransferHistory, getTransferHistory } = require('../utils/transferHistory');

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

    // Role-based filtering: Staff and regular users only see transfers they're involved in
    // Property officers, approval authorities, admins, and vice presidents see all
    const allowedToSeeAll = ['property_officer', 'approval_authority', 'administrator', 'vice_president', 'purchase_department', 'quality_assurance'];
    if (!allowedToSeeAll.includes(req.user.role)) {
      // Staff can only see transfers where they are the sender, receiver, or requester
      where[Op.or] = [
        { fromUserId: req.user.id },
        { toUserId: req.user.id },
        { requestedBy: req.user.id }
      ];
    }

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
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'workUnit']
        },
        {
          model: db.User,
          as: 'toUser',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'workUnit']
        },
        {
          model: db.User,
          as: 'requester',
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
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit']
        },
        {
          model: db.User,
          as: 'toUser',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit']
        },
        {
          model: db.User,
          as: 'requester',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
        },
        {
          model: db.User,
          as: 'approver',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
        }
      ]
    });

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Get transfer history
    const history = await getTransferHistory(id);

    res.status(200).json({
      success: true,
      data: {
        ...transfer.toJSON(),
        history
      }
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
      fromWorkUnit,
      toWorkUnit,
      reason,
      notes,
      transferorSignature
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

    // Create transfer with transferor signature
    const transfer = await db.Transfer.create({
      assetId,
      fromUserId,
      toUserId,
      fromLocation,
      toLocation,
      fromWorkUnit,
      toWorkUnit,
      reason,
      notes,
      requestedBy: req.user.id,
      requestDate: new Date(),
      transferorSignature: transferorSignature || null
    });

    // Fetch with relations
    const createdTransfer = await db.Transfer.findByPk(transfer.id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'fromUser', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit'] },
        { model: db.User, as: 'toUser', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit'] },
        { model: db.User, as: 'requester', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    // Log history
    await logTransferHistory({
      transferId: transfer.id,
      action: 'created',
      performedBy: req.user.id,
      previousStatus: null,
      newStatus: 'pending',
      notes: `Transfer initiated from ${createdTransfer.fromUser.firstName} to ${createdTransfer.toUser.firstName}`,
      metadata: { transferorSignature: transferorSignature ? 'signed' : 'unsigned' },
      req
    });

    // Send email notification to recipient
    try {
      await notifyTransferInitiated(createdTransfer, createdTransfer.fromUser, createdTransfer.toUser);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Transfer request created successfully',
      data: createdTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve transfer (recipient accepts)
// @route   POST /api/transfers/:id/approve
// @access  Private (recipient user - toUserId)
const approveTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes, recipientSignature } = req.body;

    const transfer = await db.Transfer.findByPk(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Only the recipient (toUser) can approve the transfer
    if (transfer.toUserId !== req.user.id && !['administrator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can approve this transfer'
      });
    }

    if (transfer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve transfer with status: ${transfer.status}`
      });
    }

    // Update transfer status with recipient signature
    await transfer.update({
      status: 'approved',
      approvedBy: req.user.id,
      approvalDate: new Date(),
      recipientSignature: recipientSignature || null,
      notes: notes || transfer.notes
    });

    // Update asset status
    const asset = await db.Asset.findByPk(transfer.assetId);
    await asset.update({ status: 'in_transfer' });

    const updatedTransfer = await db.Transfer.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'fromUser', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit'] },
        { model: db.User, as: 'toUser', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit'] },
        { model: db.User, as: 'approver', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    // Log history
    await logTransferHistory({
      transferId: id,
      action: 'approved',
      performedBy: req.user.id,
      previousStatus: 'pending',
      newStatus: 'approved',
      notes: notes || 'Transfer approved by recipient',
      metadata: { recipientSignature: recipientSignature ? 'signed' : 'unsigned' },
      req
    });

    // Get property officers for notification
    const propertyOfficers = await db.User.findAll({
      where: { role: 'property_officer', isActive: true },
      attributes: ['id', 'email', 'firstName', 'lastName']
    });

    // Send email notifications
    try {
      await notifyTransferApproved(updatedTransfer, updatedTransfer.fromUser, updatedTransfer.toUser, propertyOfficers);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

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
        { model: db.User, as: 'fromUser', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email'] },
        { model: db.User, as: 'toUser', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] },
        { model: db.User, as: 'approver', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    // Log history
    await logTransferHistory({
      transferId: id,
      action: 'rejected',
      performedBy: req.user.id,
      previousStatus: 'pending',
      newStatus: 'rejected',
      notes: rejectionReason,
      metadata: {},
      req
    });

    // Send email notification to transferor
    try {
      await notifyTransferRejected(updatedTransfer, updatedTransfer.fromUser, updatedTransfer.toUser, rejectionReason);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

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
// @access  Private (property_officer, administrator only - NO vice_president)
const completeTransfer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { propertyOfficerSignature } = req.body;

    const transfer = await db.Transfer.findByPk(id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Only property officers and administrators can complete transfers
    if (!['property_officer', 'administrator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only property officers can complete transfers'
      });
    }

    if (transfer.status !== 'approved' && transfer.status !== 'in_transit') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete transfer with status: ${transfer.status}`
      });
    }

    // Update transfer with property officer signature
    await transfer.update({
      status: 'completed',
      completionDate: new Date(),
      completedBy: req.user.id,
      propertyOfficerSignature: propertyOfficerSignature || null
    });

    // Update asset
    const asset = await db.Asset.findByPk(transfer.assetId);
    await asset.update({
      status: 'assigned',
      assignedTo: transfer.toUserId,
      location: transfer.toLocation,
      workUnit: transfer.toWorkUnit
    });

    const updatedTransfer = await db.Transfer.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'fromUser', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit'] },
        { model: db.User, as: 'toUser', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit'] },
        { model: db.User, as: 'completer', attributes: ['id', 'username', 'firstName', 'middleName', 'lastName'] }
      ]
    });

    // Log history
    await logTransferHistory({
      transferId: id,
      action: 'completed',
      performedBy: req.user.id,
      previousStatus: transfer.status,
      newStatus: 'completed',
      notes: 'Transfer completed by property officer',
      metadata: { 
        propertyOfficerSignature: propertyOfficerSignature ? 'signed' : 'unsigned',
        assetReassigned: true 
      },
      req
    });

    // Send email notifications to both parties
    try {
      await notifyTransferCompleted(updatedTransfer, updatedTransfer.fromUser, updatedTransfer.toUser, updatedTransfer.completer);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

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

    // Log history
    await logTransferHistory({
      transferId: id,
      action: 'cancelled',
      performedBy: req.user.id,
      previousStatus: 'pending',
      newStatus: 'cancelled',
      notes: 'Transfer cancelled by requester',
      metadata: {},
      req
    });

    res.status(200).json({
      success: true,
      message: 'Transfer cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transfer history
// @route   GET /api/transfers/:id/history
// @access  Private
const getTransferHistoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if transfer exists
    const transfer = await db.Transfer.findByPk(id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    const history = await getTransferHistory(id);

    res.status(200).json({
      success: true,
      data: history
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
  cancelTransfer,
  getTransferHistoryById
};

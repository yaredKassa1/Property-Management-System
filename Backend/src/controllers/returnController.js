const { Op } = require('sequelize');
const db = require('../models');

// @desc    Get all returns with filtering
// @route   GET /api/returns
// @access  Private
const getReturns = async (req, res, next) => {
  try {
    const {
      status,
      returnedBy,
      assetId,
      page = 1,
      limit = 10,
      sortBy = 'returnDate',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (returnedBy) where.returnedBy = returnedBy;
    if (assetId) where.assetId = assetId;

    const offset = (page - 1) * limit;

    const { count, rows } = await db.Return.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: db.Asset,
          as: 'asset',
          attributes: ['id', 'assetId', 'name', 'serialNumber', 'category', 'condition']
        },
        {
          model: db.User,
          as: 'returner',
          attributes: ['id', 'username', 'fullName', 'department']
        },
        {
          model: db.User,
          as: 'receiver',
          attributes: ['id', 'username', 'fullName', 'role']
        },
        {
          model: db.User,
          as: 'inspector',
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

// @desc    Get single return by ID
// @route   GET /api/returns/:id
// @access  Private
const getReturnById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const returnRecord = await db.Return.findByPk(id, {
      include: [
        {
          model: db.Asset,
          as: 'asset'
        },
        {
          model: db.User,
          as: 'returner',
          attributes: ['id', 'username', 'fullName', 'email', 'department']
        },
        {
          model: db.User,
          as: 'receiver',
          attributes: ['id', 'username', 'fullName', 'role']
        },
        {
          model: db.User,
          as: 'inspector',
          attributes: ['id', 'username', 'fullName', 'role']
        }
      ]
    });

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: returnRecord
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create return request
// @route   POST /api/returns
// @access  Private
const createReturn = async (req, res, next) => {
  try {
    const { assetId, reason } = req.body;

    // Check if asset exists
    const asset = await db.Asset.findByPk(assetId);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if asset is assigned
    if (asset.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Asset is not currently assigned and cannot be returned'
      });
    }

    // Check if user is authorized to return this asset
    if (asset.assignedTo !== req.user.id && req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'You can only return assets assigned to you'
      });
    }

    // Check if there's already a pending return for this asset
    const existingReturn = await db.Return.findOne({
      where: {
        assetId,
        status: { [Op.in]: ['pending', 'received', 'under_inspection'] }
      }
    });

    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: 'There is already a pending return for this asset'
      });
    }

    // Create return
    const returnRecord = await db.Return.create({
      assetId,
      returnedBy: req.user.id,
      reason,
      returnDate: new Date()
    });

    // Fetch with relations
    const createdReturn = await db.Return.findByPk(returnRecord.id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'returner', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Return request created successfully',
      data: createdReturn
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Receive returned asset
// @route   POST /api/returns/:id/receive
// @access  Private (property_officer, administrator)
const receiveReturn = async (req, res, next) => {
  try {
    const { id } = req.params;

    const returnRecord = await db.Return.findByPk(id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    if (returnRecord.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot receive return with status: ${returnRecord.status}`
      });
    }

    await returnRecord.update({
      status: 'received',
      receivedBy: req.user.id,
      receivedDate: new Date()
    });

    const updatedReturn = await db.Return.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'returner', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'receiver', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Return received successfully',
      data: updatedReturn
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Inspect returned asset
// @route   POST /api/returns/:id/inspect
// @access  Private (quality_assurance, property_officer, administrator)
const inspectReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { returnCondition, inspectionNotes, damageDescription } = req.body;

    if (!returnCondition) {
      return res.status(400).json({
        success: false,
        message: 'Return condition is required'
      });
    }

    const returnRecord = await db.Return.findByPk(id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    if (returnRecord.status !== 'received' && returnRecord.status !== 'under_inspection') {
      return res.status(400).json({
        success: false,
        message: `Cannot inspect return with status: ${returnRecord.status}`
      });
    }

    // Update return record
    await returnRecord.update({
      status: 'under_inspection',
      inspectedBy: req.user.id,
      inspectionDate: new Date(),
      returnCondition,
      inspectionNotes,
      damageDescription
    });

    // Update asset condition
    const asset = await db.Asset.findByPk(returnRecord.assetId);
    await asset.update({
      condition: returnCondition
    });

    const updatedReturn = await db.Return.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'returner', attributes: ['id', 'username', 'fullName'] },
        { model: db.User, as: 'inspector', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Inspection completed successfully',
      data: updatedReturn
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve return (complete the return process)
// @route   POST /api/returns/:id/approve
// @access  Private (property_officer, administrator)
const approveReturn = async (req, res, next) => {
  try {
    const { id } = req.params;

    const returnRecord = await db.Return.findByPk(id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    if (returnRecord.status !== 'under_inspection' && returnRecord.status !== 'received') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve return with status: ${returnRecord.status}`
      });
    }

    // Update return to completed
    await returnRecord.update({
      status: 'completed',
      completionDate: new Date()
    });

    // Update asset status to available and unassign
    const asset = await db.Asset.findByPk(returnRecord.assetId);
    await asset.update({
      status: 'available',
      assignedTo: null
    });

    const updatedReturn = await db.Return.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'returner', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Return approved and completed successfully',
      data: updatedReturn
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject return
// @route   POST /api/returns/:id/reject
// @access  Private (property_officer, administrator)
const rejectReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { inspectionNotes } = req.body;

    const returnRecord = await db.Return.findByPk(id);

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: 'Return record not found'
      });
    }

    if (returnRecord.status !== 'under_inspection' && returnRecord.status !== 'received') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject return with status: ${returnRecord.status}`
      });
    }

    await returnRecord.update({
      status: 'rejected',
      inspectionNotes
    });

    const updatedReturn = await db.Return.findByPk(id, {
      include: [
        { model: db.Asset, as: 'asset' },
        { model: db.User, as: 'returner', attributes: ['id', 'username', 'fullName'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Return rejected',
      data: updatedReturn
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReturns,
  getReturnById,
  createReturn,
  receiveReturn,
  inspectReturn,
  approveReturn,
  rejectReturn
};

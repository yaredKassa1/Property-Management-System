const { Op } = require('sequelize');
const db = require('../models');
const { notifyAssetAssigned, notifyAssetUnassigned } = require('../utils/emailService');

// @desc    Get all assets with filtering and pagination
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res, next) => {
  try {
    const {
      status,
      category,
      workUnit,
      assignedTo,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (workUnit) {
      where.workUnit = workUnit;
    }

    if (assignedTo) {
      where.assignedTo = assignedTo;
    }

    // Staff filtering logic
    const staffRoles = ['staff'];
    if (staffRoles.includes(req.user.role)) {
      // If requesting available assets (for new request form), show available assets
      // Otherwise, show only their assigned assets
      if (status === 'available' || req.query.includeAvailable === 'true') {
        where.status = 'available';
        where.assignedTo = null;
      } else {
        // Default: only show their assigned assets
        where.assignedTo = req.user.id;
      }
    }

    if (search) {
      const searchConditions = [
        { name: { [Op.iLike]: `%${search}%` } },
        { assetId: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
      
      // If staff role and not looking for available assets, combine search with assignedTo filter
      if (staffRoles.includes(req.user.role) && status !== 'available' && req.query.includeAvailable !== 'true') {
        where[Op.and] = [
          { assignedTo: req.user.id },
          { [Op.or]: searchConditions }
        ];
      } else {
        where[Op.or] = searchConditions;
      }
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Query assets
    const { count, rows } = await db.Asset.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: db.User,
          as: 'assignedUser',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName']
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

// @desc    Get single asset by ID
// @route   GET /api/assets/:id
// @access  Private
const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const asset = await db.Asset.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'assignedUser',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName']
        }
      ]
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.status(200).json({
      success: true,
      data: asset
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private (property_officer, administrator)
const createAsset = async (req, res, next) => {
  try {
    const {
      assetId,
      name,
      category,
      serialNumber,
      value,
      purchaseDate,
      workUnit,
      status,
      condition,
      description,
      warrantyExpiry,
      itemCategory,
      sourceType,
      donorName,
      quantity
    } = req.body;

    // Check if serialNumber already exists (if provided)
    if (serialNumber) {
      const existingSerial = await db.Asset.findOne({ where: { serialNumber } });
      if (existingSerial) {
        return res.status(409).json({
          success: false,
          message: 'Serial number already exists'
        });
      }
    }

    // Auto-generate tag number based on source type and donor/supplier
    const count = await db.Asset.count();
    const seq = String(count + 1).padStart(5, '0');
    let tagNumber;
    if (sourceType === 'donation' && donorName) {
      // Use initials of each word in donor name (e.g. "Wollo University" → "WU")
      const initials = donorName.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase();
      tagNumber = `${initials}${seq}`;
    } else if (sourceType === 'transferred' && donorName) {
      // Use initials of transferring org (e.g. "Ministry of Innovation" → "MOI")
      const initials = donorName.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase();
      tagNumber = `${initials}${seq}`;
    } else {
      // Purchased — always WDU prefix
      tagNumber = `WDU${seq}`;
    }

    // Auto-generate assetId from tagNumber if not provided
    const finalAssetId = assetId || tagNumber;

    // Create asset
    const asset = await db.Asset.create({
      assetId: finalAssetId,
      name,
      category,
      serialNumber,
      value,
      purchaseDate,
      location: 'Store', // Always default to Store initially
      workUnit,
      status: status || 'available',
      condition: condition || 'excellent',
      description,
      warrantyExpiry,
      tagNumber,
      itemCategory,
      sourceType: sourceType || 'purchased',
      donorName,
      quantity: quantity || 1,
      createdBy: req.user.id
    });

    // Fetch with relations
    const createdAsset = await db.Asset.findByPk(asset.id, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: createdAsset
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (property_officer, administrator)
const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const asset = await db.Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if trying to update assetId to an existing one
    if (updates.assetId && updates.assetId !== asset.assetId) {
      const existingAsset = await db.Asset.findOne({ 
        where: { 
          assetId: updates.assetId,
          id: { [Op.ne]: id }
        } 
      });
      if (existingAsset) {
        return res.status(409).json({
          success: false,
          message: 'Asset ID already exists'
        });
      }
    }

    // Check if trying to update serialNumber to an existing one
    if (updates.serialNumber && updates.serialNumber !== asset.serialNumber) {
      const existingSerial = await db.Asset.findOne({ 
        where: { 
          serialNumber: updates.serialNumber,
          id: { [Op.ne]: id }
        } 
      });
      if (existingSerial) {
        return res.status(409).json({
          success: false,
          message: 'Serial number already exists'
        });
      }
    }

    // Track assignment changes for email notifications
    const previousAssignedTo = asset.assignedTo;
    const newAssignedTo = updates.assignedTo;

    // If assigning to user, verify user exists and update location
    if (updates.assignedTo) {
      const user = await db.User.findByPk(updates.assignedTo);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found for assignment'
        });
      }
      // Auto-update status to assigned
      updates.status = 'assigned';
      // Update location to user's work unit
      if (user.workUnit) {
        updates.location = user.workUnit;
      }
    } else if (updates.assignedTo === null) {
      // If unassigning, set status to available and location back to Store
      updates.status = 'available';
      updates.location = 'Store';
    }

    // Update asset
    await asset.update(updates);

    // Fetch updated asset with relations
    const updatedAsset = await db.Asset.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'assignedUser',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email', 'workUnit']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName']
        }
      ]
    });

    // Send email notifications for assignment changes
    try {
      // If newly assigned to someone
      if (newAssignedTo && newAssignedTo !== previousAssignedTo) {
        if (updatedAsset.assignedUser) {
          await notifyAssetAssigned(updatedAsset, updatedAsset.assignedUser, req.user);
        }
      }
      
      // If unassigned from someone
      if (previousAssignedTo && (!newAssignedTo || newAssignedTo !== previousAssignedTo)) {
        const previousUser = await db.User.findByPk(previousAssignedTo, {
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'email']
        });
        if (previousUser) {
          await notifyAssetUnassigned(updatedAsset, previousUser, req.user);
        }
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (administrator only)
const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;

    const asset = await db.Asset.findByPk(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check if asset is currently assigned
    if (asset.status === 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an assigned asset. Please unassign first.'
      });
    }

    await asset.destroy();

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get asset statistics
// @route   GET /api/assets/stats/summary
// @access  Private
const getAssetStats = async (req, res, next) => {
  try {
    const totalAssets = await db.Asset.count();
    const assignedAssets = await db.Asset.count({ where: { status: 'assigned' } });
    const availableAssets = await db.Asset.count({ where: { status: 'available' } });
    const underMaintenance = await db.Asset.count({ where: { status: 'under_maintenance' } });
    const inTransfer = await db.Asset.count({ where: { status: 'in_transfer' } });

    // Get category breakdown
    const categoryStats = await db.Asset.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    // Get condition breakdown
    const conditionStats = await db.Asset.findAll({
      attributes: [
        'condition',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['condition']
    });

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        assignedAssets,
        availableAssets,
        underMaintenance,
        inTransfer,
        categoryBreakdown: categoryStats,
        conditionBreakdown: conditionStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats
};

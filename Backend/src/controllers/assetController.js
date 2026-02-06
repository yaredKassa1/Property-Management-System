const { Op } = require('sequelize');
const db = require('../models');

// @desc    Get all assets with filtering and pagination
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res, next) => {
  try {
    const {
      status,
      category,
      department,
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

    if (department) {
      where.department = department;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { assetId: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
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
          attributes: ['id', 'username', 'fullName', 'email', 'department']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
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
          attributes: ['id', 'username', 'fullName', 'email', 'department']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
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
      location,
      department,
      status,
      condition,
      description,
      warrantyExpiry
    } = req.body;

    // Check if assetId already exists
    const existingAsset = await db.Asset.findOne({ where: { assetId } });
    if (existingAsset) {
      return res.status(409).json({
        success: false,
        message: 'Asset ID already exists'
      });
    }

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

    // Create asset
    const asset = await db.Asset.create({
      assetId,
      name,
      category,
      serialNumber,
      value,
      purchaseDate,
      location,
      department,
      status: status || 'available',
      condition: condition || 'excellent',
      description,
      warrantyExpiry,
      createdBy: req.user.id
    });

    // Fetch with relations
    const createdAsset = await db.Asset.findByPk(asset.id, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
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

    // If assigning to user, verify user exists
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
    } else if (updates.assignedTo === null) {
      // If unassigning, set status to available
      updates.status = 'available';
    }

    // Update asset
    await asset.update(updates);

    // Fetch updated asset with relations
    const updatedAsset = await db.Asset.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'assignedUser',
          attributes: ['id', 'username', 'fullName', 'email', 'department']
        },
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });

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

const { Op } = require('sequelize');
const db = require('../models');
const { createNotification } = require('./notificationController');

// @desc    Get all procurement inspections with filtering
// @route   GET /api/qa-inspections
// @access  Private (quality_assurance, property_officer, administrator)
const getInspections = async (req, res, next) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Search by asset name, asset ID, or item name
    let searchCondition = {};
    if (search) {
      searchCondition = {
        [Op.or]: [
          { '$asset.name$': { [Op.iLike]: `%${search}%` } },
          { '$asset.assetId$': { [Op.iLike]: `%${search}%` } },
          { '$request.itemName$': { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.ProcurementInspection.findAndCountAll({
      where: { ...where, ...searchCondition },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: db.Asset,
          as: 'asset',
          attributes: ['id', 'assetId', 'name', 'serialNumber', 'condition', 'status']
        },
        {
          model: db.Request,
          as: 'request',
          attributes: ['id', 'itemName', 'requestType', 'completionDate', 'requestedBy']
        },
        {
          model: db.User,
          as: 'inspector',
          attributes: ['id', 'firstName', 'middleName', 'lastName', 'role']
        }
      ],
      distinct: true
    });

    // Calculate stats
    const stats = await db.ProcurementInspection.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const statsMap = {
      total: count,
      pending: 0,
      approved: 0,
      rejected: 0,
      needs_correction: 0
    };

    stats.forEach(stat => {
      statsMap[stat.status] = parseInt(stat.count);
    });

    res.status(200).json({
      success: true,
      data: rows,
      stats: statsMap,
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

// @desc    Get single procurement inspection by ID
// @route   GET /api/qa-inspections/:id
// @access  Private (quality_assurance, property_officer, administrator)
const getInspectionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const inspection = await db.ProcurementInspection.findByPk(id, {
      include: [
        {
          model: db.Asset,
          as: 'asset'
        },
        {
          model: db.Request,
          as: 'request',
          include: [
            {
              model: db.User,
              as: 'requester',
              attributes: ['id', 'firstName', 'middleName', 'lastName', 'email', 'workUnit']
            }
          ]
        },
        {
          model: db.User,
          as: 'inspector',
          attributes: ['id', 'firstName', 'middleName', 'lastName', 'role']
        }
      ]
    });

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Procurement inspection not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inspection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit inspection result
// @route   POST /api/qa-inspections/:id/inspect
// @access  Private (quality_assurance, property_officer, administrator)
const submitInspection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      result,
      assessedCondition,
      remarks,
      rejectionReason,
      correctionRequired
    } = req.body;

    // Validate required fields
    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'Inspection result is required'
      });
    }

    if (!assessedCondition) {
      return res.status(400).json({
        success: false,
        message: 'Assessed condition is required'
      });
    }

    // Validate result-specific requirements
    if (result === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when result is rejected'
      });
    }

    if (result === 'needs_correction' && (!correctionRequired || correctionRequired.trim() === '')) {
      return res.status(400).json({
        success: false,
        message: 'Correction description is required when result is needs_correction'
      });
    }

    // Find the inspection
    const inspection = await db.ProcurementInspection.findByPk(id, {
      include: [
        {
          model: db.Asset,
          as: 'asset'
        },
        {
          model: db.Request,
          as: 'request',
          include: [
            {
              model: db.User,
              as: 'requester',
              attributes: ['id', 'firstName', 'middleName', 'lastName']
            }
          ]
        }
      ]
    });

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Procurement inspection not found'
      });
    }

    // Validate inspection can be submitted
    if (inspection.status !== 'pending' && inspection.status !== 'needs_correction') {
      return res.status(400).json({
        success: false,
        message: `Cannot inspect a record with status: ${inspection.status}`
      });
    }

    // Update inspection record
    await inspection.update({
      status: result,
      inspectedBy: req.user.id,
      inspectionDate: new Date(),
      assessedCondition,
      remarks,
      rejectionReason: result === 'rejected' ? rejectionReason : null,
      correctionRequired: result === 'needs_correction' ? correctionRequired : null
    });

    // Update asset status based on inspection result
    const asset = inspection.asset;
    if (result === 'approved') {
      // Asset approved - move to available inventory
      await asset.update({
        status: 'available',
        condition: assessedCondition
      });
    } else if (result === 'rejected') {
      // Asset rejected - mark as disposed
      await asset.update({
        status: 'disposed',
        description: `Rejected during QA inspection: ${rejectionReason}`
      });
    } else if (result === 'needs_correction') {
      // Asset needs correction - keep as pending_qa
      await asset.update({
        status: 'pending_qa'
      });
    }

    // Notify property officer on approved/rejected
    if (result === 'approved' || result === 'rejected') {
      try {
        const propertyOfficers = await db.User.findAll({
          where: { role: 'property_officer', isActive: true },
          attributes: ['id']
        });

        if (propertyOfficers.length) {
          const statusText = result === 'approved' ? 'approved' : 'rejected';
          await createNotification({
            userIds: propertyOfficers.map(u => u.id),
            title: `QA Inspection ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
            message: `Asset "${inspection.request.itemName}" has been ${statusText} by QA.`,
            type: 'general',
            relatedId: inspection.requestId
          });
        }

        // Also notify the requester
        if (inspection.request.requestedBy) {
          const statusText = result === 'approved' ? 'approved and added to inventory' : 'rejected';
          await createNotification({
            userIds: inspection.request.requestedBy,
            title: `QA Inspection ${result === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your requested asset "${inspection.request.itemName}" has been ${statusText}.`,
            type: 'general',
            relatedId: inspection.requestId
          });
        }
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }
    }

    // Create audit log
    try {
      await db.AuditLog.create({
        userId: req.user.id,
        action: `QA_INSPECTION_${result.toUpperCase()}`,
        entityType: 'ProcurementInspection',
        entityId: inspection.id,
        details: {
          assetId: inspection.assetId,
          requestId: inspection.requestId,
          result,
          assessedCondition,
          remarks,
          rejectionReason,
          correctionRequired
        }
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    // Fetch updated inspection with all relations
    const updatedInspection = await db.ProcurementInspection.findByPk(id, {
      include: [
        {
          model: db.Asset,
          as: 'asset'
        },
        {
          model: db.Request,
          as: 'request'
        },
        {
          model: db.User,
          as: 'inspector',
          attributes: ['id', 'firstName', 'middleName', 'lastName', 'role']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Inspection submitted successfully',
      data: updatedInspection
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInspections,
  getInspectionById,
  submitInspection
};

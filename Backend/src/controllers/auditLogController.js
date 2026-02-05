const { Op } = require('sequelize');
const db = require('../models');

// @desc    Get all audit logs with filtering
// @route   GET /api/audit-logs
// @access  Private (administrator only)
const getAuditLogs = async (req, res, next) => {
  try {
    const {
      userId,
      action,
      entityType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = 'timestamp',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;

    // Date range filter
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.AuditLog.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: db.User,
          as: 'user',
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
    if (error?.original?.code === '42P01' || error?.parent?.code === '42P01') {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }
    next(error);
  }
};

// @desc    Get single audit log by ID
// @route   GET /api/audit-logs/:id
// @access  Private (administrator only)
const getAuditLogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const auditLog = await db.AuditLog.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'email', 'role', 'department']
        }
      ]
    });

    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs for a specific user
// @route   GET /api/audit-logs/user/:userId
// @access  Private (administrator only)
const getUserAuditLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await db.AuditLog.findAndCountAll({
      where: { userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: db.User,
          as: 'user',
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

// @desc    Get audit log statistics
// @route   GET /api/audit-logs/stats/summary
// @access  Private (administrator only)
const getAuditLogStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const totalLogs = await db.AuditLog.count({ where });
    const successfulActions = await db.AuditLog.count({ 
      where: { ...where, status: 'success' } 
    });
    const failedActions = await db.AuditLog.count({ 
      where: { ...where, status: 'failure' } 
    });
    const errorActions = await db.AuditLog.count({ 
      where: { ...where, status: 'error' } 
    });

    // Action breakdown
    const actionStats = await db.AuditLog.findAll({
      where,
      attributes: [
        'action',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['action'],
      order: [[db.sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    // Entity type breakdown
    const entityStats = await db.AuditLog.findAll({
      where,
      attributes: [
        'entityType',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['entityType'],
      order: [[db.sequelize.literal('count'), 'DESC']]
    });

    // Most active users
    const activeUsers = await db.AuditLog.findAll({
      where,
      attributes: [
        'userId',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['username', 'fullName', 'role']
        }
      ],
      group: ['userId', 'user.id'],
      order: [[db.sequelize.literal('count'), 'DESC']],
      limit: 10
    });

    // Recent failed login attempts
    const failedLogins = await db.AuditLog.count({
      where: {
        ...where,
        action: 'LOGIN_FAILURE'
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        successfulActions,
        failedActions,
        errorActions,
        failedLogins,
        topActions: actionStats,
        entityTypeBreakdown: entityStats,
        mostActiveUsers: activeUsers
      }
    });
  } catch (error) {
    // If audit_logs table does not exist yet, return empty stats instead of 500
    if (error?.original?.code === '42P01' || error?.parent?.code === '42P01' || error?.name === 'SequelizeDatabaseError') {
      return res.status(200).json({
        success: true,
        data: {
          totalLogs: 0,
          successfulActions: 0,
          failedActions: 0,
          errorActions: 0,
          failedLogins: 0,
          topActions: [],
          entityTypeBreakdown: [],
          mostActiveUsers: []
        }
      });
    }
    next(error);
  }
};

// @desc    Get recent security events
// @route   GET /api/audit-logs/security/events
// @access  Private (administrator only)
const getSecurityEvents = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    // Get security-related events
    const securityEvents = await db.AuditLog.findAll({
      where: {
        action: {
          [Op.in]: [
            'LOGIN_FAILURE',
            'LOGIN_SUCCESS',
            'LOGOUT',
            'CREATE_USER',
            'UPDATE_USER',
            'DEACTIVATE_USER',
            'DELETE_USER_PERMANENT',
            'RESET_PASSWORD'
          ]
        }
      },
      limit: parseInt(limit),
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'role']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: securityEvents
    });
  } catch (error) {
    if (error?.original?.code === '42P01' || error?.parent?.code === '42P01') {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    next(error);
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getUserAuditLogs,
  getAuditLogStats,
  getSecurityEvents
};

const db = require('../models');
const { Op } = require('sequelize');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const totalAssets = await db.Asset.count();
    const assignedAssets = await db.Asset.count({ where: { status: 'assigned' } });
    const availableAssets = await db.Asset.count({ where: { status: 'available' } });
    const underMaintenance = await db.Asset.count({ where: { status: 'under_maintenance' } });
    const pendingTransfers = await db.Transfer.count({ where: { status: 'pending' } });
    const pendingReturns = await db.Return.count({ where: { status: 'pending' } });
    const pendingRequests = await db.Request.count({ where: { status: 'pending' } });

    // Recent activities from audit logs (if available)
    const recentActivities = await db.AuditLog.findAll({
      limit: 5,
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['username', 'fullName']
        }
      ]
    });

    const activityList = recentActivities.map(log => ({
      id: log.id,
      description: `${log.action.replace(/_/g, ' ')}${log.entityType ? ` (${log.entityType})` : ''}`,
      user: log.user?.fullName || log.user?.username || 'System',
      timestamp: log.timestamp
    }));

    res.status(200).json({
      success: true,
      data: {
        totalAssets,
        assignedAssets,
        availableAssets,
        underMaintenance,
        pendingTransfers,
        pendingReturns,
        pendingRequests,
        recentActivities: activityList
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Property Officer specific statistics
// @route   GET /api/dashboard/property-officer-stats
// @access  Private (property_officer only)
const getPropertyOfficerStats = async (req, res, next) => {
  try {
    // Get date range from query params
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter = {
        createdAt: {}
      };
      if (startDate) {
        dateFilter.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt[Op.lte] = end;
      }
    }
    // Asset Status Breakdown
    const totalAssets = await db.Asset.count();
    const availableAssets = await db.Asset.count({ where: { status: 'available' } });
    const assignedAssets = await db.Asset.count({ where: { status: 'assigned' } });
    const underMaintenance = await db.Asset.count({ where: { status: 'under_maintenance' } });
    const damagedAssets = await db.Asset.count({ where: { condition: 'damaged' } });
    const disposedAssets = await db.Asset.count({ where: { status: 'disposed' } });

    // Transfer Management Stats
    const pendingTransfers = await db.Transfer.count({ where: { status: 'pending' } });
    const approvedTransfers = await db.Transfer.count({ where: { status: 'approved' } });
    const completedTransfersToday = await db.Transfer.count({
      where: {
        status: 'completed',
        updatedAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Return Management Stats
    const pendingReturns = await db.Return.count({ where: { status: 'pending' } });
    const receivedReturns = await db.Return.count({ where: { status: 'received' } });
    const underInspection = await db.Return.count({ where: { status: 'under_inspection' } });
    const completedReturnsToday = await db.Return.count({
      where: {
        status: 'completed',
        updatedAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    // Asset Condition Breakdown
    const conditionStats = await db.Asset.findAll({
      attributes: [
        'condition',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['condition'],
      raw: true
    });

    // Recent Asset Registrations (Last 7 days or filtered period)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const registrationFilter = startDate || endDate ? dateFilter : {
      createdAt: {
        [Op.gte]: sevenDaysAgo
      }
    };
    const recentRegistrations = await db.Asset.count({
      where: registrationFilter
    });

    // Asset Trend (Last 30 days by week)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const assetTrend = await db.Asset.findAll({
      attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'date'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
      order: [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Low Stock Alerts (if tracking quantities)
    // Placeholder for future stock tracking
    const lowStockAlerts = [];

    // Assignment Analytics
    const assignmentsByDepartment = await db.Asset.findAll({
      attributes: [
        'department',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        status: 'assigned',
        department: {
          [Op.ne]: null
        }
      },
      group: ['department'],
      raw: true
    });

    // Monthly Activity Summary
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyRegistrations = await db.Asset.count({
      where: {
        createdAt: {
          [Op.gte]: currentMonth
        }
      }
    });

    const monthlyTransfers = await db.Transfer.count({
      where: {
        status: 'completed',
        updatedAt: {
          [Op.gte]: currentMonth
        }
      }
    });

    const monthlyReturns = await db.Return.count({
      where: {
        status: 'completed',
        updatedAt: {
          [Op.gte]: currentMonth
        }
      }
    });

    // Assets requiring attention (damaged or maintenance)
    const assetsRequiringAttention = await db.Asset.findAll({
      where: {
        [Op.or]: [
          { status: 'under_maintenance' },
          { condition: 'damaged' },
          { condition: 'poor' }
        ]
      },
      attributes: ['id', 'assetId', 'name', 'status', 'condition', 'location'],
      limit: 10,
      order: [['updatedAt', 'DESC']]
    });

    // Transfer Processing Time (average days from pending to completed)
    const recentCompletedTransfers = await db.Transfer.findAll({
      where: {
        status: 'completed',
        updatedAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: ['createdAt', 'updatedAt'],
      raw: true
    });

    let avgTransferTime = 0;
    if (recentCompletedTransfers.length > 0) {
      const totalDays = recentCompletedTransfers.reduce((sum, transfer) => {
        const days = Math.ceil((new Date(transfer.updatedAt) - new Date(transfer.createdAt)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgTransferTime = Math.round(totalDays / recentCompletedTransfers.length);
    }

    // Return Processing Time
    const recentCompletedReturns = await db.Return.findAll({
      where: {
        status: 'completed',
        updatedAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      attributes: ['createdAt', 'updatedAt'],
      raw: true
    });

    let avgReturnTime = 0;
    if (recentCompletedReturns.length > 0) {
      const totalDays = recentCompletedReturns.reduce((sum, returnItem) => {
        const days = Math.ceil((new Date(returnItem.updatedAt) - new Date(returnItem.createdAt)) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgReturnTime = Math.round(totalDays / recentCompletedReturns.length);
    }

    // Asset Utilization Rate
    const utilizationRate = totalAssets > 0 
      ? Math.round((assignedAssets / totalAssets) * 100) 
      : 0;

    // Assets by Category
    const categoryStats = await db.Asset.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    // Top 5 Recent Asset Activities
    const recentAssetActivities = await db.AuditLog.findAll({
      where: {
        entityType: 'Asset'
      },
      limit: 5,
      order: [['timestamp', 'DESC']],
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['username', 'fullName']
        }
      ]
    });

    const assetActivityList = recentAssetActivities.map(log => ({
      id: log.id,
      action: log.action,
      description: `${log.action.replace(/_/g, ' ')}`,
      user: log.user?.fullName || log.user?.username || 'System',
      timestamp: log.timestamp,
      details: log.details
    }));

    // Pending Actions Summary
    const pendingActions = {
      transfersToComplete: approvedTransfers,
      returnsToReceive: pendingReturns,
      returnsToInspect: underInspection,
      assetsToMaintain: underMaintenance
    };

    res.status(200).json({
      success: true,
      data: {
        assetOverview: {
          totalAssets,
          availableAssets,
          assignedAssets,
          underMaintenance,
          damagedAssets,
          disposedAssets,
          utilizationRate
        },
        transferStats: {
          pendingTransfers,
          approvedTransfers,
          completedToday: completedTransfersToday,
          avgProcessingTime: avgTransferTime
        },
        returnStats: {
          pendingReturns,
          receivedReturns,
          underInspection,
          completedToday: completedReturnsToday,
          avgProcessingTime: avgReturnTime
        },
        conditionBreakdown: conditionStats,
        categoryBreakdown: categoryStats,
        recentRegistrations,
        recentActivities: assetActivityList,
        pendingActions,
        assetTrend,
        lowStockAlerts,
        assignmentsByDepartment,
        monthlyActivity: {
          registrations: monthlyRegistrations,
          transfers: monthlyTransfers,
          returns: monthlyReturns
        },
        assetsRequiringAttention,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPropertyOfficerStats
};

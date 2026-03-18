const db = require('../models');

/**
 * Log a transfer history action
 * @param {Object} params - History parameters
 * @param {string} params.transferId - Transfer ID
 * @param {string} params.action - Action type (created, approved, rejected, completed, cancelled)
 * @param {string} params.performedBy - User ID who performed the action
 * @param {string} params.previousStatus - Previous status (optional)
 * @param {string} params.newStatus - New status
 * @param {string} params.notes - Additional notes (optional)
 * @param {Object} params.metadata - Additional metadata (optional)
 * @param {Object} params.req - Express request object (for IP and user agent)
 */
const logTransferHistory = async ({
  transferId,
  action,
  performedBy,
  previousStatus,
  newStatus,
  notes,
  metadata,
  req
}) => {
  try {
    const historyData = {
      transferId,
      action,
      performedBy,
      previousStatus,
      newStatus,
      notes,
      metadata,
      ipAddress: req ? (req.ip || req.connection.remoteAddress) : null,
      userAgent: req ? req.get('user-agent') : null
    };

    await db.TransferHistory.create(historyData);
    console.log(`Transfer history logged: ${action} for transfer ${transferId}`);
  } catch (error) {
    console.error('Failed to log transfer history:', error);
    // Don't throw error - history logging should not break the main flow
  }
};

/**
 * Get transfer history for a specific transfer
 * @param {string} transferId - Transfer ID
 * @returns {Promise<Array>} Array of history records
 */
const getTransferHistory = async (transferId) => {
  try {
    const history = await db.TransferHistory.findAll({
      where: { transferId },
      include: [
        {
          model: db.User,
          as: 'performer',
          attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    return history;
  } catch (error) {
    console.error('Failed to get transfer history:', error);
    return [];
  }
};

module.exports = {
  logTransferHistory,
  getTransferHistory
};

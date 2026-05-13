const { Notification, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Notification Service
 * Handles notification creation and delivery
 */
class NotificationService {
  /**
   * Send a notification to a user or role
   * @param {Object} notificationRequest - Notification details
   * @returns {Promise<void>}
   */
  async sendNotification(notificationRequest) {
    const {
      recipientId,
      recipientRole,
      type,
      subject,
      message,
      actionUrl,
      metadata = {}
    } = notificationRequest;

    try {
      let recipients = [];

      // Determine recipients
      if (recipientId) {
        recipients = [recipientId];
      } else if (recipientRole) {
        // Find users with the specified role
        const users = await User.findAll({
          where: { role: recipientRole },
          attributes: ['id']
        });
        recipients = users.map(u => u.id);
      }

      // Create notifications for all recipients
      const notifications = await Promise.all(
        recipients.map(userId =>
          Notification.create({
            userId,
            title: subject,
            message,
            type: 'general',  // use valid ENUM value
            isRead: false,
            relatedId: metadata?.requestId || null
          })
        )
      );

      // TODO: Trigger delivery through configured channels (email, SMS, etc.)
      // For now, we just create in-app notifications

      return notifications;
    } catch (error) {
      console.error('Error sending notification:', error);
      // Don't throw - notification failures shouldn't block workflow
      return [];
    }
  }

  /**
   * Build notification content for workflow events
   * @param {string} eventType - Type of event
   * @param {Object} context - Event context
   * @returns {Object} Notification content
   */
  buildNotificationContent(eventType, context) {
    const { requestId, requestorName, itemName, workflowId, comments } = context;

    const contentMap = {
      'request_submitted': {
        subject: 'New Request Submitted',
        message: `A new request for ${itemName} has been submitted by ${requestorName}.`,
        actionUrl: `/requests/${requestId}`
      },
      'item_assigned': {
        subject: 'Item Assigned',
        message: `Your requested item "${itemName}" has been assigned to you and is ready for collection.`,
        actionUrl: `/requests/${requestId}`
      },
      'approval_required': {
        subject: 'Approval Required',
        message: `A procurement request for ${itemName} requires your approval.`,
        actionUrl: `/workflows/${workflowId}/approve`
      },
      'request_approved': {
        subject: 'Request Approved',
        message: `Your request for ${itemName} has been approved and is moving forward.`,
        actionUrl: `/requests/${requestId}`
      },
      'request_rejected': {
        subject: 'Request Rejected',
        message: `Your request for ${itemName} has been rejected. Reason: ${comments || 'Not specified'}`,
        actionUrl: `/requests/${requestId}`
      },
      'purchase_required': {
        subject: 'Purchase Required',
        message: `Please procure ${itemName} for approved request.`,
        actionUrl: `/workflows/${workflowId}/purchase`
      },
      'qa_inspection_required': {
        subject: 'QA Inspection Required',
        message: `Item ${itemName} has been procured and requires quality inspection.`,
        actionUrl: `/workflows/${workflowId}/qa-inspect`
      },
      'item_ready': {
        subject: 'Item Ready for Collection',
        message: `Your requested item "${itemName}" has passed QA and is ready for collection.`,
        actionUrl: `/requests/${requestId}/collect`
      },
      'request_cancelled': {
        subject: 'Request Cancelled',
        message: `Request for ${itemName} has been cancelled.`,
        actionUrl: `/requests/${requestId}`
      }
    };

    return contentMap[eventType] || {
      subject: 'Notification',
      message: 'You have a new notification',
      actionUrl: '/'
    };
  }

  /**
   * Get user notifications
   * @param {string} userId - ID of user
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} User's notifications
   */
  async getUserNotifications(userId, filters = {}) {
    const where = { userId };
    if (filters.read !== undefined) where.isRead = filters.read;

    return await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: filters.limit || 50
    });
  }

  async markAsRead(notificationId, userId) {
    await Notification.update(
      { isRead: true },
      { where: { id: notificationId, userId } }
    );
  }

  async markAllAsRead(userId) {
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
  }

  async getUnreadCount(userId) {
    return await Notification.count({ where: { userId, isRead: false } });
  }
}

module.exports = new NotificationService();

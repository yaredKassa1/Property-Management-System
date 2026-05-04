const db = require('../models');

// @desc  Get notifications for the logged-in user
// @route GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await db.Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

// @desc  Mark a notification as read
// @route POST /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const notif = await db.Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });

    await notif.update({ isRead: true });
    res.json({ success: true, data: notif });
  } catch (err) {
    next(err);
  }
};

// @desc  Mark all notifications as read
// @route POST /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    await db.Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

// Helper: create a notification for one or more users
const createNotification = async ({ userIds, title, message, type = 'general', relatedId = null }) => {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  const records = ids.filter(Boolean).map(userId => ({
    userId,
    title,
    message,
    type,
    relatedId,
  }));
  if (records.length) await db.Notification.bulkCreate(records);
};

module.exports = { getNotifications, markAsRead, markAllAsRead, createNotification };

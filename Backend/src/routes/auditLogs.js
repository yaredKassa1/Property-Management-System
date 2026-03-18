const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleCheck');
const {
  getAuditLogs,
  getAuditLogById,
  getUserAuditLogs,
  getAuditLogStats,
  getSecurityEvents
} = require('../controllers/auditLogController');

// All routes require authentication and administrator permission
router.use(verifyToken);
router.use(requirePermission('view_logs'));

// @route   GET /api/audit-logs/stats/summary
// @desc    Get audit log statistics
// @access  Private (administrator only)
router.get('/stats/summary', getAuditLogStats);

// @route   GET /api/audit-logs/security/events
// @desc    Get recent security events
// @access  Private (administrator only)
router.get('/security/events', getSecurityEvents);

// @route   GET /api/audit-logs/user/:userId
// @desc    Get audit logs for a specific user
// @access  Private (administrator only)
router.get(
  '/user/:userId',
  [
    param('userId')
      .isUUID()
      .withMessage('Invalid user ID')
  ],
  validate,
  getUserAuditLogs
);

// @route   GET /api/audit-logs
// @desc    Get all audit logs
// @access  Private (administrator only)
router.get(
  '/',
  [
    query('action')
      .optional()
      .trim(),
    query('entityType')
      .optional()
      .trim(),
    query('status')
      .optional()
      .isIn(['success', 'failure', 'error'])
      .withMessage('Invalid status'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage('Limit must be between 1 and 200')
  ],
  validate,
  getAuditLogs
);

// @route   GET /api/audit-logs/:id
// @desc    Get single audit log
// @access  Private (administrator only)
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid audit log ID')
  ],
  validate,
  getAuditLogById
);

module.exports = router;

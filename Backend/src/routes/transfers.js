const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const {
  getTransfers,
  getTransferById,
  createTransfer,
  approveTransfer,
  rejectTransfer,
  completeTransfer,
  cancelTransfer
} = require('../controllers/transferController');

// All routes require authentication
router.use(verifyToken);

// @route   GET /api/transfers
// @desc    Get all transfers
// @access  Private
router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'in_transit', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  validate,
  getTransfers
);

// @route   GET /api/transfers/:id
// @desc    Get single transfer
// @access  Private
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid transfer ID')
  ],
  validate,
  getTransferById
);

// @route   POST /api/transfers
// @desc    Create transfer request
// @access  Private
router.post(
  '/',
  [
    body('assetId')
      .isUUID()
      .withMessage('Valid asset ID is required'),
    body('toUserId')
      .isUUID()
      .withMessage('Valid recipient user ID is required'),
    body('fromUserId')
      .optional()
      .isUUID()
      .withMessage('Invalid sender user ID'),
    body('fromLocation')
      .trim()
      .notEmpty()
      .withMessage('From location is required'),
    body('toLocation')
      .trim()
      .notEmpty()
      .withMessage('To location is required'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Reason is required')
      .isLength({ min: 10 })
      .withMessage('Reason must be at least 10 characters')
  ],
  validate,
  createTransfer
);

// @route   POST /api/transfers/:id/approve
// @desc    Approve transfer
// @access  Private (vice_president only)
router.post(
  '/:id/approve',
  requireRole('vice_president'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid transfer ID'),
    body('notes')
      .optional()
      .trim()
  ],
  validate,
  approveTransfer
);

// @route   POST /api/transfers/:id/reject
// @desc    Reject transfer
// @access  Private (vice_president only)
router.post(
  '/:id/reject',
  requireRole('vice_president'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid transfer ID'),
    body('rejectionReason')
      .trim()
      .notEmpty()
      .withMessage('Rejection reason is required')
      .isLength({ min: 10 })
      .withMessage('Rejection reason must be at least 10 characters')
  ],
  validate,
  rejectTransfer
);

// @route   POST /api/transfers/:id/complete
// @desc    Complete transfer
// @access  Private (property_officer only)
router.post(
  '/:id/complete',
  requirePermission('manage_transfers'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid transfer ID')
  ],
  validate,
  completeTransfer
);

// @route   DELETE /api/transfers/:id
// @desc    Cancel transfer
// @access  Private (requester or administrator)
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid transfer ID')
  ],
  validate,
  cancelTransfer
);

module.exports = router;

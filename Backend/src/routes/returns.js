const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const {
  getReturns,
  getReturnById,
  createReturn,
  receiveReturn,
  inspectReturn,
  approveReturn,
  rejectReturn
} = require('../controllers/returnController');

// All routes require authentication
router.use(verifyToken);

// @route   GET /api/returns
// @desc    Get all returns
// @access  Private
router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['pending', 'received', 'under_inspection', 'approved', 'rejected', 'completed'])
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
  getReturns
);

// @route   GET /api/returns/:id
// @desc    Get single return
// @access  Private
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid return ID')
  ],
  validate,
  getReturnById
);

// @route   POST /api/returns
// @desc    Create return request
// @access  Private
router.post(
  '/',
  [
    body('assetId')
      .isUUID()
      .withMessage('Valid asset ID is required'),
    body('reason')
      .trim()
      .notEmpty()
      .withMessage('Reason is required')
      .isLength({ min: 10 })
      .withMessage('Reason must be at least 10 characters')
  ],
  validate,
  createReturn
);

// @route   POST /api/returns/:id/receive
// @desc    Receive returned asset
// @access  Private (property_officer only)
router.post(
  '/:id/receive',
  requirePermission('receive_returns'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid return ID')
  ],
  validate,
  receiveReturn
);

// @route   POST /api/returns/:id/inspect
// @desc    Inspect returned asset
// @access  Private (quality_assurance, property_officer only)
router.post(
  '/:id/inspect',
  requireRole('quality_assurance', 'property_officer'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid return ID'),
    body('returnCondition')
      .isIn(['excellent', 'good', 'fair', 'poor', 'damaged'])
      .withMessage('Valid return condition is required'),
    body('inspectionNotes')
      .optional()
      .trim(),
    body('damageDescription')
      .optional()
      .trim()
  ],
  validate,
  inspectReturn
);

// @route   POST /api/returns/:id/approve
// @desc    Approve return (complete)
// @access  Private (property_officer only)
router.post(
  '/:id/approve',
  requirePermission('approve_returns'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid return ID')
  ],
  validate,
  approveReturn
);

// @route   POST /api/returns/:id/reject
// @desc    Reject return
// @access  Private (property_officer only)
router.post(
  '/:id/reject',
  requirePermission('approve_returns'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid return ID'),
    body('inspectionNotes')
      .trim()
      .notEmpty()
      .withMessage('Inspection notes are required for rejection')
  ],
  validate,
  rejectReturn
);

module.exports = router;

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  reviewRequest,
  approveRequest,
  rejectRequest,
  completeRequest,
  cancelRequest
} = require('../controllers/requestController');

// All routes require authentication
router.use(verifyToken);

// @route   GET /api/requests
// @desc    Get all requests
// @access  Private
router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['pending', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    query('requestType')
      .optional()
      .isIn(['withdrawal', 'purchase', 'transfer', 'maintenance', 'disposal'])
      .withMessage('Invalid request type'),
    query('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
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
  getRequests
);

// @route   GET /api/requests/:id
// @desc    Get single request
// @access  Private
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid request ID')
  ],
  validate,
  getRequestById
);

// @route   POST /api/requests
// @desc    Create new request
// @access  Private
router.post(
  '/',
  [
    body('requestType')
      .isIn(['withdrawal', 'purchase', 'transfer', 'maintenance', 'disposal'])
      .withMessage('Valid request type is required'),
    body('assetId')
      .optional()
      .isUUID()
      .withMessage('Invalid asset ID'),
    body('itemName')
      .trim()
      .notEmpty()
      .withMessage('Item name is required')
      .isLength({ max: 200 })
      .withMessage('Item name must not exceed 200 characters'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('estimatedCost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Estimated cost must be a positive number'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('purpose')
      .trim()
      .notEmpty()
      .withMessage('Purpose is required')
      .isLength({ min: 10 })
      .withMessage('Purpose must be at least 10 characters'),
    body('justification')
      .optional()
      .trim(),
    body('specifications')
      .optional()
      .trim()
  ],
  validate,
  createRequest
);

// @route   PUT /api/requests/:id
// @desc    Update request
// @access  Private (requester or administrator)
router.put(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid request ID'),
    body('itemName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Item name cannot be empty'),
    body('quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority')
  ],
  validate,
  updateRequest
);

// @route   POST /api/requests/:id/review
// @desc    Mark request as under review
// @access  Private (approval_authority, vice_president only)
router.post(
  '/:id/review',
  requirePermission('approve_requests'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid request ID')
  ],
  validate,
  reviewRequest
);

// @route   POST /api/requests/:id/approve
// @desc    Approve request
// @access  Private (approval_authority, vice_president only)
router.post(
  '/:id/approve',
  requirePermission('approve_requests'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid request ID'),
    body('approvalNotes')
      .optional()
      .trim()
  ],
  validate,
  approveRequest
);

// @route   POST /api/requests/:id/reject
// @desc    Reject request
// @access  Private (approval_authority, vice_president only)
router.post(
  '/:id/reject',
  requirePermission('approve_requests'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid request ID'),
    body('rejectionReason')
      .trim()
      .notEmpty()
      .withMessage('Rejection reason is required')
      .isLength({ min: 10 })
      .withMessage('Rejection reason must be at least 10 characters')
  ],
  validate,
  rejectRequest
);

// @route   POST /api/requests/:id/complete
// @desc    Mark request as completed
// @access  Private (property_officer, purchase_department only)
router.post(
  '/:id/complete',
  requireRole('property_officer', 'purchase_department'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid request ID')
  ],
  validate,
  completeRequest
);

// @route   DELETE /api/requests/:id
// @desc    Cancel request
// @access  Private (requester or administrator)
router.delete(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid request ID')
  ],
  validate,
  cancelRequest
);

module.exports = router;

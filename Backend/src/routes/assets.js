const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats
} = require('../controllers/assetController');

// All routes require authentication
router.use(verifyToken);

// @route   GET /api/assets/stats/summary
// @desc    Get asset statistics
// @access  Private
router.get('/stats/summary', getAssetStats);

// @route   GET /api/assets
// @desc    Get all assets with filtering
// @access  Private
router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['available', 'assigned', 'in_transfer', 'under_maintenance', 'disposed'])
      .withMessage('Invalid status'),
    query('category')
      .optional()
      .isIn(['fixed', 'fixed_consumable'])
      .withMessage('Invalid category'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 10000 })
      .withMessage('Limit must be between 1 and 10000')
  ],
  validate,
  getAssets
);

// @route   GET /api/assets/:id
// @desc    Get single asset
// @access  Private
router.get(
  '/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Invalid asset ID')
  ],
  validate,
  getAssetById
);

// @route   POST /api/assets
// @desc    Create new asset
// @access  Private (property_officer only)
router.post(
  '/',
  requirePermission('manage_assets'),
  [
    body('assetId')
      .trim()
      .notEmpty()
      .withMessage('Asset ID is required')
      .isLength({ max: 50 })
      .withMessage('Asset ID must not exceed 50 characters'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Asset name is required')
      .isLength({ max: 200 })
      .withMessage('Asset name must not exceed 200 characters'),
    body('category')
      .isIn(['fixed', 'fixed_consumable'])
      .withMessage('Category must be either fixed or fixed_consumable'),
    body('value')
      .isFloat({ min: 0 })
      .withMessage('Value must be a positive number'),
    body('purchaseDate')
      .isDate()
      .withMessage('Purchase date must be a valid date'),
    body('location')
      .trim()
      .notEmpty()
      .withMessage('Location is required'),
    body('status')
      .optional()
      .isIn(['available', 'assigned', 'in_transfer', 'under_maintenance', 'disposed'])
      .withMessage('Invalid status'),
    body('condition')
      .optional()
      .isIn(['excellent', 'good', 'fair', 'poor', 'damaged'])
      .withMessage('Invalid condition'),
    body('serialNumber')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Serial number must not exceed 100 characters'),
    body('warrantyExpiry')
      .optional()
      .isDate()
      .withMessage('Warranty expiry must be a valid date')
  ],
  validate,
  createAsset
);

// @route   PUT /api/assets/:id
// @desc    Update asset
// @access  Private (property_officer only)
router.put(
  '/:id',
  requirePermission('manage_assets'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid asset ID'),
    body('assetId')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Asset ID cannot be empty')
      .isLength({ max: 50 })
      .withMessage('Asset ID must not exceed 50 characters'),
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Asset name cannot be empty')
      .isLength({ max: 200 })
      .withMessage('Asset name must not exceed 200 characters'),
    body('category')
      .optional()
      .isIn(['fixed', 'fixed_consumable'])
      .withMessage('Category must be either fixed or fixed_consumable'),
    body('value')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Value must be a positive number'),
    body('status')
      .optional()
      .isIn(['available', 'assigned', 'in_transfer', 'under_maintenance', 'disposed'])
      .withMessage('Invalid status'),
    body('condition')
      .optional()
      .isIn(['excellent', 'good', 'fair', 'poor', 'damaged'])
      .withMessage('Invalid condition'),
    body('assignedTo')
      .optional()
      .custom((value) => value === null || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
      .withMessage('Invalid user ID for assignment')
  ],
  validate,
  updateAsset
);

// @route   DELETE /api/assets/:id
// @desc    Delete asset
// @access  Private (property_officer only - soft delete recommended)
router.delete(
  '/:id',
  requirePermission('manage_assets'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid asset ID')
  ],
  validate,
  deleteAsset
);

module.exports = router;

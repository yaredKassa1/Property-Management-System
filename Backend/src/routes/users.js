const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleCheck');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  getUserStats,
  getApprovalAuthorities
} = require('../controllers/userController');

// All routes require authentication
router.use(verifyToken);

// Most routes require administrator permission (manage_users)
// But we'll allow property_officer to read users for assignment purposes

// @route   GET /api/users/stats/summary
// @desc    Get user statistics
// @access  Private (administrator only)
router.get('/stats/summary', requirePermission('manage_users'), getUserStats);

// @route   GET /api/users/approval-authorities
// @desc    Get all approval authorities (for request assignment)
// @access  Private (all authenticated users can see approval authorities)
router.get('/approval-authorities', getApprovalAuthorities);

// @route   GET /api/users
// @desc    Get all users
// @access  Private (administrator, property_officer for assignments)
router.get(
  '/',
  [
    query('role')
      .optional()
      .isIn(['administrator', 'vice_president', 'property_officer', 'approval_authority', 'purchase_department', 'quality_assurance', 'staff'])
      .withMessage('Invalid role'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
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
  getUsers
);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (administrator only)
router.get(
  '/:id',
  requirePermission('manage_users'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID')
  ],
  validate,
  getUserById
);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (administrator only)
router.post(
  '/',
  requirePermission('manage_users'),
  [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 50 })
      .withMessage('First name must not exceed 50 characters'),
    body('middleName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Middle name must not exceed 50 characters'),
    body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 50 })
      .withMessage('Last name must not exceed 50 characters'),
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^\+251[97]\d{8}$/)
      .withMessage('Phone number must be in Ethiopian format: +251 9XXXXXXXX (Ethio Telecom) or +251 7XXXXXXXX (Safaricom)'),
    body('role')
      .optional()
      .isIn(['administrator', 'vice_president', 'property_officer', 'approval_authority', 'purchase_department', 'quality_assurance', 'staff'])
      .withMessage('Invalid role'),
    body('workUnit')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Work unit must not exceed 100 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],
  validate,
  createUser
);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (administrator only)
router.put(
  '/:id',
  requirePermission('manage_users'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID'),
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name must not exceed 50 characters'),
    body('middleName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Middle name must not exceed 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name must not exceed 50 characters'),
    body('phoneNumber')
      .optional()
      .trim()
      .matches(/^\+251[97]\d{8}$/)
      .withMessage('Phone number must be in Ethiopian format: +251 9XXXXXXXX (Ethio Telecom) or +251 7XXXXXXXX (Safaricom)'),
    body('role')
      .optional()
      .isIn(['administrator', 'vice_president', 'property_officer', 'approval_authority', 'purchase_department', 'quality_assurance', 'staff'])
      .withMessage('Invalid role'),
    body('workUnit')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Work unit must not exceed 100 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],
  validate,
  updateUser
);

// @route   POST /api/users/:id/reset-password
// @desc    Reset user password
// @access  Private (administrator only)
router.post(
  '/:id/reset-password',
  requirePermission('manage_users'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  validate,
  resetPassword
);

// @route   DELETE /api/users/:id
// @desc    Delete/deactivate user
// @access  Private (administrator only)
router.delete(
  '/:id',
  requirePermission('manage_users'),
  [
    param('id')
      .isUUID()
      .withMessage('Invalid user ID'),
    query('permanent')
      .optional()
      .isBoolean()
      .withMessage('permanent must be a boolean')
  ],
  validate,
  deleteUser
);

module.exports = router;

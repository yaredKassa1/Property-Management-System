const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { logAction } = require('../middleware/auditLog');
const { body, validationResult } = require('express-validator');

// Validation rules for user creation
const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Username can only contain letters, numbers, dots, underscores, and hyphens'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('middleName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Middle name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Middle name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phoneNumber')
    .optional()
    .matches(/^\+251[79]\d{8}$/)
    .withMessage('Phone number must be in format +251XXXXXXXXX (9 digits after +251, starting with 7 or 9)'),
  
  body('wing')
    .isIn(['academic', 'administrative'])
    .withMessage('Wing must be either academic or administrative'),
  
  body('college')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('College must be less than 100 characters'),
  
  body('school')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('School must be less than 100 characters'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  
  body('administrativeUnit')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Administrative unit must be less than 100 characters'),
  
  body('role')
    .isIn(['administrator', 'vice_president', 'property_officer', 'approval_authority', 'purchase_department', 'quality_assurance', 'staff'])
    .withMessage('Invalid role specified'),
  
  body('workUnit')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Work unit must be less than 100 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Validation rules for user update
const updateUserValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('middleName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Middle name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]*$/)
    .withMessage('Middle name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phoneNumber')
    .optional()
    .matches(/^\+251[79]\d{8}$/)
    .withMessage('Phone number must be in format +251XXXXXXXXX (9 digits after +251, starting with 7 or 9)'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('role')
    .optional()
    .isIn(['administrator', 'vice_president', 'property_officer', 'approval_authority', 'purchase_department', 'quality_assurance', 'staff'])
    .withMessage('Invalid role specified'),
  
  body('workUnit')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Work unit must be less than 100 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Custom validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};
// @route   GET /api/users
// @access  Private (administrator only)
// @desc    Get all users
// @route   GET /api/users
// @access  Private (administrator only)
const getUsers = async (req, res, next) => {
  try {
    const {
      role,
      isActive,
      workUnit,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (workUnit) where.workUnit = workUnit;

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await db.User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]]
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (administrator only)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (administrator only)
const createUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      phoneNumber,
      role,
      wing,
      college,
      school,
      department,
      administrativeUnit,
      workUnit,
      isActive
    } = req.body;

    // Validate wing-specific fields
    if (!wing || !['academic', 'administrative'].includes(wing)) {
      return res.status(400).json({
        success: false,
        message: 'Wing must be either academic or administrative'
      });
    }

    if (wing === 'academic' && !college) {
      return res.status(400).json({
        success: false,
        message: 'College is required for academic wing users'
      });
    }

    if (wing === 'academic' && !department) {
      return res.status(400).json({
        success: false,
        message: 'Department is required for academic wing users'
      });
    }

    if (wing === 'administrative' && !administrativeUnit) {
      return res.status(400).json({
        success: false,
        message: 'Administrative unit is required for administrative wing users'
      });
    }

    // Check if username already exists
    const existingUsername = await db.User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await db.User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if phone number already exists (if provided)
    if (phoneNumber) {
      const existingPhone = await db.User.findOne({ where: { phoneNumber } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'Phone number is already assigned to another user'
        });
      }
    }

    // Create user (password will be hashed by model hook)
    const user = await db.User.create({
      username,
      email,
      password,
      firstName,
      middleName,
      lastName,
      phoneNumber,
      role: role || 'staff',
      wing,
      college: wing === 'academic' ? college : null,
      school: wing === 'academic' ? school : null,
      department: wing === 'academic' ? department : null,
      administrativeUnit: wing === 'administrative' ? administrativeUnit : null,
      workUnit,
      isActive: isActive !== undefined ? isActive : true
    });

    // Return user without password
    const userData = user.toSafeObject();

    // Log user creation
    await logAction(
      req.user.id,
      'CREATE_USER',
      'user',
      user.id,
      { username: user.username, role: user.role, workUnit: user.workUnit },
      req
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (administrator only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent updating own administrator role
    if (req.user.id === id && updates.role && updates.role !== 'administrator') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own administrator role'
      });
    }

    // Check if trying to update username to an existing one
    if (updates.username && updates.username !== user.username) {
      const existingUsername = await db.User.findOne({ 
        where: { 
          username: updates.username,
          id: { [Op.ne]: id }
        } 
      });
      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // Check if trying to update email to an existing one
    if (updates.email && updates.email !== user.email) {
      const existingEmail = await db.User.findOne({ 
        where: { 
          email: updates.email,
          id: { [Op.ne]: id }
        } 
      });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Check if trying to update phone number to an existing one
    if (updates.phoneNumber && updates.phoneNumber !== user.phoneNumber) {
      const existingPhone = await db.User.findOne({ 
        where: { 
          phoneNumber: updates.phoneNumber,
          id: { [Op.ne]: id }
        } 
      });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'Phone number is already assigned to another user'
        });
      }
    }

    // Update user (password will be hashed by model hook if changed)
    await user.update(updates);

    // Return updated user without password
    const updatedUser = await db.User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    // Log user update
    await logAction(
      req.user.id,
      'UPDATE_USER',
      'user',
      id,
      { updates, username: updatedUser.username },
      req
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/deactivate user
// @route   DELETE /api/users/:id
// @access  Private (administrator only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting own account
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has assigned assets
    const assignedAssets = await db.Asset.count({ where: { assignedTo: id } });
    if (assignedAssets > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with assigned assets. Please unassign assets first.'
      });
    }

    if (permanent === 'true') {
      // Permanent delete (use with caution)
      await user.destroy();
      
      // Log permanent deletion
      await logAction(
        req.user.id,
        'DELETE_USER_PERMANENT',
        'user',
        id,
        { username: user.username, permanent: true },
        req
      );
      
      return res.status(200).json({
        success: true,
        message: 'User permanently deleted'
      });
    } else {
      // Soft delete - just deactivate
      await user.update({ isActive: false });
      
      // Log deactivation
      await logAction(
        req.user.id,
        'DEACTIVATE_USER',
        'user',
        id,
        { username: user.username },
        req
      );
      
      return res.status(200).json({
        success: true,
        message: 'User deactivated successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset user password
// @route   POST /api/users/:id/reset-password
// @access  Private (administrator only)
const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await db.User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password (will be hashed by model hook)
    await user.update({ password: newPassword });

    // Log password reset
    await logAction(
      req.user.id,
      'RESET_PASSWORD',
      'user',
      id,
      { username: user.username, performedBy: req.user.username },
      req
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats/summary
// @access  Private (administrator only)
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await db.User.count();
    const activeUsers = await db.User.count({ where: { isActive: true } });
    const inactiveUsers = await db.User.count({ where: { isActive: false } });

    // Get role breakdown
    const roleStats = await db.User.findAll({
      attributes: [
        'role',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    // Get work unit breakdown
    const workUnitStats = await db.User.findAll({
      attributes: [
        'workUnit',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        workUnit: { [Op.ne]: null }
      },
      group: ['workUnit']
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleBreakdown: roleStats,
        workUnitBreakdown: workUnitStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get filtered approval authorities based on staff member's hierarchy
// @route   GET /api/users/approval-authorities/filtered
// @access  Private
const getFilteredApprovalAuthorities = async (req, res, next) => {
  try {
    const staffId = req.user.id;

    // Get the staff member's details
    const staff = await db.User.findByPk(staffId);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Determine if staff is in academic or administrative wing
    const isAcademicWing = staff.wing === 'academic';

    let approvalAuthorities;

    if (isAcademicWing) {
      // Filter by academic hierarchy: college, school, department
      approvalAuthorities = await db.User.findAll({
        where: {
          role: {
            [Op.in]: ['approval_authority', 'vice_president']
          },
          isActive: true,
          college: staff.college,
          school: staff.school,
          department: staff.department
        },
        attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role', 'college', 'school', 'department', 'administrativeUnit', 'wing'],
        order: [['firstName', 'ASC'], ['lastName', 'ASC']]
      });
    } else {
      // Filter by administrative hierarchy: administrativeUnit
      approvalAuthorities = await db.User.findAll({
        where: {
          role: {
            [Op.in]: ['approval_authority', 'vice_president']
          },
          isActive: true,
          administrativeUnit: staff.administrativeUnit
        },
        attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role', 'college', 'school', 'department', 'administrativeUnit', 'wing'],
        order: [['firstName', 'ASC'], ['lastName', 'ASC']]
      });
    }

    res.status(200).json({
      success: true,
      data: approvalAuthorities,
      wing: staff.wing,
      staffHierarchy: isAcademicWing 
        ? { college: staff.college, school: staff.school, department: staff.department }
        : { administrativeUnit: staff.administrativeUnit }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get approval authorities (all active approval authorities and vice presidents)
// @route   GET /api/users/approval-authorities
// @access  Private
const getApprovalAuthorities = async (req, res, next) => {
  try {
    const approvalAuthorities = await db.User.findAll({
      where: {
        role: {
          [Op.in]: ['approval_authority', 'vice_president']
        },
        isActive: true
      },
      attributes: ['id', 'username', 'firstName', 'middleName', 'lastName', 'role', 'workUnit', 'email'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: approvalAuthorities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change own password
// @route   POST /api/users/change-password
// @access  Private (any authenticated user)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    // Fetch user WITH password
    const user = await db.User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Model hook will hash the new password
    await user.update({ password: newPassword });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  changePassword,
  getUserStats,
  getApprovalAuthorities,
  getFilteredApprovalAuthorities,
  createUserValidation,
  updateUserValidation,
  validateRequest
};

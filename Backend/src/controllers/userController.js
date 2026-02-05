const { Op } = require('sequelize');
const db = require('../models');
const { logAction } = require('../middleware/auditLog');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (administrator only)
const getUsers = async (req, res, next) => {
  try {
    const {
      role,
      isActive,
      department,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (department) where.department = department;

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { fullName: { [Op.iLike]: `%${search}%` } },
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
      fullName,
      role,
      department,
      isActive
    } = req.body;

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

    // Create user (password will be hashed by model hook)
    const user = await db.User.create({
      username,
      email,
      password,
      fullName,
      role: role || 'staff',
      department,
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
      { username: user.username, role: user.role, department: user.department },
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

    // Get department breakdown
    const departmentStats = await db.User.findAll({
      attributes: [
        'department',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        department: { [Op.ne]: null }
      },
      group: ['department']
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleBreakdown: roleStats,
        departmentBreakdown: departmentStats
      }
    });
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
  getUserStats
};

const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const db = require('../models');
const { logAuthAttempt, logLogout } = require('../middleware/auditLog');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      role: user.role 
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user
    const user = await db.User.findOne({ 
      where: { username } 
    });

    if (!user) {
      // Log failed login attempt
      await logAuthAttempt(username, false, null, req);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      await logAuthAttempt(username, false, user.id, req);
      return res.status(403).json({
        success: false,
        message: 'Account is inactive. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Log failed login attempt
      await logAuthAttempt(username, false, user.id, req);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user);

    // Log successful login
    await logAuthAttempt(username, true, user.id, req);

    // Return user data (without password)
    const userData = user.toSafeObject();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
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
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  // Log logout
  await logLogout(req.user.id, req);
  
  // In a stateless JWT system, logout is handled client-side by removing the token
  // Here we can add token to blacklist if needed, or just confirm logout
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await db.User.findByPk(req.user.id);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by model hook)
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request password reset (send verification code)
// @route   POST /api/auth/forgot-password
// @access  Public
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    // Find user by email
    const user = await db.User.findOne({ where: { email: email.toLowerCase().trim() } });

    // Always return success to prevent email enumeration
    // Don't reveal if email exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset code shortly.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, you will receive a password reset code shortly.'
      });
    }

    // Generate 6-digit reset code
    const { generateSecureResetCode, getResetCodeExpiry } = require('../utils/codeGenerator');
    const resetCode = generateSecureResetCode();
    const resetCodeExpiry = getResetCodeExpiry(10); // 10 minutes

    // Save reset code to database
    await user.update({
      resetCode,
      resetCodeExpiry,
      resetCodeAttempts: 0 // Reset attempts counter
    });

    // Send email with reset code
    const { sendPasswordResetCode } = require('../utils/emailService');
    const emailResult = await sendPasswordResetCode(
      user.email,
      resetCode,
      user.getFullName(),
      10
    );

    // Log the attempt
    await db.AuditLog.create({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entityType: 'user',
      entityId: user.id,
      details: { email: user.email, emailSent: emailResult.success },
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset code shortly.'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    next(error);
  }
};

// @desc    Verify reset code
// @route   POST /api/auth/verify-reset-code
// @access  Public
const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid code format. Code must be 6 digits.'
      });
    }

    // Find user
    const user = await db.User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Check if too many attempts
    if (user.resetCodeAttempts >= 5) {
      // Clear the reset code
      await user.update({
        resetCode: null,
        resetCodeExpiry: null,
        resetCodeAttempts: 0
      });

      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please request a new code.'
      });
    }

    // Check if code expired
    const { isResetCodeExpired } = require('../utils/codeGenerator');
    if (isResetCodeExpired(user.resetCodeExpiry)) {
      await user.update({
        resetCode: null,
        resetCodeExpiry: null,
        resetCodeAttempts: 0
      });

      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify code
    if (user.resetCode !== code) {
      // Increment failed attempts
      await user.update({
        resetCodeAttempts: user.resetCodeAttempts + 1
      });

      const attemptsLeft = 5 - (user.resetCodeAttempts + 1);
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
      });
    }

    // Code is valid
    // Log successful verification
    await db.AuditLog.create({
      userId: user.id,
      action: 'PASSWORD_RESET_CODE_VERIFIED',
      entityType: 'user',
      entityId: user.id,
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Verification code confirmed. You can now reset your password.'
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    next(error);
  }
};

// @desc    Reset password with verified code
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, code, and new password'
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await db.User.findOne({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Check if code expired
    const { isResetCodeExpired } = require('../utils/codeGenerator');
    if (isResetCodeExpired(user.resetCodeExpiry)) {
      await user.update({
        resetCode: null,
        resetCodeExpiry: null,
        resetCodeAttempts: 0
      });

      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Verify code one more time
    if (user.resetCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Update password and clear reset fields
    await user.update({
      password: newPassword, // Will be hashed by model hook
      resetCode: null,
      resetCodeExpiry: null,
      resetCodeAttempts: 0
    });

    // Send confirmation email
    const { sendPasswordResetConfirmation } = require('../utils/emailService');
    await sendPasswordResetConfirmation(user.email, user.getFullName());

    // Log successful password reset
    await db.AuditLog.create({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'user',
      entityId: user.id,
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    next(error);
  }
};

module.exports = {
  login,
  getCurrentUser,
  logout,
  changePassword,
  requestPasswordReset,
  verifyResetCode,
  resetPassword
};

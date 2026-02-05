const db = require('../models');

/**
 * Create an audit log entry
 * @param {Object} data - Audit log data
 */
const createAuditLog = async (data) => {
  try {
    await db.AuditLog.create({
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      status: data.status || 'success',
      errorMessage: data.errorMessage,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging should not break application flow
  }
};

/**
 * Middleware to automatically log requests
 */
const auditLogMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    // Override res.json to capture response
    res.json = function(data) {
      // Create audit log after response
      const logData = {
        userId: req.user?.id,
        action,
        entityType,
        entityId: req.params.id || data?.data?.id,
        details: {
          method: req.method,
          path: req.path,
          body: sanitizeBody(req.body),
          query: req.query,
          params: req.params
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure',
        errorMessage: data?.message && res.statusCode >= 400 ? data.message : null
      };

      createAuditLog(logData);

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Log user authentication attempts
 */
const logAuthAttempt = async (username, success, userId = null, req) => {
  await createAuditLog({
    userId,
    action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
    entityType: 'auth',
    details: {
      username,
      success
    },
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    status: success ? 'success' : 'failure'
  });
};

/**
 * Log user logout
 */
const logLogout = async (userId, req) => {
  await createAuditLog({
    userId,
    action: 'LOGOUT',
    entityType: 'auth',
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    status: 'success'
  });
};

/**
 * Log critical actions manually
 */
const logAction = async (userId, action, entityType, entityId, details, req, status = 'success') => {
  await createAuditLog({
    userId,
    action,
    entityType,
    entityId,
    details,
    ipAddress: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get ? req.get('user-agent') : null,
    status
  });
};

/**
 * Sanitize request body to remove sensitive data
 */
const sanitizeBody = (body) => {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'token'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  
  return sanitized;
};

module.exports = {
  createAuditLog,
  auditLogMiddleware,
  logAuthAttempt,
  logLogout,
  logAction
};

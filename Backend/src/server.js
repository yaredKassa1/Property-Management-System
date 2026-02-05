const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const transferRoutes = require('./routes/transfers');
const returnRoutes = require('./routes/returns');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');
const auditLogRoutes = require('./routes/auditLogs');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ============= Middleware =============

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api', limiter);

// ============= Routes =============

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/requests', requestRoutes);

// API documentation route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Woldia University Property Management System API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
        changePassword: 'PUT /api/auth/change-password'
      },
      users: {
        list: 'GET /api/users (admin only)',
        get: 'GET /api/users/:id (admin only)',
        create: 'POST /api/users (admin only)',
        update: 'PUT /api/users/:id (admin only)',
        delete: 'DELETE /api/users/:id (admin only)',
        resetPassword: 'POST /api/users/:id/reset-password (admin only)',
        stats: 'GET /api/users/stats/summary (admin only)'
      },
      auditLogs: {
        list: 'GET /api/audit-logs (admin only)',
        get: 'GET /api/audit-logs/:id (admin only)',
        userLogs: 'GET /api/audit-logs/user/:userId (admin only)',
        stats: 'GET /api/audit-logs/stats/summary (admin only)',
        security: 'GET /api/audit-logs/security/events (admin only)'
      },
      assets: {
        list: 'GET /api/assets',
        get: 'GET /api/assets/:id',
        create: 'POST /api/assets (property_officer)',
        update: 'PUT /api/assets/:id (property_officer)',
        delete: 'DELETE /api/assets/:id (property_officer)',
        stats: 'GET /api/assets/stats/summary'
      },
      transfers: {
        list: 'GET /api/transfers',
        get: 'GET /api/transfers/:id',
        create: 'POST /api/transfers',
        approve: 'POST /api/transfers/:id/approve (vice_president)',
        reject: 'POST /api/transfers/:id/reject (vice_president)',
        complete: 'POST /api/transfers/:id/complete (property_officer)',
        cancel: 'DELETE /api/transfers/:id'
      },
      returns: {
        list: 'GET /api/returns',
        get: 'GET /api/returns/:id',
        create: 'POST /api/returns',
        receive: 'POST /api/returns/:id/receive (property_officer)',
        inspect: 'POST /api/returns/:id/inspect (qa/property_officer)',
        approve: 'POST /api/returns/:id/approve (property_officer)',
        reject: 'POST /api/returns/:id/reject (property_officer)'
      },
      requests: {
        list: 'GET /api/requests',
        get: 'GET /api/requests/:id',
        create: 'POST /api/requests',
        update: 'PUT /api/requests/:id',
        review: 'POST /api/requests/:id/review (approval_authority)',
        approve: 'POST /api/requests/:id/approve (approval_authority)',
        reject: 'POST /api/requests/:id/reject (approval_authority)',
        complete: 'POST /api/requests/:id/complete (property_officer/purchase)',
        cancel: 'DELETE /api/requests/:id'
      }
    },
    documentation: 'See README.md for full API documentation'
  });
});

// ============= Error Handling =============

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============= Server Initialization =============

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      console.error('💡 Tip: Run "npm run migrate" to set up the database.');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('═════════════════════════════════════════════════════');
      console.log(`🚀 WDUPMS Backend Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log('═════════════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;

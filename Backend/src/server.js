const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { initializeScheduler } = require('./utils/scheduler');
const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const transferRoutes = require('./routes/transfers');
const returnRoutes = require('./routes/returns');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');
const auditLogRoutes = require('./routes/auditLogs');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');
const qaInspectionRoutes = require('./routes/qaInspections');
const workflowRoutes = require('./routes/workflows');
const notificationRoutes = require('./routes/notifications');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/qa-inspections', qaInspectionRoutes);
app.use('/api/workflows', workflowRoutes);

app.get('/api', (req, res) => {
  res.status(200).json({ success: true, message: 'Woldia University Property Management System API', version: '1.0.0' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const connected = await testConnection();
    if (!connected) { console.error('Failed to connect to database.'); process.exit(1); }
    app.listen(PORT, () => {
      console.log('='.repeat(53));
      console.log('Server running on http://localhost:' + PORT);
      console.log('='.repeat(53));
      initializeScheduler();
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => { console.error('Unhandled Promise Rejection:', err); process.exit(1); });

startServer();
module.exports = app;

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { getDashboardStats, getPropertyOfficerStats } = require('../controllers/dashboardController');

// All routes require authentication
router.use(verifyToken);

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', getDashboardStats);

// @route   GET /api/dashboard/property-officer-stats
// @desc    Get Property Officer specific statistics
// @access  Private (property_officer only)
router.get('/property-officer-stats', requireRole('property_officer'), getPropertyOfficerStats);

module.exports = router;

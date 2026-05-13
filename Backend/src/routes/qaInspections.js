const express = require('express');
const router = express.Router();
const {
  getInspections,
  getInspectionById,
  submitInspection
} = require('../controllers/procurementInspectionController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

// All routes require authentication
router.use(verifyToken);

// @route   GET /api/qa-inspections
// @desc    Get all procurement inspections with filtering
// @access  Private (quality_assurance, property_officer, administrator)
router.get('/', requireRole('quality_assurance', 'property_officer', 'administrator'), getInspections);

// @route   GET /api/qa-inspections/:id
// @desc    Get single procurement inspection by ID
// @access  Private (quality_assurance, property_officer, administrator)
router.get('/:id', requireRole('quality_assurance', 'property_officer', 'administrator'), getInspectionById);

// @route   POST /api/qa-inspections/:id/inspect
// @desc    Submit inspection result
// @access  Private (quality_assurance, property_officer, administrator)
router.post('/:id/inspect', requireRole('quality_assurance', 'property_officer', 'administrator'), submitInspection);

module.exports = router;

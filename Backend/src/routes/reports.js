const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleCheck');
const {
  assetStatusReport,
  transferReport,
  inventoryReport,
  assetAssignmentReport,
  overdueReturnsReport,
  workUnitSummaryReport,
  assetConditionReport,
  requestStatusReport,
} = require('../controllers/reportController');

router.use(verifyToken);
router.use(requirePermission('view_reports'));

router.post('/asset-status',      assetStatusReport);
router.post('/transfers',         transferReport);
router.post('/inventory',         inventoryReport);
router.post('/asset-assignment',  assetAssignmentReport);
router.post('/overdue-returns',   overdueReturnsReport);
router.post('/work-unit-summary', workUnitSummaryReport);
router.post('/asset-condition',   assetConditionReport);
router.post('/request-status',    requestStatusReport);

module.exports = router;
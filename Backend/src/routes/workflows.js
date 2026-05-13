const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const approvalHandlers = require('../services/approvalHandlers');
const workflowService = require('../services/workflowService');

router.use(verifyToken);

// GET /api/workflows/:id
router.get('/:id', [param('id').isUUID()], validate, async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowStatus(req.params.id);
    res.json({ success: true, data: workflow });
  } catch (error) { next(error); }
});

// POST /api/workflows/:id/approve
router.post('/:id/approve',
  requireRole('approval_authority', 'vice_president', 'administrator'),
  [
    param('id').isUUID(),
    body('decision').isIn(['approve', 'reject']).withMessage('Decision must be approve or reject'),
    body('comments').optional().trim(),
    body('permittedAmount').optional().isInt({ min: 1 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { decision, comments } = req.body;
      const workflow = await workflowService.getWorkflowStatus(req.params.id);
      let result;
      if (workflow.currentState === 'pending_approval') {
        result = await approvalHandlers.handleApprovalAuthorityAction(req.params.id, {
          actorId: req.user.id, decision, comments,
          permittedAmount: req.body.permittedAmount ? parseInt(req.body.permittedAmount) : undefined
        });
      } else if (workflow.currentState === 'pending_vp_approval') {
        result = await approvalHandlers.handleVPAction(req.params.id, { actorId: req.user.id, decision, comments });
      } else {
        return res.status(400).json({ success: false, message: `Cannot approve in current state: ${workflow.currentState}` });
      }
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
);

// POST /api/workflows/:id/property-officer-complete
router.post('/:id/property-officer-complete',
  requireRole('property_officer', 'administrator'),
  [param('id').isUUID()], validate,
  async (req, res, next) => {
    try {
      const result = await approvalHandlers.handlePropertyOfficerAction(req.params.id, { actorId: req.user.id });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
);

// POST /api/workflows/:id/mark-procured
router.post('/:id/mark-procured',
  requireRole('purchase_department', 'administrator'),
  [param('id').isUUID(), body('procurementDetails').optional().isObject()], validate,
  async (req, res, next) => {
    try {
      const result = await approvalHandlers.handlePurchaseDepartmentAction(req.params.id, {
        actorId: req.user.id, procurementDetails: req.body.procurementDetails || {}
      });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
);

// POST /api/workflows/:id/qa-inspect
router.post('/:id/qa-inspect',
  requireRole('quality_assurance', 'administrator'),
  [
    param('id').isUUID(),
    body('decision').isIn(['approve', 'reject']).withMessage('Decision must be approve or reject'),
    body('comments').optional().trim(),
    body('inspectionDetails').optional().isObject()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { decision, comments, inspectionDetails } = req.body;
      const result = await approvalHandlers.handleQAInspectionAction(req.params.id, {
        actorId: req.user.id, decision, comments, inspectionDetails: inspectionDetails || {}
      });
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  }
);

module.exports = router;

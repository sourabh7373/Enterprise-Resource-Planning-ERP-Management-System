const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  createWorkflow,
  getWorkflows,
  getWorkflowById,
  updateWorkflow,
  toggleWorkflowStatus,
  submitApprovalRequest,
  getApprovalRequests,
  getApprovalRequestById,
  makeApprovalDecision,
  getAutomationRules,
  saveAutomationRule
} = require('../controllers/workflowController');

// Approval request routes (Static routes MUST come before dynamic /:id routes)
router.route('/requests')
  .get(protect, getApprovalRequests)
  .post(protect, submitApprovalRequest);

router.route('/requests/:id')
  .get(protect, getApprovalRequestById);

router.route('/requests/:id/decision')
  .patch(protect, makeApprovalDecision);

// Automation rules routes
router.route('/automation-rules')
  .get(protect, getAutomationRules)
  .post(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER', 'Admin', 'Manager'), saveAutomationRule);

// Workflow management routes
router.route('/')
  .get(protect, getWorkflows)
  .post(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER', 'Admin', 'Manager'), createWorkflow);

router.route('/:id')
  .get(protect, getWorkflowById)
  .put(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER', 'Admin', 'Manager'), updateWorkflow);

router.route('/:id/status')
  .patch(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER', 'Admin', 'Manager'), toggleWorkflowStatus);

module.exports = router;

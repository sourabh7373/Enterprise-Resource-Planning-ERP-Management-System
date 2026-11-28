const Workflow = require('../models/Workflow');
const ApprovalRequest = require('../models/ApprovalRequest');
const ApprovalHistory = require('../models/ApprovalHistory');
const AutomationRule = require('../models/AutomationRule');
const Notification = require('../models/Notification');

// @desc    Create a new workflow
// @route   POST /api/workflows
// @access  Private (Admin / Manager)
exports.createWorkflow = async (req, res) => {
  try {
    const { name, description, module, status, stages } = req.body;

    if (!name || !module || !stages || !stages.length) {
      return res.status(400).json({ message: 'Please provide workflow name, module, and at least one stage.' });
    }

    if (status === 'ACTIVE' && (!stages || stages.length === 0)) {
      return res.status(400).json({ message: 'Cannot activate a workflow without valid approval stages.' });
    }

    const workflow = await Workflow.create({
      name,
      description,
      module,
      status: status || 'DRAFT',
      stages,
      createdBy: req.user._id
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all workflows
// @route   GET /api/workflows
// @access  Private
exports.getWorkflows = async (req, res) => {
  try {
    const { module, status } = req.query;
    let query = {};
    if (module) query.module = module;
    if (status) query.status = status;

    const workflows = await Workflow.find(query).populate('createdBy', 'name email').populate('stages.approverUser', 'name email');
    res.status(200).json(workflows);
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get workflow by ID
// @route   GET /api/workflows/:id
// @access  Private
exports.getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('stages.approverUser', 'name email');

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    res.status(200).json(workflow);
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update workflow
// @route   PUT /api/workflows/:id
// @access  Private (Admin / Manager)
exports.updateWorkflow = async (req, res) => {
  try {
    const { name, description, module, status, stages } = req.body;

    let workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    if (status === 'ACTIVE' && ((stages && stages.length === 0) || (!stages && workflow.stages.length === 0))) {
      return res.status(400).json({ message: 'Cannot activate a workflow without valid approval stages.' });
    }

    workflow.name = name || workflow.name;
    workflow.description = description !== undefined ? description : workflow.description;
    workflow.module = module || workflow.module;
    workflow.status = status || workflow.status;
    if (stages) workflow.stages = stages;

    await workflow.save();
    res.status(200).json(workflow);
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Toggle workflow activation status
// @route   PATCH /api/workflows/:id/status
// @access  Private (Admin / Manager)
exports.toggleWorkflowStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    if (status === 'ACTIVE' && (!workflow.stages || workflow.stages.length === 0)) {
      return res.status(400).json({ message: 'Cannot activate workflow without approval stages.' });
    }

    workflow.status = status;
    await workflow.save();

    res.status(200).json(workflow);
  } catch (error) {
    console.error('Error toggling workflow status:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Submit an approval request
// @route   POST /api/workflows/requests
// @access  Private
exports.submitApprovalRequest = async (req, res) => {
  try {
    const { workflowId, title, description, amount, referenceId, referenceModel, module } = req.body;

    if (!workflowId || !title || !module) {
      return res.status(400).json({ message: 'Please provide workflowId, title, and module.' });
    }

    const workflow = await Workflow.findById(workflowId);
    if (!workflow || workflow.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Selected workflow is not active or does not exist.' });
    }

    // Handle referenceId: if it's a string not valid ObjectId or not provided, generate a dummy ObjectId or use a valid one
    const mongoose = require('mongoose');
    let validRefId = referenceId;
    if (!referenceId || !mongoose.Types.ObjectId.isValid(referenceId)) {
      validRefId = new mongoose.Types.ObjectId();
    }

    const approvalRequest = await ApprovalRequest.create({
      workflow: workflow._id,
      module,
      referenceId: validRefId,
      referenceModel: referenceModel || module,
      requester: req.user._id,
      currentStageNumber: 1,
      status: 'PENDING',
      title,
      description,
      amount: amount ? Number(amount) : undefined
    });

    // Record history entry
    const firstStage = workflow.stages.find(s => s.stageNumber === 1) || workflow.stages[0];
    await ApprovalHistory.create({
      approvalRequest: approvalRequest._id,
      workflow: workflow._id,
      stageNumber: firstStage ? firstStage.stageNumber : 1,
      stageName: firstStage ? firstStage.stageName : 'Initial Stage',
      previousStatus: 'NONE',
      newStatus: 'PENDING',
      approver: req.user._id,
      decision: 'SUBMITTED',
      comments: 'Approval request submitted.'
    });

    // Create notification for potential approvers or admin
    await Notification.create({
      user: req.user._id, // or broadcast/notify approvers
      title: 'New Approval Request Submitted',
      message: `Request "${title}" has been submitted for approval under workflow "${workflow.name}".`,
      type: 'info'
    });

    res.status(201).json(approvalRequest);
  } catch (error) {
    console.error('Error submitting approval request:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get approval requests (inbox / submitted)
// @route   GET /api/workflows/requests
// @access  Private
exports.getApprovalRequests = async (req, res) => {
  try {
    const { type, status, module } = req.query; // type = 'inbox' or 'submitted' or 'all'
    let query = {};

    if (status) query.status = status;
    if (module) query.module = module;

    if (type === 'submitted') {
      query.requester = req.user._id;
    } else if (type === 'inbox') {
      // Find requests where current user is authorized approver for the current stage
      // We can fetch all pending requests and filter by workflow stages matching user role/id
      query.status = 'PENDING';
    }

    const requests = await ApprovalRequest.find(query)
      .populate('workflow', 'name module stages')
      .populate('requester', 'name email role')
      .sort({ createdAt: -1 });

    // If type is inbox, filter strictly by whether req.user is authorized for the current stage
    let filteredRequests = requests;
    if (type === 'inbox') {
      filteredRequests = requests.filter(reqDoc => {
        if (!reqDoc.workflow || !reqDoc.workflow.stages) return false;
        const currentStage = reqDoc.workflow.stages.find(s => s.stageNumber === reqDoc.currentStageNumber);
        if (!currentStage) return false;

        // Check if user is SUPER_ADMIN/Admin/HR_MANAGER/FINANCE_MANAGER/etc., matches role, or matches specific user
        const normalizedUserRole = (req.user.role || '').replace(/[-_\s]/g, '').toLowerCase();
        const normalizedStageRole = (currentStage.approverRole || '').replace(/[-_\s]/g, '').toLowerCase();

        if (['superadmin', 'admin'].includes(normalizedUserRole)) return true;
        if (currentStage.approverType === 'User' && currentStage.approverUser && currentStage.approverUser.toString() === req.user._id.toString()) return true;
        if (currentStage.approverType === 'Role' && currentStage.approverRole) {
          if (normalizedStageRole === normalizedUserRole) return true;
          if (normalizedStageRole === 'manager' && normalizedUserRole.includes('manager')) return true;
          if (normalizedStageRole === 'hr' && (normalizedUserRole.includes('hr') || normalizedUserRole === 'hrmanager')) return true;
          if (normalizedStageRole === 'finance' && (normalizedUserRole.includes('finance') || normalizedUserRole === 'financemanager')) return true;
          if (normalizedStageRole === 'sales' && (normalizedUserRole.includes('sales') || normalizedUserRole === 'salesmanager')) return true;
          if (normalizedStageRole === 'inventory' && (normalizedUserRole.includes('inventory') || normalizedUserRole === 'inventorymanager')) return true;
          if (normalizedStageRole === 'employee' && normalizedUserRole === 'employee') return true;
        }

        return false;
      });
    }

    res.status(200).json(filteredRequests);
  } catch (error) {
    console.error('Error fetching approval requests:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get approval request by ID
// @route   GET /api/workflows/requests/:id
// @access  Private
exports.getApprovalRequestById = async (req, res) => {
  try {
    const request = await ApprovalRequest.findById(req.params.id)
      .populate('workflow')
      .populate('requester', 'name email role');

    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    const history = await ApprovalHistory.find({ approvalRequest: request._id })
      .populate('approver', 'name email role')
      .sort({ timestamp: 1 });

    res.status(200).json({ request, history });
  } catch (error) {
    console.error('Error fetching approval request details:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Approve or Reject an approval request
// @route   PATCH /api/workflows/requests/:id/decision
// @access  Private
exports.makeApprovalDecision = async (req, res) => {
  try {
    const { decision, comments } = req.body; // decision = 'APPROVED' or 'REJECTED'

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision. Must be APPROVED or REJECTED.' });
    }

    const request = await ApprovalRequest.findById(req.params.id).populate('workflow');
    if (!request) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'This request has already been completed or cancelled.' });
    }

    // Check self-approval rule unless admin
    if (request.requester.toString() === req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Self-approval is not permitted.' });
    }

    const workflow = request.workflow;
    const currentStage = workflow.stages.find(s => s.stageNumber === request.currentStageNumber);

    if (!currentStage) {
      return res.status(400).json({ message: 'Invalid approval stage configuration.' });
    }

    // Verify approver authorization
    const normalizedUserRole = (req.user.role || '').replace(/[-_\s]/g, '').toLowerCase();
    const normalizedStageRole = (currentStage.approverRole || '').replace(/[-_\s]/g, '').toLowerCase();

    const isAuthorized = ['superadmin', 'admin'].includes(normalizedUserRole) ||
      (currentStage.approverType === 'User' && currentStage.approverUser && currentStage.approverUser.toString() === req.user._id.toString()) ||
      (currentStage.approverType === 'Role' && currentStage.approverRole && (function() {
        if (normalizedStageRole === normalizedUserRole) return true;
        if (normalizedStageRole === 'manager' && normalizedUserRole.includes('manager')) return true;
        if (normalizedStageRole === 'hr' && (normalizedUserRole.includes('hr') || normalizedUserRole === 'hrmanager')) return true;
        if (normalizedStageRole === 'finance' && (normalizedUserRole.includes('finance') || normalizedUserRole === 'financemanager')) return true;
        if (normalizedStageRole === 'sales' && (normalizedUserRole.includes('sales') || normalizedUserRole === 'salesmanager')) return true;
        if (normalizedStageRole === 'inventory' && (normalizedUserRole.includes('inventory') || normalizedUserRole === 'inventorymanager')) return true;
        if (normalizedStageRole === 'employee' && normalizedUserRole === 'employee') return true;
        return false;
      })());

    if (!isAuthorized) {
      return res.status(403).json({ message: 'You are not authorized to approve this stage.' });
    }

    const previousStatus = request.status;
    let newStatus = 'PENDING';

    if (decision === 'REJECTED') {
      newStatus = 'REJECTED';
      request.status = 'REJECTED';
    } else {
      // Check if there is a next stage
      const nextStage = workflow.stages.find(s => s.stageNumber === request.currentStageNumber + 1);
      if (nextStage) {
        request.currentStageNumber += 1;
        newStatus = 'PENDING';
      } else {
        newStatus = 'APPROVED';
        request.status = 'APPROVED';
      }
    }

    await request.save();

    // Record history
    await ApprovalHistory.create({
      approvalRequest: request._id,
      workflow: workflow._id,
      stageNumber: currentStage.stageNumber,
      stageName: currentStage.stageName,
      previousStatus,
      newStatus: request.status === 'PENDING' ? `STAGE_${request.currentStageNumber}_PENDING` : request.status,
      approver: req.user._id,
      decision,
      comments: comments || `${decision} at stage ${currentStage.stageName}`
    });

    // Notify requester
    await Notification.create({
      user: request.requester,
      title: `Approval Request ${decision}`,
      message: `Your request "${request.title}" has been ${decision.toLowerCase()} at stage "${currentStage.stageName}".`,
      type: decision === 'APPROVED' ? 'success' : 'warning'
    });

    res.status(200).json({ message: `Request successfully ${decision.toLowerCase()}`, request });
  } catch (error) {
    console.error('Error processing approval decision:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get automation rules
// @route   GET /api/workflows/automation-rules
// @access  Private
exports.getAutomationRules = async (req, res) => {
  try {
    const rules = await AutomationRule.find().populate('createdBy', 'name email');
    res.status(200).json(rules);
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create or update automation rule
// @route   POST /api/workflows/automation-rules
// @access  Private (Admin / Manager)
exports.saveAutomationRule = async (req, res) => {
  try {
    const { id, name, description, triggerType, thresholdValue, isActive } = req.body;

    if (!name || !triggerType) {
      return res.status(400).json({ message: 'Please provide rule name and triggerType.' });
    }

    let rule;
    if (id) {
      rule = await AutomationRule.findById(id);
      if (!rule) {
        return res.status(404).json({ message: 'Automation rule not found' });
      }
      rule.name = name;
      rule.description = description;
      rule.triggerType = triggerType;
      rule.thresholdValue = thresholdValue !== undefined ? thresholdValue : rule.thresholdValue;
      rule.isActive = isActive !== undefined ? isActive : rule.isActive;
      await rule.save();
    } else {
      rule = await AutomationRule.create({
        name,
        description,
        triggerType,
        thresholdValue: thresholdValue || 0,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user._id
      });
    }

    res.status(201).json(rule);
  } catch (error) {
    console.error('Error saving automation rule:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

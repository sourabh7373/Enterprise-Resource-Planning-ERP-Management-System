const mongoose = require('mongoose');
require('dotenv').config();
require('./models/User');
require('./models/Workflow');
require('./models/ApprovalRequest');

async function testInbox() {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/erp_db');
    const hrUser = await mongoose.model('User').findOne({ email: 'hr@erp.com' });
    console.log('HR User:', { _id: hrUser._id, role: hrUser.role });

    const requests = await mongoose.model('ApprovalRequest').find({ status: 'PENDING' })
      .populate('workflow', 'name module stages')
      .populate('requester', 'name email role')
      .sort({ createdAt: -1 });

    console.log('Pending requests found:', requests.length);

    for (const reqDoc of requests) {
      console.log('Request document:', {
        _id: reqDoc._id,
        title: reqDoc.title,
        status: reqDoc.status,
        currentStageNumber: reqDoc.currentStageNumber,
        workflow: reqDoc.workflow ? {
          name: reqDoc.workflow.name,
          stages: reqDoc.workflow.stages
        } : null
      });

      if (!reqDoc.workflow || !reqDoc.workflow.stages) {
        console.log('Request missing workflow or stages:', reqDoc._id);
        continue;
      }
      const currentStage = reqDoc.workflow.stages.find(s => s.stageNumber === reqDoc.currentStageNumber);
      console.log('Current stage found:', currentStage);

      const normalizedUserRole = (hrUser.role || '').replace(/[-_\s]/g, '').toLowerCase();
      const normalizedStageRole = (currentStage.approverRole || '').replace(/[-_\s]/g, '').toLowerCase();

      console.log('Normalized comparison:', { normalizedUserRole, normalizedStageRole });

      let match = false;
      if (['superadmin', 'admin'].includes(normalizedUserRole)) match = true;
      if (currentStage.approverType === 'Role' && currentStage.approverRole) {
        if (normalizedStageRole === normalizedUserRole) match = true;
        if (normalizedStageRole === 'manager' && normalizedUserRole.includes('manager')) match = true;
        if (normalizedStageRole === 'hr' && (normalizedUserRole.includes('hr') || normalizedUserRole === 'hrmanager')) match = true;
        if (normalizedStageRole === 'finance' && (normalizedUserRole.includes('finance') || normalizedUserRole === 'financemanager')) match = true;
      }
      console.log('Matches HR?', match);
    }

    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}
testInbox();

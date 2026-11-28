const mongoose = require('mongoose');
require('dotenv').config();
require('./models/User');
require('./models/Workflow');
require('./models/ApprovalRequest');

async function testFetchAllRequests() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/erp_db');
    const requests = await mongoose.model('ApprovalRequest').find({})
      .populate('workflow', 'name module stages')
      .populate('requester', 'name email role');

    console.log('Total approval requests in DB:', requests.length);
    for (const r of requests) {
      console.log({
        _id: r._id,
        title: r.title,
        status: r.status,
        currentStageNumber: r.currentStageNumber,
        hasWorkflow: !!r.workflow,
        workflowStages: r.workflow?.stages
      });
    }
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}
testFetchAllRequests();

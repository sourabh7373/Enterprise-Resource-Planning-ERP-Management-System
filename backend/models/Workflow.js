const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  module: { 
    type: String, 
    required: true, 
    enum: ['Expense', 'Invoice', 'Leave', 'Purchase', 'General'] 
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], 
    default: 'DRAFT' 
  },
  stages: [{
    stageNumber: { type: Number, required: true },
    stageName: { type: String, required: true },
    approverType: { type: String, enum: ['Role', 'User'], required: true },
    approverRole: { type: String }, // e.g., 'Admin', 'Manager'
    approverUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requirements: { type: String }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Workflow', workflowSchema);

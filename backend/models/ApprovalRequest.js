const mongoose = require('mongoose');

const approvalRequestSchema = new mongoose.Schema({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  module: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // e.g. Expense ID or Leave ID
  referenceModel: { type: String, required: true }, // e.g. 'Leave', 'Finance' (Expense)
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentStageNumber: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  title: { type: String, required: true },
  description: { type: String },
  amount: { type: Number },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRequest', approvalRequestSchema);

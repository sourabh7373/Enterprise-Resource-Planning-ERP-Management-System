const mongoose = require('mongoose');

const approvalHistorySchema = new mongoose.Schema({
  approvalRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ApprovalRequest', required: true },
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  stageNumber: { type: Number, required: true },
  stageName: { type: String, required: true },
  previousStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  decision: { type: String, enum: ['APPROVED', 'REJECTED', 'SUBMITTED', 'CANCELLED'], required: true },
  comments: { type: String, trim: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalHistory', approvalHistorySchema);

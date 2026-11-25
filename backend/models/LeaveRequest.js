const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  leaveType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numberOfDays: { type: Number, required: true },
  reason: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], 
    default: 'PENDING',
    index: true
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approvalRemarks: { type: String },
  decisionAt: { type: Date },
  history: [{
    action: String,
    previousStatus: String,
    newStatus: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Index for performance
leaveRequestSchema.index({ employee: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);

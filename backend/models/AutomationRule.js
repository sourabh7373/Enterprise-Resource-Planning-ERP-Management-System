const mongoose = require('mongoose');

const automationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  triggerType: { 
    type: String, 
    required: true, 
    enum: ['LOW_STOCK', 'OVERDUE_INVOICE', 'PENDING_APPROVAL_REMINDER', 'TASK_DEADLINE'] 
  },
  thresholdValue: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastTriggeredAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AutomationRule', automationRuleSchema);

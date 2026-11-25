const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: false },
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED', 'ON_HOLD'], 
    default: 'TODO' 
  },
  comments: [{
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  history: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    changedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

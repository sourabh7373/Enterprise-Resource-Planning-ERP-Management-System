const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  status: { 
    type: String, 
    enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'], 
    default: 'PLANNED' 
  },
  progress: { type: Number, default: 0, min: 0, max: 100 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);

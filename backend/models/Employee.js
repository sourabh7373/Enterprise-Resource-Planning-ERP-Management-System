const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  employeeId: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  dateOfBirth: { type: Date },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  designation: { type: String, required: true, trim: true },
  joiningDate: { type: Date, default: Date.now },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Intern'], default: 'Full-time' },
  reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  profileImage: { type: String, default: '' },
  documents: [{ name: String, path: String, uploadedAt: { type: Date, default: Date.now } }],
  emergencyContact: {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  employmentStatus: { type: String, enum: ['Active', 'Probation', 'Notice Period', 'Terminated', 'Resigned'], default: 'Active' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);

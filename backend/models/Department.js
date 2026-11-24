const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  description: { type: String, trim: true },
  departmentHead: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', default: null },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);

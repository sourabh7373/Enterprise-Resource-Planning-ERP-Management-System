const mongoose = require('mongoose');

const correctionHistorySchema = new mongoose.Schema({
  previousValues: {
    checkIn: Date,
    checkOut: Date,
    status: String,
    workingHours: Number,
    isLate: Boolean
  },
  updatedValues: {
    checkIn: Date,
    checkOut: Date,
    status: String,
    workingHours: Number,
    isLate: Boolean
  },
  correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, trim: true },
  timestamp: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  attendanceDate: { type: Date, required: true }, // Normalized to start of day
  checkIn: { type: Date },
  checkOut: { type: Date },
  workingHours: { type: Number, default: 0 }, // in hours
  status: { 
    type: String, 
    enum: ['Present', 'Late', 'Half-Day', 'Absent', 'On Leave'], 
    default: 'Present' 
  },
  isLate: { type: Boolean, default: false },
  remarks: { type: String, trim: true },
  correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  correctionHistory: [correctionHistorySchema]
}, { timestamps: true });

// Compound unique index on employee and attendanceDate to prevent duplicate daily attendance
attendanceSchema.index({ employee: 1, attendanceDate: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceById,
  correctAttendance,
  getAttendanceReport
} = require('../controllers/attendanceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Employee check-in & check-out
router.post('/check-in', authorizeRoles('EMPLOYEE', 'HR_MANAGER', 'SUPER_ADMIN'), checkIn);
router.post('/check-out', authorizeRoles('EMPLOYEE', 'HR_MANAGER', 'SUPER_ADMIN'), checkOut);

// My attendance logs
console.log('>>> [DEBUG] Registering GET /my route');
router.get('/my', getMyAttendance);

// Attendance report (must be before /:id route)
router.get('/report', authorizeRoles('HR_MANAGER', 'SUPER_ADMIN'), getAttendanceReport);

// Get all attendance records (HR and Admin)
router.get('/', authorizeRoles('HR_MANAGER', 'SUPER_ADMIN'), getAllAttendance);

// Get attendance record by ID
router.get('/:id', getAttendanceById);

// Attendance correction (HR and Admin)
router.put('/:id/correction', authorizeRoles('HR_MANAGER', 'SUPER_ADMIN'), correctAttendance);

module.exports = router;

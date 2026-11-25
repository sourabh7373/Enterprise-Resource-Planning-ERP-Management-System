const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');

// Helper to normalize date to start of day in UTC or company timezone
const getNormalizedDate = (date = new Date()) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// @desc    Check-in
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
const checkIn = async (req, res) => {
  try {
    const userId = req.user._id;
    // Never trust employee ID supplied by request body; resolve employee from authenticated user
    const employee = await Employee.findOne({ user: userId });
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found for authenticated user' });
    }

    const today = getNormalizedDate();

    // Check if employee is on approved leave today
    const activeLeave = await Leave.findOne({
      employee: employee._id,
      status: 'Approved',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (activeLeave) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot check in while on approved leave ("On Leave")' 
      });
    }

    // Check existing attendance for today
    let attendance = await Attendance.findOne({ employee: employee._id, attendanceDate: today });

    if (attendance && attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }

    const now = new Date();
    // Configurable company working hours: Late arrival if check-in after 9:30 AM (9.5 hours)
    // Local hours in Asia/Calcutta or UTC: Let's check hours/minutes
    // Assuming 09:30 AM standard start time
    const checkInHour = now.getHours();
    const checkInMinute = now.getMinutes();
    const isLate = (checkInHour > 9) || (checkInHour === 9 && checkInMinute > 30);
    const status = isLate ? 'Late' : 'Present';

    if (!attendance) {
      attendance = new Attendance({
        employee: employee._id,
        attendanceDate: today,
        checkIn: now,
        isLate,
        status,
        remarks: req.body.remarks || ''
      });
    } else {
      attendance.checkIn = now;
      attendance.isLate = isLate;
      attendance.status = status;
      if (req.body.remarks) attendance.remarks = req.body.remarks;
    }

    await attendance.save();
    
    const populatedAttendance = await Attendance.findById(attendance._id).populate('employee', 'fullName employeeId department designation');

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: populatedAttendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate attendance record for today' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-out
// @route   POST /api/attendance/check-out
// @access  Private (Employee)
const checkOut = async (req, res) => {
  try {
    const userId = req.user._id;
    const employee = await Employee.findOne({ user: userId });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found for authenticated user' });
    }

    const today = getNormalizedDate();
    const attendance = await Attendance.findOne({ employee: employee._id, attendanceDate: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'Cannot check out without check-in' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'Already checked out today' });
    }

    const now = new Date();
    if (now < attendance.checkIn) {
      return res.status(400).json({ success: false, message: 'Check-out time cannot be before check-in time' });
    }

    attendance.checkOut = now;

    // Calculate working hours accurately in hours
    const diffMs = attendance.checkOut - attendance.checkIn;
    const diffHours = diffMs / (1000 * 60 * 60);
    attendance.workingHours = parseFloat(diffHours.toFixed(2));

    // Determine status (Half-Day if working hours < 4 hours)
    if (attendance.workingHours < 4 && attendance.status !== 'On Leave') {
      attendance.status = 'Half-Day';
    }

    if (req.body.remarks) {
      attendance.remarks = req.body.remarks;
    }

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id).populate('employee', 'fullName employeeId department designation');

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: populatedAttendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Private (Employee)
const getMyAttendance = async (req, res) => {
  console.log('>>> [DEBUG] HIT getMyAttendance route for user:', req.user?._id, 'Role:', req.user?.role);
  try {
    const userId = req.user._id;
    const employee = await Employee.findOne({ user: userId });

    const { startDate, endDate, page = 1, limit = 30 } = req.query;
    let query = {};

    if (!employee) {
      // If HR_MANAGER or SUPER_ADMIN without an employee profile, allow them to view all organization attendance records or empty list
      if (['HR_MANAGER', 'SUPER_ADMIN'].includes(req.user.role)) {
        // query remains empty to fetch organization-wide attendance for HR/Admin without profile
      } else {
        return res.status(404).json({ success: false, message: 'Employee profile not found' });
      }
    } else {
      query.employee = employee._id;
    }

    if (startDate || endDate) {
      query.attendanceDate = {};
      if (startDate) query.attendanceDate.$gte = new Date(startDate);
      if (endDate) query.attendanceDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const attendanceRecords = await Attendance.find(query)
      .populate('employee', 'fullName employeeId department designation')
      .sort({ attendanceDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    // Also check if any approved leave records exist and include them if not present in attendance
    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      total,
      data: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance (HR_MANAGER, SUPER_ADMIN)
// @route   GET /api/attendance
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const getAllAttendance = async (req, res) => {
  try {
    const { employeeId, departmentId, startDate, endDate, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (employeeId) {
      query.employee = employeeId;
    }

    if (departmentId) {
      const employeesInDept = await Employee.find({ department: departmentId }).select('_id');
      query.employee = { $in: employeesInDept.map(e => e._id) };
    }

    if (startDate || endDate) {
      query.attendanceDate = {};
      if (startDate) query.attendanceDate.$gte = new Date(startDate);
      if (endDate) query.attendanceDate.$lte = new Date(endDate);
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'fullName employeeId department designation',
        populate: { path: 'department', select: 'name code' }
      })
      .sort({ attendanceDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      total,
      data: attendanceRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private (Employee - own, HR/Admin - all)
const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: 'employee',
        select: 'fullName employeeId department designation user',
        populate: { path: 'department', select: 'name code' }
      })
      .populate('correctedBy', 'email role');

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    // Role check: If EMPLOYEE, can only view own attendance
    if (req.user.role === 'EMPLOYEE') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee || attendance.employee._id.toString() !== employee._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: Cannot view other employees attendance' });
      }
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Correct attendance record
// @route   PUT /api/attendance/:id/correction
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const correctAttendance = async (req, res) => {
  try {
    const { checkIn, checkOut, status, remarks, reason } = req.body;
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    // Store previous values for audit history
    const previousValues = {
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
      workingHours: attendance.workingHours,
      isLate: attendance.isLate
    };

    if (checkIn !== undefined) attendance.checkIn = checkIn ? new Date(checkIn) : null;
    if (checkOut !== undefined) attendance.checkOut = checkOut ? new Date(checkOut) : null;
    if (status !== undefined) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    // Recalculate working hours if checkIn and checkOut exist
    if (attendance.checkIn && attendance.checkOut) {
      if (attendance.checkOut < attendance.checkIn) {
        return res.status(400).json({ success: false, message: 'Check-out cannot be before check-in' });
      }
      const diffMs = attendance.checkOut - attendance.checkIn;
      attendance.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    } else {
      attendance.workingHours = 0;
    }

    const updatedValues = {
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
      workingHours: attendance.workingHours,
      isLate: attendance.isLate
    };

    attendance.correctedBy = req.user._id;

    // Push to correction audit history
    attendance.correctionHistory.push({
      previousValues,
      updatedValues,
      correctedBy: req.user._id,
      reason: reason || 'Administrative correction',
      timestamp: new Date()
    });

    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employee', 'fullName employeeId department designation')
      .populate('correctedBy', 'email role');

    res.status(200).json({
      success: true,
      message: 'Attendance corrected successfully',
      data: populatedAttendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, departmentId } = req.query;
    const query = {};

    if (startDate || endDate) {
      query.attendanceDate = {};
      if (startDate) query.attendanceDate.$gte = new Date(startDate);
      if (endDate) query.attendanceDate.$lte = new Date(endDate);
    }

    if (departmentId) {
      const employeesInDept = await Employee.find({ department: departmentId }).select('_id');
      query.employee = { $in: employeesInDept.map(e => e._id) };
    }

    const records = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'fullName employeeId department designation',
        populate: { path: 'department', select: 'name code' }
      });

    // Compute summary statistics
    const totalRecords = records.length;
    const presentCount = records.filter(r => r.status === 'Present').length;
    const lateCount = records.filter(r => r.status === 'Late' || r.isLate).length;
    const halfDayCount = records.filter(r => r.status === 'Half-Day').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    const onLeaveCount = records.filter(r => r.status === 'On Leave').length;

    const totalWorkingHours = records.reduce((acc, curr) => acc + (curr.workingHours || 0), 0);
    const averageWorkingHours = totalRecords > 0 ? parseFloat((totalWorkingHours / totalRecords).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalRecords,
        presentCount,
        lateCount,
        halfDayCount,
        absentCount,
        onLeaveCount,
        averageWorkingHours
      },
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceById,
  correctAttendance,
  getAttendanceReport
};

const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper to normalize date to start of day in UTC
const getNormalizedDate = (date = new Date()) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date' });
    }
    if (start > end) return res.status(400).json({ message: 'Start date cannot be after end date' });

    const normStart = getNormalizedDate(start);
    const normEnd = getNormalizedDate(end);

    // Simple day calculation
    const diffTime = Math.abs(normEnd - normStart);
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping pending/approved leaves
    const overlapping = await LeaveRequest.findOne({
      employee: employee._id,
      status: { $in: ['PENDING', 'APPROVED'] },
      startDate: { $lte: normEnd },
      endDate: { $gte: normStart }
    });

    if (overlapping) return res.status(400).json({ message: 'Overlapping leave request exists' });

    const leave = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      startDate: normStart,
      endDate: normEnd,
      numberOfDays,
      reason,
      status: 'PENDING'
    });

    // Notify HR Managers
    const hrManagers = await User.find({ role: 'HR_MANAGER' });
    for (const hr of hrManagers) {
      await Notification.create({
        user: hr._id,
        title: 'New Leave Request',
        message: `New leave request from ${employee.fullName}`,
        type: 'LEAVE',
        relatedEntity: { entityType: 'LeaveRequest', entityId: leave._id }
      });
    }

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });

    const { status, page = 1, limit = 10 } = req.query;
    const query = { employee: employee._id };
    if (status) query.status = status;

    const leaves = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all leaves (HR/Admin)
// @route   GET /api/leaves
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType, employee, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (employee) query.employee = employee;
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = getNormalizedDate(startDate);
      if (endDate) query.startDate.$lte = getNormalizedDate(endDate);
    }

    const leaves = await LeaveRequest.find(query)
      .populate('employee', 'fullName employeeId department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leave by ID
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid leave request ID format' });
    }
    const leave = await LeaveRequest.findById(req.params.id).populate('employee', 'fullName employeeId department');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    const employee = await Employee.findOne({ user: req.user._id });
    if (req.user.role === 'EMPLOYEE' && (!employee || leave.employee._id.toString() !== employee._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel leave
// @route   PATCH /api/leaves/:id/cancel
// @access  Private
const cancelLeave = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid leave request ID format' });
    }
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });

    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee || leave.employee.toString() !== employee._id.toString()) return res.status(403).json({ message: 'Access denied' });
    if (leave.status !== 'PENDING') return res.status(400).json({ message: 'Only PENDING requests can be cancelled' });

    leave.status = 'CANCELLED';
    leave.history.push({ action: 'CANCEL', previousStatus: 'PENDING', newStatus: 'CANCELLED', performedBy: req.user._id, remarks: 'Employee cancelled' });
    await leave.save();

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve leave
// @route   PATCH /api/leaves/:id/approve
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const approveLeave = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid leave request ID format' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Check leave request exists and is PENDING
    const existingLeave = await LeaveRequest.findOne({ _id: req.params.id }).session(session);
    if (!existingLeave) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (existingLeave.status !== 'PENDING') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: `Leave request is already ${existingLeave.status.toLowerCase()} or processed` });
    }

    // Prevent HR from approving own leave if employee profile linked
    const approverEmployee = await Employee.findOne({ user: req.user._id }).session(session);
    if (approverEmployee && existingLeave.employee.toString() === approverEmployee._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Employees cannot approve their own leave request' });
    }

    // 2. Update LeaveRequest status
    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'PENDING' },
      {
        $set: {
          status: 'APPROVED',
          approvedBy: req.user._id,
          decisionAt: new Date(),
          approvalRemarks: req.body.remarks || ''
        },
        $push: {
          history: {
            action: 'APPROVE',
            previousStatus: 'PENDING',
            newStatus: 'APPROVED',
            performedBy: req.user._id,
            remarks: req.body.remarks || ''
          }
        }
      },
      { new: true, session }
    );

    if (!leave) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Leave request not found or not PENDING' });
    }

    // 3. Integrate with Attendance with robust date normalization & duplicate safety
    const startDate = new Date(leave.startDate);
    const endDate = new Date(leave.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Invalid leave start or end date' });
    }

    const dates = [];
    let d = getNormalizedDate(startDate);
    const endNorm = getNormalizedDate(endDate);

    while (d <= endNorm) {
      dates.push(new Date(d));
      d.setUTCDate(d.getUTCDate() + 1);
    }

    for (const date of dates) {
      const normalizedAttendanceDate = getNormalizedDate(date);
      if (!normalizedAttendanceDate || isNaN(normalizedAttendanceDate.getTime())) {
        continue;
      }

      await Attendance.findOneAndUpdate(
        { employee: leave.employee, attendanceDate: normalizedAttendanceDate },
        { 
          $set: { 
            status: 'On Leave', 
            remarks: req.body.remarks ? `Approved Leave: ${req.body.remarks}` : 'Approved Leave' 
          },
          $setOnInsert: {
            checkIn: null,
            checkOut: null,
            workingHours: 0,
            isLate: false
          }
        },
        { upsert: true, new: true, session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Notify employee (outside transaction or safe after commit)
    try {
      const emp = await Employee.findById(leave.employee);
      if (emp && emp.user) {
        await Notification.create({
          user: emp.user,
          title: 'Leave Approved',
          message: `Your leave request (${leave.leaveType}) from ${leave.startDate.toISOString().split('T')[0]} to ${leave.endDate.toISOString().split('T')[0]} has been approved`,
          type: 'LEAVE',
          relatedEntity: { entityType: 'LeaveRequest', entityId: leave._id }
        });
      }
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr.message);
    }

    res.json(leave);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate attendance record conflict detected for leave dates' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject leave
// @route   PATCH /api/leaves/:id/reject
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const rejectLeave = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid leave request ID format' });
  }
  if (!req.body.remarks || !req.body.remarks.trim()) {
    return res.status(400).json({ message: 'Rejection remarks are required' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingLeave = await LeaveRequest.findOne({ _id: req.params.id }).session(session);
    if (!existingLeave) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (existingLeave.status !== 'PENDING') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: `Leave request is already ${existingLeave.status.toLowerCase()} or processed` });
    }

    const approverEmployee = await Employee.findOne({ user: req.user._id }).session(session);
    if (approverEmployee && existingLeave.employee.toString() === approverEmployee._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ message: 'Employees cannot reject their own leave request' });
    }

    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'PENDING' },
      {
        $set: {
          status: 'REJECTED',
          decisionAt: new Date(),
          approvalRemarks: req.body.remarks
        },
        $push: {
          history: {
            action: 'REJECT',
            previousStatus: 'PENDING',
            newStatus: 'REJECTED',
            performedBy: req.user._id,
            remarks: req.body.remarks
          }
        }
      },
      { new: true, session }
    );

    if (!leave) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Leave request not found or not PENDING' });
    }

    await session.commitTransaction();
    session.endSession();

    // Notify employee
    try {
      const emp = await Employee.findById(leave.employee);
      if (emp && emp.user) {
        await Notification.create({
          user: emp.user,
          title: 'Leave Rejected',
          message: `Your leave request (${leave.leaveType}) has been rejected. Remarks: ${req.body.remarks}`,
          type: 'LEAVE',
          relatedEntity: { entityType: 'LeaveRequest', entityId: leave._id }
        });
      }
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr.message);
    }

    res.json(leave);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, getLeaveById, cancelLeave, approveLeave, rejectLeave };

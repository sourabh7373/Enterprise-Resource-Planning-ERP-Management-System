const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

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
    if (start > end) return res.status(400).json({ message: 'Start date cannot be after end date' });

    // Simple day calculation (excluding weekends could be added here)
    const diffTime = Math.abs(end - start);
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping pending/approved leaves
    const overlapping = await LeaveRequest.findOne({
      employee: employee._id,
      status: { $in: ['PENDING', 'APPROVED'] },
      startDate: { $lte: end },
      endDate: { $gte: start }
    });

    if (overlapping) return res.status(400).json({ message: 'Overlapping leave request exists' });

    const leave = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      status: 'PENDING'
    });

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
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
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
  try {
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
      { new: true }
    );

    if (!leave) return res.status(404).json({ message: 'Leave request not found or not PENDING' });

    // Integrate with Attendance
    const dates = [];
    let d = new Date(leave.startDate);
    while (d <= leave.endDate) {
      dates.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }

    for (const date of dates) {
      await Attendance.findOneAndUpdate(
        { employee: leave.employee, attendanceDate: date },
        { $set: { status: 'On Leave', remarks: 'Approved Leave' } },
        { upsert: true, new: true }
      );
    }

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject leave
// @route   PATCH /api/leaves/:id/reject
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const rejectLeave = async (req, res) => {
  try {
    if (!req.body.remarks) return res.status(400).json({ message: 'Rejection remarks required' });
    
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
      { new: true }
    );

    if (!leave) return res.status(404).json({ message: 'Leave request not found or not PENDING' });

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, getLeaveById, cancelLeave, approveLeave, rejectLeave };

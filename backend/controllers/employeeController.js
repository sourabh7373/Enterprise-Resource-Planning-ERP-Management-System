const Employee = require('../models/Employee');
const Department = require('../models/Department');

// Helper to generate unique employee ID
const generateEmployeeId = async () => {
  const latestEmployee = await Employee.findOne().sort({ createdAt: -1 });
  let nextNum = 1001;
  if (latestEmployee && latestEmployee.employeeId) {
    const match = latestEmployee.employeeId.match(/EMP(\d+)/);
    if (match) {
      nextNum = parseInt(match[1]) + 1;
    }
  }
  return `EMP${nextNum}`;
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res) => {
  try {
    const { search, department, employmentStatus, employmentType, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    if (employmentStatus) {
      query.employmentStatus = employmentStatus;
    }

    if (employmentType) {
      query.employmentType = employmentType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .populate('reportingManager', 'fullName employeeId email profileImage')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: employees
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name code description')
      .populate('reportingManager', 'fullName employeeId email designation profileImage phone')
      .populate('user', 'email role isActive');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find direct reports (subordinates)
    const directReports = await Employee.find({ reportingManager: employee._id })
      .select('fullName employeeId email designation profileImage employmentStatus');

    res.status(200).json({
      success: true,
      data: {
        ...employee.toObject(),
        directReports
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const createEmployee = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      department,
      designation,
      joiningDate,
      employmentType,
      reportingManager,
      emergencyContact,
      employmentStatus,
      user
    } = req.body;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const existingEmail = await Employee.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Employee with this email already exists' });
    }

    // Validate department
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(400).json({ message: 'Department reference is invalid or does not exist' });
    }

    if (reportingManager) {
      const managerExists = await Employee.findById(reportingManager);
      if (!managerExists) {
        return res.status(400).json({ message: 'Reporting manager reference is invalid or does not exist' });
      }
    }

    const employeeId = await generateEmployeeId();

    let profileImage = '';
    let documents = [];

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        profileImage = `/uploads/profiles/${req.files.profileImage[0].filename}`;
      }
      if (req.files.documents) {
        documents = req.files.documents.map(doc => ({
          name: doc.originalname,
          path: `/uploads/documents/${doc.filename}`,
          uploadedAt: new Date()
        }));
      }
    }

    let parsedEmergencyContact = {};
    if (emergencyContact) {
      try {
        parsedEmergencyContact = typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact;
      } catch (e) {
        parsedEmergencyContact = emergencyContact;
      }
    }

    const employee = await Employee.create({
      fullName,
      employeeId,
      email,
      phone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      department,
      designation,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      employmentType: employmentType || 'Full-time',
      reportingManager: reportingManager || null,
      profileImage,
      documents,
      emergencyContact: parsedEmergencyContact,
      employmentStatus: employmentStatus || 'Active',
      user: user || null
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('department', 'name code')
      .populate('reportingManager', 'fullName employeeId email profileImage');

    res.status(201).json({
      success: true,
      data: populatedEmployee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const {
      fullName,
      email,
      phone,
      address,
      dateOfBirth,
      department,
      designation,
      joiningDate,
      employmentType,
      reportingManager,
      emergencyContact,
      employmentStatus,
      user
    } = req.body;

    if (email && email !== employee.email) {
      const emailExists = await Employee.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already used by another employee' });
      }
      employee.email = email;
    }

    if (fullName) employee.fullName = fullName;
    if (phone) employee.phone = phone;
    if (address !== undefined) employee.address = address;
    if (dateOfBirth) employee.dateOfBirth = new Date(dateOfBirth);
    if (designation) employee.designation = designation;
    if (joiningDate) employee.joiningDate = new Date(joiningDate);
    if (employmentType) employee.employmentType = employmentType;
    if (employmentStatus) employee.employmentStatus = employmentStatus;
    if (user !== undefined) employee.user = user || null;

    if (department) {
      const deptExists = await Department.findById(department);
      if (!deptExists) return res.status(400).json({ message: 'Invalid department reference' });
      employee.department = department;
    }

    if (reportingManager !== undefined) {
      if (reportingManager) {
        if (reportingManager === employee._id.toString()) {
          return res.status(400).json({ message: 'Employee cannot be their own reporting manager' });
        }
        const managerExists = await Employee.findById(reportingManager);
        if (!managerExists) return res.status(400).json({ message: 'Invalid reporting manager reference' });
        employee.reportingManager = reportingManager;
      } else {
        employee.reportingManager = null;
      }
    }

    if (emergencyContact) {
      try {
        employee.emergencyContact = typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact;
      } catch (e) {
        employee.emergencyContact = emergencyContact;
      }
    }

    if (req.files) {
      if (req.files.profileImage && req.files.profileImage[0]) {
        employee.profileImage = `/uploads/profiles/${req.files.profileImage[0].filename}`;
      }
      if (req.files.documents && req.files.documents.length > 0) {
        const newDocs = req.files.documents.map(doc => ({
          name: doc.originalname,
          path: `/uploads/documents/${doc.filename}`,
          uploadedAt: new Date()
        }));
        employee.documents.push(...newDocs);
      }
    }

    await employee.save();

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('department', 'name code')
      .populate('reportingManager', 'fullName employeeId email profileImage');

    res.status(200).json({
      success: true,
      data: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete employee (soft deactivation or hard delete)
// @route   DELETE /api/employees/:id
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Check if employee is a reporting manager for others
    const subCount = await Employee.countDocuments({ reportingManager: employee._id });
    if (subCount > 0) {
      return res.status(400).json({
        message: `Cannot delete employee because ${subCount} other employee(s) report to them.`
      });
    }

    // Check if employee is department head
    const deptHeadCount = await Department.countDocuments({ departmentHead: employee._id });
    if (deptHeadCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete employee because they are assigned as a department head.'
      });
    }

    // Soft deactivation or deletion
    employee.employmentStatus = 'Terminated';
    await employee.save();

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee status (patch)
// @route   PATCH /api/employees/:id/status
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const updateEmployeeStatus = async (req, res) => {
  try {
    const { employmentStatus } = req.body;
    if (!['Active', 'Probation', 'Notice Period', 'Terminated', 'Resigned'].includes(employmentStatus)) {
      return res.status(400).json({ message: 'Invalid employment status' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    employee.employmentStatus = employmentStatus;
    await employee.save();

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus
};

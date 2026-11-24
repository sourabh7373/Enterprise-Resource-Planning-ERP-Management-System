const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Department.countDocuments(query);

    const departments = await Department.find(query)
      .populate('departmentHead', 'fullName employeeId email profileImage')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: departments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('departmentHead', 'fullName employeeId email profileImage designation phone');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Get employees in this department
    const employees = await Employee.find({ department: department._id })
      .select('fullName employeeId email designation employmentStatus profileImage');

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        employees
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const createDepartment = async (req, res) => {
  try {
    const { name, code, description, departmentHead, status } = req.body;

    const existingDept = await Department.findOne({ $or: [{ name }, { code }] });
    if (existingDept) {
      return res.status(400).json({ message: 'Department with this name or code already exists' });
    }

    if (departmentHead) {
      const headEmployee = await Employee.findById(departmentHead);
      if (!headEmployee) {
        return res.status(400).json({ message: 'Department head employee reference not found' });
      }
    }

    const department = await Department.create({
      name,
      code,
      description,
      departmentHead: departmentHead || null,
      status: status || 'Active'
    });

    const populatedDept = await Department.findById(department._id)
      .populate('departmentHead', 'fullName employeeId email profileImage');

    res.status(201).json({
      success: true,
      data: populatedDept
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, departmentHead, status } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (name && name !== department.name) {
      const nameExists = await Department.findOne({ name });
      if (nameExists) return res.status(400).json({ message: 'Department name already exists' });
      department.name = name;
    }

    if (code && code !== department.code) {
      const codeExists = await Department.findOne({ code });
      if (codeExists) return res.status(400).json({ message: 'Department code already exists' });
      department.code = code;
    }

    if (description !== undefined) department.description = description;
    if (status !== undefined) department.status = status;

    if (departmentHead !== undefined) {
      if (departmentHead) {
        const headEmployee = await Employee.findById(departmentHead);
        if (!headEmployee) {
          return res.status(400).json({ message: 'Department head employee reference not found' });
        }
        department.departmentHead = departmentHead;
      } else {
        department.departmentHead = null;
      }
    }

    await department.save();

    const updatedDept = await Department.findById(department._id)
      .populate('departmentHead', 'fullName employeeId email profileImage');

    res.status(200).json({
      success: true,
      data: updatedDept
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (SUPER_ADMIN, HR_MANAGER)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if employees are assigned to this department
    const employeeCount = await Employee.countDocuments({ department: department._id });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department because ${employeeCount} employee(s) are assigned to it.` 
      });
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};

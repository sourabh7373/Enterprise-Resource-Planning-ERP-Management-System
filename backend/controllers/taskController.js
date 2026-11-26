const Task = require('../models/Task');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (HR_MANAGER, SUPER_ADMIN, FINANCE_MANAGER, SALES_MANAGER, INVENTORY_MANAGER)
const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedEmployee, priority, dueDate } = req.body;
    
    // Allow SUPER_ADMIN to create tasks without an employee profile
    let createdBy = null;
    if (req.user.role !== 'SUPER_ADMIN') {
      const employee = await Employee.findOne({ user: req.user._id });
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found for current user' });
      }
      createdBy = employee._id;
    }
    
    const task = await Task.create({
      title,
      description,
      project,
      assignedEmployee,
      createdBy,
      priority,
      dueDate
    });
    
    // Notify assigned employee
    if (assignedEmployee) {
      const employee = await Employee.findById(assignedEmployee);
      if (employee) {
        await Notification.create({
          user: employee.user,
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${title}`,
          type: 'TASK',
          relatedEntity: { entityType: 'Task', entityId: task._id }
        });
      }
    }
    
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedEmployee', 'fullName').populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }
    const tasks = await Task.find({ assignedEmployee: employee._id }).populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedEmployee', 'fullName').populate('project', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    // Only allow updating specific fields to prevent unauthorized changes
    const { title, description, priority, dueDate, status } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, priority, dueDate, status },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const employee = await Employee.findOne({ user: req.user._id });
    
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    task.status = status;
    if (employee) {
      task.history.push({ status, changedBy: employee._id });
    }
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const employee = await Employee.findOne({ user: req.user._id });
    
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    const comment = { text };
    if (employee) {
      comment.employee = employee._id;
    }
    task.comments.push(comment);
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, getMyTasks, getTaskById, updateTask, updateTaskStatus, addComment };

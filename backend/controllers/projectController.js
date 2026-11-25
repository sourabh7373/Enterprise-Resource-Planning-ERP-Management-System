const Project = require('../models/Project');
const Employee = require('../models/Employee');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, projectManager, assignedEmployees } = req.body;
    
    if (!name || !startDate || !endDate || !projectManager) {
      return res.status(400).json({ message: 'Please provide all required fields: name, startDate, endDate, projectManager' });
    }

    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      projectManager,
      assignedEmployees
    });
    
    res.status(201).json(project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'EMPLOYEE') {
      query = { assignedEmployees: req.user.employee };
    }
    const projects = await Project.find(query).populate('projectManager', 'fullName').populate('assignedEmployees', 'fullName');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('projectManager', 'fullName').populate('assignedEmployees', 'fullName');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (HR_MANAGER, SUPER_ADMIN)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject };

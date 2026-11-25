const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), updateProject)
  .delete(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), deleteProject);

module.exports = router;

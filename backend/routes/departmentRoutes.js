const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), createDepartment);

router.route('/:id')
  .get(protect, getDepartmentById)
  .put(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), updateDepartment)
  .delete(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), deleteDepartment);

module.exports = router;

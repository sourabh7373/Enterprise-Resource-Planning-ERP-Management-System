const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateEmployeeStatus
} = require('../controllers/employeeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'documents', maxCount: 5 }
]);

router.route('/')
  .get(protect, getEmployees)
  .post(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), uploadFields, createEmployee);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), uploadFields, updateEmployee)
  .delete(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), deleteEmployee);

router.route('/:id/status')
  .patch(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), updateEmployeeStatus);

module.exports = router;

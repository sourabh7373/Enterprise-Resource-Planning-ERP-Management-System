const express = require('express');
const router = express.Router();
const { protect, authorizeRoles: authorize } = require('../middleware/authMiddleware');
const {
  getSuperAdminDashboard,
  getHrDashboard,
  getFinanceDashboard,
  getSalesDashboard,
  getInventoryDashboard,
  getEmployeeDashboard
} = require('../controllers/dashboardController');

router.use(protect);

router.get('/super-admin', authorize('SUPER_ADMIN'), getSuperAdminDashboard);
router.get('/hr', authorize('SUPER_ADMIN', 'HR_MANAGER'), getHrDashboard);
router.get('/finance', authorize('SUPER_ADMIN', 'FINANCE_MANAGER'), getFinanceDashboard);
router.get('/sales', authorize('SUPER_ADMIN', 'SALES_MANAGER'), getSalesDashboard);
router.get('/inventory', authorize('SUPER_ADMIN', 'INVENTORY_MANAGER'), getInventoryDashboard);
router.get('/employee', authorize('SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER', 'EMPLOYEE'), getEmployeeDashboard);

module.exports = router;

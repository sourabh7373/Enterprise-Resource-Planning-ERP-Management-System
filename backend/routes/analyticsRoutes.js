const express = require('express');
const router = express.Router();
const { protect, authorizeRoles: authorize } = require('../middleware/authMiddleware');
const { getAnalyticsOverview } = require('../controllers/analyticsController');

router.use(protect);
router.use(authorize('SUPER_ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER', 'SALES_MANAGER', 'INVENTORY_MANAGER'));

router.get('/overview', getAnalyticsOverview);

module.exports = router;

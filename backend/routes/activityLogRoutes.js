const express = require('express');
const router = express.Router();
const { getActivityLogs } = require('../controllers/activityLogController');
const { protect, authorizeRoles: authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/', getActivityLogs);

module.exports = router;

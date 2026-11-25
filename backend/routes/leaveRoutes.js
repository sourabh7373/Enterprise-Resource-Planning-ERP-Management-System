const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  cancelLeave,
  approveLeave,
  rejectLeave
} = require('../controllers/leaveController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/', authorizeRoles('HR_MANAGER', 'SUPER_ADMIN'), getAllLeaves);
router.get('/:id', getLeaveById);
router.patch('/:id/cancel', cancelLeave);
router.patch('/:id/approve', authorizeRoles('HR_MANAGER', 'SUPER_ADMIN'), approveLeave);
router.patch('/:id/reject', authorizeRoles('HR_MANAGER', 'SUPER_ADMIN'), rejectLeave);

module.exports = router;

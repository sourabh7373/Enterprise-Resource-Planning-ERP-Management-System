const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  addComment
} = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), createTask);

router.get('/my', protect, getMyTasks);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTask);

router.patch('/:id/status', protect, updateTaskStatus);
router.post('/:id/comments', protect, addComment);

module.exports = router;

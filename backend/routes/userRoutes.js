const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus
} = require('../controllers/userController');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');

// All user management routes require authentication and SUPER_ADMIN role
router.use(authenticateUser);

router.route('/')
  .get(authorizeRoles('SUPER_ADMIN'), getUsers)
  .post(authorizeRoles('SUPER_ADMIN'), createUser);

router.route('/:id')
  .get(getUserById) // Handled inside controller to allow own profile access or SUPER_ADMIN
  .put(authorizeRoles('SUPER_ADMIN'), updateUser);

router.route('/:id/status')
  .patch(authorizeRoles('SUPER_ADMIN'), updateUserStatus);

module.exports = router;

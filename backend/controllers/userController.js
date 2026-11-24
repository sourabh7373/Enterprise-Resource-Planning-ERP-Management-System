const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin (SUPER_ADMIN)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').populate('employee');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin or Own profile
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('employee');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Security check: if not SUPER_ADMIN, user can only access their own profile
    if (req.user.role !== 'SUPER_ADMIN' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this user record' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin (SUPER_ADMIN)
const createUser = async (req, res, next) => {
  try {
    const { email, password, role, employee } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      email,
      password,
      role: role || 'EMPLOYEE',
      employee: employee || undefined
    });

    const userResponse = await User.findById(user._id).select('-password').populate('employee');

    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin (SUPER_ADMIN)
const updateUser = async (req, res, next) => {
  try {
    const { email, role, employee, isActive } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent privilege escalation or accidental self-demotion/lockout if needed, but SUPER_ADMIN can update
    if (email) user.email = email;
    if (role) user.role = role;
    if (employee !== undefined) user.employee = employee;
    if (isActive !== undefined) user.isActive = isActive;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('employee');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (activate/deactivate)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin (SUPER_ADMIN)
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined || typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'Please provide a valid boolean isActive status' });
    }

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus
};

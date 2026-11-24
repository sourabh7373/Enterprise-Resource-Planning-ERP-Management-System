const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

// Alias protect as authenticateUser for requirements compatibility
const authenticateUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'Not authorized, account inactive or not found' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const protect = authenticateUser;

// Authorize specific roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

// Authorize permissions (if granular permissions are needed or map to roles)
const authorizePermissions = (...permissions) => {
  // Mapping roles to permissions if needed, or check specific permissions
  // SUPER_ADMIN has all permissions
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    // Implement custom permission checks if required
    next();
  };
};

module.exports = {
  authenticateUser,
  protect,
  authorizeRoles,
  authorizePermissions
};

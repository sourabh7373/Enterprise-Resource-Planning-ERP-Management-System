const ActivityLog = require('../models/ActivityLog');

const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(50).populate('user', 'email');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const logActivity = async (userId, action, module, description, relatedEntity = null, metadata = null) => {
  try {
    const log = new ActivityLog({
      user: userId,
      action,
      module,
      description,
      relatedEntity,
      metadata
    });
    await log.save();
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = { getActivityLogs, logActivity };

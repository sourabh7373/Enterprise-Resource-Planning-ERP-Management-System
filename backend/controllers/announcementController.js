const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

const getAnnouncements = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      status: 'PUBLISHED',
      startDate: { $lte: now },
      expiryDate: { $gte: now },
      targetRoles: { $in: [req.user.role] }
    }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement({ ...req.body, createdBy: req.user._id });
    await announcement.save();

    // Notify target roles
    if (announcement.status === 'PUBLISHED') {
      const users = await User.find({ role: { $in: announcement.targetRoles } });
      for (const user of users) {
        await Notification.create({
          user: user._id,
          title: 'New Announcement',
          message: announcement.title,
          type: 'ANNOUNCEMENT',
          relatedEntity: { entityType: 'Announcement', entityId: announcement._id }
        });
      }
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };

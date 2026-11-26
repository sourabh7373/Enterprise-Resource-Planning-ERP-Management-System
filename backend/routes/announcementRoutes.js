const express = require('express');
const router = express.Router();
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), createAnnouncement);
router.put('/:id', authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), updateAnnouncement);
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'HR_MANAGER'), deleteAnnouncement);

module.exports = router;

const express = require('express');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @desc Get all notifications
 * @route GET /api/notifications
 * @access Private
 */
router.get('/', protect, notificationController.getNotifications);

/**
 * @desc Mark a notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
router.put('/:id/read', protect, notificationController.markAsRead);

/**
 * @desc Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
router.put('/read-all', protect, notificationController.markAllAsRead);

module.exports = router;

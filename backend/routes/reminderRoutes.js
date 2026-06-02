const express = require('express');
const reminderController = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', reminderController.getReminders);
router.post('/', reminderController.createReminder);
router.delete('/:id', reminderController.deleteReminder);

module.exports = router;

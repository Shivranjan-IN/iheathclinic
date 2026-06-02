const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Only staff and admins can see analytics
router.use(protect);
router.use(authorize('admin', 'clinic', 'doctor'));

router.get('/stats', analyticsController.getStats);
router.get('/charts', analyticsController.getChartData);

module.exports = router;

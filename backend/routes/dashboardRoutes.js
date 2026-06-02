const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All dashboard routes require authentication
router.use(protect);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/appointments-data', dashboardController.getAppointmentData);
router.get('/revenue-data', dashboardController.getRevenueData);
router.get('/recent-appointments', dashboardController.getRecentAppointments);

module.exports = router;

const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect, authorize } = require('../middleware/auth');

// All device routes are protected and require 'doctor' role
router.use(protect);
router.use(authorize('doctor'));

// Device CRUD
router.get('/', deviceController.getDevices);
router.post('/', deviceController.createDevice);
router.patch('/:id', deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

// Device Readings
router.post('/readings', deviceController.createReading);
router.get('/readings/:deviceId', deviceController.getReadings);

module.exports = router;

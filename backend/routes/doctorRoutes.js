const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Routes accessible by public (like fetching the doctor list)
router.get('/', doctorController.getAllDoctors);

// All other doctor routes are protected
router.use(protect);

// Clinic and Doctor Registration (Clinic Admin can register doctors)
router.post('/register', authorize('clinic'), doctorController.registerDoctor);

// Other doctor-specific routes require 'doctor' role
router.use(authorize('doctor', 'clinic'));

// Patient Management
router.get('/patients', doctorController.getDoctorPatients);
router.delete('/patients/:id', doctorController.deleteDoctorPatient);

// Appointment Management
router.get('/appointments', doctorController.getDoctorAppointments);
router.post('/appointments', doctorController.createDoctorAppointment);
router.patch('/appointments/:id/status', doctorController.updateAppointmentStatus);

// Prescription Management
router.get('/prescriptions', doctorController.getDoctorPrescriptions);
router.post('/prescriptions', doctorController.createDoctorPrescription);

// Dashboard Stats
router.get('/stats', doctorController.getDoctorStats);

// Profile Management
router.get('/profile', doctorController.getDoctorProfile);
router.put('/profile', doctorController.updateDoctorProfile);

// Document Management
router.get('/documents', doctorController.getDoctorDocuments);
router.post('/documents/upload', upload.single('document'), doctorController.uploadDoctorDocument);
router.delete('/documents/:id', doctorController.deleteDoctorDocument);

module.exports = router;

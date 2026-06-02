const express = require('express');
const { check } = require('express-validator');
const patientController = require('../controllers/patientController');
const validate = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.get('/profile', patientController.getPatientProfile);
router.get('/dashboard/stats', patientController.getDashboardStats);
router.get('/invoices/my', patientController.getMyInvoices);
router.put('/profile', patientController.updatePatientProfile);
// Use memory upload for profile photos (stores binary in database)
router.post('/profile/photo', upload.single('profile_photo'), patientController.uploadProfilePhoto);

router.post(
    '/',
    [
        authorize('admin', 'clinic', 'receptionist', 'doctor'),
        check('patient_id', 'Patient ID is required').not().isEmpty(),
        check('full_name', 'Name is required').not().isEmpty(),
        check('phone', 'Phone number is required').not().isEmpty(),
        validate
    ],
    patientController.createPatient
);

router.get('/', patientController.getAllPatients);

router.get('/:id', patientController.getPatientById);

router.put(
    '/:id',
    [
        authorize('admin', 'receptionist', 'doctor'),
        validate
    ],
    patientController.updatePatient
);

router.delete(
    '/:id',
    authorize('admin'),
    patientController.deletePatient
);

// Get patient profile photo from database
router.get('/profile/photo/:patientId', patientController.getProfilePhoto);

// AI Insight routes
const aiHealthController = require('../controllers/aiHealthController');

router.post('/ai/explain-report', patientController.explainReport);
router.post('/ai/explain-prescription', patientController.explainPrescription);
router.post('/ai/scan-prescription', upload.single('prescription_image'), aiHealthController.scanPrescription);

// Scanned prescriptions history
router.post('/scanned-prescriptions', patientController.saveScannedPrescription);
router.get('/scanned-prescriptions', patientController.getScannedPrescriptionHistory);

// Saved medicines (wishlist)
router.get('/saved-medicines', patientController.getSavedMedicines);
router.post('/saved-medicines/toggle', patientController.toggleSaveMedicine);

// Saved addresses
router.get('/addresses', patientController.getSavedAddresses);
router.post('/addresses', patientController.saveAddress);
router.delete('/addresses/:id', patientController.deleteAddress);

module.exports = router;

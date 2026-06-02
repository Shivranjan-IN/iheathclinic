const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Patient gets their own prescriptions
router.get('/my', prescriptionController.getMyPrescriptions);

router.post(
    '/',
    authorize('doctor', 'admin'),
    prescriptionController.createPrescription
);

router.get(
    '/',
    authorize('doctor', 'admin', 'receptionist'),
    prescriptionController.getAllPrescriptions
);

router.get('/:id/download', prescriptionController.downloadPrescription);

router.get(
    '/:id',
    prescriptionController.getPrescriptionById
);

router.get(
    '/patient/:patientId',
    prescriptionController.getPatientPrescriptions
);

module.exports = router;


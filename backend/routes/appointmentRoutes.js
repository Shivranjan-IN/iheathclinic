const express = require('express');
const { check } = require('express-validator');
const appointmentController = require('../controllers/appointmentController');
const validate = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// User's specific API requirements
router.get('/', appointmentController.getDoctorAppointments);
router.post('/start', authorize('doctor'), appointmentController.startAppointment);
router.put('/status', authorize('doctor', 'admin', 'receptionist', 'patient'), appointmentController.updateStatusFromPost);
router.put('/reschedule', authorize('doctor', 'admin', 'receptionist', 'patient'), appointmentController.rescheduleAppointment);
router.delete('/:id', authorize('doctor', 'admin'), appointmentController.deleteAppointment);

// Existing/Other routes
router.get('/my-appointments', appointmentController.getPatientAppointments);
router.get('/my-upcoming-appointments', appointmentController.getUpcomingPatientAppointments);

router.post(
    '/',
    [
        check('patient_id', 'Patient ID is required').not().isEmpty(),
        check('doctor_id', 'Doctor ID is required').not().isEmpty(),
        check('appointment_date', 'Date is required').not().isEmpty(),
        validate
    ],
    appointmentController.createAppointment
);

router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);
router.get('/upcoming/:patientId', appointmentController.getUpcomingAppointments);
router.get('/booked-slots/:doctorId/:date', appointmentController.getBookedSlots);
router.get('/:id', appointmentController.getAppointmentById);

router.patch(
    '/:id/status',
    [
        authorize('admin', 'doctor', 'receptionist', 'patient'),
        check('status', 'Status is required').isIn(['scheduled', 'completed', 'cancelled', 'no-show', 'in_progress']),
        validate
    ],
    appointmentController.updateStatus
);

module.exports = router;

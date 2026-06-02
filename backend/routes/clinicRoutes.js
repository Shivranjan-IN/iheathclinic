const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Controllers
const clinicController = require('../controllers/clinicController');
const clinicPatientController = require('../controllers/clinicPatientController');
const clinicStaffController = require('../controllers/clinicStaffController');
const clinicOpsController = require('../controllers/clinicOpsController');

// All clinic routes require 'clinic' role protection
// All clinic management routes require protection
router.use(protect);

// Admin-level or Staff-level based on specific routes below
// Most management routes are for both 'clinic' (admin) and 'receptionist'/'nurse'
const clinicAndStaff = authorize('clinic', 'receptionist', 'nurse', 'doctor');
const clinicOnly = authorize('clinic');

// 1 & 2. Admin Dashboard & Profile
router.get('/profile', clinicAndStaff, clinicController.getProfile);
router.put('/profile', clinicOnly, clinicController.updateProfile);

// 3. Patient Management
router.get('/patients/search', clinicAndStaff, clinicPatientController.searchPatient);
router.get('/patients/today', clinicAndStaff, clinicPatientController.getTodayPatients);
router.get('/patients/upcoming', clinicAndStaff, clinicPatientController.getUpcomingPatients);
router.get('/patients/completed', clinicAndStaff, clinicPatientController.getCompletedPatients);
router.get('/patients', clinicAndStaff, clinicPatientController.getAllPatients);
router.post('/patients', clinicAndStaff, clinicPatientController.addPatient);

// 4. Appointment Management
router.get('/appointments', clinicAndStaff, clinicPatientController.getAppointments);
router.post('/appointments', clinicAndStaff, clinicPatientController.createAppointment);
router.post('/appointments/book', clinicAndStaff, clinicPatientController.bookAppointment);
router.put('/appointments/:id', clinicAndStaff, clinicPatientController.updateAppointment);
router.patch('/appointments/:id/status', clinicAndStaff, clinicPatientController.updateAppointmentStatus);
router.delete('/appointments/:id', clinicAndStaff, clinicPatientController.deleteAppointment);

// Clinic Doctors list (for booking dropdown)
router.get('/doctors/list', clinicAndStaff, clinicPatientController.getClinicDoctors);

// 5. Queue Management
router.get('/queue', clinicAndStaff, clinicPatientController.getQueue);

// 6. Doctor Management
router.get('/doctors', clinicAndStaff, clinicStaffController.getDoctors);
router.post('/doctors', clinicOnly, clinicStaffController.addDoctor);
router.put('/doctors/:id', clinicOnly, clinicStaffController.updateDoctor);
router.delete('/doctors/:id', clinicOnly, clinicStaffController.removeDoctor);

// 7. Staff Management
router.get('/staff', clinicOnly, clinicStaffController.getStaff);
router.post('/staff', clinicOnly, clinicStaffController.addStaff);
router.put('/staff/:id', clinicOnly, clinicStaffController.updateStaff);
router.delete('/staff/:id', clinicOnly, clinicStaffController.deleteStaff);

// 8. Prescription & Medical Records
router.get('/prescriptions', clinicAndStaff, clinicOpsController.getPrescriptions);

// 9. Lab & Diagnostics
router.get('/labs', clinicAndStaff, clinicOpsController.getLabs);
router.post('/labs', clinicAndStaff, clinicOpsController.addLab);
router.get('/labs/orders', clinicAndStaff, clinicOpsController.getLabOrders);
router.post('/labs/orders', clinicAndStaff, clinicOpsController.createLabOrder);
router.get('/labs/connected', clinicAndStaff, clinicOpsController.getConnectedLabs);
router.get('/labs/system-provided', clinicAndStaff, clinicOpsController.getSystemLabs);
router.post('/labs/connect-system', clinicAndStaff, clinicOpsController.connectSystemLab);
router.post('/labs/connect-manual', clinicAndStaff, clinicOpsController.connectManualLab);
router.delete('/labs/connected/:id', clinicAndStaff, clinicOpsController.disconnectLab);

// 10. Billing & Payments
router.get('/billing', clinicAndStaff, clinicOpsController.getBilling);
router.get('/billing/patients/search', clinicAndStaff, clinicOpsController.searchBillingPatients);
router.post('/billing', clinicAndStaff, clinicOpsController.createInvoice);
router.put('/billing/:id', clinicAndStaff, clinicOpsController.updateInvoiceStatus);

// 11. Pharmacy & Inventory
router.get('/medicines', clinicAndStaff, clinicOpsController.getMedicines);
router.post('/medicines', clinicAndStaff, clinicOpsController.addMedicine);

// 12. Reports & Analytics
router.get('/reports', clinicAndStaff, clinicController.getReports);

// 13. Notifications
router.get('/notifications', clinicAndStaff, clinicOpsController.getNotifications);

// 14. Settings
router.get('/settings', clinicAndStaff, clinicController.getSettings);
router.put('/settings', clinicAndStaff, clinicController.updateSettings);

// 15. Support
router.post('/support/ticket', clinicAndStaff, clinicController.submitTicket);

// 16. Outgoing Notifications
router.post('/notifications', clinicAndStaff, clinicOpsController.sendNotification);

module.exports = router;

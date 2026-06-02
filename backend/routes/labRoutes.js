const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All lab routes require authentication
router.use(protect);

// Patient gets their own lab orders
router.get('/my-orders', labController.getMyOrders);

// Lab Dashboard Routes (Exclusive to Lab Admins/Staff)
router.get('/profile', authorize('lab'), labController.getLabProfile);
router.put('/profile', authorize('lab'), labController.updateLabProfile);
router.get('/dashboard-stats', authorize('lab'), labController.getDashboardStats);
router.get('/inventory', authorize('lab'), labController.getInventory);
router.post('/inventory', authorize('lab'), labController.saveInventory);
router.get('/staff', authorize('lab'), labController.getStaff);
router.post('/staff', authorize('lab'), labController.onboardStaff);
router.get('/shifts', authorize('lab'), labController.getLabShifts);
router.post('/shifts', authorize('lab'), labController.createLabShift);
router.get('/bookings', authorize('lab'), labController.getLabBookings);
router.get('/transactions', authorize('lab'), labController.getLabTransactions);
router.put('/bookings/bulk-assign', authorize('lab'), labController.bulkAssignTechnician);
router.post('/reports/bulk-upload', authorize('lab'), upload.array('reports', 10), labController.bulkUploadReports);
router.get('/connections', authorize('lab'), labController.getClinicConnections);
router.get('/partners', authorize('lab'), labController.getPotentialPartners);
router.get('/mapping-reports', authorize('lab'), labController.getMappingReports);
router.get('/billing/report', authorize('lab'), labController.getBillingReport);
router.get('/billing/invoices', authorize('lab'), labController.getManualInvoices);
router.post('/billing/invoice', authorize('lab'), labController.createManualInvoice);
router.get('/billing/archive', authorize('lab'), labController.getBillingArchive);
router.get('/reviews', authorize('lab'), labController.getReviews);
router.get('/reviews/export', authorize('lab'), labController.exportReviews);
router.put('/reviews/:id/helpful', authorize('lab'), labController.markReviewHelpful);
router.put('/reviews/:id/flag', authorize('lab'), labController.flagReview);
router.get('/reviews/archive', authorize('lab'), labController.getReviewArchives);
router.get('/scheduling', authorize('lab'), labController.getScheduling);
router.put('/scheduling', authorize('lab'), labController.updateScheduling);

// Lab Document Management
router.get('/documents', authorize('lab'), labController.getLabDocuments);
router.post('/documents/upload', authorize('lab'), upload.single('document'), labController.uploadLabDocument);
router.delete('/documents/:id', authorize('lab'), labController.deleteLabDocument);

router.route('/')
    .get(labController.getOrders)
    .post(authorize('doctor', 'admin', 'clinic'), labController.createOrder);

router.get('/test-types', labController.getTestTypes);

router.route('/:id')
    .get(labController.getOrderById)
    .put(authorize('doctor', 'admin', 'clinic', 'lab'), labController.updateStatus)
    .delete(authorize('admin', 'clinic'), labController.deleteOrder);

module.exports = router;


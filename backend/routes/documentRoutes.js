const express = require('express');
const documentController = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(protect);

// Get all documents for the authenticated patient
router.get('/', documentController.getMyDocuments);

// Upload a new document (stores file in Supabase)
router.post('/upload', upload.single('document'), documentController.uploadDocument);

// --- Doctor / Admin Management Routes ---
router.get('/patient/:patientId', authorize('doctor', 'admin', 'clinic'), documentController.getPatientDocuments);
router.post('/patient/upload', authorize('doctor', 'admin', 'clinic'), upload.single('document'), documentController.uploadDocumentForPatient);
router.delete('/doctor/:id', authorize('doctor', 'admin', 'clinic'), documentController.deleteDocumentByDoctor);

// View / Download / Delete (Patient's own)
router.get('/:id', documentController.getDocument);
router.get('/:id/download', documentController.downloadDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;

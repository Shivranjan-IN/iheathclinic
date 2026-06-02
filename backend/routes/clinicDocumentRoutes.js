const express = require('express');
const clinicDocumentController = require('../controllers/clinicDocumentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.use(protect);

// Get all documents for the clinic
router.get('/', clinicDocumentController.getClinicDocuments);

// Get available document types
router.get('/types', clinicDocumentController.getDocumentTypes);

// Upload a new clinic document (stores in Supabase, URL in database)
router.post('/upload', upload.single('document'), clinicDocumentController.uploadClinicDocument);

// View a document inline (in browser)
router.get('/:id', clinicDocumentController.getClinicDocument);

// Download a document as attachment
router.get('/:id/download', clinicDocumentController.downloadClinicDocument);

// Delete a document
router.delete('/:id', clinicDocumentController.deleteClinicDocument);

module.exports = router;


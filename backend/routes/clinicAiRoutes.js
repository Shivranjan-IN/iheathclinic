const express = require('express');
const clinicAiController = require('../controllers/clinicAiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all Clinic AI routes
router.use(protect);

// 1. Predictive Workload Planner
router.get('/workload', clinicAiController.predictWorkload);

// 2. Virtual Receptionist Chatbot
router.post('/chatbot', clinicAiController.chatbot);

// 3. Symptom Checker
router.post('/symptoms', clinicAiController.checkSymptoms);

// 4. Prescription Generator
router.post('/prescription', clinicAiController.generatePrescription);

// 5. Health Record Summarizer
router.post('/summarize', clinicAiController.summarizeRecord);

// 6. Document Scanner (text-based fallback)
router.post('/scan-text', clinicAiController.scanDocument);

// 7. Treatment Recommendation
router.post('/treatment', clinicAiController.recommendTreatment);

module.exports = router;

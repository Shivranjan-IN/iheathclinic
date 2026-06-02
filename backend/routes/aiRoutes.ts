import { Router } from 'express';
import { handleTTS, handleChat, analyzeSymptoms, analyzeDocument, analyzeXray, scanPrescription, analyzeSentiment } from '../controllers/genkitController';
import { protect } from '../middleware/auth';

const router = Router();

// Protect all AI routes
router.use(protect);

/**
 * @route   POST /api/ai/analyze-symptoms
 * @desc    Analyze patient symptoms
 * @access  Public
 */
router.post('/analyze-symptoms', analyzeSymptoms);

/**
 * @route   POST /api/ai/analyze-document
 * @desc    Analyze medical report or X-ray/Scan
 * @access  Public
 */
router.post('/analyze-document', analyzeDocument);

/**
 * @route   POST /api/ai/analyze-xray
 * @desc    AI-powered X-ray analysis
 * @access  Public
 */
router.post('/analyze-xray', analyzeXray);

/**
 * @route   POST /api/ai/scan-prescription
 * @desc    Scan prescription and extract medicine names
 * @access  Public
 */
router.post('/scan-prescription', scanPrescription);

/**
 * @route   POST /api/ai/analyze-sentiment
 * @desc    Analyze patient feedback sentiment
 * @access  Public
 */
router.post('/analyze-sentiment', analyzeSentiment);

/**
 * @route   POST /api/ai/tts
 * @desc    Convert text to speech (English/Hindi)
 * @access  Public
 */
router.post('/tts', handleTTS);

/**
 * @route   POST /api/ai/chat
 * @desc    Chat follow-up for AI analysis
 * @access  Public
 */
router.post('/chat', handleChat);

export default router;

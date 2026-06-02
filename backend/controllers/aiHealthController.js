const { OpenAI } = require('openai');
const ResponseHandler = require('../utils/responseHandler');
const { z } = require('genkit');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
});

// Lazy-load genkit ai instance to avoid TypeScript/ESM issues in CJS context
let _ai = null;
const getAI = async () => {
    if (!_ai) {
        const m = await import('../ai/genkit.ts');
        _ai = m.ai || m.default?.ai || m.default;
    }
    return _ai;
};

exports.explainReport = async (req, res, next) => {
    try {
        const { report_content, language } = req.body; // language can be 'English' or 'Hindi'

        if (!report_content) {
            return ResponseHandler.badRequest(res, 'Report content is required for AI explanation');
        }

        const prompt = `Explain the following medical report in detail for a patient who is not a medical professional. 
        Provide the explanation in ${language || 'English'}. 
        Focus on key findings, what they mean, and potential next steps.
        Report Content: ${report_content}`;

        const ai = await getAI();
        const response = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt
        });

        const explanation = response.text;
        ResponseHandler.success(res, { explanation }, 'AI report explanation generated');
    } catch (error) {
        console.error('AI Error:', error);
        next(error);
    }
};

exports.explainPrescription = async (req, res, next) => {
    try {
        const { prescription_details, language } = req.body;

        if (!prescription_details) {
            return ResponseHandler.badRequest(res, 'Prescription details required for AI explanation');
        }

        const prompt = `Explain this medical prescription for a patient. 
        Provide the explanation in ${language || 'English'}.
        Include:
        1. Purpose of each medication (if known).
        2. Important instructions (dosage, frequency).
        3. Simple lifestyle advice based on the prescription.
        Prescription Details: ${prescription_details}`;

        const ai = await getAI();
        const response = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt
        });

        const explanation = response.text;
        ResponseHandler.success(res, { explanation }, 'AI prescription explanation generated');
    } catch (error) {
        console.error('AI Error:', error);
        next(error);
    }
};

const PrescriptionDataSchema = z.object({
    extractedData: z.array(z.object({
        name: z.string().describe("The name of the medicine or pharmaceutical product"),
        dosage: z.string().optional().default("").describe("The dosage of the medicine, e.g. 500mg, 1 tablet"),
        frequency: z.string().optional().default("").describe("The frequency of the medicine, e.g. Twice a day, 1-0-1"),
        duration: z.string().optional().default("").describe("The duration of treatment, e.g. 5 days")
    })).describe("List of medicines extracted from the prescription image")
});

exports.scanPrescription = async (req, res, next) => {
    try {
        if (!req.file) {
            return ResponseHandler.badRequest(res, 'Prescription image is required');
        }

        const base64Image = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype || 'image/jpeg';
        const fileDataUri = `data:${mimeType};base64,${base64Image}`;

        const ai = await getAI();
        const systemPrompt = `You are a world-class pharmacist and expert in medical calligraphy and prescription decoding. 
        Your task is to scan the provided image and extract every single medicine or pharmaceutical product mentioned.
        For each medicine, extract: name, dosage, frequency, and duration.
        If the image is blurry, low quality, or doesn't contain a readable prescription, return a single item with name "Unreadable Prescription" and other fields empty.`;

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: [
                { text: systemPrompt },
                { media: { url: fileDataUri } }
            ],
            output: { schema: PrescriptionDataSchema }
        });

        const extractedData = output?.extractedData || [];
        ResponseHandler.success(res, { extractedData }, 'Prescription scanned successfully');
    } catch (error) {
        console.error('Gemini Vision Error:', error);
        ResponseHandler.success(res, { 
            extractedData: [{ name: 'Could not read prescription image. Please enter details manually.', dosage: '', frequency: '', duration: '' }] 
        }, 'Prescription scan fallback triggered');
    }
};

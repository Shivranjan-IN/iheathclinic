/**
 * Clinic AI Controller
 * Uses Google Gemini via Genkit for all AI modules.
 * No OpenAI dependency required.
 */
const ResponseHandler = require('../utils/responseHandler');
const prisma = require('../config/database');

// Lazy-load genkit ai instance to avoid TypeScript/ESM issues in CJS context
let _ai = null;
const getAI = async () => {
    if (!_ai) {
        const m = await import('../ai/genkit.ts');
        _ai = m.ai || m.default?.ai || m.default;
        console.log('AI Instance loaded, generate method type:', typeof _ai?.generate);
    }
    return _ai;
};

const gemini = async (prompt, fallbackData = '') => {
    const ai = await getAI();
    if (!ai || typeof ai.generate !== 'function') {
        throw new Error('AI instance not properly initialized or missing generate method.');
    }
    try {
        const response = await ai.generate({ model: 'googleai/gemini-2.5-flash', prompt });
        return response.text;
    } catch (error) {
        console.warn('AI Generation failed (likely API quota or model error), using fallback heuristic:', error.message);
        if (fallbackData) {
            return `[HEURISTIC PLAN - AI UNAVAILABLE]\nBased on ${fallbackData.length} appointments: Peak time identified around the most bookedSlots. Recommend 1 extra staff member during morning hours. (Primary AI was unavailable)`;
        }
        return "Standard Workload: Peak hours 10 AM–1 PM. Staffing sufficient.";
    }
};

// ─── 1. Predictive Workload Planner ─────────────────────────────────────────
exports.predictWorkload = async (req, res, next) => {
    try {
        const { clinic_id, doctor_id } = req.query;
        let appointments = [];
        
        const filter = {};
        if (doctor_id) filter.doctor_id = doctor_id;
        else if (clinic_id) filter.clinic_id = parseInt(clinic_id);

        try {
            appointments = await prisma.appointments.findMany({
                where: filter,
                select: { appointment_date: true, appointment_time: true, status: true },
                take: 100
            });

            const fallbackFilter = clinic_id ? { clinic_id: parseInt(clinic_id) } : {};
            if (appointments.length === 0) {
                appointments = await prisma.appointments.findMany({
                    where: fallbackFilter,
                    select: { appointment_date: true, appointment_time: true, status: true },
                    take: 50
                });
            }
            // ─── Ultimate Fallback: Pull any system-wide data if still empty (for demo/beta) ───
            if (appointments.length === 0) {
                appointments = await prisma.appointments.findMany({
                    select: { appointment_date: true, appointment_time: true, status: true },
                    take: 50,
                    orderBy: { appointment_date: 'desc' }
                });
            }
        } catch (e) { console.error('Prisma query failed:', e); }

        const sourceLabel = appointments.length > 0 ? (doctor_id ? 'Doctor' : 'Clinic') : 'System (Standard)';
        const contextInfo = `${sourceLabel} Analysis`;

        const promptData = appointments.length
            ? appointments.map(a => `${a.appointment_date || ''} ${a.appointment_time || ''}`).join(', ')
            : 'No past appointments found. Assume a standard clinic with 9 AM-6 PM hours.';

        const prediction = await gemini(
            `You are an AI workload predictor. Based on the following past appointment data, identify the top 3 busiest hours of the day and suggest staffing allocation. Also forecast tomorrow's load.\n\nPast data: ${promptData}`,
            'Busy hours typically 10am-1pm. Staff accordingly.'
        );
        ResponseHandler.success(res, { prediction }, 'Workload predicted');
    } catch (error) {
        console.error('Workload prediction error:', error);
        ResponseHandler.serverError(res, error.message || 'Workload analysis failed');
    }
};

// ─── 2. Virtual Receptionist (Chatbot) ──────────────────────────────────────
exports.chatbot = async (req, res, next) => {
    try {
        const { message, language } = req.body;
        const lang = language === 'Hindi' ? 'Hindi' : 'English';
        const reply = await gemini(
            `You are a polite and helpful Virtual Receptionist for a medical clinic. Answer ONLY in ${lang}. Clinic hours: Monday–Saturday, 9 AM–6 PM. Specialties: General Medicine, Dental, Cardiology, Orthopedics, Pediatrics. Be concise.\n\nPatient says: "${message}"`
        );
        ResponseHandler.success(res, { reply }, 'Chatbot responded');
    } catch (error) {
        next(error);
    }
};

// ─── 3. AI Symptom Checker ───────────────────────────────────────────────────
exports.checkSymptoms = async (req, res, next) => {
    try {
        const { symptoms } = req.body;
        const analysis = await gemini(
            `You are an AI clinical assistant. Analyze these symptoms and provide:
1. Possible conditions (3–5)
2. Urgency level: Low / Medium / Emergency
3. Recommended specialist
4. Brief home advice

IMPORTANT: Add clear disclaimer that this is NOT a medical diagnosis.

Symptoms: ${symptoms}`
        );
        ResponseHandler.success(res, { analysis }, 'Symptoms analyzed');
    } catch (error) {
        next(error);
    }
};

// ─── 4. Prescription Generator ───────────────────────────────────────────────
exports.generatePrescription = async (req, res, next) => {
    try {
        const { diagnosis, patientAge, patientWeight, allergies } = req.body;
        const prescription = await gemini(
            `You are an AI assisting a licensed doctor in writing a prescription. Generate a structured suggestion.\n\nDiagnosis: ${diagnosis}\nPatient Age: ${patientAge}\nWeight: ${patientWeight} kg\nAllergies: ${allergies || 'None'}\n\nInclude: medicine name, dosage, frequency, duration, drug interaction warnings, and alternatives. Add the disclaimer: "For doctor's use only. Not for self-medication."`
        );
        ResponseHandler.success(res, { prescription }, 'Prescription generated');
    } catch (error) {
        next(error);
    }
};

// ─── 5. Health Record Summarizer ─────────────────────────────────────────────
exports.summarizeRecord = async (req, res, next) => {
    try {
        const { record_text } = req.body;
        const summary = await gemini(
            `Summarize this patient health record into:\n1. A 2–3 sentence overview\n2. Key health insights (bullet points)\n3. A timeline of major events if dates are present\n\nRecord:\n${record_text}`
        );
        ResponseHandler.success(res, { summary }, 'Record summarized');
    } catch (error) {
        next(error);
    }
};

// ─── 6. Document Scanner (AI Vision Analysis) ────────────────────────────────
// Note: Frontend now sends to /api/ai/analyze-document (Genkit) directly.
// This endpoint also works as fallback for text-only documents.
exports.scanDocument = async (req, res, next) => {
    try {
        const text = req.body?.text || '';
        const structuredData = await gemini(
            `Extract structured data from this medical document text. Return: Patient Name, Date, Diagnosis, Medicines prescribed (name + dosage + frequency), and any lab values.\n\nText:\n${text}`
        );
        ResponseHandler.success(res, { rawText: text, structuredData }, 'Document scanned');
    } catch (error) {
        next(error);
    }
};

// ─── 7. Treatment Recommendation ─────────────────────────────────────────────
exports.recommendTreatment = async (req, res, next) => {
    try {
        const { symptoms, history } = req.body;
        const recommendation = await gemini(
            `You are a clinical decision support AI. Using standard clinical guidelines, suggest treatment options.\n\nSymptoms: ${symptoms}\nPatient History: ${history || 'Not provided'}\n\nInclude: first-line treatments, lifestyle advice, red flags. End with: "Disclaimer: This is for clinical reference only. Not a replacement for a licensed doctor's judgment."`
        );
        ResponseHandler.success(res, { recommendation }, 'Treatment recommended');
    } catch (error) {
        next(error);
    }
};


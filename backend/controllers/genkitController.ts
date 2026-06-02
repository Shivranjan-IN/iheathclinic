import { Request, Response, NextFunction } from 'express';
import ResponseHandler from '../utils/responseHandler';
import { ai } from '../ai/genkit';
import { z } from 'genkit';
import { getHindiAudio } from '@/ai/flows/hindi-xray-analysis';
import { getEnglishAudio, chatWithEnglishXrayBot } from '@/ai/flows/english-xray-analysis';
import { chatWithXrayBot } from '@/ai/flows/hindi-xray-analysis';
import { analyzeXray as runXrayFlow } from '@/ai/flows/xray-analysis';

// ----------------------------------------------------------------------------
// 1. Analyze Symptoms
// ----------------------------------------------------------------------------

const SymptomsOutputSchema = z.object({
    possibleConditions: z.array(z.string()).describe("List of possible medical conditions."),
    severityLevel: z.enum(['Low', 'Medium', 'High']).describe("Overall estimated severity based on symptoms."),
    recommendedSpecialist: z.string().describe("The type of doctor or specialist to visit."),
    basicAdvice: z.string().describe("Non-diagnostic advice or immediate home care tips."),
});

// ----------------------------------------------------------------------------
// 1.5. Scan Prescription
// ----------------------------------------------------------------------------

const PrescriptionScanOutputSchema = z.object({
    medicines: z.array(z.string()).describe("List of medicine names extracted from the prescription."),
});

// ----------------------------------------------------------------------------
// 1.6. Sentiment Analysis
// ----------------------------------------------------------------------------

const SentimentAnalysisSchema = z.object({
    sentiment: z.enum(['Positive', 'Neutral', 'Negative']),
    score: z.number().min(0).max(100),
    key_topics: z.array(z.string()),
    summary: z.string(),
    actionable_improvements: z.array(z.string()),
});

export const analyzeSymptoms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { symptoms, language = 'en' } = req.body;
        if (!symptoms) {
            return (ResponseHandler as any).badRequest(res, 'Symptoms text is required');
        }

        const systemPrompt = language === 'hi' 
            ? `आप एक मेडिकल असिस्टेंट हैं। दिए गए लक्षणों (symptoms) का विश्लेषण करें और केवल JSON फॉर्मेट में आउटपुट दें। 
               ध्यान रहे: यह निदान (diagnosis) नहीं है। मरीज को हमेशा डॉक्टर से सलाह लेनी चाहिए।
               JSON में possibleConditions, severityLevel (Low/Medium/High), recommendedSpecialist और basicAdvice शामिल करें।`
            : `You are an AI medical assistant. Analyze the following symptoms and respond ONLY in valid JSON.
               Disclaimer: This is not a diagnosis. Always recommend consulting a real doctor.
               Include possibleConditions, severityLevel (Low/Medium/High), recommendedSpecialist, and basicAdvice.`;

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: `Symptoms: ${symptoms}\n\n${systemPrompt}`,
            output: { schema: SymptomsOutputSchema },
        });

        (ResponseHandler as any).success(res, output, 'Symptoms analyzed successfully');
    } catch (error) {
        console.error('Symptom analysis failed:', error);
        next(error);
    }
};

// ----------------------------------------------------------------------------
// 2. Analyze Document / X-Ray / Scan
// ----------------------------------------------------------------------------

const DocumentAnalysisOutputSchema = z.object({
    explanation: z.string().describe("Simple overall explanation of the document or scan."),
    abnormalValues: z.array(z.string()).describe("List of abnormal values, flagged items, or worrying visual signs."),
    summary: z.string().describe("A very short plain language summary for the patient."),
    riskIndicators: z.array(z.string()).describe("Potentially risky findings or indicators (e.g., High Blood Sugar, Fracture detected)."),
    suggestedNextSteps: z.array(z.string()).describe("Actionable advice or next steps to take."),
});

export const analyzeDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileDataUri, documentText, fileType, language = 'en' } = req.body;

        if (!fileDataUri && !documentText) {
            return (ResponseHandler as any).badRequest(res, 'Either fileDataUri (image/pdf) or documentText is required');
        }

        const languageInstruction = language === 'hi' 
            ? 'पूरी रिपोर्ट और स्पष्टीकरण हिंदी भाषा में दें (Respond entirely in Hindi).'
            : 'Respond entirely in English.';

        let parts: any[] = [{ text: `You are an expert medical document and scan analyzer. Analyze the provided ${fileType || 'document/scan'} and extract findings into JSON format. ${languageInstruction} Find abnormal values, risk indicators, and provide a plain language summary.` }];

        if (documentText) {
            parts.push({ text: `Document text extracted:\n${documentText}` });
        }
        if (fileDataUri) {
            parts.push({ media: { url: fileDataUri } });
        }

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: parts,
            output: { schema: DocumentAnalysisOutputSchema },
        });

        (ResponseHandler as any).success(res, output, 'Medical document analyzed successfully');
    } catch (error) {
        console.error('Document analysis failed:', error);
        next(error);
    }
};

export const analyzeXray = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { xrayImage, language = 'en' } = req.body;
        if (!xrayImage) {
            return (ResponseHandler as any).badRequest(res, 'X-ray image (xrayImage) is required');
        }

        const output = await runXrayFlow({ xrayImage });
        (ResponseHandler as any).success(res, output, 'X-ray analyzed successfully');
    } catch (error) {
        console.error('X-ray analysis failed:', error);
        next(error);
    }
};

export const scanPrescription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileDataUri } = req.body;

        if (!fileDataUri) {
            return (ResponseHandler as any).badRequest(res, 'Prescription image (fileDataUri) is required');
        }

        const systemPrompt = `You are a world-class pharmacist and expert in medical calligraphy and prescription decoding. 
        Your task is to scan the provided image and extract every single medicine or pharmaceutical product mentioned.
        Respond ONLY in valid JSON with a "medicines" array containing the strings of detected medicine names.`;

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: [
                { text: systemPrompt },
                { media: { url: fileDataUri } }
            ],
            output: { schema: PrescriptionScanOutputSchema },
        });

        (ResponseHandler as any).success(res, output, 'Prescription scanned successfully');
    } catch (error) {
        console.error('Prescription scan failed:', error);
        next(error);
    }
};

export const analyzeSentiment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { feedback } = req.body;
        if (!feedback) return (ResponseHandler as any).badRequest(res, 'Feedback is required');

        const { output } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            prompt: `Analyze the following patient feedback:\n"${feedback}"`,
            output: { schema: SentimentAnalysisSchema },
        });

        (ResponseHandler as any).success(res, output, 'Sentiment analysis complete');
    } catch (error) {
        console.error('Sentiment analysis failed:', error);
        next(error);
    }
};

// ----------------------------------------------------------------------------
// 3. Text to Speech
// ----------------------------------------------------------------------------
export const handleTTS = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { text, language = 'en' } = req.body;
        if (!text) {
            return (ResponseHandler as any).badRequest(res, 'Text is required for TTS');
        }

        let audioDataUri;
        if (language === 'hi') {
            audioDataUri = await getHindiAudio(text);
        } else {
            audioDataUri = await getEnglishAudio(text);
        }

        (ResponseHandler as any).success(res, { audioDataUri }, 'Audio generated');
    } catch (error) {
        next(error);
    }
};

// ----------------------------------------------------------------------------
// 4. Chat Follow-up (Generic & Specialized)
// ----------------------------------------------------------------------------
export const handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { prompt, history = [], language = 'en' } = req.body;
        if (!prompt) {
            return (ResponseHandler as any).badRequest(res, 'Prompt is required for chat');
        }

        // Map roles precisely: Gemini requires Alternating User/Model, starting with User.
        const messages = history.map((h: any) => ({
            role: (h.role === 'assistant' || h.role === 'model') ? 'model' : 'user',
            content: [{ text: h.content }]
        }));

        // Filter out any leading 'model' messages as Gemini history MUST start with 'user'
        let validStartIndex = 0;
        while (validStartIndex < messages.length && messages[validStartIndex].role === 'model') {
            validStartIndex++;
        }
        
        const finalMessages = messages.slice(validStartIndex);
        
        // Add current prompt
        finalMessages.push({ role: 'user', content: [{ text: prompt }] });

        const { text } = await ai.generate({
            model: 'googleai/gemini-2.5-flash',
            messages: finalMessages
        });

        (ResponseHandler as any).success(res, { response: text }, 'AI response generated');
    } catch (error: any) {
        console.error('Chat generation failed:', error?.name, error?.message);
        next(error);
    }
};

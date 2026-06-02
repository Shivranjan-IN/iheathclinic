import axios from 'axios';

// Local backend endpoints for Anti-Gravity Healthcare API
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export const aiIntelligenceService = {
    /**
     * Analyzes a medical report (PDF, JPG, PNG) using local Gemini engine
     * @param fileDataUri The base64 Data URI of the file
     * @param fileName The name of the file
     * @param language The language for analysis
     */
    analyzeReport: async (fileDataUri: string, fileName: string, language: string = 'en') => {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await axios.post(`${API_BASE_URL}/ai/analyze-document`, {
            fileDataUri,
            fileName,
            fileType: fileName.split('.').pop(),
            language
        }, { headers });
        
        // Return in format expected by UI or adjust UI
        return response.data;
    },

    /**
     * Gets clinical insights for symptoms using local Gemini engine
     * @param symptoms The description of symptoms
     * @param language 
     */
    checkSymptoms: async (symptoms: string, language: string = 'en') => {
        const token = localStorage.getItem('auth_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        const response = await axios.post(`${API_BASE_URL}/ai/analyze-symptoms`, {
            symptoms,
            language
        }, { headers });
        
        // The backend returns a structured object, but the old code expected a string.
        // We'll format the structured object into a pretty string for the UI.
        const { possibleConditions, severityLevel, recommendedSpecialist, basicAdvice } = response.data.data;
        
        return `### Clinical Assessment (AI)
**Estimated Severity:** ${severityLevel}
**Recommended Specialist:** ${recommendedSpecialist}

**Possible Conditions:**
${possibleConditions.map((c: string) => `- ${c}`).join('\n')}

**Advice:**
${basicAdvice}

---
*Disclaimer: This is for informational purposes only. Consult a doctor.*`;
    }
};


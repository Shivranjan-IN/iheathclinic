'use server';
/**
 * @fileOverview AI-powered X-ray image analysis flow.
 *
 * - analyzeXray - A function that analyzes an X-ray image.
 * - AnalyzeXrayInput - The input type for the analyzeXray function.
 * - AnalyzeXrayOutput - The return type for the analyzeXray function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeXrayInputSchema = z.object({
  xrayImage: z
    .string()
    .describe(
      "An X-ray image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeXrayInput = z.infer<typeof AnalyzeXrayInputSchema>;

const AnalyzeXrayOutputSchema = z.object({
  xrayType: z.string().describe("The detected body part in the X-ray (e.g., 'Chest X-ray', 'Left Hand X-ray')."),
  finding: z.string().describe("A concise summary of the primary issue found (e.g., 'Mild lung infection in lower right lung', 'Fracture in the forearm bone')."),
  summary: z.string().describe("A simple, human-understandable summary of the findings, explaining what the X-ray shows and the potential severity."),
  patientIssue: z.string().describe("Details about the problem the patient might be facing, including possible symptoms and whether it seems acute or chronic."),
  prescription: z.string().describe("AI-based suggestions including over-the-counter medicines, home care tips, and specialist recommendations. Must include a disclaimer."),
});
export type AnalyzeXrayOutput = z.infer<typeof AnalyzeXrayOutputSchema>;

export async function analyzeXray(
  input: AnalyzeXrayInput
): Promise<AnalyzeXrayOutput> {
  return xrayAnalysisFlow(input);
}

const xrayAnalysisPrompt = ai.definePrompt({
  name: 'xrayAnalysisPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: AnalyzeXrayInputSchema},
  output: {schema: AnalyzeXrayOutputSchema},
  prompt: `You are a medical image assistant. Your task is to analyze the uploaded X-ray image and provide a complete, medical-style summary in patient-friendly language.

Follow these steps carefully:

1.  **X-ray Analysis:**
    *   Detect the body part shown in the X-ray (e.g., chest, hand, leg, teeth, skull).
    *   Identify visible issues like fractures, alignment problems, infections, lung inflammation, or other abnormalities.
    *   Highlight the exact location of the problem (e.g., left lung lower zone, right forearm bone).

2.  **Generate Output in the following structured format:**

    *   **xrayType:** The detected body part.
    *   **finding:** A very short, precise summary of the main issue.
    *   **summary:** Explain what the X-ray shows in easy, non-medical English. Mention if it looks normal, mild, or serious.
    *   **patientIssue:** Describe the problem the patient might be facing, including possible symptoms (e.g., pain, swelling, breathing difficulty) and whether it seems acute or chronic.
    *   **prescription:**
        *   If mild, suggest general over-the-counter medicines (e.g., "For pain, Paracetamol or Ibuprofen") and home remedies (e.g., "rest", "apply ice").
        *   Recommend the type of specialist to consult (e.g., Orthopedic, Pulmonologist, Dentist).
        *   **Crucially, you MUST end this section with the disclaimer:** "Note: This is an AI-based summary. Consult a certified doctor before taking any medicine."

IMPORTANT: Do NOT make a final diagnosis. Your role is to provide an informational summary and suggest possible next actions only.

X-ray Image:
{{media url=xrayImage}}`,
});

const xrayAnalysisFlow = ai.defineFlow(
  {
    name: 'xrayAnalysisFlow',
    inputSchema: AnalyzeXrayInputSchema,
    outputSchema: AnalyzeXrayOutputSchema,
  },
  async input => {
    const {output} = await xrayAnalysisPrompt(input);
    return output!;
  }
);

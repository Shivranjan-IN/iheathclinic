'use server';
/**
 * @fileOverview A comprehensive AI flow for analyzing X-ray images in English,
 * providing a structured summary, text-to-speech audio output, and a follow-up chat session.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

// Define Zod schemas for structured input and output

const AnalyzeXrayInputSchema = z.object({
  xrayImage: z
    .string()
    .describe(
      "An X-ray image as a data URI (e.g., 'data:image/jpeg;base64,...')."
    ),
});
export type AnalyzeXrayInput = z.infer<typeof AnalyzeXrayInputSchema>;

const AnalysisOutputSchema = z.object({
  xrayType: z.string().describe("Type of X-ray (e.g., 'Chest X-ray')."),
  finding: z
    .string()
    .describe("Short summary of the finding (e.g., 'Mild infection')."),
  summary: z.string().describe('Patient-friendly summary in English.'),
  patientIssue: z.string().describe('Detailed patient issue in English.'),
  prescription: z.string().describe('Prescription suggestion in English.'),
});
export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

const ChatInputSchema = z.object({
  history: z.array(z.any()),
  prompt: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

/**
 * Converts PCM audio buffer to WAV format.
 * @param pcmData The raw PCM audio data.
 * @returns A Base64 encoded string of the WAV audio.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });
    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', d => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}

// Define AI tools for TTS and Chat

export const englishTextToSpeechTool = ai.defineTool(
  {
    name: 'englishTextToSpeechTool',
    description:
      'Generates audio from the provided English text. Use this to create the audio playback for the user.',
    inputSchema: z.object({
      textToSpeak: z
        .string()
        .describe('The English text to be converted to speech. This text should be conversational and human-like.'),
    }),
    outputSchema: z.object({
      audioDataUri: z.string(),
    }),
  },
  async ({textToSpeak}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts', // Corrected model to match available key capabilities
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Nebula'}}, // English voice
        },
      },
      prompt: textToSpeak,
    });
    if (!media) throw new Error('TTS failed: No media returned.');
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);
    return {audioDataUri: `data:audio/wav;base64,${wavBase64}`};
  }
);

export const englishChatTool = ai.defineTool(
  {
    name: 'englishXrayChatTool',
    description:
      'Use this tool to answer follow-up questions from the user based on the X-ray analysis.',
    inputSchema: ChatInputSchema,
    outputSchema: z.string(),
  },
  async ({history, prompt}) => {
    const {text} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      history: history as any[],
      prompt: `Based on our previous analysis, answer this question: ${prompt}`,
    });
    return text;
  }
);

// Define the main AI flow

const englishXrayAnalysisPrompt = `
You are a medical image assistant. Your goal is to analyze the uploaded X-ray and explain the findings like a compassionate and clear-spoken doctor. Do not just read the report; explain it.

Follow these steps carefully and present all results in easy English:

1. X-Ray Analysis:
   - First, analyze the image to detect the body part (e.g., chest, hand, leg, teeth, skull, spine).
   - Identify any visible issues like fractures, bone misalignment, infections, swelling, lung patches, cavities, or other abnormalities.
   - Note the exact affected area (e.g., right lower lung zone, left forearm bone).

2. Create a Human-Style Explanation (For the 'summary' field):
   - Rephrase the technical findings into a friendly, spoken-style explanation.
   - Use a natural, conversational tone. For example, use phrases like "So, what this X-ray shows is..." or "It seems like there's...".
   - Mention if the result appears normal, a minor issue, or a serious condition in an empathetic way.
   - This summary will be used for text-to-speech, so make it sound like a person is talking.

3. Detail the Patient's Issue (For the 'patientIssue' field):
   - Clearly state the possible condition (e.g., chest infection, bone fracture, sinus issue).
   - Describe likely symptoms the patient might be experiencing (pain, swelling, cough, difficulty breathing).
   - Indicate if the issue seems temporary (acute) or long-term (chronic).

4. Suggest Next Steps (For the 'prescription' field):
   - If the issue is mild, suggest general OTC medicines or home remedies (e.g., for pain/swelling: "Paracetamol 500mg, Ibuprofen, rest, apply ice pack"; for mild lung infection: "Steam inhalation, warm fluids").
   - If the problem looks serious, recommend visiting a specialist (e.g., Orthopedic, Pulmonologist, Dentist).
   - **Crucially, include this disclaimer at the end:** "⚠️ This is an AI-generated suggestion. Please consult a certified doctor before taking any medication."

Output ONLY in the requested JSON format.
`;

export const englishXrayAnalysisFlow = ai.defineFlow(
  {
    name: 'englishXrayAnalysisFlow',
    inputSchema: AnalyzeXrayInputSchema,
    outputSchema: AnalysisOutputSchema,
  },
  async ({xrayImage}) => {
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {text: englishXrayAnalysisPrompt},
        {media: {url: xrayImage}},
      ],
      output: {schema: AnalysisOutputSchema},
    });
    return output!;
  }
);

// Export wrapper functions for client-side usage

export async function analyzeEnglishXray(
  input: AnalyzeXrayInput
): Promise<AnalysisOutput> {
  return englishXrayAnalysisFlow(input);
}

export async function getEnglishAudio(textToSpeak: string): Promise<string> {
  const result = await englishTextToSpeechTool({textToSpeak});
  return result.audioDataUri;
}

export async function chatWithEnglishXrayBot(input: ChatInput): Promise<string> {
  return englishChatTool(input);
}

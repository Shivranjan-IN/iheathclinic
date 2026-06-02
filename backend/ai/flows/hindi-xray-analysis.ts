'use server';
/**
 * @fileOverview A comprehensive AI flow for analyzing X-ray images in Hindi,
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
  xrayType: z.string().describe('Type of X-ray (e.g., छाती का X-ray).'),
  finding: z
    .string()
    .describe('Short summary of the finding (e.g., हल्का संक्रमण).'),
  summary: z.string().describe('Patient-friendly summary in Hindi.'),
  patientIssue: z.string().describe('Detailed patient issue in Hindi.'),
  prescription: z.string().describe('Prescription suggestion in Hindi.'),
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

export const textToSpeechTool = ai.defineTool(
  {
    name: 'textToSpeechTool',
    description:
      'Generates audio from the provided Hindi text. Use this to create the audio playback for the user.',
    inputSchema: z.object({
      textToSpeak: z
        .string()
        .describe('The Hindi text to be converted to speech. This text should be conversational and human-like.'),
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
          voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Algenib'}},
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

export const chatTool = ai.defineTool(
  {
    name: 'xrayChatTool',
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

const hindiXrayAnalysisPrompt = `
आप एक मेडिकल इमेज असिस्टेंट हैं। आपका लक्ष्य केवल रिपोर्ट पढ़ना नहीं है, बल्कि एक डॉक्टर की तरह सहानुभूति और स्पष्टता के साथ निष्कर्षों को समझाना है।

इन स्टेप्स को फॉलो करें और परिणाम आसान हिंदी में दिखाएँ:

1.  **एक्स-रे विश्लेषण (X-ray Analysis):**
    *   पहचान करें कि X-ray किस बॉडी पार्ट का है (जैसे — छाती, हाथ, पैर, दांत, सिर)।
    *   इमेज में कोई असामान्यता (Abnormality) जैसे fracture, infection, swelling, या bone alignment की समस्या को पहचानें।
    *   समस्या का सटीक स्थान बताएँ (जैसे — दाएँ फेफड़े का निचला हिस्सा)।

2.  **मानवीय स्पष्टीकरण बनाएँ ('summary' फ़ील्ड के लिए):**
    *   तकनीकी निष्कर्षों को एक दोस्ताना, बोलचाल की व्याख्या में बदलें।
    *   प्राकृतिक, संवादी लहजे का प्रयोग करें। उदाहरण के लिए, "तो, यह एक्स-रे दिखा रहा है कि..." या "ऐसा लगता है कि..." जैसे वाक्यांशों का प्रयोग करें।
    *   बताएँ कि स्थिति सामान्य, हल्की समस्या, या गंभीर है, और इसे सहानुभूतिपूर्वक बताएँ।
    *   यह सारांश टेक्स्ट-टू-स्पीच के लिए उपयोग किया जाएगा, इसलिए इसे ऐसा बनाएँ जैसे कोई व्यक्ति बात कर रहा हो।

3.  **मरीज की स्थिति का विवरण ('patientIssue' फ़ील्ड के लिए):**
    *   मरीज को कौन सी समस्या हो सकती है और उसके सम्भावित लक्षण क्या हैं (जैसे — दर्द, सूजन, सांस लेने में परेशानी)।
    *   यह समस्या अस्थायी (Temporary) है या दीर्घकालीन (Chronic), यह भी बताएँ।

4.  **दवा और सुझाव ('prescription' फ़ील्ड के लिए):**
    *   अगर समस्या हल्की है, तो सामान्य OTC दवाओं और घरेलू उपचार का सुझाव दें (जैसे — Paracetamol, आराम करें)।
    *   बताएँ कि किस विशेषज्ञ डॉक्टर से मिलना चाहिए (जैसे — ऑर्थोपेडिक, पल्मोनोलॉजिस्ट)।
    *   **हमेशा यह चेतावनी शामिल करें:** "⚠️ यह केवल AI द्वारा दिया गया सुझाव है। कृपया किसी योग्य डॉक्टर से परामर्श अवश्य करें।"

आउटपुट केवल JSON फॉर्मेट में दें।
`;

export const hindiXrayAnalysisFlow = ai.defineFlow(
  {
    name: 'hindiXrayAnalysisFlow',
    inputSchema: AnalyzeXrayInputSchema,
    outputSchema: AnalysisOutputSchema,
  },
  async ({xrayImage}) => {
    const {output} = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        {text: hindiXrayAnalysisPrompt},
        {media: {url: xrayImage}},
      ],
      output: {schema: AnalysisOutputSchema},
    });
    return output!;
  }
);

// Export wrapper functions for client-side usage

export async function analyzeHindiXray(
  input: AnalyzeXrayInput
): Promise<AnalysisOutput> {
  return hindiXrayAnalysisFlow(input);
}

export async function getHindiAudio(textToSpeak: string): Promise<string> {
  const result = await textToSpeechTool({textToSpeak});
  return result.audioDataUri;
}

export async function chatWithXrayBot(input: ChatInput): Promise<string> {
  return chatTool(input);
}

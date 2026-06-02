const dotenv = require('dotenv');
dotenv.config();

const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');

console.log("GOOGLE_GENAI_API_KEY:", process.env.GOOGLE_GENAI_API_KEY ? "Present" : "Missing");

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});

async function main() {
  try {
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: 'Hello! Respond with "Success" if you can hear me.',
    });
    console.log("Gemini response:", response.text);
  } catch (error) {
    console.error("Gemini invocation failed:", error);
  }
}

main();

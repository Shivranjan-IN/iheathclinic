'use server';
/**
 * @fileOverview AI-powered medical record summarization flow.
 *
 * - summarizeMedicalRecord - A function that summarizes a patient's medical record.
 * - SummarizeMedicalRecordInput - The input type for the summarizeMedicalRecord function.
 * - SummarizeMedicalRecordOutput - The return type for the summarizeMedicalRecord function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMedicalRecordInputSchema = z.object({
  medicalRecord: z
    .string()
    .describe('The full medical record of the patient.'),
});
export type SummarizeMedicalRecordInput = z.infer<typeof SummarizeMedicalRecordInputSchema>;

const SummarizeMedicalRecordOutputSchema = z.object({
  summary: z
    .string()
    .describe('The summarized version of the medical record.'),
});
export type SummarizeMedicalRecordOutput = z.infer<typeof SummarizeMedicalRecordOutputSchema>;

export async function summarizeMedicalRecord(
  input: SummarizeMedicalRecordInput
): Promise<SummarizeMedicalRecordOutput> {
  return summarizeMedicalRecordFlow(input);
}

const summarizeMedicalRecordPrompt = ai.definePrompt({
  name: 'summarizeMedicalRecordPrompt',
  model: 'googleai/gemini-2.5-flash',
  input: {schema: SummarizeMedicalRecordInputSchema},
  output: {schema: SummarizeMedicalRecordOutputSchema},
  prompt: `You are an AI assistant that summarizes medical records for doctors. Given the following medical record, provide a concise and informative summary:

Medical Record:
{{medicalRecord}}`,
});

const summarizeMedicalRecordFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalRecordFlow',
    inputSchema: SummarizeMedicalRecordInputSchema,
    outputSchema: SummarizeMedicalRecordOutputSchema,
  },
  async input => {
    const {output} = await summarizeMedicalRecordPrompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview AI-powered scoring for open-ended assessment questions.
 *
 * - automatedAiScoring - A function that grades open-ended assessment questions using AI, providing a score and explanation.
 * - AutomatedAiScoringInput - The input type for the automatedAiScoring function.
 * - AutomatedAiScoringOutput - The return type for the automatedAiScoring function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedAiScoringInputSchema = z.object({
  question: z.string().describe('The open-ended assessment question.'),
  answer: z.string().describe('The candidate\'s answer to the question.'),
  roleRequirements: z.string().describe('The requirements for the role being assessed.'),
  skillsToTest: z.string().describe('The skills that the question is designed to test.'),
});
export type AutomatedAiScoringInput = z.infer<typeof AutomatedAiScoringInputSchema>;

const AutomatedAiScoringOutputSchema = z.object({
  score: z.number().describe('The score awarded to the answer.'),
  explanation: z.string().describe('An explanation of the score.'),
});
export type AutomatedAiScoringOutput = z.infer<typeof AutomatedAiScoringOutputSchema>;

export async function automatedAiScoring(input: AutomatedAiScoringInput): Promise<AutomatedAiScoringOutput> {
  return automatedAiScoringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedAiScoringPrompt',
  input: {schema: AutomatedAiScoringInputSchema},
  output: {schema: AutomatedAiScoringOutputSchema},
  prompt: `You are an AI assessment scorer. You will take a question, the answer to the question, the role requirements, and the skills that the question is testing, and provide a score and explanation for the answer. The score should be from 0 to 100.

Question: {{{question}}}
Answer: {{{answer}}}
Role Requirements: {{{roleRequirements}}}
Skills to Test: {{{skillsToTest}}}

Score: {{score}}
Explanation: {{explanation}}`,
});

const automatedAiScoringFlow = ai.defineFlow(
  {
    name: 'automatedAiScoringFlow',
    inputSchema: AutomatedAiScoringInputSchema,
    outputSchema: AutomatedAiScoringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

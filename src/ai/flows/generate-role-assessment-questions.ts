'use server';

/**
 * @fileOverview AI-powered question generation for role-specific assessments.
 *
 * - generateRoleSpecificAssessmentQuestions - A function that generates assessment questions based on role requirements and skills.
 * - GenerateRoleSpecificAssessmentQuestionsInput - The input type for the generateRoleSpecificAssessmentQuestions function.
 * - GenerateRoleSpecificAssessmentQuestionsOutput - The return type for the generateRoleSpecificAssessmentQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRoleSpecificAssessmentQuestionsInputSchema = z.object({
  roleRequirements: z.string().describe('Detailed requirements for the job role.'),
  skillsToTest: z.string().describe('Specific skills that the assessment should evaluate.'),
  questionTypes: z.array(z.enum(['multiple-choice', 'coding', 'short answer', 'system design'])).describe('Types of questions to generate.'),
  numberOfQuestions: z.number().int().positive().describe('Number of questions to generate for each question type.'),
});

export type GenerateRoleSpecificAssessmentQuestionsInput = z.infer<typeof GenerateRoleSpecificAssessmentQuestionsInputSchema>;

const AssessmentQuestionSchema = z.object({
  type: z.enum(['multiple-choice', 'coding', 'short answer', 'system design']).describe('The type of the question.'),
  question: z.string().describe('The assessment question.'),
  options: z.array(z.string()).optional().describe('Multiple choice options, if applicable.'),
  correctAnswer: z.string().optional().describe('The correct answer to the question.'),
  explanation: z.string().optional().describe('Explanation of the correct answer.'),
});

const GenerateRoleSpecificAssessmentQuestionsOutputSchema = z.object({
  questions: z.array(AssessmentQuestionSchema).describe('Generated assessment questions.'),
});

export type GenerateRoleSpecificAssessmentQuestionsOutput = z.infer<typeof GenerateRoleSpecificAssessmentQuestionsOutputSchema>;

export async function generateRoleSpecificAssessmentQuestions(
  input: GenerateRoleSpecificAssessmentQuestionsInput
): Promise<GenerateRoleSpecificAssessmentQuestionsOutput> {
  return generateRoleSpecificAssessmentQuestionsFlow(input);
}

const generateRoleSpecificAssessmentQuestionsPrompt = ai.definePrompt({
  name: 'generateRoleSpecificAssessmentQuestionsPrompt',
  input: {schema: GenerateRoleSpecificAssessmentQuestionsInputSchema},
  output: {schema: GenerateRoleSpecificAssessmentQuestionsOutputSchema},
  prompt: `You are an expert in generating role-specific assessment questions. Given the role requirements, skills to test, question types, and the number of questions, generate a list of diverse and challenging questions.

Role Requirements: {{{roleRequirements}}}
Skills to Test: {{{skillsToTest}}}

For each question type specified ({{{questionTypes}}}), generate {{{numberOfQuestions}}} questions.  Ensure that the generated questions appropriately test the specified skills for the role.

Output the questions in JSON format.
`,
});

const generateRoleSpecificAssessmentQuestionsFlow = ai.defineFlow(
  {
    name: 'generateRoleSpecificAssessmentQuestionsFlow',
    inputSchema: GenerateRoleSpecificAssessmentQuestionsInputSchema,
    outputSchema: GenerateRoleSpecificAssessmentQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateRoleSpecificAssessmentQuestionsPrompt(input);
    return output!;
  }
);

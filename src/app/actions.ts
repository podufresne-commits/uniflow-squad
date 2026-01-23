'use server';

import { z } from 'zod';
import { generateRoleSpecificAssessmentQuestions } from '@/ai/flows/generate-role-assessment-questions';
import type { AssessmentQuestion } from './lib/types';

const questionGenSchema = z.object({
  roleRequirements: z.string().min(10, "Role requirements are too short."),
  skillsToTest: z.string().min(3, "Skills to test are required."),
  questionTypes: z.array(z.enum(['multiple-choice', 'coding', 'short answer', 'system design'])).min(1, "At least one question type is required."),
  numberOfQuestions: z.coerce.number().min(1).max(5),
});


export type FormState = {
  message: string;
  questions?: AssessmentQuestion[];
  errors?: {
    roleRequirements?: string[];
    skillsToTest?: string[];
    questionTypes?: string[];
    numberOfQuestions?: string[];
    _form?: string[];
  }
}

export async function generateQuestionsAction(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = questionGenSchema.safeParse({
    roleRequirements: formData.get('roleRequirements'),
    skillsToTest: formData.get('skillsToTest'),
    questionTypes: formData.getAll('questionTypes'),
    numberOfQuestions: formData.get('numberOfQuestions'),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed. Please check the fields.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const result = await generateRoleSpecificAssessmentQuestions(validatedFields.data);

    if (!result || !result.questions || result.questions.length === 0) {
      return { message: "AI generation failed to produce questions. Please try again." };
    }
    
    // The AI flow doesn't generate an ID or a specific skill per question, so we add them.
    const questionsWithIdAndSkill = result.questions.map((q, i) => ({
      ...q,
      id: `gen-${Date.now()}-${i}`,
      skill: validatedFields.data.skillsToTest.split(',')[0]?.trim() || 'General'
    })) as AssessmentQuestion[];


    return {
      message: `Successfully generated ${result.questions.length} questions.`,
      questions: questionsWithIdAndSkill,
    };

  } catch (error) {
    console.error(error);
    return { message: "An unexpected error occurred while generating questions." };
  }
}

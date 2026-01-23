'use server';

import { z } from 'zod';
import { generateRoleSpecificAssessmentQuestions } from '@/ai/flows/generate-role-assessment-questions';
import { automatedAiScoring } from '@/ai/flows/automated-ai-scoring';
import type { AssessmentQuestion } from './lib/types';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const questionGenSchema = z.object({
  roleRequirements: z.string().min(10, "Role requirements are too short."),
  skillsToTest: z.string().min(3, "Skills to test are required."),
  questionTypes: z.array(z.enum(['multiple-choice', 'coding', 'short answer', 'system design'])).min(1, "At least one question type is required."),
  numberOfQuestions: z.coerce.number().min(1).max(5),
});

const roleSchema = z.object({
    title: z.string().min(3, "Title is required."),
    description: z.string().min(10, "Description is too short."),
    skills: z.string().min(1, "At least one skill is required."),
    requirements: z.string().min(10, "Requirements are too short."),
})


export type FormState = {
  message: string;
  questions?: AssessmentQuestion[];
  errors?: {
    roleRequirements?: string[];
    skillsToTest?: string[];
    questionTypes?: string[];
    numberOfQuestions?: string[];
    _form?: string[];
    title?: string[];
    description?: string[];
    skills?: string[];
    requirements?: string[];
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

export async function createRoleAction(prevState: FormState, formData: FormData) {
    const validatedFields = roleSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        skills: formData.get('skills'),
        requirements: formData.get('requirements'),
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed. Please check the fields.",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    // In a real app, you'd save this to a database.
    console.log('New Role Created:', validatedFields.data);
    
    revalidatePath('/dashboard/roles');
    redirect('/dashboard/roles');

    return {
        message: 'Successfully created role!',
    }
}

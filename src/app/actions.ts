'use server';

import { z } from 'zod';
import { generateRoleSpecificAssessmentQuestions } from '@/ai/flows/generate-role-assessment-questions';
import { automatedAiScoring } from '@/ai/flows/automated-ai-scoring';
import type { AssessmentQuestion } from './lib/types';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createRole, createCandidate, createAssessmentSession, createAssessmentToken } from '@/lib/db';
import crypto from 'crypto';

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

const candidateSchema = z.object({
    name: z.string().min(2, "Name is required."),
    email: z.string().email("Invalid email address."),
    roleId: z.string().min(1, "Role is required."),
})


export type FormState = {
  message: string;
  questions?: AssessmentQuestion[];
  invitationLink?: string;
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
    name?: string[];
    email?: string[];
    roleId?: string[];
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

    // Save role to Firestore
    const skillsArray = validatedFields.data.skills.split(',').map(s => s.trim());
    
    const roleData = {
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        requirements: validatedFields.data.requirements,
        skills: skillsArray,
        assessment: {
            questions: [] // Questions can be generated later
        }
    };

    try {
        const roleId = await createRole(roleData);
        
        if (!roleId) {
            return {
                message: 'Failed to create role. Please try again.',
            }
        }

        revalidatePath('/roles');
        redirect('/roles');
    } catch (error) {
        console.error('Error in createRoleAction:', error);
        return {
            message: 'An unexpected error occurred.',
        }
    }

    return {
        message: 'Successfully created role!',
    }
}

// ================== CANDIDATE ACTIONS ==================

export async function createCandidateAction(prevState: FormState, formData: FormData) {
    const validatedFields = candidateSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        roleId: formData.get('roleId'),
    });

    if (!validatedFields.success) {
        return {
            message: "Validation failed. Please check the fields.",
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        // Create candidate
        const candidateData = {
            name: validatedFields.data.name,
            email: validatedFields.data.email,
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${validatedFields.data.name}`,
            assessmentSessionIds: []
        };

        const candidateId = await createCandidate(candidateData);
        
        if (!candidateId) {
            return {
                message: 'Failed to create candidate. Please try again.',
            }
        }

        // Create assessment session
        const sessionData = {
            candidateId,
            roleId: validatedFields.data.roleId,
            status: 'Not Started' as const,
            startedAt: new Date().toISOString(),
            overallScore: 0,
            integrityViolations: [],
            answers: []
        };

        const sessionId = await createAssessmentSession(sessionData);
        
        if (!sessionId) {
            return {
                message: 'Failed to create assessment session. Please try again.',
            }
        }

        // Generate secure token for magic link
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Token expires in 7 days

        const tokenData = {
            token,
            candidateId,
            roleId: validatedFields.data.roleId,
            assessmentSessionId: sessionId,
            expiresAt,
            used: false
        };

        const tokenId = await createAssessmentToken(tokenData);
        
        if (!tokenId) {
            return {
                message: 'Failed to create invitation token. Please try again.',
            }
        }

        // Generate invitation link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
        const invitationLink = `${baseUrl}/assess/${token}`;

        revalidatePath('/candidates');
        
        return {
            message: `Successfully created candidate and sent invitation!`,
            invitationLink
        };

    } catch (error) {
        console.error('Error in createCandidateAction:', error);
        return {
            message: 'An unexpected error occurred.',
        }
    }
}


import { NextResponse } from 'next/server';
import { updateAssessmentSession } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { sessionId, answers, violations, completedAt } = await request.json();

    if (!sessionId || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert answers object to array format for storage
    const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer: answer as string,
      score: 0, // Will be scored later by AI
      explanation: 'Pending AI scoring'
    }));

    // Convert violations to the correct format
    const formattedViolations = violations.reduce((acc: any[], violation: any) => {
      const existing = acc.find(v => v.type === violation.type);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({
          type: violation.type,
          timestamp: violation.timestamp,
          count: 1
        });
      }
      return acc;
    }, []);

    // Update the assessment session
    const updated = await updateAssessmentSession(sessionId, {
      status: 'Completed',
      completedAt,
      answers: answersArray,
      integrityViolations: formattedViolations,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update assessment session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

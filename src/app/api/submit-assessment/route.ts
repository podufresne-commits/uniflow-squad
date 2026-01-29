import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

interface ViolationInput {
  type: 'Tab Switch' | 'Copy/Paste';
  timestamp: string;
}

interface ViolationOutput {
  type: 'Tab Switch' | 'Copy/Paste';
  timestamp: string;
  count: number;
}

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

    // Convert violations to the correct format with proper types
    const formattedViolations = (violations as ViolationInput[]).reduce((acc: ViolationOutput[], violation: ViolationInput) => {
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

    // Get storage adapter and update the assessment session
    const storage = getStorage();
    await storage.updateSession(sessionId, {
      status: 'Completed',
      completedAt,
      answers: answersArray,
      integrityViolations: formattedViolations,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

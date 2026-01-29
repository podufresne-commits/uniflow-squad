import { getStorage } from '@/lib/storage';
import AssessmentClient from './assessment-client';
import { notFound } from 'next/navigation';

// Helper to convert Firestore Timestamp to Date
function toDate(value: any): Date {
  if (value instanceof Date) return value;
  if (value?.toDate && typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'string') return new Date(value);
  return new Date();
}

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const storage = getStorage();

  // Validate token and get assessment details
  let tokenData, role;
  let isValid = false;
  let isExpired = false;
  let isUsed = false;

  try {
    tokenData = await storage.getAssessmentToken(token);
    
    if (!tokenData) {
      // Token not found
      isValid = false;
    } else {
      isValid = true;
      isUsed = tokenData.used;
      
      // Handle Firestore Timestamp conversion
      const expirationDate = toDate(tokenData.expiresAt);
      isExpired = expirationDate < new Date();

      // Get the role
      role = await storage.getRole(tokenData.roleId);
    }
  } catch (error) {
    console.error('Error validating token:', error);
    isValid = false;
  }

  if (!isValid || !tokenData || !role) {
    return (
      <AssessmentClient
        token={token}
        candidateId=""
        sessionId=""
        role={{ id: '', title: '', description: '', requirements: '', skills: [], assessment: { questions: [] } }}
        isValid={false}
        isExpired={false}
        isUsed={false}
      />
    );
  }

  return (
    <AssessmentClient
      token={token}
      candidateId={tokenData.candidateId}
      sessionId={tokenData.assessmentSessionId}
      role={role}
      isValid={isValid}
      isExpired={isExpired}
      isUsed={isUsed}
    />
  );
}

import { getAssessmentToken, getRole, markTokenAsUsed } from '@/lib/db';
import { roles as mockRoles } from '@/lib/mock-data';
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

  // Validate token and get assessment details
  let tokenData, role;
  let isValid = false;
  let isExpired = false;
  let isUsed = false;

  try {
    tokenData = await getAssessmentToken(token);
    
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
      try {
        const firestoreRole = await getRole(tokenData.roleId);
        role = firestoreRole || mockRoles.find(r => r.id === tokenData.roleId);
      } catch (error) {
        // Fall back to mock data
        role = mockRoles.find(r => r.id === tokenData.roleId);
      }
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
        role={mockRoles[0] || { id: '', title: '', description: '', requirements: '', skills: [], assessment: { questions: [] } }}
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

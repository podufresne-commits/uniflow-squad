export type Role = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  skills: string[];
  assessment: {
    questions: AssessmentQuestion[];
  };
};

export type QuestionType = 'multiple-choice' | 'coding' | 'short answer' | 'system design';

export type AssessmentQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  skill: string;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  assessmentSessionIds: string[];
};

export type AssessmentStatus = 'Completed' | 'In Progress' | 'Not Started';

export type AssessmentSession = {
  id: string;
  candidateId: string;
  roleId: string;
  status: AssessmentStatus;
  startedAt: string;
  completedAt?: string;
  overallScore: number;
  integrityViolations: {
    type: 'Tab Switch' | 'Copy/Paste';
    timestamp: string;
    count: number;
  }[];
  answers: {
    questionId: string;
    answer: string;
    score: number;
    explanation: string;
  }[];
};

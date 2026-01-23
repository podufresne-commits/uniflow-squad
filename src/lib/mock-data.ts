import type { Role, Candidate, AssessmentSession, AssessmentQuestion } from './types';

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'q1',
    type: 'short answer',
    question: 'Describe the difference between server-side rendering (SSR) and client-side rendering (CSR) in a Next.js application. What are the key trade-offs?',
    skill: 'Next.js',
    correctAnswer: "SSR generates the full HTML on the server for each request, improving SEO and initial load time. CSR renders the app in the browser, which can be faster after the initial load but may have worse SEO. Trade-offs include performance, SEO, and server load.",
  },
  {
    id: 'q2',
    type: 'coding',
    question: 'Write a React hook `useDebounce` that takes a value and a delay and returns the debounced value.',
    skill: 'React',
    correctAnswer: "```javascript\nimport { useState, useEffect } from 'react';\n\nfunction useDebounce<T>(value: T, delay: number): T {\n  const [debouncedValue, setDebouncedValue] = useState<T>(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => {\n      setDebouncedValue(value);\n    }, delay);\n\n    return () => {\n      clearTimeout(handler);\n    };\n  }, [value, delay]);\n\n  return debouncedValue;\n}\n```"
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    question: 'Which of the following is NOT a valid way to manage state in a large-scale React application?',
    options: ['Redux', 'Zustand', 'React Context API with useReducer', 'Using only useState in the root component'],
    correctAnswer: 'Using only useState in the root component',
    explanation: 'While useState is a fundamental hook, relying on it alone in the root component for all state management in a large-scale application leads to prop drilling and makes state management brittle and hard to maintain.',
    skill: 'React',
  },
  {
    id: 'q4',
    type: 'system design',
    question: 'Outline a high-level system design for a real-time chat application. What components and technologies would you use?',
    skill: 'System Design',
    correctAnswer: 'A high-level design would include a client (web/mobile), a backend server, a database, and a real-time messaging service. Technologies could include: React for the client, Node.js/Express for the backend, WebSockets (e.g., Socket.IO) for real-time communication, and a database like MongoDB or PostgreSQL for storing messages and user data. A load balancer would be needed for scalability.'
  },
];

export const roles: Role[] = [
  {
    id: 'founding-engineer-frontend',
    title: 'Founding Engineer, Frontend',
    description: 'We are seeking a passionate and experienced Founding Frontend Engineer to take a leading role in building the Uniflow Assess platform from the ground up.',
    requirements: '5+ years of experience with React, TypeScript, and Next.js. Proven track record of building and shipping complex web applications. Deep understanding of web performance, accessibility, and modern frontend architecture.',
    skills: ['React', 'Next.js', 'TypeScript', 'System Design', 'UI/UX'],
    assessment: {
      questions: assessmentQuestions,
    },
  },
  {
    id: 'founding-engineer-backend',
    title: 'Founding Engineer, Backend',
    description: 'As a Founding Backend Engineer, you will be responsible for designing, building, and maintaining the core infrastructure and APIs that power Uniflow Assess.',
    requirements: '5+ years of experience with Node.js, Python, or Go. Expertise in designing and building scalable, distributed systems. Strong experience with cloud platforms (GCP/Firebase, AWS) and database technologies (SQL, NoSQL).',
    skills: ['Node.js', 'Firebase', 'System Design', 'API Design'],
    assessment: {
      questions: assessmentQuestions,
    },
  },
  {
    id: 'founding-engineer-fullstack',
    title: 'Founding Engineer, Full-Stack',
    description: 'Join us as a Founding Full-Stack Engineer to architect and build end-to-end features for the Uniflow Assess platform, from the database to the UI.',
    requirements: 'Broad experience across the stack. Proficient in both frontend (React, Next.js) and backend (Node.js, Firebase) technologies. A strong product sense and ability to own features from concept to deployment.',
    skills: ['React', 'Next.js', 'Node.js', 'Firebase', 'System Design'],
    assessment: {
      questions: assessmentQuestions,
    },
  },
];

export const candidates: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar1/100/100',
    assessmentSessionIds: ['sess-1'],
  },
  {
    id: 'cand-2',
    name: 'Ben Carter',
    email: 'ben.carter@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar2/100/100',
    assessmentSessionIds: ['sess-2'],
  },
  {
    id: 'cand-3',
    name: 'Aisha Khan',
    email: 'aisha.khan@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar3/100/100',
    assessmentSessionIds: ['sess-3'],
  },
  {
    id: 'cand-4',
    name: 'David Chen',
    email: 'david.chen@example.com',
    avatarUrl: 'https://picsum.photos/seed/avatar4/100/100',
    assessmentSessionIds: [],
  },
];

export const assessmentSessions: AssessmentSession[] = [
  {
    id: 'sess-1',
    candidateId: 'cand-1',
    roleId: 'founding-engineer-frontend',
    status: 'Completed',
    startedAt: '2024-05-20T10:00:00Z',
    completedAt: '2024-05-20T10:45:00Z',
    overallScore: 88,
    integrityViolations: [],
    answers: [
      {
        questionId: 'q1',
        answer: "SSR renders on the server for a fast first paint and good SEO, while CSR renders on the client which is good for web apps. The main trade-off is between initial load speed and subsequent navigation speed.",
        score: 90,
        explanation: 'The candidate correctly identifies the core differences and the main trade-offs. The answer is concise and accurate.'
      },
      {
        questionId: 'q2',
        answer: 'I would use a useEffect hook that sets a timeout. When the value changes, the timeout is cleared and reset. This prevents the value from updating too frequently.',
        score: 85,
        explanation: 'The candidate understands the concept of debouncing and the use of useEffect and setTimeout, but did not provide the full code implementation.'
      },
      {
        questionId: 'q3',
        answer: 'Using only useState in the root component',
        score: 100,
        explanation: 'Correct. This approach is not scalable for large applications.'
      },
      {
        questionId: 'q4',
        answer: 'For a real-time chat app, I would use WebSockets for the client-server communication. The backend could be a Node.js server, and messages could be stored in a NoSQL database like MongoDB for flexibility.',
        score: 80,
        explanation: 'Good high-level overview. The candidate identified the key technology (WebSockets) and appropriate choices for the backend and database. Could be improved by mentioning load balancing and message queueing for a larger scale system.'
      }
    ]
  },
  {
    id: 'sess-2',
    candidateId: 'cand-2',
    roleId: 'founding-engineer-fullstack',
    status: 'Completed',
    startedAt: '2024-05-21T14:00:00Z',
    completedAt: '2024-05-21T14:55:00Z',
    overallScore: 76,
    integrityViolations: [
        { type: 'Tab Switch', timestamp: '2024-05-21T14:15:23Z', count: 2 },
        { type: 'Copy/Paste', timestamp: '2024-05-21T14:30:05Z', count: 1 }
    ],
    answers: [
       {
        questionId: 'q1',
        answer: "SSR is server-side, CSR is client-side. SEO is better with SSR.",
        score: 70,
        explanation: 'The answer is correct but lacks depth and does not mention the trade-offs.'
      },
      {
        questionId: 'q2',
        answer: "```javascript\nfunction useDebounce(value, delay) {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    const t = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(t);\n  }, [value, delay]);\n\n  return debounced;\n}\n```",
        score: 95,
        explanation: 'Excellent code implementation. It is correct, clean, and follows React hook conventions. Minor improvement could be adding TypeScript types.'
      },
      {
        questionId: 'q3',
        answer: 'Redux',
        score: 0,
        explanation: 'Incorrect. Redux is a very popular and valid state management library for large-scale React applications.'
      },
      {
        questionId: 'q4',
        answer: 'I would build it with Firebase. Use Firestore for the database and Firebase Authentication for users.',
        score: 65,
        explanation: 'The candidate suggests a reasonable BaaS approach, but misses the core real-time communication aspect (WebSockets) and does not provide a broader system design perspective.'
      }
    ]
  },
  {
    id: 'sess-3',
    candidateId: 'cand-3',
    roleId: 'founding-engineer-backend',
    status: 'In Progress',
    startedAt: '2024-05-22T09:30:00Z',
    overallScore: 0,
    integrityViolations: [],
    answers: [],
  }
];

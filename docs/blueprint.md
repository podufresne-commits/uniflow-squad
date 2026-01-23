# **App Name**: Uniflow Assess

## Core Features:

- Role Management: CRUD operations for defining and managing job roles within Uniflow, pre-populated with Founding Engineer positions.
- AI-Powered Question Generation: Leverage the Gemini API as a tool to dynamically generate role-specific assessment questions, including multiple-choice, coding, short answer, and system design question types. The tool takes role requirements and skills to test.
- Secure Candidate Assessment: A locked-down assessment environment enforcing fullscreen, disabling copy/paste, and monitoring tab switches to prevent cheating. Violations are logged.
- Automated AI Scoring: Use Gemini AI to automatically grade open-ended assessment questions, providing a score and explanation for each answer.
- Candidate Management & Invitation: Create candidate profiles, assign assessments, and send secure magic link invitations with configurable expirations.
- Real-time Assessment Monitoring: Track candidate progress, time remaining, and integrity flags during the assessment session.
- Detailed Results Dashboard: Present comprehensive assessment results including overall score, question-type breakdown, skill-based analysis, integrity reports, and manual override options for admin review.
- Database Configuration: Implementation of database schemas and logic in Firestore for storing application's data and to manage data flow and logic

## Style Guidelines:

- Follow "uniflow.tech" website styles
- Code: 'Source Code Pro' (monospace) for display code snippets within coding questions.
- Consistent set of simple, professional icons for navigation and actions within the platform.
- Clean, distraction-free layout optimized for both admin dashboard and candidate assessment interfaces. Use shadcn/ui components.
- Subtle transitions and feedback animations for key interactions like question submission and score updates.
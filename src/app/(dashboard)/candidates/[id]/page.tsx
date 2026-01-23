import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle, Code, FileText, AlertTriangle, User, Briefcase, Clock, ShieldCheck } from 'lucide-react';
import { candidates, assessmentSessions, roles } from '@/lib/mock-data';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ResultsCharts } from './components/results-charts';
import type { AssessmentQuestion } from '@/lib/types';
import { automatedAiScoring } from '@/ai/flows/automated-ai-scoring';

export default async function CandidateResultPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { session?: string };
}) {
  const candidate = candidates.find((c) => c.id === params.id);
  const session = assessmentSessions.find((s) => s.id === searchParams.session);
  const role = roles.find((r) => r.id === session?.roleId);

  if (!candidate || !session || !role) {
    notFound();
  }

  const getQuestion = (questionId: string): AssessmentQuestion | undefined => {
    return role.assessment.questions.find((q) => q.id === questionId);
  }

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return <CheckCircle className="size-4 text-muted-foreground" />;
      case 'coding':
        return <Code className="size-4 text-muted-foreground" />;
      default:
        return <FileText className="size-4 text-muted-foreground" />;
    }
  };

  // Perform AI scoring for each answer
  const scoredAnswers = await Promise.all(
    session.answers.map(async (answer) => {
      const question = getQuestion(answer.questionId);
      if (!question) {
        return { ...answer, score: 0, explanation: "Question not found." };
      }
      try {
        const scoreResult = await automatedAiScoring({
          question: question.question,
          answer: answer.answer,
          roleRequirements: role.requirements,
          skillsToTest: question.skill
        });
        return { ...answer, ...scoreResult };
      } catch (e) {
        console.error("AI Scoring failed for question:", question.id, e);
        return { ...answer, score: answer.score, explanation: `AI scoring failed: ${answer.explanation}` };
      }
    })
  );

  const overallScore = Math.round(scoredAnswers.reduce((acc, ans) => acc + ans.score, 0) / (scoredAnswers.length || 1));

  const scoreBySkill: { [key: string]: { scores: number[], count: number } } = {};
  scoredAnswers.forEach(answer => {
    const question = getQuestion(answer.questionId);
    if(question) {
        if(!scoreBySkill[question.skill]) {
            scoreBySkill[question.skill] = { scores: [], count: 0 };
        }
        scoreBySkill[question.skill].scores.push(answer.score);
        scoreBySkill[question.skill].count++;
    }
  });

  const avgScoreBySkill = Object.entries(scoreBySkill).map(([skill, data]) => ({
    skill,
    score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count),
  }));

  return (
    <div>
      <PageHeader
        title="Assessment Results"
        description={`Detailed report for ${candidate.name}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/candidates">
              <ArrowLeft className="mr-2" />
              Back to Candidates
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultsCharts score={overallScore} skillScores={avgScoreBySkill} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Question Breakdown</CardTitle>
              <CardDescription>Review of each question and the candidate's answer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {scoredAnswers.map(answer => {
                const question = getQuestion(answer.questionId);
                if (!question) return null;
                
                return (
                  <div key={answer.questionId}>
                    <div className="p-4 border rounded-lg bg-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {getQuestionIcon(question.type)}
                          <p className="font-medium">{question.question}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{answer.score}/100</p>
                          <Badge variant="secondary">{question.skill}</Badge>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Candidate's Answer</h4>
                        <div className="prose prose-sm dark:prose-invert rounded-md bg-muted/50 p-3 max-w-none">
                            <p>{answer.answer}</p>
                        </div>
                      </div>
                       <div className="mt-3">
                        <h4 className="font-semibold text-sm mb-2">AI Scoring Explanation</h4>
                        <div className="text-sm text-muted-foreground italic rounded-md bg-muted/50 p-3">
                            <p>&ldquo;{answer.explanation}&rdquo;</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="size-16">
                        <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                        <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl">{candidate.name}</CardTitle>
                        <CardDescription>{candidate.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="size-4" />
                    <span>Assessed for: <span className="font-medium text-foreground">{role.title}</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-4" />
                    <span>Completed on: <span className="font-medium text-foreground">{new Date(session.completedAt!).toLocaleDateString()}</span></span>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    <span>Final Score: <span className="font-medium text-primary">{overallScore}%</span></span>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Integrity Report</CardTitle>
            </CardHeader>
            <CardContent>
              {session.integrityViolations.length > 0 ? (
                 <div className="space-y-3">
                    {session.integrityViolations.map((v, i) => (
                      <div key={i} className="flex items-center gap-3 text-destructive">
                        <AlertTriangle className="size-5" />
                        <div>
                          <p className="font-medium">{v.type} <span className="font-normal text-sm">({v.count}x)</span></p>
                          <p className="text-xs">{new Date(v.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                 </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6">
                    <ShieldCheck className="size-10 text-green-600 mb-2"/>
                    <p className="font-medium">No Integrity Issues</p>
                    <p className="text-sm text-muted-foreground">The candidate completed the assessment without any violations.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

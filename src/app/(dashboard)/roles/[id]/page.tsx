'use client';

import React from 'react';
import { roles } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Code, FileText, Bot } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import GenerateQuestionsForm from './components/generate-questions-form';
import type { AssessmentQuestion } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const role = roles.find((r) => r.id === params.id);
  const [questions, setQuestions] = React.useState<AssessmentQuestion[]>(
    role?.assessment.questions || []
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { toast } = useToast();


  if (!role) {
    notFound();
  }

  const handleAddQuestions = (newQuestions: AssessmentQuestion[]) => {
    setQuestions((prev) => [...prev, ...newQuestions]);
    setDialogOpen(false);
    toast({
        title: 'Success!',
        description: `${newQuestions.length} new questions have been added.`
    })
  };

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

  return (
    <div>
      <PageHeader
        title={role.title}
        description={role.description}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/roles">
              <ArrowLeft className="mr-2" />
              Back to Roles
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Assessment Questions</CardTitle>
                  <CardDescription>
                    Questions designed to evaluate candidates for this role.
                  </CardDescription>
                </div>
                 <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Bot className="mr-2" /> Generate with AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>AI Question Generation</DialogTitle>
                      <DialogDescription>
                        Generate new questions using AI based on the role&apos;s needs.
                      </DialogDescription>
                    </DialogHeader>
                    <GenerateQuestionsForm role={role} onQuestionsGenerated={handleAddQuestions} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {questions.map((q) => (
                    <AccordionItem value={q.id} key={q.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          {getQuestionIcon(q.type)}
                          <span className="text-left">{q.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {q.type}
                          </Badge>
                          <Badge variant="secondary">{q.skill}</Badge>
                        </div>
                        {q.options && (
                          <div>
                            <p className="font-medium text-sm mb-2">Options:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {q.options.map((opt, i) => (
                                <li key={i}>{opt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {q.correctAnswer && (
                          <div>
                            <p className="font-medium text-sm mb-2">
                              Correct Answer:
                            </p>
                            <div className="prose prose-sm dark:prose-invert rounded-md border bg-muted/50 p-3">
                              {q.type === 'coding' ? (
                                <pre>
                                  <code className="font-code">
                                    {q.correctAnswer}
                                  </code>
                                </pre>
                              ) : (
                                <p>{q.correctAnswer}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No assessment questions defined for this role yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Required Skills</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {role.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-medium">Requirements</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {role.requirements}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

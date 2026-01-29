'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { AssessmentQuestion, Role } from '@/lib/types';

interface AssessmentClientProps {
  token: string;
  candidateId: string;
  sessionId: string;
  role: Role;
  isValid: boolean;
  isExpired: boolean;
  isUsed: boolean;
}

export default function AssessmentClient({
  token,
  candidateId,
  sessionId,
  role,
  isValid,
  isExpired,
  isUsed,
}: AssessmentClientProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState<{ type: 'Tab Switch' | 'Copy/Paste'; timestamp: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 1 hour in seconds

  const questions = role.assessment.questions;
  const currentQuestion = questions[currentQuestionIndex];

  // Fullscreen enforcement
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error entering fullscreen:', err);
        // Fullscreen might not be supported or blocked
        // Continue anyway but log the issue
      }
    };

    if (!isCompleted && isValid && !isExpired && !isUsed) {
      enterFullscreen();
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isCompleted) {
        setIsFullscreen(false);
        addViolation('Tab Switch');
        // Try to re-enter fullscreen
        enterFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isCompleted, isValid, isExpired, isUsed, addViolation]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isCompleted) {
        addViolation('Tab Switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isCompleted, addViolation]);

  // Copy/paste blocking - but allow within input fields
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow copy/paste in textareas (for candidate answers)
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        return;
      }
      e.preventDefault();
      addViolation('Copy/Paste');
    };

    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow copy/paste in textareas (for candidate answers)
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
        return;
      }
      e.preventDefault();
      addViolation('Copy/Paste');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCopy);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCopy);
    };
  }, [addViolation, isCompleted]);

  // Timer
  useEffect(() => {
    if (isCompleted || !isValid || isExpired || isUsed) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time runs out
          handleSubmitAssessment().catch(err => {
            console.error('Auto-submit failed:', err);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, isValid, isExpired, isUsed, handleSubmitAssessment]);

  const addViolation = useCallback((type: 'Tab Switch' | 'Copy/Paste') => {
    setViolations((prev) => [...prev, { type, timestamp: new Date().toISOString() }]);
  }, []);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitAssessment = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answers,
          violations,
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsCompleted(true);
        // Exit fullscreen
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } else {
        console.error('Failed to submit assessment');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setIsSubmitting(false);
    }
  }, [sessionId, answers, violations]);

  // Invalid token states
  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Invalid assessment link. Please contact the administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This assessment link has expired. Please contact the administrator for a new link.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isUsed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert className="max-w-md">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You have already completed this assessment. Thank you!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Assessment Completed
            </CardTitle>
            <CardDescription>
              Thank you for completing the assessment. Your responses have been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We will review your assessment and get back to you soon.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{role.title} Assessment</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Clock className="h-5 w-5" />
            <span>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Violations Warning */}
        {violations.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {violations.length} integrity violation(s) detected. Please stay on this page and do not copy/paste.
            </AlertDescription>
          </Alert>
        )}

        {/* Question Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                {currentQuestion.type}
              </span>
              <span className="text-xs font-medium px-2 py-1 bg-secondary text-secondary-foreground rounded">
                {currentQuestion.skill}
              </span>
            </div>
            <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {(currentQuestion.type === 'short answer' || 
              currentQuestion.type === 'coding' || 
              currentQuestion.type === 'system design') && (
              <Textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={currentQuestion.type === 'coding' ? 15 : 8}
                className={currentQuestion.type === 'coding' ? 'font-code text-sm' : ''}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            {Object.keys(answers).length} of {questions.length} answered
          </div>
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmitAssessment} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

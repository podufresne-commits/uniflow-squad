'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateQuestionsAction } from '@/app/actions';
import type { FormState } from '@/app/actions';
import type { Role, QuestionType, AssessmentQuestion } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const questionTypes: { id: QuestionType; label: string }[] = [
  { id: 'short answer', label: 'Short Answer' },
  { id: 'multiple-choice', label: 'Multiple Choice' },
  { id: 'coding', label: 'Coding' },
  { id: 'system design', label: 'System Design' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 animate-spin" />
      ) : (
        <Bot className="mr-2" />
      )}
      Generate Questions
    </Button>
  );
}

export default function GenerateQuestionsForm({
  role,
  onQuestionsGenerated,
}: {
  role: Role;
  onQuestionsGenerated: (questions: AssessmentQuestion[]) => void;
}) {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useActionState(
    generateQuestionsAction,
    initialState
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.errors) {
      toast({
        title: 'Validation Error',
        description: state.message,
        variant: 'destructive',
      });
    } else if (state.questions) {
      onQuestionsGenerated(state.questions);
    } else if (state.message && !state.questions) {
       toast({
        title: 'An error occured',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, onQuestionsGenerated]);

  return (
    <form action={formAction} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="roleRequirements">Role Requirements</Label>
        <Textarea
          id="roleRequirements"
          name="roleRequirements"
          defaultValue={role.requirements}
          rows={4}
          className="text-xs"
        />
        {state.errors?.roleRequirements && (
          <p className="text-sm text-destructive">
            {state.errors.roleRequirements[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="skillsToTest">Skills to Test</Label>
        <Input
          id="skillsToTest"
          name="skillsToTest"
          defaultValue={role.skills.join(', ')}
        />
        {state.errors?.skillsToTest && (
          <p className="text-sm text-destructive">
            {state.errors.skillsToTest[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Question Types</Label>
        <div className="grid grid-cols-2 gap-2">
          {questionTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-2">
              <Checkbox
                id={`type-${type.id}`}
                name="questionTypes"
                value={type.id}
                defaultChecked={true}
              />
              <Label htmlFor={`type-${type.id}`} className="font-normal">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
        {state.errors?.questionTypes && (
          <p className="text-sm text-destructive">
            {state.errors.questionTypes[0]}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="numberOfQuestions">
          Number of Questions (per type)
        </Label>
        <Input
          id="numberOfQuestions"
          name="numberOfQuestions"
          type="number"
          defaultValue={1}
          min={1}
          max={5}
        />
        {state.errors?.numberOfQuestions && (
          <p className="text-sm text-destructive">
            {state.errors.numberOfQuestions[0]}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  );
}

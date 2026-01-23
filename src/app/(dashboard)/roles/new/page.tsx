'use client';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createRoleAction, type FormState } from '@/app/actions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 animate-spin" />}
            Save Role
        </Button>
    )
}

export default function NewRolePage() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useActionState(createRoleAction, initialState);

  return (
    <div>
      <PageHeader
        title="Create a New Role"
        description="Define a new job role to start creating assessments."
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/roles">
              <ArrowLeft className="mr-2" />
              Cancel
            </Link>
          </Button>
        }
      />
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>Fill in the details for the new role.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Role Title</Label>
              <Input id="title" name="title" placeholder="e.g., Founding Engineer, Frontend" />
              {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="A brief summary of the role's purpose." />
               {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input id="skills" name="skills" placeholder="e.g., React, Next.js, TypeScript (comma-separated)" />
              {state.errors?.skills && <p className="text-sm text-destructive">{state.errors.skills[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" name="requirements" placeholder="Detailed requirements for the role." rows={5} />
              {state.errors?.requirements && <p className="text-sm text-destructive">{state.errors.requirements[0]}</p>}
            </div>
            <div className="flex justify-end gap-4">
                <Button variant="ghost" asChild><Link href="/dashboard/roles">Cancel</Link></Button>
                <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

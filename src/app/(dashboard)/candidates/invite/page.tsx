'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowLeft, Loader2, Copy, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createCandidateAction, type FormState } from '@/app/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 animate-spin" />}
      Create & Send Invitation
    </Button>
  );
}

export default function InviteCandidatePage() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useActionState(createCandidateAction, initialState);
  const [roles, setRoles] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  // Fetch roles for the select dropdown
  useEffect(() => {
    // In a real app, this would fetch from Firestore
    // For now, we'll use mock data
    import('@/lib/mock-data').then((module) => {
      setRoles(module.roles);
    });
  }, []);

  const copyToClipboard = async () => {
    if (state.invitationLink) {
      await navigator.clipboard.writeText(state.invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <PageHeader
        title="Invite Candidate"
        description="Create a candidate profile and send an assessment invitation."
        actions={
          <Button variant="outline" asChild>
            <Link href="/candidates">
              <ArrowLeft className="mr-2" />
              Back to Candidates
            </Link>
          </Button>
        }
      />

      {state.invitationLink && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Invitation created successfully!</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded text-sm break-all">
                  {state.invitationLink}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Send this link to the candidate. It expires in 7 days.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Candidate Information</CardTitle>
          <CardDescription>
            Enter the candidate's details and select the role for their assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., John Doe"
                required
              />
              {state.errors?.name && (
                <p className="text-sm text-destructive">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="e.g., john@example.com"
                required
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Assessment Role</Label>
              <Select name="roleId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.roleId && (
                <p className="text-sm text-destructive">{state.errors.roleId[0]}</p>
              )}
            </div>

            {state.message && !state.invitationLink && (
              <Alert variant={state.errors ? 'destructive' : 'default'}>
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="ghost" asChild>
                <Link href="/candidates">Cancel</Link>
              </Button>
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

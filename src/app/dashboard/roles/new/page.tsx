import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewRolePage() {
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
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Role Title</Label>
              <Input id="title" placeholder="e.g., Founding Engineer, Frontend" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="A brief summary of the role's purpose." />
            </div>
             <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input id="skills" placeholder="e.g., React, Next.js, TypeScript (comma-separated)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea id="requirements" placeholder="Detailed requirements for the role." rows={5} />
            </div>
            <div className="flex justify-end">
                <Button>Save Role</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

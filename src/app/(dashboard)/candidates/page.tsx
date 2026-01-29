import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getCandidates, getAssessmentSessions, getRoles } from '@/lib/db';
import { candidates as mockCandidates, assessmentSessions as mockSessions, roles as mockRoles } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { AssessmentStatus } from '@/lib/types';

export default async function CandidatesPage() {
  // Try to get data from Firestore, fall back to mock data
  let candidates, assessmentSessions, roles;
  try {
    const firestoreCandidates = await getCandidates();
    const firestoreSessions = await getAssessmentSessions();
    const firestoreRoles = await getRoles();
    candidates = firestoreCandidates.length > 0 ? firestoreCandidates : mockCandidates;
    assessmentSessions = firestoreSessions.length > 0 ? firestoreSessions : mockSessions;
    roles = firestoreRoles.length > 0 ? firestoreRoles : mockRoles;
  } catch (error) {
    console.log('Using mock data - Firestore not configured:', error);
    candidates = mockCandidates;
    assessmentSessions = mockSessions;
    roles = mockRoles;
  }

  const getCandidateStatus = (candidateId: string): { status: AssessmentStatus, roleTitle: string, sessionId: string } | null => {
    const session = assessmentSessions.find(s => s.candidateId === candidateId);
    if (!session) return null;
    const role = roles.find(r => r.id === session.roleId);
    return {
        status: session.status,
        roleTitle: role?.title || 'Unknown Role',
        sessionId: session.id,
    }
  }

  const statusColors: Record<AssessmentStatus, string> = {
    'Completed': 'bg-green-600',
    'In Progress': 'bg-primary',
    'Not Started': 'bg-gray-400',
  }

  return (
    <div>
      <PageHeader
        title="Candidates"
        description="View and manage all candidates and their assessment progress."
        actions={
          <Button asChild>
            <Link href="/candidates/invite">
              <UserPlus className="mr-2" />
              Invite Candidate
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead className="hidden md:table-cell">Assessment Role</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => {
                const assessmentInfo = getCandidateStatus(candidate.id);
                return (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={candidate.avatarUrl} alt={candidate.name} />
                          <AvatarFallback>{candidate.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {assessmentInfo ? assessmentInfo.roleTitle : 'N/A'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {assessmentInfo ? (
                        <Badge variant="outline" className="flex items-center gap-2">
                           <span className={cn("h-2 w-2 rounded-full", statusColors[assessmentInfo.status])} />
                           {assessmentInfo.status}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Invited</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {assessmentInfo && assessmentInfo.status === 'Completed' && (
                         <Link href={`/candidates/${candidate.id}?session=${assessmentInfo.sessionId}`} className="text-primary hover:underline text-sm font-medium">
                            View Results
                         </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

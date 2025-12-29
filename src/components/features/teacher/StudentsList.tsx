'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudentDetailsDialog } from './StudentDetailsDialog';

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  parentEmail?: string | null;
  classes: string[];
  isActive?: boolean;
}

interface StudentsListProps {
  students: StudentData[];
}

export function StudentsList({ students }: StudentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des élèves</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium">
                  {student.lastName} {student.firstName}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {student.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex gap-1 flex-wrap justify-end">
                  {student.classes.map((className) => (
                    <Badge key={className} variant="secondary">
                      {className}
                    </Badge>
                  ))}
                </div>
                <StudentDetailsDialog student={student} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

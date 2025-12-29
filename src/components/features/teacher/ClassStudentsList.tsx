'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  isActive?: boolean;
}

interface ClassStudentsListProps {
  students: StudentData[];
  className: string;
}

export function ClassStudentsList({ students, className }: ClassStudentsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des élèves</CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Aucun élève inscrit dans cette classe.
          </p>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {student.email}
                  </p>
                </div>
                <StudentDetailsDialog
                  student={{
                    ...student,
                    classes: [className],
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

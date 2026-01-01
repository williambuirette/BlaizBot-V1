'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClassOption, Student } from '../types';

interface StepStudentsProps {
  studentsByClass: Record<string, { classInfo: ClassOption; students: Student[] }>;
  selectedStudents: string[];
  onToggleStudent: (id: string) => void;
  onToggleClass: (classId: string) => void;
  isClassFullySelected: (classId: string) => boolean;
  totalStudents: number;
}

export function StepStudents({
  studentsByClass,
  selectedStudents,
  onToggleStudent,
  onToggleClass,
  isClassFullySelected,
  totalStudents,
}: StepStudentsProps) {
  const classEntries = Object.entries(studentsByClass);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Sélectionnez les élèves</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choisissez les élèves qui recevront l&apos;assignation
        </p>
      </div>

      {classEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucun élève disponible pour les classes sélectionnées
        </p>
      ) : (
        <div className="space-y-3">
          {classEntries.map(([classId, { classInfo, students }]) => {
            const allSelected = isClassFullySelected(classId);
            const someSelected = students.some((s) => selectedStudents.includes(s.id));

            return (
              <Card key={classId}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {classInfo.name}
                      <Badge variant="secondary" className="ml-2">
                        {students.length} élève(s)
                      </Badge>
                    </CardTitle>
                    <Button
                      variant={allSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onToggleClass(classId)}
                    >
                      {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-3">
                  {students.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Aucun élève dans cette classe
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {students.map((student) => {
                        const isSelected = selectedStudents.includes(student.id);
                        return (
                          <div
                            key={student.id}
                            className={cn(
                              'flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors',
                              isSelected && 'bg-muted border border-primary/20'
                            )}
                            onClick={() => onToggleStudent(student.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => onToggleStudent(student.id)}
                            />
                            <span className="text-sm">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedStudents.length === 0 && totalStudents > 0 && (
        <p className="text-sm text-destructive">
          ⚠️ Sélectionnez au moins un élève pour continuer
        </p>
      )}

      {selectedStudents.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedStudents.length} élève(s) sélectionné(s)
        </p>
      )}
    </div>
  );
}

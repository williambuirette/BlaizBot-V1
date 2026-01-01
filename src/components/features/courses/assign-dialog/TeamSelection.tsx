// src/components/features/courses/assign-dialog/TeamSelection.tsx
// Sous-composant pour la sélection d'équipe (multiple élèves)

'use client';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Loader2, X } from 'lucide-react';
import type { ClassData, StudentSelection } from './types';

interface TeamSelectionProps {
  classes: ClassData[];
  selectedClassIds: string[];
  setSelectedClassIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStudents: StudentSelection[];
  setSelectedStudents: React.Dispatch<React.SetStateAction<StudentSelection[]>>;
  loadingStudents: Record<string, boolean>;
  removeStudent: (studentId: string) => void;
  toggleAllStudents: (classId: string) => void;
}

export function TeamSelection({
  classes,
  selectedClassIds,
  setSelectedClassIds,
  selectedStudents,
  setSelectedStudents,
  loadingStudents,
  removeStudent,
  toggleAllStudents,
}: TeamSelectionProps) {
  return (
    <div className="space-y-3 pt-2">
      {/* Selected students badges */}
      {selectedStudents.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">
            Élèves sélectionnés ({selectedStudents.length})
          </Label>
          <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/30 max-h-20 overflow-auto">
            {selectedStudents.map((student) => (
              <Badge
                key={student.id}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {student.firstName} {student.lastName}
                <span className="text-xs text-muted-foreground ml-1">
                  ({student.className})
                </span>
                <button
                  type="button"
                  onClick={() => removeStudent(student.id)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Class buttons */}
      <div className="space-y-2">
        <Label>Ajouter des élèves depuis une classe</Label>
        <div className="flex flex-wrap gap-2">
          {classes.map((cls) => {
            const isExpanded = selectedClassIds.includes(cls.id);
            return (
              <Button
                key={cls.id}
                type="button"
                variant={isExpanded ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedClassIds((prev) =>
                    isExpanded
                      ? prev.filter((id) => id !== cls.id)
                      : [...prev, cls.id]
                  );
                }}
              >
                {cls.name}
                {isExpanded && <X className="h-3 w-3 ml-1" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Student list per class */}
      {selectedClassIds.length > 0 && (
        <ScrollArea className="h-48 border rounded-lg">
          <div className="p-2 space-y-4">
            {selectedClassIds.map((classId) => {
              const cls = classes.find((c) => c.id === classId);
              if (!cls) return null;
              const isLoading = loadingStudents[classId];

              return (
                <div key={classId} className="space-y-2">
                  <div className="flex items-center justify-between sticky top-0 bg-background py-1">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {cls.name}
                    </Label>
                    {cls.students && cls.students.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAllStudents(classId)}
                        className="h-6 text-xs"
                      >
                        {cls.students.every((s) =>
                          selectedStudents.some((sel) => sel.id === s.id)
                        )
                          ? 'Aucun'
                          : 'Tous'}
                      </Button>
                    )}
                  </div>

                  {isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement...
                    </div>
                  ) : cls.students && cls.students.length > 0 ? (
                    <div className="space-y-1 pl-2">
                      {cls.students.map((student) => {
                        const isSelected = selectedStudents.some(
                          (s) => s.id === student.id
                        );
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors ${
                              isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                removeStudent(student.id);
                              } else {
                                setSelectedStudents((prev) => [
                                  ...prev,
                                  {
                                    ...student,
                                    classId,
                                    className: cls.name,
                                  },
                                ]);
                              }
                            }}
                          >
                            <Checkbox checked={isSelected} />
                            <span className="text-sm">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground pl-2">
                      Aucun élève
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

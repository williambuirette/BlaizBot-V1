// src/components/features/courses/assign-dialog/SingleStudentSelection.tsx
// Sous-composant pour la sélection d'un seul élève

'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { ClassData } from './types';

interface SingleStudentSelectionProps {
  classes: ClassData[];
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  selectedClass: ClassData | undefined;
  loading: boolean;
}

export function SingleStudentSelection({
  classes,
  selectedClassId,
  setSelectedClassId,
  selectedStudentId,
  setSelectedStudentId,
  selectedClass,
  loading,
}: SingleStudentSelectionProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="space-y-2">
        <Label>Classe</Label>
        <Select
          value={selectedClassId}
          onValueChange={(v) => {
            setSelectedClassId(v);
            setSelectedStudentId('');
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une classe" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedClassId && (
        <div className="space-y-2">
          <Label>Élève</Label>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          ) : (
            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un élève" />
              </SelectTrigger>
              <SelectContent>
                {selectedClass?.students?.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
    </div>
  );
}

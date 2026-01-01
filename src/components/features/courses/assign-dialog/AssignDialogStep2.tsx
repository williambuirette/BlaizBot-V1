// src/components/features/courses/assign-dialog/AssignDialogStep2.tsx
// Étape 2 : À qui assigner ?

'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, User } from 'lucide-react';

import { ClassSelection } from './ClassSelection';
import { TeamSelection } from './TeamSelection';
import { SingleStudentSelection } from './SingleStudentSelection';
import type { TargetType, ClassData, StudentSelection } from './types';

interface Step2Props {
  targetType: TargetType;
  setTargetType: (type: TargetType) => void;
  classes: ClassData[];
  selectedClassIds: string[];
  setSelectedClassIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  selectedStudents: StudentSelection[];
  setSelectedStudents: React.Dispatch<React.SetStateAction<StudentSelection[]>>;
  loadingStudents: Record<string, boolean>;
  loading: boolean;
  removeStudent: (studentId: string) => void;
  toggleAllStudents: (classId: string) => void;
}

export function AssignDialogStep2({
  targetType,
  setTargetType,
  classes,
  selectedClassIds,
  setSelectedClassIds,
  selectedClassId,
  setSelectedClassId,
  selectedStudentId,
  setSelectedStudentId,
  selectedStudents,
  setSelectedStudents,
  loadingStudents,
  loading,
  removeStudent,
  toggleAllStudents,
}: Step2Props) {
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">À qui assigner ?</Label>
      <RadioGroup
        value={targetType}
        onValueChange={(v) => {
          setTargetType(v as TargetType);
          setSelectedClassIds([]);
          setSelectedStudents([]);
        }}
      >
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="CLASS" id="class" />
          <Label htmlFor="class" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Une ou plusieurs classes entières
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="TEAM" id="team" />
          <Label htmlFor="team" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sélection d&apos;élèves (équipe)
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="STUDENT" id="student" />
          <Label htmlFor="student" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Un élève unique
            </div>
          </Label>
        </div>
      </RadioGroup>

      {/* CLASS - Multi-select */}
      {targetType === 'CLASS' && (
        <ClassSelection
          classes={classes}
          selectedClassIds={selectedClassIds}
          setSelectedClassIds={setSelectedClassIds}
        />
      )}

      {/* TEAM - Student selection */}
      {targetType === 'TEAM' && (
        <TeamSelection
          classes={classes}
          selectedClassIds={selectedClassIds}
          setSelectedClassIds={setSelectedClassIds}
          selectedStudents={selectedStudents}
          setSelectedStudents={setSelectedStudents}
          loadingStudents={loadingStudents}
          removeStudent={removeStudent}
          toggleAllStudents={toggleAllStudents}
        />
      )}

      {/* STUDENT - Single select */}
      {targetType === 'STUDENT' && (
        <SingleStudentSelection
          classes={classes}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          selectedClass={selectedClass}
          loading={loading}
        />
      )}
    </div>
  );
}

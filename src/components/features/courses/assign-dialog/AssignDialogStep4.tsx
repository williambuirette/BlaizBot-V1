// src/components/features/courses/assign-dialog/AssignDialogStep4.tsx
// Étape 4 : Récapitulatif

'use client';

import { Label } from '@/components/ui/label';
import type { ContentType, TargetType, Chapter, ClassData, StudentSelection } from './types';

interface Step4Props {
  contentType: ContentType;
  chapters: Chapter[];
  selectedChapterId: string;
  selectedSectionId: string;
  targetType: TargetType;
  selectedClassIds: string[];
  selectedStudents: StudentSelection[];
  selectedStudentId: string;
  classes: ClassData[];
  title: string;
  dueDate: string;
}

export function AssignDialogStep4({
  contentType,
  chapters,
  selectedChapterId,
  selectedSectionId,
  targetType,
  selectedClassIds,
  selectedStudents,
  selectedStudentId,
  classes,
  title,
  dueDate,
}: Step4Props) {
  // Get content display name
  const getContentName = () => {
    if (contentType === 'course') return 'Tout le cours';
    if (contentType === 'chapter') {
      return chapters.find((c) => c.id === selectedChapterId)?.title || 'Chapitre';
    }
    if (contentType === 'section') {
      const chapter = chapters.find((c) => c.id === selectedChapterId);
      return chapter?.sections.find((s) => s.id === selectedSectionId)?.title || 'Section';
    }
    return '';
  };

  // Get target display
  const getTargetDisplay = () => {
    if (targetType === 'CLASS') {
      const classNames = selectedClassIds
        .map((id) => classes.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(', ');
      return (
        <span className="flex flex-col items-end">
          <span>{selectedClassIds.length} classe(s)</span>
          <span className="text-xs text-muted-foreground">{classNames}</span>
        </span>
      );
    }

    if (targetType === 'TEAM') {
      const studentNames =
        selectedStudents.length <= 3
          ? selectedStudents.map((s) => `${s.firstName} ${s.lastName}`).join(', ')
          : `${selectedStudents.slice(0, 2).map((s) => s.firstName).join(', ')} et ${selectedStudents.length - 2} autres`;
      return (
        <span className="flex flex-col items-end">
          <span>{selectedStudents.length} élève(s)</span>
          <span className="text-xs text-muted-foreground">{studentNames}</span>
        </span>
      );
    }

    if (targetType === 'STUDENT') {
      const selectedClass = classes.find((c) =>
        c.students?.some((s) => s.id === selectedStudentId)
      );
      const student = selectedClass?.students?.find((s) => s.id === selectedStudentId);
      return student ? `${student.firstName} ${student.lastName}` : '';
    }

    return '';
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Récapitulatif</Label>

      <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Contenu :</span>
          <span className="font-medium">{getContentName()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Cible :</span>
          <span className="font-medium text-right">{getTargetDisplay()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Titre :</span>
          <span className="font-medium">{title}</span>
        </div>

        {dueDate && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date limite :</span>
            <span className="font-medium">
              {new Date(dueDate).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

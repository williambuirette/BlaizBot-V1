'use client';

import { MultiSelectDropdown } from '../MultiSelectDropdown';
import type { Course } from '../types';

interface StepCoursesProps {
  courses: Course[];
  selectedCourses: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  hasSubjectFilter: boolean;
}

export function StepCourses({
  courses,
  selectedCourses,
  onToggle,
  onSelectAll,
  onClearAll,
  hasSubjectFilter,
}: StepCoursesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Sélectionnez les cours</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {hasSubjectFilter
            ? 'Cours filtrés selon les matières sélectionnées'
            : 'Tous vos cours disponibles'}
        </p>
      </div>

      <MultiSelectDropdown<Course>
        label="Cours"
        placeholder="Sélectionner des cours..."
        items={courses}
        selected={selectedCourses}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onClearAll={onClearAll}
        renderItem={(course: Course) => (
          <div className="flex items-center gap-2">
            <span>{course.title}</span>
            {course.subject && (
              <span className="text-xs text-muted-foreground">
                ({course.subject.name})
              </span>
            )}
          </div>
        )}
        getId={(item: Course) => item.id}
        emptyMessage="Aucun cours trouvé"
      />

      {selectedCourses.length === 0 && (
        <p className="text-sm text-destructive">
          ⚠️ Sélectionnez au moins un cours pour continuer
        </p>
      )}
    </div>
  );
}

'use client';

import { MultiSelectDropdown } from '../MultiSelectDropdown';
import type { Subject } from '../types';

interface StepSubjectsProps {
  subjects: Subject[];
  selectedSubjects: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function StepSubjects({
  subjects,
  selectedSubjects,
  onToggle,
  onSelectAll,
  onClearAll,
}: StepSubjectsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Sélectionnez les matières</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Filtrez les cours par matière (optionnel - passez à l&apos;étape suivante pour voir tous les cours)
        </p>
      </div>

      <MultiSelectDropdown<Subject>
        label="Matières"
        placeholder="Sélectionner des matières..."
        items={subjects}
        selected={selectedSubjects}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onClearAll={onClearAll}
        renderItem={(subject: Subject) => subject.name}
        getId={(item: Subject) => item.id}
        emptyMessage="Aucune matière trouvée"
      />

      {selectedSubjects.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedSubjects.length} matière(s) sélectionnée(s) - Les cours seront filtrés
        </p>
      )}
    </div>
  );
}

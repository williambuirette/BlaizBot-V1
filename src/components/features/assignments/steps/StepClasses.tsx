'use client';

import { MultiSelectDropdown } from '../MultiSelectDropdown';
import type { ClassOption } from '../types';

interface StepClassesProps {
  classes: ClassOption[];
  selectedClasses: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export function StepClasses({
  classes,
  selectedClasses,
  onToggle,
  onSelectAll,
  onClearAll,
}: StepClassesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Sélectionnez les classes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choisissez les classes dont les élèves recevront l&apos;assignation
        </p>
      </div>

      <MultiSelectDropdown<ClassOption>
        label="Classes"
        placeholder="Sélectionner des classes..."
        items={classes}
        selected={selectedClasses}
        onToggle={onToggle}
        onSelectAll={onSelectAll}
        onClearAll={onClearAll}
        renderItem={(cls: ClassOption) => cls.name}
        getId={(item: ClassOption) => item.id}
        emptyMessage="Aucune classe trouvée"
      />

      {selectedClasses.length === 0 && (
        <p className="text-sm text-destructive">
          ⚠️ Sélectionnez au moins une classe pour continuer
        </p>
      )}
    </div>
  );
}

// src/components/features/courses/assign-dialog/ClassSelection.tsx
// Sous-composant pour la sélection de classes

'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';
import type { ClassData } from './types';

interface ClassSelectionProps {
  classes: ClassData[];
  selectedClassIds: string[];
  setSelectedClassIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export function ClassSelection({
  classes,
  selectedClassIds,
  setSelectedClassIds,
}: ClassSelectionProps) {
  return (
    <div className="space-y-3 pt-2">
      <Label>Sélectionner les classes</Label>
      <ScrollArea className="h-40 border rounded-lg">
        <div className="p-2 space-y-1">
          {classes.map((cls) => {
            const isSelected = selectedClassIds.includes(cls.id);
            return (
              <div
                key={cls.id}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
                onClick={() => {
                  setSelectedClassIds((prev) =>
                    isSelected
                      ? prev.filter((id) => id !== cls.id)
                      : [...prev, cls.id]
                  );
                }}
              >
                <Checkbox checked={isSelected} />
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{cls.name}</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      {selectedClassIds.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selectedClassIds.length} classe(s) sélectionnée(s)
        </p>
      )}
    </div>
  );
}

// src/components/features/courses/assign-dialog/AssignDialogStep3.tsx
// Étape 3 : Détails de l'assignation

'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from 'lucide-react';

interface Step3Props {
  title: string;
  setTitle: (title: string) => void;
  instructions: string;
  setInstructions: (instructions: string) => void;
  dueDate: string;
  setDueDate: (date: string) => void;
}

export function AssignDialogStep3({
  title,
  setTitle,
  instructions,
  setInstructions,
  dueDate,
  setDueDate,
}: Step3Props) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Détails</Label>

      <div className="space-y-2">
        <Label htmlFor="title">Titre *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l'assignation"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Instructions pour les élèves..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Date limite</Label>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
}

// Composant question individuelle pour ExerciseEditorInline

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import type { ExerciseItem } from './types';

interface ExerciseItemCardProps {
  item: ExerciseItem;
  index: number;
  onUpdate: (index: number, field: keyof ExerciseItem, value: unknown) => void;
  onRemove: (index: number) => void;
}

export function ExerciseItemCard({ item, index, onUpdate, onRemove }: ExerciseItemCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Question {index + 1}</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-16 h-8"
              value={item.points || 1}
              onChange={(e) => onUpdate(index, 'points', parseInt(e.target.value) || 1)}
              min={1}
              max={20}
            />
            <span className="text-sm text-muted-foreground">pts</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Énoncé *</Label>
          <Textarea
            placeholder="Ex: Calculez la dérivée de f(x) = 3x² + 2x - 1"
            value={item.question}
            onChange={(e) => onUpdate(index, 'question', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Réponse attendue *</Label>
          <Textarea
            placeholder="Ex: f'(x) = 6x + 2"
            value={item.answer}
            onChange={(e) => onUpdate(index, 'answer', e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Indice (optionnel)</Label>
          <Input
            placeholder="Ex: Utilisez la formule (xⁿ)' = nxⁿ⁻¹"
            value={item.hint || ''}
            onChange={(e) => onUpdate(index, 'hint', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

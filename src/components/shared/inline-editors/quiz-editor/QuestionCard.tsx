// src/components/shared/inline-editors/quiz-editor/QuestionCard.tsx
// Carte de question individuelle pour l'éditeur de quiz

'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Trash2, GripVertical } from 'lucide-react';
import { OptionsSection } from './OptionsSection';
import type { QuizQuestion } from './types';

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
  onRemove: () => void;
  onUpdateQuestion: (field: keyof QuizQuestion, value: unknown) => void;
  onUpdateOption: (oIndex: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (oIndex: number) => void;
  onToggleCorrectAnswer: (oIndex: number) => void;
}

export function QuestionCard({
  question: q,
  index: qIndex,
  onRemove,
  onUpdateQuestion,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onToggleCorrectAnswer,
}: QuestionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <span className="font-medium">Question {qIndex + 1}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Énoncé de la question *</Label>
          <Textarea
            placeholder="Posez votre question ici..."
            value={q.question}
            onChange={(e) => onUpdateQuestion('question', e.target.value)}
            rows={2}
          />
        </div>

        <OptionsSection
          options={q.options}
          correctAnswers={q.correctAnswers}
          onUpdateOption={onUpdateOption}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onToggleCorrectAnswer={onToggleCorrectAnswer}
        />

        <div className="space-y-2">
          <Label>Correction / Explication</Label>
          <Textarea
            placeholder="Ex: La bonne réponse est B car..."
            value={q.explanation || ''}
            onChange={(e) => onUpdateQuestion('explanation', e.target.value)}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}

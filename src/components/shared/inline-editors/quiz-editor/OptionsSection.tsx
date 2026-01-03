// src/components/shared/inline-editors/quiz-editor/OptionsSection.tsx
// Section des options de réponse pour une question de quiz

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

interface OptionsSectionProps {
  options: string[];
  correctAnswers: number[];
  onUpdateOption: (oIndex: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (oIndex: number) => void;
  onToggleCorrectAnswer: (oIndex: number) => void;
}

export function OptionsSection({
  options,
  correctAnswers,
  onUpdateOption,
  onAddOption,
  onRemoveOption,
  onToggleCorrectAnswer,
}: OptionsSectionProps) {
  return (
    <div className="space-y-2">
      <Label>Options de réponse</Label>
      <p className="text-xs text-muted-foreground">
        ✅ Cliquez sur le bouton vert pour marquer la bonne réponse
      </p>
      <div className="space-y-2">
        {options.map((option, oIndex) => (
          <OptionRow
            key={oIndex}
            option={option}
            index={oIndex}
            isCorrect={correctAnswers.includes(oIndex)}
            canRemove={options.length > 2}
            onUpdate={(value) => onUpdateOption(oIndex, value)}
            onRemove={() => onRemoveOption(oIndex)}
            onToggleCorrect={() => onToggleCorrectAnswer(oIndex)}
          />
        ))}
      </div>
      {correctAnswers.length === 0 && (
        <p className="text-xs text-orange-600">
          ⚠️ Veuillez sélectionner au moins une bonne réponse
        </p>
      )}
      {options.length < 6 && (
        <Button variant="outline" size="sm" onClick={onAddOption}>
          <Plus className="h-3 w-3 mr-1" />
          Ajouter une option
        </Button>
      )}
    </div>
  );
}

interface OptionRowProps {
  option: string;
  index: number;
  isCorrect: boolean;
  canRemove: boolean;
  onUpdate: (value: string) => void;
  onRemove: () => void;
  onToggleCorrect: () => void;
}

function OptionRow({
  option,
  index,
  isCorrect,
  canRemove,
  onUpdate,
  onRemove,
  onToggleCorrect,
}: OptionRowProps) {
  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
        isCorrect 
          ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-600' 
          : 'bg-background border-input hover:border-muted-foreground'
      }`}
    >
      <Button
        type="button"
        variant={isCorrect ? 'default' : 'outline'}
        size="sm"
        onClick={onToggleCorrect}
        className={`h-8 w-8 p-0 rounded-full shrink-0 ${
          isCorrect 
            ? 'bg-green-600 hover:bg-green-700 border-green-600' 
            : 'border-2 border-gray-300 hover:border-green-500'
        }`}
      >
        {isCorrect ? '✓' : ''}
      </Button>
      <Input
        placeholder={`Option ${index + 1}`}
        value={option}
        onChange={(e) => onUpdate(e.target.value)}
        className={`flex-1 ${isCorrect ? 'border-green-300 dark:border-green-700' : ''}`}
      />
      {isCorrect && (
        <span className="text-xs text-green-600 font-semibold whitespace-nowrap bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
          BONNE RÉPONSE
        </span>
      )}
      {canRemove && (
        <Button variant="ghost" size="icon" onClick={onRemove} className="shrink-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

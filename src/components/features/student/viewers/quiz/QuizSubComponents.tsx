// src/components/features/student/viewers/quiz/QuizSubComponents.tsx
// Sous-composants du QuizViewer

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Loader2 
} from 'lucide-react';
import type { QuizOption } from './types';

// ============================================================================
// QuizProgress
// ============================================================================

interface QuizProgressProps { 
  current: number; 
  total: number; 
  score: number;
  answeredQuestions: Set<number>;
}

export function QuizProgress({ 
  current, 
  total, 
  score,
  answeredQuestions 
}: QuizProgressProps) {
  return (
    <div className="flex items-center justify-between">
      <Badge variant="outline">
        Question {current + 1}/{total}
      </Badge>
      <Badge variant="secondary">
        Score : {score}/{answeredQuestions.size}
      </Badge>
    </div>
  );
}

// ============================================================================
// AnswerOption
// ============================================================================

interface AnswerOptionProps { 
  option: QuizOption; 
  showResult: boolean; 
  isCorrect: boolean; 
  isSelected: boolean;
}

export function AnswerOption({ 
  option, 
  showResult, 
  isCorrect, 
  isSelected 
}: AnswerOptionProps) {
  let className = "flex items-center space-x-3 p-3 rounded-lg border transition-colors";
  
  if (showResult) {
    if (isCorrect) {
      className += " bg-green-50 border-green-500 dark:bg-green-900/20";
    } else if (isSelected && !isCorrect) {
      className += " bg-red-50 border-red-500 dark:bg-red-900/20";
    }
  } else {
    className += " hover:bg-muted/50";
  }

  return (
    <div className={className}>
      <RadioGroupItem value={option.id} id={option.id} />
      <Label 
        htmlFor={option.id} 
        className="flex-1 cursor-pointer flex items-center justify-between"
      >
        {option.text}
        {showResult && isCorrect && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        {showResult && isSelected && !isCorrect && (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
      </Label>
    </div>
  );
}

// ============================================================================
// AnswerFeedback
// ============================================================================

interface AnswerFeedbackProps { 
  isCorrect: boolean; 
  explanation?: string;
}

export function AnswerFeedback({ 
  isCorrect, 
  explanation 
}: AnswerFeedbackProps) {
  return (
    <div className={`mt-4 p-4 rounded-lg ${
      isCorrect 
        ? 'bg-green-50 dark:bg-green-900/20' 
        : 'bg-red-50 dark:bg-red-900/20'
    }`}>
      <p className={`font-medium ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
        {isCorrect ? '✓ Bonne réponse !' : '✗ Mauvaise réponse'}
      </p>
      {explanation && (
        <p className="text-sm mt-2 text-muted-foreground">{explanation}</p>
      )}
    </div>
  );
}

// ============================================================================
// QuizActions
// ============================================================================

interface QuizActionsProps { 
  showResult: boolean; 
  selectedAnswer: string | null; 
  isLastQuestion: boolean;
  hasFinished: boolean;
  onSubmit: () => void; 
  onNext: () => void; 
  onReset: () => void;
}

export function QuizActions({ 
  showResult, 
  selectedAnswer, 
  isLastQuestion,
  hasFinished,
  onSubmit, 
  onNext, 
  onReset 
}: QuizActionsProps) {
  return (
    <div className="flex justify-between">
      <Button variant="outline" onClick={onReset}>
        <RotateCcw className="h-4 w-4 mr-2" />
        Recommencer
      </Button>
      {!showResult ? (
        <Button onClick={onSubmit} disabled={!selectedAnswer}>
          Valider
        </Button>
      ) : !isLastQuestion ? (
        <Button onClick={onNext}>
          Question suivante
        </Button>
      ) : hasFinished ? (
        <Button onClick={onReset}>
          Refaire le quiz
        </Button>
      ) : null}
    </div>
  );
}

// ============================================================================
// FinalScore
// ============================================================================

interface FinalScoreProps {
  score: number;
  total: number;
  isSaving?: boolean;
  saved?: boolean;
}

export function FinalScore({ score, total, isSaving, saved }: FinalScoreProps) {
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 70;

  return (
    <Card className={passed ? 'border-green-500' : 'border-orange-500'}>
      <CardContent className="p-6 text-center">
        <h3 className="text-2xl font-bold mb-2">
          {passed ? '🎉 Félicitations !' : '📚 Continuez vos efforts !'}
        </h3>
        <p className="text-4xl font-bold text-primary mb-2">
          {score}/{total}
        </p>
        <p className="text-muted-foreground">
          {percentage}% de bonnes réponses
        </p>
        {/* Save status */}
        {isSaving && (
          <div className="mt-3 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enregistrement...</span>
          </div>
        )}
        {saved && !isSaving && (
          <div className="mt-3 flex items-center justify-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Score enregistré !</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// src/components/features/student/viewers/QuizViewer.tsx
// Viewer pour les sections de type QUIZ

'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Loader2 
} from 'lucide-react';

// Types
interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[] | string[]; // Support both formats
  correctOptionId?: string;
  correctAnswers?: number[]; // Alternative format from editor
  explanation?: string;
}

interface QuizContent {
  questions: QuizQuestion[];
  passingScore?: number;
  shuffleQuestions?: boolean;
}

// Normalize options to always have id and text
function normalizeOptions(options: QuizOption[] | string[]): QuizOption[] {
  if (!options || options.length === 0) return [];
  
  // If first item is a string, convert all to QuizOption format
  if (typeof options[0] === 'string') {
    return (options as string[]).map((text, index) => ({
      id: `opt-${index}`,
      text: text || '',
    }));
  }
  
  // Already in QuizOption format
  return options as QuizOption[];
}

// Get correct option ID from question
function getCorrectOptionId(question: QuizQuestion, normalizedOptions: QuizOption[]): string {
  // If correctOptionId is provided, use it
  if (question.correctOptionId) return question.correctOptionId;
  
  // Otherwise, use correctAnswers array (first correct answer)
  if (question.correctAnswers && question.correctAnswers.length > 0) {
    const correctIndex = question.correctAnswers[0];
    if (correctIndex !== undefined && normalizedOptions[correctIndex]) {
      return normalizedOptions[correctIndex].id;
    }
  }
  
  return '';
}

interface QuizViewerProps {
  content: string | null;
  courseId?: string;
  sectionId?: string;
  onScoreUpdate?: () => void;
}

// Composant principal
export function QuizViewer({ content, courseId, sectionId, onScoreUpdate }: QuizViewerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Parse content
  let quizData: QuizContent | null = null;
  try {
    if (content) {
      quizData = JSON.parse(content) as QuizContent;
    }
  } catch {
    // Parsing error
  }

  // Reset quiz
  const resetQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    setSaved(false);
  }, []);

  // Sauvegarder le score dans la BDD (automatique quand quiz terminé)
  const saveScore = useCallback(async (finalScore: number, totalQuestions: number) => {
    if (!courseId || !sectionId) return;
    
    setIsSaving(true);
    try {
      const percentage = Math.round((finalScore / totalQuestions) * 100);
      const res = await fetch(`/api/student/courses/${courseId}/sections/${sectionId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: percentage, status: 'COMPLETED' }),
      });
      
      if (res.ok) {
        setSaved(true);
        onScoreUpdate?.(); // Rafraîchir les KPIs
      }
    } catch (error) {
      console.error('Erreur sauvegarde score quiz:', error);
    } finally {
      setIsSaving(false);
    }
  }, [courseId, sectionId, onScoreUpdate]);

  // Handle answer submission
  const handleSubmitAnswer = useCallback(() => {
    if (!quizData || !selectedAnswer) return;
    const question = quizData.questions[currentQuestion];
    if (!question) return;
    
    const normalizedOptions = normalizeOptions(question.options);
    const correctId = getCorrectOptionId(question, normalizedOptions);
    
    const isCorrectAnswer = selectedAnswer === correctId;
    const newScore = isCorrectAnswer ? score + 1 : score;
    
    if (isCorrectAnswer) {
      setScore(newScore);
    }
    
    setAnsweredQuestions((prev) => new Set(prev).add(currentQuestion));
    setShowResult(true);
    
    // Si c'est la dernière question, sauvegarder automatiquement
    const isLast = currentQuestion === quizData.questions.length - 1;
    if (isLast && !saved) {
      saveScore(newScore, quizData.questions.length);
    }
  }, [quizData, selectedAnswer, currentQuestion, score, saved, saveScore]);

  // Next question
  const handleNextQuestion = useCallback(() => {
    if (!quizData) return;
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [quizData, currentQuestion]);

  // No quiz data
  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Aucun quiz disponible.</p>
      </div>
    );
  }

  const questions = quizData.questions;
  const question = questions[currentQuestion];
  
  // Safety check - should not happen but TypeScript requires it
  if (!question) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Question introuvable.</p>
      </div>
    );
  }
  
  // Normalize options for display
  const normalizedOptions = normalizeOptions(question.options);
  const correctOptionId = getCorrectOptionId(question, normalizedOptions);
  
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isCorrect = selectedAnswer === correctOptionId;
  const hasFinished = answeredQuestions.size === questions.length && showResult && isLastQuestion;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <QuizProgress 
        current={currentQuestion} 
        total={questions.length} 
        score={score}
        answeredQuestions={answeredQuestions}
      />

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={setSelectedAnswer}
            disabled={showResult}
          >
            <div className="space-y-3">
              {normalizedOptions.map((option, index) => {
                const optionKey = option.id || `option-${index}`;
                return (
                  <AnswerOption 
                    key={optionKey}
                    option={option}
                    showResult={showResult}
                    isCorrect={option.id === correctOptionId}
                    isSelected={selectedAnswer === option.id}
                  />
                );
              })}
            </div>
          </RadioGroup>

          {/* Result */}
          {showResult && (
            <AnswerFeedback 
              isCorrect={isCorrect} 
              explanation={question.explanation} 
            />
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <QuizActions 
        showResult={showResult}
        selectedAnswer={selectedAnswer}
        isLastQuestion={isLastQuestion}
        hasFinished={hasFinished}
        onSubmit={handleSubmitAnswer}
        onNext={handleNextQuestion}
        onReset={resetQuiz}
      />

      {/* Final score */}
      {hasFinished && (
        <FinalScore 
          score={score} 
          total={questions.length} 
          isSaving={isSaving}
          saved={saved}
        />
      )}
    </div>
  );
}

// Sous-composants
function QuizProgress({ 
  current, 
  total, 
  score,
  answeredQuestions 
}: { 
  current: number; 
  total: number; 
  score: number;
  answeredQuestions: Set<number>;
}) {
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

function AnswerOption({ 
  option, 
  showResult, 
  isCorrect, 
  isSelected 
}: { 
  option: QuizOption; 
  showResult: boolean; 
  isCorrect: boolean; 
  isSelected: boolean;
}) {
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

function AnswerFeedback({ 
  isCorrect, 
  explanation 
}: { 
  isCorrect: boolean; 
  explanation?: string;
}) {
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

function QuizActions({ 
  showResult, 
  selectedAnswer, 
  isLastQuestion,
  hasFinished,
  onSubmit, 
  onNext, 
  onReset 
}: { 
  showResult: boolean; 
  selectedAnswer: string | null; 
  isLastQuestion: boolean;
  hasFinished: boolean;
  onSubmit: () => void; 
  onNext: () => void; 
  onReset: () => void;
}) {
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

interface FinalScoreProps {
  score: number;
  total: number;
  isSaving?: boolean;
  saved?: boolean;
}

function FinalScore({ score, total, isSaving, saved }: FinalScoreProps) {
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

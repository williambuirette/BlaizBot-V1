// src/components/features/student/viewers/quiz/QuizViewer.tsx
// Viewer pour les sections de type QUIZ

'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { HelpCircle } from 'lucide-react';
import { 
  QuizProgress, 
  AnswerOption, 
  AnswerFeedback, 
  QuizActions, 
  FinalScore 
} from './QuizSubComponents';
import { 
  normalizeOptions, 
  getCorrectOptionId 
} from './types';
import type { QuizContent } from './types';

interface QuizViewerProps {
  content: string | null;
  courseId?: string;
  sectionId?: string;
  onScoreUpdate?: () => void;
}

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

  // Sauvegarder le score dans la BDD
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
        onScoreUpdate?.();
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
  
  if (!question) {
    return (
      <div className="text-center py-12">
        <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Question introuvable.</p>
      </div>
    );
  }
  
  const normalizedOptions = normalizeOptions(question.options);
  const correctOptionId = getCorrectOptionId(question, normalizedOptions);
  
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isCorrect = selectedAnswer === correctOptionId;
  const hasFinished = answeredQuestions.size === questions.length && showResult && isLastQuestion;

  return (
    <div className="space-y-6">
      <QuizProgress 
        current={currentQuestion} 
        total={questions.length} 
        score={score}
        answeredQuestions={answeredQuestions}
      />

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

          {showResult && (
            <AnswerFeedback 
              isCorrect={isCorrect} 
              explanation={question.explanation} 
            />
          )}
        </CardContent>
      </Card>

      <QuizActions 
        showResult={showResult}
        selectedAnswer={selectedAnswer}
        isLastQuestion={isLastQuestion}
        hasFinished={hasFinished}
        onSubmit={handleSubmitAnswer}
        onNext={handleNextQuestion}
        onReset={resetQuiz}
      />

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

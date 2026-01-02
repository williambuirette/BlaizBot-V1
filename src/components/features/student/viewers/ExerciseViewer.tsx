// src/components/features/student/viewers/ExerciseViewer.tsx
// Viewer pour les sections de type EXERCISE avec notation IA

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PenTool, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types - Support both editor format (items) and viewer format (questions)
interface ExerciseItem {
  id: string;
  question: string;
  answer?: string; // Only used by teacher/grading
  points?: number;
  hint?: string;
  type?: 'short' | 'long' | 'code';
}

interface ExerciseContent {
  title?: string;
  instructions?: string;
  questions?: ExerciseItem[]; // Legacy format
  items?: ExerciseItem[]; // Editor format
  totalPoints?: number;
  dueDate?: string;
  timeLimit?: number;
}

// Normalize: get questions from either 'questions' or 'items' field
function getQuestions(data: ExerciseContent): ExerciseItem[] {
  // Try 'items' first (editor format), then 'questions' (legacy)
  const list = data.items || data.questions || [];
  // Ensure each item has an id
  return list.map((item, index) => ({
    ...item,
    id: item.id || `q-${index}`,
  }));
}

interface GradingResult {
  score: number;
  maxScore: number;
  feedback: string;
  questionResults: { questionId: string; score: number; maxScore: number; feedback: string }[];
}

interface ExerciseViewerProps {
  content: string | null;
  sectionId: string;
  sectionTitle: string;
  courseId?: string;
  onScoreUpdate?: () => void;
}

// Composant principal
export function ExerciseViewer({ content, sectionId, sectionTitle, courseId, onScoreUpdate }: ExerciseViewerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingScore, setIsSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Parse content
  let exerciseData: ExerciseContent | null = null;
  try {
    if (content) exerciseData = JSON.parse(content) as ExerciseContent;
  } catch { /* Parsing error */ }

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // Save score to progression (called after grading)
  const saveScore = useCallback(async (result: GradingResult) => {
    if (!courseId) return;
    
    setIsSavingScore(true);
    try {
      const score = Math.round((result.score / result.maxScore) * 100);
      const res = await fetch(`/api/student/courses/${courseId}/sections/${sectionId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, status: 'COMPLETED' }),
      });
      
      if (res.ok) {
        setScoreSaved(true);
        onScoreUpdate?.();
      }
    } catch {
      // Silent fail - don't block the user
      console.error('Failed to save exercise score');
    } finally {
      setIsSavingScore(false);
    }
  }, [courseId, sectionId, onScoreUpdate]);

  const handleSubmit = useCallback(async () => {
    if (!exerciseData) return;
    const questions = getQuestions(exerciseData);
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/grade-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, sectionTitle, questions, answers }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Erreur lors de la notation');
      const result = await res.json();
      setGradingResult(result);
      // Auto-save score after grading
      await saveScore(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  }, [exerciseData, sectionId, sectionTitle, answers, saveScore]);

  const handleReset = useCallback(() => {
    setAnswers({});
    setGradingResult(null);
    setError(null);
    setScoreSaved(false);
  }, []);

  // Get normalized questions
  const questions = exerciseData ? getQuestions(exerciseData) : [];
  
  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <PenTool className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Aucun exercice disponible.</p>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter((a) => a.trim()).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      {(exerciseData.title || exerciseData.instructions) && (
        <div className="space-y-4">
          {exerciseData.title && (
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{exerciseData.title}</h3>
              {exerciseData.totalPoints && <Badge variant="secondary">{exerciseData.totalPoints} points</Badge>}
            </div>
          )}
          {exerciseData.instructions && (
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/30 rounded-lg">
              <ReactMarkdown>{exerciseData.instructions}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuestionCard 
            key={q.id} question={q} index={i}
            answer={answers[q.id] || ''}
            onChange={(v) => handleAnswerChange(q.id, v)}
            result={gradingResult?.questionResults.find((r) => r.questionId === q.id)}
            disabled={isSubmitting || !!gradingResult}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Final result */}
      {gradingResult && (
        <FinalResult 
          result={gradingResult} 
          isSaving={isSavingScore} 
          saved={scoreSaved} 
        />
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {answeredCount}/{questions.length} question{questions.length > 1 ? 's' : ''} répondue{answeredCount > 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          {gradingResult ? (
            <Button onClick={handleReset}>Recommencer</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!allAnswered || isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Notation...</> 
                           : <><Send className="h-4 w-4 mr-2" />Soumettre</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Question Card
function QuestionCard({ question, index, answer, onChange, result, disabled }: { 
  question: ExerciseItem; index: number; answer: string; 
  onChange: (v: string) => void; result?: { score: number; maxScore: number; feedback: string }; disabled: boolean;
}) {
  const borderClass = result 
    ? (result.score === result.maxScore ? 'border-green-500' : result.score > 0 ? 'border-orange-500' : 'border-red-500')
    : '';

  return (
    <Card className={borderClass}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <p className="font-medium"><span className="text-primary mr-2">{index + 1}.</span>{question.question}</p>
          {question.points && <Badge variant="outline">{question.points} pt{question.points > 1 ? 's' : ''}</Badge>}
        </div>
        {question.hint && !result && <p className="text-xs text-muted-foreground italic">💡 {question.hint}</p>}
        
        {question.type === 'long' || question.type === 'code' ? (
          <textarea
            className="w-full min-h-[100px] p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-muted disabled:cursor-not-allowed"
            placeholder={question.type === 'code' ? 'Écrivez votre code...' : 'Votre réponse...'}
            value={answer} onChange={(e) => onChange(e.target.value)} disabled={disabled}
          />
        ) : (
          <Input placeholder="Votre réponse..." value={answer} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
        )}

        {result && (
          <div className={`p-3 rounded-lg ${result.score === result.maxScore ? 'bg-green-50 dark:bg-green-900/20' : result.score > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className={`h-4 w-4 ${result.score === result.maxScore ? 'text-green-500' : result.score > 0 ? 'text-orange-500' : 'text-red-500'}`} />
              <span className="font-medium">{result.score}/{result.maxScore} point{result.maxScore > 1 ? 's' : ''}</span>
            </div>
            <p className="text-sm text-muted-foreground">{result.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Final Result
interface FinalResultProps {
  result: GradingResult;
  isSaving?: boolean;
  saved?: boolean;
}

function FinalResult({ result, isSaving, saved }: FinalResultProps) {
  const pct = Math.round((result.score / result.maxScore) * 100);
  const emoji = pct >= 90 ? '🌟 Excellent !' : pct >= 70 ? '👍 Bon travail !' : '💪 Continue !';
  const border = pct >= 90 ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' 
               : pct >= 70 ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
               : 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10';

  return (
    <Card className={border}>
      <CardContent className="p-6 text-center">
        <h3 className="text-2xl font-bold mb-2">{emoji}</h3>
        <p className="text-4xl font-bold text-primary mb-2">{result.score}/{result.maxScore}</p>
        <p className="text-lg text-muted-foreground mb-4">{pct}%</p>
        <div className="prose prose-sm dark:prose-invert max-w-none text-left">
          <ReactMarkdown>{result.feedback}</ReactMarkdown>
        </div>
        {/* Save status */}
        {isSaving && (
          <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enregistrement...</span>
          </div>
        )}
        {saved && !isSaving && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Score enregistré !</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Éditeur de quiz pour les cartes de révision étudiant
 * Permet de créer des quiz manuellement ou via IA
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  GripVertical,
  Check,
  X,
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

interface CardQuiz {
  id: string;
  questions: Record<string, unknown>[];
  aiGenerated: boolean;
}

interface StudentQuizEditorProps {
  cardId: string;
  quiz: CardQuiz | null;
  courseId: string | null;
  onQuizChange: (quiz: CardQuiz | null) => void;
}

function generateId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function StudentQuizEditor({
  cardId,
  quiz,
  courseId,
  onQuizChange,
}: StudentQuizEditorProps) {
  const [questions, setQuestions] = useState<Question[]>(
    (quiz?.questions as unknown as Question[]) || []
  );
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Ajouter une question
  const addQuestion = (type: Question['type'] = 'multiple_choice') => {
    const newQuestion: Question = {
      id: generateId(),
      question: '',
      type,
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'true_false' ? 'true' : 0,
      explanation: '',
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  // Supprimer une question
  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Mettre à jour une question
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  // Mettre à jour une option
  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== questionId || !q.options) return q;
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  // Générer avec l'IA
  const generateWithAI = async () => {
    if (!courseId) {
      alert('Cette fonctionnalité nécessite un supplément lié à un cours');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          cardId,
          numberOfQuestions: 5,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          const newQuestions = data.questions.map((q: Partial<Question>) => ({
            ...q,
            id: generateId(),
          }));
          setQuestions(prev => [...prev, ...newQuestions]);
        }
      }
    } catch (error) {
      console.error('Erreur génération IA:', error);
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  // Sauvegarder le quiz
  const saveQuiz = async () => {
    if (questions.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/student/cards/${cardId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });

      if (res.ok) {
        const data = await res.json();
        onQuizChange(data.data);
      }
    } catch (error) {
      console.error('Erreur sauvegarde quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => addQuestion('multiple_choice')}>
            <Plus className="h-4 w-4 mr-1" />
            QCM
          </Button>
          <Button variant="outline" onClick={() => addQuestion('true_false')}>
            <Plus className="h-4 w-4 mr-1" />
            Vrai/Faux
          </Button>
          <Button variant="outline" onClick={() => addQuestion('short_answer')}>
            <Plus className="h-4 w-4 mr-1" />
            Réponse courte
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {courseId && (
            <Button
              variant="secondary"
              onClick={generateWithAI}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Générer avec l&apos;IA
            </Button>
          )}
          <Button onClick={saveQuiz} disabled={saving || questions.length === 0}>
            {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Liste des questions */}
      {questions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="mb-4">Aucune question</p>
            <p className="text-sm">
              Ajoutez des questions manuellement ou générez-les avec l&apos;IA
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <CardTitle className="text-sm">Question {index + 1}</CardTitle>
                    <Select
                      value={q.type}
                      onValueChange={(v) => updateQuestion(q.id, { type: v as Question['type'] })}
                    >
                      <SelectTrigger className="w-35 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="multiple_choice">QCM</SelectItem>
                        <SelectItem value="true_false">Vrai/Faux</SelectItem>
                        <SelectItem value="short_answer">Réponse courte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => removeQuestion(q.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Question */}
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                    placeholder="Tapez votre question..."
                    rows={2}
                  />
                </div>

                {/* Options selon le type */}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2">
                    <Label>Options (cliquez pour marquer la bonne réponse)</Label>
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <Button
                            variant={q.correctAnswer === optIndex ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => updateQuestion(q.id, { correctAnswer: optIndex })}
                          >
                            {q.correctAnswer === optIndex ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{String.fromCharCode(65 + optIndex)}</span>
                            )}
                          </Button>
                          <Input
                            value={opt}
                            onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {q.type === 'true_false' && (
                  <div className="space-y-2">
                    <Label>Réponse correcte</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant={q.correctAnswer === 'true' ? 'default' : 'outline'}
                        onClick={() => updateQuestion(q.id, { correctAnswer: 'true' })}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Vrai
                      </Button>
                      <Button
                        variant={q.correctAnswer === 'false' ? 'default' : 'outline'}
                        onClick={() => updateQuestion(q.id, { correctAnswer: 'false' })}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Faux
                      </Button>
                    </div>
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div className="space-y-2">
                    <Label>Réponse attendue</Label>
                    <Input
                      value={q.correctAnswer as string}
                      onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                      placeholder="Réponse correcte..."
                    />
                  </div>
                )}

                {/* Explication */}
                <div className="space-y-2">
                  <Label>Explication (optionnel)</Label>
                  <Textarea
                    value={q.explanation || ''}
                    onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                    placeholder="Explication affichée après la réponse..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

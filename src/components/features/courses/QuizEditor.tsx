// src/components/features/courses/QuizEditor.tsx
// Éditeur de quiz avec questions à choix multiples

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, GripVertical, Loader2, Sparkles } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[]; // Indices des bonnes réponses
  explanation?: string;
}

interface QuizContent {
  questions: QuizQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showExplanation?: boolean;
}

interface QuizEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionTitle: string;
  initialContent: QuizContent | null;
  onSave: (content: QuizContent) => Promise<void>;
}

export function QuizEditor({
  open,
  onOpenChange,
  sectionTitle,
  initialContent,
  onSave,
}: QuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Load initial content
  useEffect(() => {
    if (open && initialContent?.questions) {
      setQuestions(initialContent.questions);
    } else if (open) {
      setQuestions([]);
    }
  }, [open, initialContent]);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswers: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: unknown) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = [...q.options];
      newOptions[oIndex] = value;
      return { ...q, options: newOptions };
    }));
  };

  const addOption = (qIndex: number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === qIndex ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = q.options.filter((_, idx) => idx !== oIndex);
      // Update correct answers indices
      const newCorrectAnswers = q.correctAnswers
        .filter((idx) => idx !== oIndex)
        .map((idx) => (idx > oIndex ? idx - 1 : idx));
      return { ...q, options: newOptions, correctAnswers: newCorrectAnswers };
    }));
  };

  const toggleCorrectAnswer = (qIndex: number, oIndex: number) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const isSelected = q.correctAnswers.includes(oIndex);
      const newCorrectAnswers = isSelected
        ? q.correctAnswers.filter((idx) => idx !== oIndex)
        : [...q.correctAnswers, oIndex];
      return { ...q, correctAnswers: newCorrectAnswers };
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ questions });
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur sauvegarde quiz:', error);
    } finally {
      setSaving(false);
    }
  };

  // Générer des questions avec l'IA
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: sectionTitle,
          prompt: aiPrompt,
          count: 5,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          setQuestions([...questions, ...data.questions]);
        }
      }
    } catch (error) {
      console.error('Erreur génération IA:', error);
    } finally {
      setGenerating(false);
      setAiPrompt('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Éditeur de Quiz : {sectionTitle}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Génération IA */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Générer avec l&apos;IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  placeholder="Décrivez les questions que vous souhaitez générer...&#10;Ex: 5 questions sur la photosynthèse niveau 3ème"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={2}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateWithAI}
                  disabled={generating || !aiPrompt.trim()}
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Générer des questions
                </Button>
              </CardContent>
            </Card>

            {/* Liste des questions */}
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune question pour le moment.</p>
                <p className="text-sm">Ajoutez des questions manuellement ou générez-les avec l&apos;IA.</p>
              </div>
            ) : (
              questions.map((q, qIndex) => (
                <Card key={q.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        <span className="font-medium">Question {qIndex + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(qIndex)}
                      >
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
                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Options de réponse</Label>
                      <p className="text-xs text-muted-foreground">
                        ✅ Cliquez sur le bouton vert pour marquer la bonne réponse
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => {
                          const isCorrect = q.correctAnswers.includes(oIndex);
                          return (
                            <div 
                              key={oIndex} 
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
                                onClick={() => toggleCorrectAnswer(qIndex, oIndex)}
                                className={`h-8 w-8 p-0 rounded-full shrink-0 ${
                                  isCorrect 
                                    ? 'bg-green-600 hover:bg-green-700 border-green-600' 
                                    : 'border-2 border-gray-300 hover:border-green-500'
                                }`}
                              >
                                {isCorrect ? '✓' : ''}
                              </Button>
                              <Input
                                placeholder={`Option ${oIndex + 1}`}
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className={`flex-1 ${isCorrect ? 'border-green-300 dark:border-green-700' : ''}`}
                              />
                              {isCorrect && (
                                <span className="text-xs text-green-600 font-semibold whitespace-nowrap bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                                  BONNE RÉPONSE
                                </span>
                              )}
                              {q.options.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {q.correctAnswers.length === 0 && (
                        <p className="text-xs text-orange-600">
                          ⚠️ Veuillez sélectionner au moins une bonne réponse
                        </p>
                      )}
                      {q.options.length < 6 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(qIndex)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ajouter une option
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Correction / Explication (visible après réponse)</Label>
                      <p className="text-xs text-muted-foreground">
                        Cette explication sera affichée à l&apos;élève après sa réponse
                      </p>
                      <Textarea
                        placeholder="Ex: La bonne réponse est B car la photosynthèse se déroule dans les chloroplastes..."
                        value={q.explanation || ''}
                        onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Bouton ajouter question */}
            <Button variant="outline" className="w-full" onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || questions.length === 0}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Enregistrer ({questions.length} question{questions.length > 1 ? 's' : ''})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

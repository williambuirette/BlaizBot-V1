// src/components/features/courses/inline-editors/QuizEditorInline.tsx
// Éditeur de quiz inline (sans Dialog) pour SectionCard

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Loader2, Sparkles } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

interface QuizContent {
  questions: QuizQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showExplanation?: boolean;
}

interface QuizEditorInlineProps {
  sectionId: string;
  sectionTitle: string;
  initialContent: QuizContent | null;
  aiInstructions?: string;
  onContentChange: (content: QuizContent) => void;
  onAiInstructionsChange?: (instructions: string) => void;
}

export function QuizEditorInline({
  sectionTitle,
  initialContent,
  aiInstructions = '',
  onContentChange,
  onAiInstructionsChange,
}: QuizEditorInlineProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [localAiInstructions, setLocalAiInstructions] = useState(aiInstructions);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  // Load initial content
  useEffect(() => {
    if (initialContent?.questions) {
      setQuestions(initialContent.questions);
    }
  }, [initialContent]);

  useEffect(() => {
    setLocalAiInstructions(aiInstructions);
  }, [aiInstructions]);

  // Notifier le parent des changements
  const notifyChange = (newQuestions: QuizQuestion[]) => {
    onContentChange({ questions: newQuestions });
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswers: [],
    };
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    notifyChange(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    notifyChange(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: unknown) => {
    const newQuestions = questions.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    );
    setQuestions(newQuestions);
    notifyChange(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = [...q.options];
      newOptions[oIndex] = value;
      return { ...q, options: newOptions };
    });
    setQuestions(newQuestions);
    notifyChange(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = questions.map((q, i) => 
      i === qIndex ? { ...q, options: [...q.options, ''] } : q
    );
    setQuestions(newQuestions);
    notifyChange(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIndex) return q;
      const newOptions = q.options.filter((_, idx) => idx !== oIndex);
      const newCorrectAnswers = q.correctAnswers
        .filter((idx) => idx !== oIndex)
        .map((idx) => (idx > oIndex ? idx - 1 : idx));
      return { ...q, options: newOptions, correctAnswers: newCorrectAnswers };
    });
    setQuestions(newQuestions);
    notifyChange(newQuestions);
  };

  const toggleCorrectAnswer = (qIndex: number, oIndex: number) => {
    const newQuestions = questions.map((q, i) => {
      if (i !== qIndex) return q;
      const isSelected = q.correctAnswers.includes(oIndex);
      const newCorrectAnswers = isSelected
        ? q.correctAnswers.filter((idx) => idx !== oIndex)
        : [...q.correctAnswers, oIndex];
      return { ...q, correctAnswers: newCorrectAnswers };
    });
    setQuestions(newQuestions);
    notifyChange(newQuestions);
  };

  const handleAiInstructionsChange = (instructions: string) => {
    setLocalAiInstructions(instructions);
    onAiInstructionsChange?.(instructions);
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
          const newQuestions = [...questions, ...data.questions];
          setQuestions(newQuestions);
          notifyChange(newQuestions);
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
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
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
                <Label>Correction / Explication</Label>
                <Textarea
                  placeholder="Ex: La bonne réponse est B car..."
                  value={q.explanation || ''}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  rows={2}
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

      {/* Instructions IA */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Instructions pour l&apos;IA (optionnel)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={localAiInstructions}
            onChange={(e) => handleAiInstructionsChange(e.target.value)}
            placeholder="Donnez du contexte à l'IA pour ce quiz..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Ces instructions seront utilisées par l&apos;assistant IA pour aider l&apos;élève.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

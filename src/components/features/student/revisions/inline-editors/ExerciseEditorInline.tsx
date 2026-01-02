// src/components/features/courses/inline-editors/ExerciseEditorInline.tsx
// Éditeur d'exercice inline (sans Dialog) pour SectionCard

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Loader2, Sparkles, Eye, Edit2 } from 'lucide-react';

interface ExerciseItem {
  id: string;
  question: string;
  answer: string;
  points?: number;
  hint?: string;
}

interface ExerciseContent {
  instructions: string;
  items: ExerciseItem[];
  totalPoints?: number;
  timeLimit?: number;
}

interface ExerciseEditorInlineProps {
  sectionId: string;
  sectionTitle: string;
  initialContent: ExerciseContent | null;
  aiInstructions?: string;
  onContentChange: (content: ExerciseContent) => void;
  onAiInstructionsChange?: (instructions: string) => void;
}

export function ExerciseEditorInline({
  sectionTitle,
  initialContent,
  aiInstructions = '',
  onContentChange,
  onAiInstructionsChange,
}: ExerciseEditorInlineProps) {
  const [instructions, setInstructions] = useState('');
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [localAiInstructions, setLocalAiInstructions] = useState(aiInstructions);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Load initial content
  useEffect(() => {
    if (initialContent) {
      setInstructions(initialContent.instructions || '');
      setItems(initialContent.items || []);
      setTimeLimit(initialContent.timeLimit);
    }
  }, [initialContent]);

  useEffect(() => {
    setLocalAiInstructions(aiInstructions);
  }, [aiInstructions]);

  const totalPoints = items.reduce((sum, item) => sum + (item.points || 0), 0);

  // Notifier le parent des changements
  const notifyChange = (
    newInstructions: string,
    newItems: ExerciseItem[],
    newTimeLimit?: number
  ) => {
    const newTotalPoints = newItems.reduce((sum, item) => sum + (item.points || 0), 0);
    onContentChange({
      instructions: newInstructions,
      items: newItems,
      totalPoints: newTotalPoints,
      timeLimit: newTimeLimit,
    });
  };

  const handleInstructionsChange = (value: string) => {
    setInstructions(value);
    notifyChange(value, items, timeLimit);
  };

  const handleTimeLimitChange = (value: number | undefined) => {
    setTimeLimit(value);
    notifyChange(instructions, items, value);
  };

  const addItem = () => {
    const newItem: ExerciseItem = {
      id: `ex-${Date.now()}`,
      question: '',
      answer: '',
      points: 1,
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    notifyChange(instructions, newItems, timeLimit);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    notifyChange(instructions, newItems, timeLimit);
  };

  const updateItem = (index: number, field: keyof ExerciseItem, value: unknown) => {
    const newItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } as ExerciseItem : item
    );
    setItems(newItems);
    notifyChange(instructions, newItems, timeLimit);
  };

  const handleAiInstructionsChange = (value: string) => {
    setLocalAiInstructions(value);
    onAiInstructionsChange?.(value);
  };

  // Générer des exercices avec l'IA
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-exercise', {
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
        let newInstructions = instructions;
        if (data.instructions && !instructions) {
          newInstructions = data.instructions;
          setInstructions(newInstructions);
        }
        if (data.items) {
          const newItems = [...items, ...data.items];
          setItems(newItems);
          notifyChange(newInstructions, newItems, timeLimit);
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
    <div className="space-y-4">
      {/* Toggle Preview/Edit */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? (
            <>
              <Edit2 className="h-4 w-4 mr-1" />
              Éditer
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Aperçu
            </>
          )}
        </Button>
      </div>

      {previewMode ? (
        // Mode aperçu
        <div className="space-y-6 p-4 bg-muted/30 rounded-lg">
          <div>
            <h3 className="font-semibold text-lg mb-2">{sectionTitle}</h3>
            {timeLimit && (
              <p className="text-sm text-muted-foreground mb-2">
                ⏱️ Temps limite : {timeLimit} minutes | Points : {totalPoints}
              </p>
            )}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{instructions}</p>
            </div>
          </div>
          <hr />
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="space-y-2">
                <p className="font-medium">
                  {index + 1}. {item.question}
                  {item.points && (
                    <span className="text-muted-foreground text-sm ml-2">
                      ({item.points} pt{item.points > 1 ? 's' : ''})
                    </span>
                  )}
                </p>
                {item.hint && (
                  <p className="text-sm text-muted-foreground italic">
                    💡 Indice : {item.hint}
                  </p>
                )}
                <div className="ml-4 p-2 bg-green-50 dark:bg-green-900/20 rounded border-l-2 border-green-500">
                  <p className="text-sm">
                    <strong>Réponse :</strong> {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Mode édition
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="ai">Génération IA</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            {/* Instructions */}
            <div className="space-y-2">
              <Label>Instructions générales</Label>
              <Textarea
                placeholder="Consignes pour l'exercice..."
                value={instructions}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                rows={3}
              />
            </div>

            {/* Liste des questions */}
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Aucune question pour le moment.</p>
                <p className="text-sm">Ajoutez des questions ou générez-les avec l&apos;IA.</p>
              </div>
            ) : (
              items.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Question {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="w-16 h-8"
                          value={item.points || 1}
                          onChange={(e) =>
                            updateItem(index, 'points', parseInt(e.target.value) || 1)
                          }
                          min={1}
                          max={20}
                        />
                        <span className="text-sm text-muted-foreground">pts</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
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
                        onChange={(e) => updateItem(index, 'question', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Réponse attendue *</Label>
                      <Textarea
                        placeholder="Ex: f'(x) = 6x + 2"
                        value={item.answer}
                        onChange={(e) => updateItem(index, 'answer', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Indice (optionnel)</Label>
                      <Input
                        placeholder="Ex: Utilisez la formule (xⁿ)' = nxⁿ⁻¹"
                        value={item.hint || ''}
                        onChange={(e) => updateItem(index, 'hint', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Bouton ajouter */}
            <Button variant="outline" className="w-full" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </TabsContent>

          <TabsContent value="ai">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Générer avec l&apos;IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Décrivez les exercices que vous souhaitez générer...&#10;Ex: 5 exercices sur les équations du second degré"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={generateWithAI}
                  disabled={generating || !aiPrompt.trim()}
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Générer des exercices
                </Button>
              </CardContent>
            </Card>

            {/* Instructions IA */}
            <Card className="bg-muted/30 mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Instructions pour l&apos;IA (optionnel)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={localAiInstructions}
                  onChange={(e) => handleAiInstructionsChange(e.target.value)}
                  placeholder="Donnez du contexte à l'IA pour cet exercice..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Ces instructions seront utilisées par l&apos;assistant IA pour aider l&apos;élève.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Paramètres de l&apos;exercice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Temps limite (minutes)</Label>
                  <Input
                    type="number"
                    placeholder="Optionnel"
                    value={timeLimit || ''}
                    onChange={(e) =>
                      handleTimeLimitChange(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    min={1}
                    max={180}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Total des points : <strong>{totalPoints}</strong></p>
                  <p>Nombre de questions : <strong>{items.length}</strong></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

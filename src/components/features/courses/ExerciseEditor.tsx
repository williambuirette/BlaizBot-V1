// src/components/features/courses/ExerciseEditor.tsx
// Éditeur d'exercices avec énoncé et correction

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
  timeLimit?: number; // en minutes
}

interface ExerciseEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionTitle: string;
  initialContent: ExerciseContent | null;
  onSave: (content: ExerciseContent) => Promise<void>;
}

export function ExerciseEditor({
  open,
  onOpenChange,
  sectionTitle,
  initialContent,
  onSave,
}: ExerciseEditorProps) {
  const [instructions, setInstructions] = useState('');
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Load initial content
  useEffect(() => {
    if (open && initialContent) {
      setInstructions(initialContent.instructions || '');
      setItems(initialContent.items || []);
      setTimeLimit(initialContent.timeLimit);
    } else if (open) {
      setInstructions('');
      setItems([]);
      setTimeLimit(undefined);
    }
  }, [open, initialContent]);

  const addItem = () => {
    const newItem: ExerciseItem = {
      id: `ex-${Date.now()}`,
      question: '',
      answer: '',
      points: 1,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ExerciseItem, value: unknown) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } as ExerciseItem : item
    ));
  };

  const totalPoints = items.reduce((sum, item) => sum + (item.points || 0), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        instructions,
        items,
        totalPoints,
        timeLimit,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur sauvegarde exercice:', error);
    } finally {
      setSaving(false);
    }
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
        if (data.instructions) {
          setInstructions(data.instructions);
        }
        if (data.items) {
          setItems([...items, ...data.items]);
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
          <div className="flex items-center justify-between">
            <DialogTitle>Éditeur d&apos;Exercice : {sectionTitle}</DialogTitle>
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
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
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
                    placeholder="Consignes pour l'exercice...&#10;Ex: Résolvez les équations suivantes. Montrez votre raisonnement."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Liste des questions */}
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucune question pour le moment.</p>
                    <p className="text-sm">
                      Ajoutez des questions manuellement ou générez-les avec l&apos;IA.
                    </p>
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

                <Button variant="outline" className="w-full" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une question
                </Button>
              </TabsContent>

              <TabsContent value="ai">
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Générer avec l&apos;IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Décrivez les exercices que vous souhaitez générer...&#10;Ex: 5 exercices de calcul de dérivées niveau Terminale, difficulté progressive"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={4}
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
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Temps limite (minutes)</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 30"
                        value={timeLimit || ''}
                        onChange={(e) =>
                          setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)
                        }
                        min={1}
                        max={180}
                      />
                      <p className="text-xs text-muted-foreground">
                        Laissez vide pour aucune limite de temps
                      </p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">Récapitulatif</p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• {items.length} question(s)</li>
                        <li>• {totalPoints} point(s) au total</li>
                        {timeLimit && <li>• {timeLimit} minutes</li>}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || items.length === 0}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Enregistrer ({items.length} question{items.length > 1 ? 's' : ''})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

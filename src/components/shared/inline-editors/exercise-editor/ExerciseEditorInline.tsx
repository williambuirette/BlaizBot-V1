// ExerciseEditorInline - Composant principal refactorisé
// 398 lignes → ~180 lignes (sous-composants extraits)

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Eye, Edit2 } from 'lucide-react';

import type { ExerciseItem, ExerciseContent, ExerciseEditorInlineProps } from './types';
import { ExerciseItemCard } from './ExerciseItemCard';
import { ExercisePreview } from './ExercisePreview';
import { AIGenerationPanel } from './AIGenerationPanel';

// Ré-exporter les types pour compatibilité
export type { ExerciseItem, ExerciseContent, ExerciseEditorInlineProps } from './types';

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

  const handleAIGenerate = (newItems: ExerciseItem[], newInstr?: string) => {
    let currentInstructions = instructions;
    if (newInstr && !instructions) {
      currentInstructions = newInstr;
      setInstructions(currentInstructions);
    }
    const combinedItems = [...items, ...newItems];
    setItems(combinedItems);
    notifyChange(currentInstructions, combinedItems, timeLimit);
  };

  return (
    <div className="space-y-4">
      {/* Toggle Preview/Edit */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setPreviewMode(!previewMode)}>
          {previewMode ? (
            <><Edit2 className="h-4 w-4 mr-1" />Éditer</>
          ) : (
            <><Eye className="h-4 w-4 mr-1" />Aperçu</>
          )}
        </Button>
      </div>

      {previewMode ? (
        <ExercisePreview
          title={sectionTitle}
          instructions={instructions}
          items={items}
          timeLimit={timeLimit}
          totalPoints={totalPoints}
        />
      ) : (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="ai">Génération IA</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-2">
              <Label>Instructions générales</Label>
              <Textarea
                placeholder="Consignes pour l'exercice..."
                value={instructions}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                rows={3}
              />
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Aucune question pour le moment.</p>
                <p className="text-sm">Ajoutez des questions ou générez-les avec l&apos;IA.</p>
              </div>
            ) : (
              items.map((item, index) => (
                <ExerciseItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))
            )}

            <Button variant="outline" className="w-full" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </TabsContent>

          <TabsContent value="ai">
            <AIGenerationPanel
              sectionTitle={sectionTitle}
              aiInstructions={localAiInstructions}
              onAiInstructionsChange={handleAiInstructionsChange}
              onGenerate={handleAIGenerate}
            />
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

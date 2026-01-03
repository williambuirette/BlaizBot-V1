// Panel de génération IA pour les exercices

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import type { ExerciseItem } from './types';

interface AIGenerationPanelProps {
  sectionTitle: string;
  aiInstructions: string;
  onAiInstructionsChange: (value: string) => void;
  onGenerate: (items: ExerciseItem[], instructions?: string) => void;
}

export function AIGenerationPanel({ 
  sectionTitle, 
  aiInstructions, 
  onAiInstructionsChange,
  onGenerate 
}: AIGenerationPanelProps) {
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

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
        onGenerate(data.items || [], data.instructions);
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
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Instructions pour l&apos;IA (optionnel)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={aiInstructions}
            onChange={(e) => onAiInstructionsChange(e.target.value)}
            placeholder="Donnez du contexte à l'IA pour cet exercice..."
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

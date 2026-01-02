/**
 * Éditeur inline pour les Notes
 * Utilise un éditeur de texte riche comme LessonEditorInline
 */

'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';

interface NoteContent {
  html: string;
}

interface NoteEditorInlineProps {
  cardId: string;
  cardTitle: string;
  initialContent: NoteContent | null;
  onContentChange: (content: NoteContent) => void;
}

export function NoteEditorInline({
  cardId,
  cardTitle,
  initialContent,
  onContentChange,
}: NoteEditorInlineProps) {
  const [html, setHtml] = useState(initialContent?.html || '');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (initialContent?.html && initialContent.html !== html) {
      setHtml(initialContent.html);
    }
  }, [initialContent]);

  const handleChange = (value: string) => {
    setHtml(value);
    onContentChange({ html: value });
  };

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    try {
      // TODO: Appel API IA pour générer du contenu de note
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'student_note',
          context: {
            title: cardTitle,
            currentContent: html,
          },
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          handleChange(data.content);
        }
      }
    } catch (error) {
      console.error('Erreur génération IA:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Contenu de la note</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateWithAI}
          disabled={generating}
          className="gap-2"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Améliorer avec l&apos;IA
        </Button>
      </div>

      <Textarea
        placeholder="Écrivez vos notes ici... Vous pouvez utiliser du texte simple ou du markdown."
        value={html}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-[300px] font-mono text-sm resize-y"
      />

      <p className="text-xs text-muted-foreground">
        💡 Conseil : Prenez des notes personnelles, reformulez avec vos propres mots pour mieux retenir.
      </p>
    </div>
  );
}

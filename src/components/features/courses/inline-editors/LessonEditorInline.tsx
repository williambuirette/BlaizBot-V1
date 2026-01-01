// src/components/features/courses/inline-editors/LessonEditorInline.tsx
// Éditeur de leçon inline (sans Dialog) pour SectionCard

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Eye, Edit2 } from 'lucide-react';
import { RichEditor } from '@/components/ui/rich-editor';

interface LessonContent {
  html: string;
  summary?: string;
}

interface LessonEditorInlineProps {
  sectionId: string;
  sectionTitle: string;
  initialContent: LessonContent | null;
  aiInstructions?: string;
  onContentChange: (content: LessonContent) => void;
  onAiInstructionsChange?: (instructions: string) => void;
}

export function LessonEditorInline({
  sectionTitle,
  initialContent,
  aiInstructions = '',
  onContentChange,
  onAiInstructionsChange,
}: LessonEditorInlineProps) {
  const [content, setContent] = useState('');
  const [localAiInstructions, setLocalAiInstructions] = useState(aiInstructions);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  // Load initial content
  useEffect(() => {
    if (initialContent?.html) {
      setContent(initialContent.html);
    }
  }, [initialContent]);

  useEffect(() => {
    setLocalAiInstructions(aiInstructions);
  }, [aiInstructions]);

  // Notifier le parent des changements
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange({ html: newContent });
  };

  const handleAiInstructionsChange = (instructions: string) => {
    setLocalAiInstructions(instructions);
    onAiInstructionsChange?.(instructions);
  };

  // Générer du contenu avec l'IA
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: sectionTitle,
          prompt: aiPrompt,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          const newContent = content + '\n\n' + data.content;
          handleContentChange(newContent);
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
        <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/30 rounded-lg min-h-[300px]">
          <h2>{sectionTitle}</h2>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      ) : (
        // Mode édition
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="ai">Génération IA</TabsTrigger>
            <TabsTrigger value="settings">Paramètres IA</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="space-y-2">
              <RichEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Rédigez le contenu de votre leçon ici..."
                className="min-h-[300px]"
              />
              <p className="text-xs text-muted-foreground">
                ~{Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 200)} min de lecture
              </p>
            </div>
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
                  placeholder="Décrivez le contenu que vous souhaitez générer...&#10;Ex: Une introduction à la photosynthèse pour des élèves de 3ème."
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
                  Générer du contenu
                </Button>
                <p className="text-xs text-muted-foreground">
                  Le contenu généré sera ajouté à la suite du contenu existant.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-instructions">Instructions pour l&apos;IA (optionnel)</Label>
                <Textarea
                  id="ai-instructions"
                  value={localAiInstructions}
                  onChange={(e) => handleAiInstructionsChange(e.target.value)}
                  placeholder="Donnez du contexte à l'IA pour cette section...&#10;Ex: Cette leçon porte sur les fractions. L'IA doit utiliser des exemples concrets (pizza, gâteau)."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Ces instructions seront utilisées par l&apos;assistant IA quand l&apos;élève consulte cette section.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

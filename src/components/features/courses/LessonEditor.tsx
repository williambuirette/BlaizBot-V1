// src/components/features/courses/LessonEditor.tsx
// Éditeur de contenu pour les leçons avec TipTap

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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Eye, Edit2, Maximize2, Minimize2 } from 'lucide-react';
import { RichEditor } from '@/components/ui/rich-editor';
import { cn } from '@/lib/utils';

interface LessonContent {
  html: string;
  summary?: string;
}

interface LessonEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionTitle: string;
  initialContent: LessonContent | null;
  onSave: (content: LessonContent) => Promise<void>;
}

export function LessonEditor({
  open,
  onOpenChange,
  sectionTitle,
  initialContent,
  onSave,
}: LessonEditorProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load initial content
  useEffect(() => {
    if (open && initialContent?.html) {
      setContent(initialContent.html);
    } else if (open) {
      setContent('');
    }
  }, [open, initialContent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ html: content });
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur sauvegarde leçon:', error);
    } finally {
      setSaving(false);
    }
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
          setContent(prev => prev + '\n\n' + data.content);
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
      <DialogContent 
        className={cn(
          "flex flex-col transition-all duration-300",
          isFullscreen 
            ? "!max-w-[98vw] !w-[98vw] !h-[95vh] !max-h-[95vh] rounded-lg" 
            : "max-w-5xl max-h-[95vh]"
        )}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Éditeur de Leçon : {sectionTitle}</DialogTitle>
            <div className="flex items-center gap-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Réduire" : "Plein écran"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className={cn(
          "flex-1 overflow-auto pr-2",
          isFullscreen ? "h-[calc(100vh-140px)]" : "h-[65vh]"
        )}>
          {previewMode ? (
            // Mode aperçu - affiche le HTML rendu
            <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-muted/30 rounded-lg">
              <h2>{sectionTitle}</h2>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          ) : (
            // Mode édition
            <Tabs defaultValue="content" className="w-full h-full flex flex-col">
              <TabsList className="mb-4 flex-shrink-0">
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="ai">Génération IA</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col">
                  <RichEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Rédigez le contenu de votre leçon ici..."
                    className={cn(
                      "flex-1",
                      isFullscreen ? "min-h-[calc(100vh-280px)]" : "min-h-[45vh]"
                    )}
                  />
                  <p className="text-xs text-muted-foreground mt-2 flex-shrink-0">
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
                      placeholder="Décrivez le contenu que vous souhaitez générer...&#10;Ex: Une introduction à la photosynthèse pour des élèves de 3ème, avec les concepts clés et des exemples concrets."
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
            </Tabs>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

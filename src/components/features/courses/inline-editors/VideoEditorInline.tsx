// src/components/features/courses/inline-editors/VideoEditorInline.tsx
// Éditeur de vidéo inline (sans Dialog) pour SectionCard

'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube } from 'lucide-react';

interface VideoContent {
  url: string;
  platform: 'youtube' | 'vimeo' | 'other';
  videoId?: string;
  description?: string;
}

interface VideoEditorInlineProps {
  sectionId: string;
  sectionTitle: string;
  initialContent: VideoContent | null;
  aiInstructions?: string;
  onContentChange: (content: VideoContent) => void;
  onAiInstructionsChange?: (instructions: string) => void;
}

// Extraire l'ID YouTube d'une URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

// Détecter la plateforme
function detectPlatform(url: string): 'youtube' | 'vimeo' | 'other' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'other';
}

export function VideoEditorInline({
  sectionTitle,
  initialContent,
  aiInstructions = '',
  onContentChange,
  onAiInstructionsChange,
}: VideoEditorInlineProps) {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [localAiInstructions, setLocalAiInstructions] = useState(aiInstructions);

  // État dérivé
  const platform = detectPlatform(url);
  const videoId = platform === 'youtube' ? extractYouTubeId(url) : null;
  const isValidUrl = url.trim().length > 0 && (platform !== 'youtube' || videoId !== null);

  // Load initial content
  useEffect(() => {
    if (initialContent) {
      setUrl(initialContent.url || '');
      setDescription(initialContent.description || '');
    }
  }, [initialContent]);

  useEffect(() => {
    setLocalAiInstructions(aiInstructions);
  }, [aiInstructions]);

  // Notifier le parent des changements
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    const newPlatform = detectPlatform(newUrl);
    const newVideoId = newPlatform === 'youtube' ? extractYouTubeId(newUrl) : null;
    onContentChange({
      url: newUrl,
      platform: newPlatform,
      videoId: newVideoId || undefined,
      description,
    });
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    onContentChange({
      url,
      platform,
      videoId: videoId || undefined,
      description: newDescription,
    });
  };

  const handleAiInstructionsChange = (instructions: string) => {
    setLocalAiInstructions(instructions);
    onAiInstructionsChange?.(instructions);
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="video-url">URL de la vidéo *</Label>
        <Input
          id="video-url"
          placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
        />
        {url && !isValidUrl && (
          <p className="text-xs text-destructive">
            URL non valide. Formats acceptés : YouTube, Vimeo
          </p>
        )}
        {url && isValidUrl && (
          <p className="text-xs text-green-600 flex items-center gap-1">
            ✓ {platform === 'youtube' ? 'Vidéo YouTube détectée' : `Plateforme : ${platform}`}
          </p>
        )}
      </div>

      {/* Preview */}
      {videoId && platform === 'youtube' && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={sectionTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="video-description">Description / Notes (optionnel)</Label>
        <Textarea
          id="video-description"
          placeholder="Points clés de la vidéo, timestamps importants..."
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* Instructions IA */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Youtube className="h-4 w-4 text-red-600" />
            Instructions pour l&apos;IA (optionnel)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={localAiInstructions}
            onChange={(e) => handleAiInstructionsChange(e.target.value)}
            placeholder="Donnez du contexte à l'IA pour cette vidéo...&#10;Ex: Cette vidéo explique le théorème de Pythagore. L'IA doit pouvoir aider l'élève à comprendre les concepts présentés."
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Ces instructions seront utilisées par l&apos;assistant IA quand l&apos;élève consulte cette vidéo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

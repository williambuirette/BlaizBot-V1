// src/components/features/courses/VideoEditor.tsx
// Éditeur pour les sections vidéo (YouTube, etc.)

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
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Youtube, ExternalLink, Play } from 'lucide-react';

interface VideoContent {
  url: string;
  platform: 'youtube' | 'vimeo' | 'other';
  videoId?: string;
  description?: string;
  timestamps?: { time: string; label: string }[];
}

interface VideoEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionTitle: string;
  initialContent: VideoContent | null;
  onSave: (content: VideoContent) => Promise<void>;
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

export function VideoEditor({
  open,
  onOpenChange,
  sectionTitle,
  initialContent,
  onSave,
}: VideoEditorProps) {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // État dérivé
  const platform = detectPlatform(url);
  const videoId = platform === 'youtube' ? extractYouTubeId(url) : null;
  const isValidUrl = url.trim().length > 0 && (platform !== 'youtube' || videoId !== null);

  // Load initial content
  useEffect(() => {
    if (open && initialContent) {
      setUrl(initialContent.url || '');
      setDescription(initialContent.description || '');
    } else if (open) {
      setUrl('');
      setDescription('');
    }
  }, [open, initialContent]);

  const handleSave = async () => {
    if (!isValidUrl) return;
    setSaving(true);
    try {
      await onSave({
        url,
        platform,
        videoId: videoId || undefined,
        description,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur sauvegarde vidéo:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            Éditeur Vidéo : {sectionTitle}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="video-url">URL de la vidéo *</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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

            {/* Placeholder si pas de preview */}
            {!videoId && url && isValidUrl && (
              <Card className="bg-muted">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Play className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Aperçu non disponible</p>
                  <Button variant="link" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ouvrir dans un nouvel onglet
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="video-description">Description (optionnelle)</Label>
              <Textarea
                id="video-description"
                placeholder="Ajoutez une description ou des notes pour vos élèves..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">💡 Conseil</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Collez simplement l&apos;URL YouTube de la vidéo. L&apos;intégration sera automatique.
                Plus tard, l&apos;IA pourra analyser le contenu de la vidéo pour générer des quiz !
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || !isValidUrl}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

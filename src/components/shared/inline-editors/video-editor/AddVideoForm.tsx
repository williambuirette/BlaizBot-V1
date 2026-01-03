// Formulaire d'ajout de vidéo (URL ou Upload)

'use client';

import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Plus, Upload, Link as LinkIcon, FileVideo, Loader2, AlertCircle } from 'lucide-react';
import type { VideoItem } from './types';
import { detectPlatform, extractYouTubeId, generateId, validateVideoFile } from './utils';

interface AddVideoFormProps {
  onAddVideo: (video: VideoItem) => void;
}

export function AddVideoForm({ onAddVideo }: AddVideoFormProps) {
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation URL
  const platform = detectPlatform(newUrl);
  const videoId = platform === 'youtube' ? extractYouTubeId(newUrl) : null;
  const isValidUrl = newUrl.trim().length > 0 && (platform !== 'youtube' || videoId !== null);

  // Ajouter une vidéo par URL
  const handleAddVideoUrl = () => {
    if (!newUrl.trim()) return;
    
    const newVideo: VideoItem = {
      id: generateId(),
      url: newUrl.trim(),
      platform,
      videoId: videoId || undefined,
      title: newTitle.trim() || undefined,
    };
    
    onAddVideo(newVideo);
    setNewUrl('');
    setNewTitle('');
  };

  // Upload d'une vidéo locale
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Erreur de validation');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simuler la progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      setUploadProgress(100);

      const newVideo: VideoItem = {
        id: data.id,
        url: data.url,
        platform: 'uploaded',
        title: newTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
        filename: file.name,
        mimeType: file.type,
      };

      onAddVideo(newVideo);
      setNewTitle('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une vidéo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'url' | 'upload')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Lien YouTube/Vimeo
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importer un fichier
            </TabsTrigger>
          </TabsList>

          {/* Tab URL */}
          <TabsContent value="url" className="space-y-3 mt-0">
            <div className="space-y-2">
              <Label htmlFor="new-video-url">URL de la vidéo</Label>
              <Input
                id="new-video-url"
                placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && isValidUrl && handleAddVideoUrl()}
              />
              {newUrl && !isValidUrl && (
                <p className="text-xs text-destructive">
                  URL non valide. Formats acceptés : YouTube, Vimeo
                </p>
              )}
              {newUrl && isValidUrl && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  ✓ {platform === 'youtube' ? 'Vidéo YouTube détectée' : `Plateforme : ${platform}`}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-video-title-url">Titre (optionnel)</Label>
              <Input
                id="new-video-title-url"
                placeholder="Ex: Introduction au chapitre 1"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && isValidUrl && handleAddVideoUrl()}
              />
            </div>
            
            <Button 
              onClick={handleAddVideoUrl} 
              disabled={!isValidUrl}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter cette vidéo
            </Button>
          </TabsContent>

          {/* Tab Upload */}
          <TabsContent value="upload" className="space-y-3 mt-0">
            <div className="space-y-2">
              <Label htmlFor="new-video-title-upload">Titre (optionnel)</Label>
              <Input
                id="new-video-title-upload"
                placeholder="Ex: Présentation NotebookLM"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fichier vidéo</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isUploading ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                {isUploading ? (
                  <div className="space-y-3">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Upload en cours...</p>
                    <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                  </div>
                ) : (
                  <>
                    <FileVideo className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Glissez une vidéo ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      MP4, WebM, OGG, MOV, AVI • Max 100 Mo
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </Button>
                  </>
                )}
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {uploadError}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                💡 Idéal pour les présentations audio/vidéo générées par NotebookLM ou d&apos;autres outils IA.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// src/components/features/courses/inline-editors/VideoEditorInline.tsx
// Éditeur de vidéo inline - Support multiple vidéos + upload local

'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Youtube, 
  Plus, 
  Trash2, 
  GripVertical, 
  Upload, 
  Link as LinkIcon,
  Video,
  FileVideo,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface VideoItem {
  id: string;
  url: string;
  platform: 'youtube' | 'vimeo' | 'uploaded' | 'other';
  videoId?: string;
  title?: string;
  filename?: string; // Pour les vidéos uploadées
  mimeType?: string; // Pour les vidéos uploadées
}

interface VideoContent {
  videos?: VideoItem[];
  description?: string;
  // Rétrocompatibilité avec l'ancien format
  url?: string;
  platform?: 'youtube' | 'vimeo' | 'uploaded' | 'other';
  videoId?: string;
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
function detectPlatform(url: string): 'youtube' | 'vimeo' | 'uploaded' | 'other' {
  if (url.startsWith('/uploads/')) return 'uploaded';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'other';
}

// Générer un ID unique
function generateId(): string {
  return `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Convertir ancien format vers nouveau
function migrateContent(content: VideoContent | null): VideoItem[] {
  if (!content) return [];
  
  // Nouveau format avec videos[]
  if (content.videos && content.videos.length > 0) {
    return content.videos;
  }
  
  // Ancien format avec url unique
  if (content.url) {
    return [{
      id: generateId(),
      url: content.url,
      platform: content.platform || detectPlatform(content.url),
      videoId: content.videoId || extractYouTubeId(content.url) || undefined,
    }];
  }
  
  return [];
}

export function VideoEditorInline({
  sectionTitle,
  initialContent,
  aiInstructions = '',
  onContentChange,
  onAiInstructionsChange,
}: VideoEditorInlineProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [description, setDescription] = useState('');
  const [localAiInstructions, setLocalAiInstructions] = useState(aiInstructions);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial content
  useEffect(() => {
    if (initialContent) {
      setVideos(migrateContent(initialContent));
      setDescription(initialContent.description || '');
    }
  }, [initialContent]);

  useEffect(() => {
    setLocalAiInstructions(aiInstructions);
  }, [aiInstructions]);

  // Notifier le parent des changements
  const notifyChange = (newVideos: VideoItem[], newDescription?: string) => {
    onContentChange({
      videos: newVideos,
      description: newDescription ?? description,
      // Garder l'URL principale pour rétrocompatibilité
      url: newVideos[0]?.url,
      platform: newVideos[0]?.platform,
      videoId: newVideos[0]?.videoId,
    });
  };

  // Ajouter une vidéo par URL
  const handleAddVideoUrl = () => {
    if (!newUrl.trim()) return;
    
    const platform = detectPlatform(newUrl);
    const videoId = platform === 'youtube' ? extractYouTubeId(newUrl) : null;
    
    const newVideo: VideoItem = {
      id: generateId(),
      url: newUrl.trim(),
      platform,
      videoId: videoId || undefined,
      title: newTitle.trim() || undefined,
    };
    
    const updatedVideos = [...videos, newVideo];
    setVideos(updatedVideos);
    notifyChange(updatedVideos);
    
    // Reset inputs
    setNewUrl('');
    setNewTitle('');
  };

  // Upload d'une vidéo locale
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format non supporté. Utilisez MP4, WebM, OGG, MOV ou AVI.');
      return;
    }

    // Vérifier la taille (100 MB max)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('Fichier trop volumineux. Maximum : 100 Mo.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simuler la progression (l'API ne supporte pas le streaming progress)
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

      // Ajouter la vidéo uploadée
      const newVideo: VideoItem = {
        id: data.id,
        url: data.url,
        platform: 'uploaded',
        title: newTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
        filename: file.name,
        mimeType: file.type,
      };

      const updatedVideos = [...videos, newVideo];
      setVideos(updatedVideos);
      notifyChange(updatedVideos);

      // Reset
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

  // Supprimer une vidéo
  const handleRemoveVideo = (id: string) => {
    const updatedVideos = videos.filter(v => v.id !== id);
    setVideos(updatedVideos);
    notifyChange(updatedVideos);
  };

  // Mettre à jour le titre d'une vidéo
  const handleUpdateTitle = (id: string, title: string) => {
    const updatedVideos = videos.map(v => 
      v.id === id ? { ...v, title } : v
    );
    setVideos(updatedVideos);
    notifyChange(updatedVideos);
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    notifyChange(videos, newDescription);
  };

  const handleAiInstructionsChange = (instructions: string) => {
    setLocalAiInstructions(instructions);
    onAiInstructionsChange?.(instructions);
  };

  // Validation URL
  const platform = detectPlatform(newUrl);
  const videoId = platform === 'youtube' ? extractYouTubeId(newUrl) : null;
  const isValidUrl = newUrl.trim().length > 0 && (platform !== 'youtube' || videoId !== null);

  return (
    <div className="space-y-6">
      {/* Liste des vidéos ajoutées */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <Label>Vidéos ajoutées ({videos.length})</Label>
          {videos.map((video, index) => (
            <Card key={video.id} className="relative">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Grip pour réordonner (futur) */}
                  <div className="flex items-center text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  
                  {/* Preview miniature */}
                  {video.platform === 'youtube' && video.videoId && (
                    <div className="w-32 h-20 bg-black rounded overflow-hidden shrink-0">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title || `Vidéo ${index + 1}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  )}
                  
                  {video.platform === 'uploaded' && (
                    <div className="w-32 h-20 bg-muted rounded overflow-hidden shrink-0 flex items-center justify-center">
                      <video
                        src={video.url}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    </div>
                  )}
                  
                  {video.platform !== 'youtube' && video.platform !== 'uploaded' && (
                    <div className="w-32 h-20 bg-muted rounded flex items-center justify-center shrink-0">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Infos */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <Input
                      placeholder={`Titre de la vidéo ${index + 1} (optionnel)`}
                      value={video.title || ''}
                      onChange={(e) => handleUpdateTitle(video.id, e.target.value)}
                      className="font-medium"
                    />
                    <p className="text-xs text-muted-foreground truncate" title={video.url}>
                      {video.filename || video.url}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant={video.platform === 'uploaded' ? 'secondary' : 'outline'} className="text-xs">
                        {video.platform === 'youtube' && <Youtube className="h-3 w-3 mr-1" />}
                        {video.platform === 'uploaded' && <FileVideo className="h-3 w-3 mr-1" />}
                        {video.platform === 'youtube' ? 'YouTube' : 
                         video.platform === 'uploaded' ? 'Uploadé' : 
                         video.platform}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemoveVideo(video.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout avec tabs */}
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

      {/* Preview de la première vidéo */}
      {videos.length > 0 && videos[0] && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Aperçu - {videos[0].title || 'Vidéo principale'}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-b-lg overflow-hidden">
              {videos[0].platform === 'youtube' && videos[0].videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videos[0].videoId}`}
                  title={sectionTitle}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : videos[0].platform === 'uploaded' ? (
                <video
                  src={videos[0].url}
                  controls
                  className="w-full h-full"
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Video className="h-16 w-16" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="video-description">Description / Notes (optionnel)</Label>
        <Textarea
          id="video-description"
          placeholder="Points clés des vidéos, timestamps importants..."
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* Instructions IA */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            Instructions pour l&apos;IA (optionnel)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={localAiInstructions}
            onChange={(e) => handleAiInstructionsChange(e.target.value)}
            placeholder="Donnez du contexte à l'IA pour ces vidéos...&#10;Ex: Cette présentation NotebookLM résume le chapitre sur la photosynthèse."
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Ces instructions seront utilisées par l&apos;assistant IA quand l&apos;élève consulte cette section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

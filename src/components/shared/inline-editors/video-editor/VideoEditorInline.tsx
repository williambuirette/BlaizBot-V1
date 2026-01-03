// VideoEditorInline - Composant principal refactorisé
// 563 lignes → ~140 lignes (sous-composants extraits)

'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';

import type { VideoItem, VideoContent, VideoEditorInlineProps } from './types';
import { migrateContent } from './utils';
import { VideoItemCard } from './VideoItemCard';
import { AddVideoForm } from './AddVideoForm';
import { VideoPreview } from './VideoPreview';

// Ré-exporter les types pour compatibilité
export type { VideoItem, VideoContent, VideoEditorInlineProps } from './types';

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

  const handleAddVideo = (video: VideoItem) => {
    const updatedVideos = [...videos, video];
    setVideos(updatedVideos);
    notifyChange(updatedVideos);
  };

  const handleRemoveVideo = (id: string) => {
    const updatedVideos = videos.filter(v => v.id !== id);
    setVideos(updatedVideos);
    notifyChange(updatedVideos);
  };

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

  return (
    <div className="space-y-6">
      {/* Liste des vidéos ajoutées */}
      {videos.length > 0 && (
        <div className="space-y-3">
          <Label>Vidéos ajoutées ({videos.length})</Label>
          {videos.map((video, index) => (
            <VideoItemCard
              key={video.id}
              video={video}
              index={index}
              onUpdateTitle={handleUpdateTitle}
              onRemove={handleRemoveVideo}
            />
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <AddVideoForm onAddVideo={handleAddVideo} />

      {/* Preview de la première vidéo */}
      {videos.length > 0 && videos[0] && (
        <VideoPreview video={videos[0]} sectionTitle={sectionTitle} />
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

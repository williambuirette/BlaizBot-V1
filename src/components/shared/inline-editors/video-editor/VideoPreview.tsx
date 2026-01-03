// Composant de prévisualisation vidéo

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video } from 'lucide-react';
import type { VideoItem } from './types';

interface VideoPreviewProps {
  video: VideoItem;
  sectionTitle: string;
}

export function VideoPreview({ video, sectionTitle }: VideoPreviewProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          Aperçu - {video.title || 'Vidéo principale'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video bg-black rounded-b-lg overflow-hidden">
          {video.platform === 'youtube' && video.videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}`}
              title={sectionTitle}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : video.platform === 'uploaded' ? (
            <video
              src={video.url}
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
  );
}

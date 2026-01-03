// Composant carte pour un item vidéo

'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Youtube, Trash2, GripVertical, Video, FileVideo } from 'lucide-react';
import type { VideoItem } from './types';

interface VideoItemCardProps {
  video: VideoItem;
  index: number;
  onUpdateTitle: (id: string, title: string) => void;
  onRemove: (id: string) => void;
}

export function VideoItemCard({ video, index, onUpdateTitle, onRemove }: VideoItemCardProps) {
  return (
    <Card className="relative">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Grip pour réordonner (futur) */}
          <div className="flex items-center text-muted-foreground">
            <GripVertical className="h-5 w-5" />
          </div>
          
          {/* Preview miniature */}
          <VideoThumbnail video={video} index={index} />
          
          {/* Infos */}
          <div className="flex-1 min-w-0 space-y-2">
            <Input
              placeholder={`Titre de la vidéo ${index + 1} (optionnel)`}
              value={video.title || ''}
              onChange={(e) => onUpdateTitle(video.id, e.target.value)}
              className="font-medium"
            />
            <p className="text-xs text-muted-foreground truncate" title={video.url}>
              {video.filename || video.url}
            </p>
            <div className="flex items-center gap-2">
              <PlatformBadge platform={video.platform} />
            </div>
          </div>
          
          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onRemove(video.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoThumbnail({ video, index }: { video: VideoItem; index: number }) {
  if (video.platform === 'youtube' && video.videoId) {
    return (
      <div className="w-32 h-20 bg-black rounded overflow-hidden shrink-0">
        <iframe
          src={`https://www.youtube.com/embed/${video.videoId}`}
          title={video.title || `Vidéo ${index + 1}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }
  
  if (video.platform === 'uploaded') {
    return (
      <div className="w-32 h-20 bg-muted rounded overflow-hidden shrink-0 flex items-center justify-center">
        <video
          src={video.url}
          className="w-full h-full object-cover"
          muted
          preload="metadata"
        />
      </div>
    );
  }
  
  return (
    <div className="w-32 h-20 bg-muted rounded flex items-center justify-center shrink-0">
      <Video className="h-8 w-8 text-muted-foreground" />
    </div>
  );
}

function PlatformBadge({ platform }: { platform: VideoItem['platform'] }) {
  const variant = platform === 'uploaded' ? 'secondary' : 'outline';
  
  return (
    <Badge variant={variant} className="text-xs">
      {platform === 'youtube' && <Youtube className="h-3 w-3 mr-1" />}
      {platform === 'uploaded' && <FileVideo className="h-3 w-3 mr-1" />}
      {platform === 'youtube' ? 'YouTube' : 
       platform === 'uploaded' ? 'Uploadé' : 
       platform}
    </Badge>
  );
}

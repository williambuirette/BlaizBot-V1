// src/components/features/student/viewers/VideoViewer.tsx
// Viewer pour les sections de type VIDEO

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, ExternalLink } from 'lucide-react';

// Types
interface VideoFile {
  url: string;
  filename: string;
  type?: string;
}

interface VideoContent {
  type: 'youtube' | 'vimeo' | 'uploaded' | 'other';
  videoId?: string;
  embedUrl?: string;
  directUrl?: string;
  originalUrl?: string;
  title?: string;
  platform?: string;
  files?: VideoFile[];
}

interface VideoViewerProps {
  content: string | null;
}

// Interface pour le format des cartes élève (StudentCard VIDEO)
interface StudentCardVideoContent {
  videos?: Array<{
    id: string;
    url: string;
    platform: 'youtube' | 'vimeo' | 'uploaded' | 'other';
    videoId?: string;
    title?: string;
    description?: string;
  }>;
  description?: string;
  url?: string;
  platform?: string;
  videoId?: string;
}

// Helpers
function parseVideoContent(content: string | null): VideoContent | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as StudentCardVideoContent;
    
    // Format StudentCard - priorité au videoId racine ou dans videos[]
    const videoId = parsed.videoId || (parsed.videos?.[0]?.videoId);
    const platform = parsed.platform || parsed.videos?.[0]?.platform || 'youtube';
    const url = parsed.url || parsed.videos?.[0]?.url;
    
    if (videoId) {
      return {
        type: platform as VideoContent['type'],
        videoId: videoId,
        originalUrl: url,
      };
    }
    
    // Si pas de videoId mais une URL, extraire le videoId
    if (url) {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const extractedId = url.includes('youtu.be')
          ? url.split('/').pop()?.split('?')[0]
          : new URLSearchParams(url.split('?')[1]).get('v');
        return { type: 'youtube', videoId: extractedId || undefined, originalUrl: url };
      }
      if (url.includes('vimeo.com')) {
        const extractedId = url.split('/').pop()?.split('?')[0];
        return { type: 'vimeo', videoId: extractedId || undefined, originalUrl: url };
      }
    }
    
    // Format standard VideoContent (fallback)
    return parsed as unknown as VideoContent;
  } catch {
    // URL brute
    if (content.includes('youtube.com') || content.includes('youtu.be')) {
      const videoId = content.includes('youtu.be')
        ? content.split('/').pop()?.split('?')[0]
        : new URLSearchParams(content.split('?')[1]).get('v');
      return { type: 'youtube', videoId: videoId || undefined };
    }
    if (content.includes('vimeo.com')) {
      const videoId = content.split('/').pop()?.split('?')[0];
      return { type: 'vimeo', videoId: videoId || undefined };
    }
    return { type: 'other', directUrl: content };
  }
}

// Composant principal
export function VideoViewer({ content }: VideoViewerProps) {
  const videoData = parseVideoContent(content);

  if (!videoData) {
    return (
      <div className="text-center py-12">
        <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Aucune vidéo disponible.</p>
      </div>
    );
  }

  // Plusieurs vidéos
  if (videoData.files && videoData.files.length > 0) {
    return (
      <div className="space-y-4">
        {videoData.files.map((file, index) => (
          <VideoCard key={index} file={file} index={index} />
        ))}
      </div>
    );
  }

  // Vidéo unique
  return <SingleVideoPlayer videoData={videoData} />;
}

// Sous-composants
function VideoCard({ file, index }: { file: VideoFile; index: number }) {
  const isDirectUrl = file.url.startsWith('/') || file.url.includes('blob');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Video className="h-4 w-4 text-primary" />
          <span className="font-medium">{file.filename || `Vidéo ${index + 1}`}</span>
          <Badge variant="secondary" className="ml-auto">
            {file.type || 'Vidéo'}
          </Badge>
        </div>
        {isDirectUrl ? (
          <video controls className="w-full rounded-lg max-h-[50vh]">
            <source src={file.url} type={file.type || 'video/mp4'} />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        ) : (
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-5 w-5" />
              Ouvrir la vidéo
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SingleVideoPlayer({ videoData }: { videoData: VideoContent }) {
  // YouTube
  if (videoData.type === 'youtube' && videoData.videoId) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoData.videoId}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={videoData.title || 'Vidéo YouTube'}
        />
      </div>
    );
  }

  // Vimeo
  if (videoData.type === 'vimeo' && videoData.videoId) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${videoData.videoId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={videoData.title || 'Vidéo Vimeo'}
        />
      </div>
    );
  }

  // Vidéo uploadée
  if (videoData.type === 'uploaded' && videoData.directUrl) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <video controls className="w-full h-full">
          <source src={videoData.directUrl} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      </div>
    );
  }

  // Embed générique
  if (videoData.embedUrl) {
    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={videoData.embedUrl}
          className="w-full h-full"
          allowFullScreen
          title={videoData.title || 'Vidéo'}
        />
      </div>
    );
  }

  // URL directe
  if (videoData.directUrl || videoData.originalUrl) {
    const url = videoData.directUrl || videoData.originalUrl;
    return (
      <div className="text-center py-12">
        <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline flex items-center justify-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Ouvrir la vidéo dans un nouvel onglet
        </a>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Format vidéo non reconnu.</p>
    </div>
  );
}

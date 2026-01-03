// Utilitaires pour VideoEditorInline

import type { VideoItem, VideoContent } from './types';

// Extraire l'ID YouTube d'une URL
export function extractYouTubeId(url: string): string | null {
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
export function detectPlatform(url: string): 'youtube' | 'vimeo' | 'uploaded' | 'other' {
  if (url.startsWith('/uploads/')) return 'uploaded';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  return 'other';
}

// Générer un ID unique
export function generateId(): string {
  return `video-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Convertir ancien format vers nouveau
export function migrateContent(content: VideoContent | null): VideoItem[] {
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

// Types de fichiers vidéo acceptés
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm', 
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo'
];

// Taille max en octets (100 MB)
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

// Valider un fichier vidéo
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: 'Format non supporté. Utilisez MP4, WebM, OGG, MOV ou AVI.' };
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: 'Fichier trop volumineux. Maximum : 100 Mo.' };
  }
  return { valid: true };
}

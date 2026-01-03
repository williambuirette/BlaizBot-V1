// Types partagés pour VideoEditorInline

export interface VideoItem {
  id: string;
  url: string;
  platform: 'youtube' | 'vimeo' | 'uploaded' | 'other';
  videoId?: string;
  title?: string;
  filename?: string;
  mimeType?: string;
}

export interface VideoContent {
  videos?: VideoItem[];
  description?: string;
  // Rétrocompatibilité avec l'ancien format
  url?: string;
  platform?: 'youtube' | 'vimeo' | 'uploaded' | 'other';
  videoId?: string;
}

export interface VideoEditorInlineProps {
  sectionId: string;
  sectionTitle: string;
  initialContent: VideoContent | null;
  aiInstructions?: string;
  onContentChange: (content: VideoContent) => void;
  onAiInstructionsChange?: (instructions: string) => void;
}

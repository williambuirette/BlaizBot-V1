// src/components/features/courses/resource-dialog/types.ts
// Types et constantes pour ResourceFormDialog

import { Link, Youtube, FileText, Image, File, Table, Presentation } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ResourceType = 'LINK' | 'YOUTUBE' | 'PDF' | 'DOCUMENT' | 'EXCEL' | 'POWERPOINT' | 'IMAGE';

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: ResourceType;
  url: string | null;
  fileUrl: string | null;
}

export interface ResourceFormData {
  title: string;
  description?: string;
  type: ResourceType;
  url?: string;
  fileUrl?: string;
}

interface ResourceTypeConfig {
  value: ResourceType;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const resourceTypes: readonly ResourceTypeConfig[] = [
  { value: 'LINK', label: 'Lien externe', icon: Link, description: 'Site web, article' },
  { value: 'YOUTUBE', label: 'Vidéo YouTube', icon: Youtube, description: 'Tutoriel, cours' },
  { value: 'PDF', label: 'Document PDF', icon: FileText, description: 'Fiche, support' },
  { value: 'DOCUMENT', label: 'Document Word', icon: File, description: 'DOC, DOCX' },
  { value: 'EXCEL', label: 'Tableur Excel', icon: Table, description: 'XLS, XLSX' },
  { value: 'POWERPOINT', label: 'Présentation', icon: Presentation, description: 'PPT, PPTX' },
  { value: 'IMAGE', label: 'Image', icon: Image, description: 'Schéma, illustration' },
] as const;

// Valid extensions per type
export const extensionConfig: Record<string, string[]> = {
  'PDF': ['.pdf'],
  'DOCUMENT': ['.doc', '.docx'],
  'EXCEL': ['.xls', '.xlsx'],
  'POWERPOINT': ['.ppt', '.pptx', '.ppsx'],
  'IMAGE': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
};

// Validate file by extension
export function isValidExtension(file: File, type: string): boolean {
  const ext = '.' + (file.name.toLowerCase().split('.').pop() || '');
  const allowed = extensionConfig[type] || [];
  return allowed.includes(ext);
}

// Get HTML accept attribute for file dialog filtering
export function getInputAccept(type: string): string {
  const extensions = extensionConfig[type] || [];
  return extensions.join(',');
}

// Check if URL or FileURL is needed based on type
export function needsUrl(type: ResourceType): boolean {
  return type === 'LINK' || type === 'YOUTUBE';
}

export function needsFileUrl(type: ResourceType): boolean {
  return type === 'PDF' || type === 'DOCUMENT' || type === 'EXCEL' || type === 'POWERPOINT' || type === 'IMAGE';
}

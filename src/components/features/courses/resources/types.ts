// Types et configuration pour ResourcesManager

import { Link, Youtube, FileText, File, Table, Image } from 'lucide-react';
import type { ResourceType } from '../ResourceFormDialog';

// Type pour les fichiers uploadés (CourseFile)
export interface CourseFile {
  id: string;
  filename: string;
  url: string;
  fileType: string;
}

// Mapping des icônes et labels par type
export const resourceTypeConfig = {
  LINK: { icon: Link, label: 'Liens externes', color: 'bg-blue-100 text-blue-800' },
  YOUTUBE: { icon: Youtube, label: 'Vidéos YouTube', color: 'bg-red-100 text-red-800' },
  PDF: { icon: FileText, label: 'Documents PDF', color: 'bg-orange-100 text-orange-800' },
  DOCUMENT: { icon: File, label: 'Documents Word', color: 'bg-purple-100 text-purple-800' },
  EXCEL: { icon: Table, label: 'Tableurs Excel', color: 'bg-emerald-100 text-emerald-800' },
  POWERPOINT: { icon: FileText, label: 'Présentations PowerPoint', color: 'bg-amber-100 text-amber-800' },
  IMAGE: { icon: Image, label: 'Images', color: 'bg-green-100 text-green-800' },
};

export const typeOrder: ResourceType[] = ['LINK', 'YOUTUBE', 'PDF', 'DOCUMENT', 'EXCEL', 'POWERPOINT', 'IMAGE'];

// Utilitaires pour MessageThread

import { FileText, Image, FileSpreadsheet, Paperclip } from 'lucide-react';

/**
 * Retourne l'icône appropriée selon le type de fichier
 */
export function getFileIcon(type: string) {
  if (type.includes('pdf')) return FileText;
  if (type.includes('image')) return Image;
  if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet;
  if (type.includes('word') || type.includes('document')) return FileText;
  if (type.includes('presentation') || type.includes('powerpoint')) return FileText;
  return Paperclip;
}

/**
 * Formate la taille d'un fichier en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

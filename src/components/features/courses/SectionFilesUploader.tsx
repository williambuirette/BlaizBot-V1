// src/components/features/courses/SectionFilesUploader.tsx
// Composant pour uploader des fichiers de base de connaissance par section

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  File,
  FileText,
  Image,
  Film,
  Music,
  Trash2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  size?: number;
  createdAt: string;
}

interface SectionFilesUploaderProps {
  sectionId: string;
  className?: string;
}

// Mapping icônes par type MIME
function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.startsWith('video/')) return Film;
  if (fileType.startsWith('audio/')) return Music;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  return File;
}

// Formatter la taille de fichier
function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Taille inconnue';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SectionFilesUploader({
  sectionId,
  className,
}: SectionFilesUploaderProps) {
  const [files, setFiles] = useState<SectionFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/sections/${sectionId}/files`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Erreur fetch files:', error);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Handle file upload
  const handleUpload = async (uploadFiles: FileList | null) => {
    if (!uploadFiles || uploadFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(uploadFiles)) {
        // 1. Upload le fichier vers le serveur
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          console.error('Erreur upload:', error);
          continue;
        }

        const uploadData = await uploadRes.json();
        
        // 2. Créer l'entrée en BDD avec l'URL persistante et le texte extrait
        const res = await fetch(`/api/teacher/sections/${sectionId}/files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: uploadData.filename,
            fileType: uploadData.type || file.type,
            url: uploadData.url,
            size: uploadData.size || file.size,
            textContent: uploadData.textContent || null, // Texte extrait pour l'IA
          }),
        });

        if (res.ok) {
          await fetchFiles();
        }
      }
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (fileId: string) => {
    try {
      const res = await fetch(
        `/api/teacher/sections/${sectionId}/files/${fileId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (error) {
      console.error('Erreur delete:', error);
    }
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <File className="h-4 w-4" />
          Base de connaissance
          <Badge variant="secondary" className="ml-auto">
            {files.length} fichier{files.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Zone de drop */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-4 text-center transition-colors',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            uploading && 'opacity-50 pointer-events-none'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Upload en cours...</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Glissez vos fichiers ici ou
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Parcourir
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, images, documents...
              </p>
            </>
          )}
        </div>

        {/* Liste des fichiers */}
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : files.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((file) => {
              const Icon = getFileIcon(file.fileType);
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50 group"
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => window.open(file.url, '_blank')}
                      title="Ouvrir"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(file.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Aucun fichier ajouté
          </p>
        )}
      </CardContent>
    </Card>
  );
}

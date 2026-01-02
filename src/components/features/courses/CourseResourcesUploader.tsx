// src/components/features/courses/CourseResourcesUploader.tsx
// Composant pour uploader et gérer les ressources globales d'un cours

'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  File,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  Video,
  Music,
  Upload,
  Loader2,
  Trash2,
  ExternalLink,
  Download,
  Plus,
} from 'lucide-react';

interface CourseFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  createdAt?: string;
}

interface CourseResourcesUploaderProps {
  courseId: string;
  files: CourseFile[];
  onUpdate: () => void;
}

// Icône selon le type de fichier
function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />;
    case 'word':
      return <FileText className="h-8 w-8 text-blue-500" />;
    case 'excel':
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    case 'powerpoint':
      return <Presentation className="h-8 w-8 text-orange-500" />;
    case 'image':
      return <Image className="h-8 w-8 text-purple-500" />;
    case 'video':
      return <Video className="h-8 w-8 text-pink-500" />;
    case 'audio':
      return <Music className="h-8 w-8 text-yellow-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
}

// Extensions acceptées pour l'input
const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.doc', '.docx',
  '.xls', '.xlsx',
  '.ppt', '.pptx',
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.mp4', '.webm', '.mov',
  '.mp3', '.wav', '.ogg',
  '.txt', '.csv',
].join(',');

export function CourseResourcesUploader({ 
  courseId, 
  files, 
  onUpdate 
}: CourseResourcesUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<CourseFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Upload un fichier
  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/teacher/courses/${courseId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur upload');
      }

      toast.success(`${file.name} uploadé avec succès`);
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [courseId, onUpdate]);

  // Handler input file
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  // Supprimer un fichier
  const handleDelete = useCallback(async () => {
    if (!fileToDelete) return;
    
    setDeleting(fileToDelete.id);
    try {
      const res = await fetch(
        `/api/teacher/courses/${courseId}/files?fileId=${fileToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur suppression');
      }

      toast.success('Fichier supprimé');
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
      setFileToDelete(null);
    }
  }, [courseId, fileToDelete, onUpdate]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Ressources du cours
                {files.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({files.length})
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Documents, vidéos et fichiers disponibles pour vos élèves
              </CardDescription>
            </div>
            <div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <Button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                size="sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucune ressource pour le moment
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Cliquez pour ajouter des documents, vidéos, audio...
              </p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  {getFileIcon(file.fileType)}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {file.fileType}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <a href={file.url} target="_blank" rel="noopener noreferrer" title="Ouvrir">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <a href={file.url} download={file.filename} title="Télécharger">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setFileToDelete(file)}
                      disabled={deleting === file.id}
                      title="Supprimer"
                    >
                      {deleting === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation suppression */}
      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce fichier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le fichier &quot;{fileToDelete?.filename}&quot; sera définitivement supprimé.
              Les élèves n&apos;y auront plus accès.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

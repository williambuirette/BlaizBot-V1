/**
 * Gestionnaire de fichiers pour les cartes de révision étudiant
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  Trash2,
  FileText,
  Image,
  Video,
  Music,
  File,
  Loader2,
  Download,
  ExternalLink,
} from 'lucide-react';

interface CardFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
}

interface StudentFilesManagerProps {
  cardId: string;
  files: CardFile[];
  onFileUploaded: (file: CardFile) => void;
  onFileDeleted: (fileId: string) => void;
}

// Icône selon le type de fichier
function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
    case 'word':
    case 'excel':
    case 'powerpoint':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'image':
      return <Image className="h-5 w-5 text-purple-500" />;
    case 'video':
      return <Video className="h-5 w-5 text-pink-500" />;
    case 'audio':
      return <Music className="h-5 w-5 text-yellow-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
}

export function StudentFilesManager({
  cardId,
  files,
  onFileUploaded,
  onFileDeleted,
}: StudentFilesManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/student/cards/${cardId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur upload');
      }

      const data = await res.json();
      onFileUploaded(data.data);
    } catch (error) {
      console.error('Erreur upload:', error);
      alert(error instanceof Error ? error.message : 'Erreur upload fichier');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Supprimer ce fichier ?')) return;

    setDeleting(fileId);
    try {
      const res = await fetch(`/api/student/cards/${cardId}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onFileDeleted(fileId);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Zone d'upload */}
      <div className="border-2 border-dashed rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
        />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Glissez un fichier ou cliquez pour uploader
        </p>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Upload en cours...
            </>
          ) : (
            'Choisir un fichier'
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Max 100 MB • PDF, Word, Excel, PowerPoint, Images, Vidéos, Audio
        </p>
      </div>

      {/* Liste des fichiers */}
      {files.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-muted-foreground">
            Aucun fichier attaché
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.fileType)}
                    <div>
                      <p className="font-medium text-sm">{file.filename}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {file.fileType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a href={file.url} download={file.filename}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(file.id)}
                      disabled={deleting === file.id}
                    >
                      {deleting === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

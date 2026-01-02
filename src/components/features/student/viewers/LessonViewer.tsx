// src/components/features/student/viewers/LessonViewer.tsx
// Viewer pour les sections de type LESSON

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  ExternalLink,
  Download,
  File,
  FileImage,
  FileVideo,
  FileAudio
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Types
export interface SectionFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  size?: number;
  textContent?: string | null;
}

interface LessonContent {
  html: string;
  summary?: string;
}

interface LessonViewerProps {
  content: string | null;
  files?: SectionFile[];
}

// Helpers
function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return <FileImage className="h-4 w-4" />;
  if (fileType.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
  if (fileType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
  if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  return <File className="h-4 w-4" />;
}

function downloadFile(url: string, filename: string) {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    });
}

// Composant principal
export function LessonViewer({ content, files }: LessonViewerProps) {
  const hasFiles = files && files.length > 0;
  const [viewingFile, setViewingFile] = useState<SectionFile | null>(null);

  return (
    <div className="space-y-6">
      {/* Contenu de la leçon */}
      {content ? (
        (() => {
          try {
            const lessonData: LessonContent = JSON.parse(content);
            if (lessonData.html) {
              return (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lessonData.html }} />
                </div>
              );
            }
          } catch {
            // Fallback Markdown
          }
          return (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          );
        })()
      ) : (
        !hasFiles && <p className="text-muted-foreground">Aucun contenu disponible.</p>
      )}

      {/* Documents de la base de connaissances */}
      {hasFiles && (
        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Documents de cours ({files.length})
          </h3>
          <div className="grid gap-3">
            {files.map((file) => (
              <FileCard 
                key={file.id} 
                file={file} 
                onView={() => setViewingFile(file)}
                onDownload={() => downloadFile(file.url, file.filename)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Modal de visualisation de fichier */}
      {viewingFile && (
        <FileViewerDialog 
          file={viewingFile} 
          onClose={() => setViewingFile(null)} 
        />
      )}
    </div>
  );
}

// Sous-composants
function FileCard({ 
  file, 
  onView, 
  onDownload 
}: { 
  file: SectionFile; 
  onView: () => void; 
  onDownload: () => void;
}) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getFileIcon(file.fileType)}
            <div>
              <p className="font-medium text-sm">{file.filename}</p>
              <p className="text-xs text-muted-foreground">
                {file.fileType.split('/')[1]?.toUpperCase() || 'Document'}
                {file.size && ` • ${formatFileSize(file.size)}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Ouvrir
            </Button>
            <Button variant="ghost" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FileViewerDialog({ 
  file, 
  onClose 
}: { 
  file: SectionFile; 
  onClose: () => void;
}) {
  const isImage = file.fileType.startsWith('image/');
  const isPdf = file.fileType === 'application/pdf';
  const hasExtractedText = !!file.textContent;
  const canPreview = isImage || isPdf || hasExtractedText;

  return (
    <Dialog open={!!file} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon(file.fileType)}
            {file.filename}
          </DialogTitle>
        </DialogHeader>
        <div className="w-full h-[70vh] overflow-hidden">
          {isImage ? (
            <div className="w-full h-full flex items-center justify-center bg-muted/20 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`/api/files/view?path=${encodeURIComponent(file.url)}`}
                alt={file.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={`/api/files/view?path=${encodeURIComponent(file.url)}`}
              className="w-full h-full border-0"
              title={file.filename}
            />
          ) : hasExtractedText ? (
            <div className="w-full h-full overflow-auto p-6 bg-white dark:bg-slate-900">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="mb-4 pb-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {getFileIcon(file.fileType)}
                    <span className="font-medium">{file.filename}</span>
                  </div>
                  <Badge variant="secondary">Contenu extrait</Badge>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {file.textContent}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
              <div className="p-6 bg-muted/30 rounded-full">
                {getFileIcon(file.fileType)}
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">{file.filename}</h3>
                <p className="text-muted-foreground">
                  L&apos;aperçu n&apos;est pas disponible pour ce type de fichier.
                </p>
              </div>
              <Button size="lg" onClick={() => downloadFile(file.url, file.filename)}>
                <Download className="h-5 w-5 mr-2" />
                Télécharger le fichier
              </Button>
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          {canPreview && (
            <Button variant="outline" onClick={() => downloadFile(file.url, file.filename)}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          )}
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

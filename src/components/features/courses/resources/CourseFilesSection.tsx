// Section fichiers uploadés

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Image,
  File,
  FileSpreadsheet,
  Presentation,
  Video,
  Music,
  ExternalLink,
  Download,
  Upload,
} from 'lucide-react';
import type { CourseFile } from './types';

// Icône colorée selon le type de fichier
function getCourseFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
      return <FileText className="h-6 w-6 text-red-500" />;
    case 'word':
      return <FileText className="h-6 w-6 text-blue-500" />;
    case 'excel':
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    case 'powerpoint':
      return <Presentation className="h-6 w-6 text-orange-500" />;
    case 'image':
      return <Image className="h-6 w-6 text-purple-500" />;
    case 'video':
      return <Video className="h-6 w-6 text-pink-500" />;
    case 'audio':
      return <Music className="h-6 w-6 text-yellow-500" />;
    default:
      return <File className="h-6 w-6 text-gray-500" />;
  }
}

interface CourseFilesSectionProps {
  files: CourseFile[];
}

export function CourseFilesSection({ files }: CourseFilesSectionProps) {
  const [expanded, setExpanded] = useState(true);

  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-5 w-5" />
          Fichiers uploadés ({files.length})
        </CardTitle>
        <CardDescription>
          Documents ajoutés lors de la création/modification du cours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start mb-2">
              {expanded ? (
                <ChevronDown className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-2" />
              )}
              {expanded ? 'Masquer' : 'Afficher'} les fichiers
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="shrink-0">{getCourseFileIcon(file.fileType)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {file.fileType}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" title="Ouvrir">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={file.url} download={file.filename} title="Télécharger">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

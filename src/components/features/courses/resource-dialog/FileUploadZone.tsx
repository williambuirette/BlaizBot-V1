// src/components/features/courses/resource-dialog/FileUploadZone.tsx
// Zone d'upload de fichier avec dropzone

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { isValidExtension, getInputAccept, extensionConfig } from './types';
import type { ResourceType } from './types';

interface UploadedFile {
  filename: string;
  url: string;
}

interface FileUploadZoneProps {
  selectedType: ResourceType;
  uploadedFile: UploadedFile | null;
  onUpload: (file: UploadedFile) => void;
  onRemove: () => void;
}

export function FileUploadZone({
  selectedType,
  uploadedFile,
  onUpload,
  onRemove,
}: FileUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file) return;

    // Manual extension validation
    if (!isValidExtension(file, selectedType)) {
      const ext = '.' + (file.name.toLowerCase().split('.').pop() || '');
      const allowed = extensionConfig[selectedType] || [];
      setUploadError(`Extension ${ext} non autorisée. Formats acceptés: ${allowed.join(', ')}`);
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }
      
      const data = await res.json();
      onUpload({ filename: data.filename, url: data.url });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }, [selectedType, onUpload]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    if (rejection) {
      const sizeError = rejection.errors.find(e => e.code === 'file-too-large');
      if (sizeError) {
        setUploadError('Fichier trop volumineux (max 10 MB)');
      }
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: uploading,
    noClick: false,
    noKeyboard: false,
    useFsAccessApi: false,
  });

  const inputProps = {
    ...getInputProps(),
    accept: getInputAccept(selectedType),
  };

  const getTypeLabel = () => {
    switch (selectedType) {
      case 'PDF': return 'PDF uniquement (max 10 Mo)';
      case 'DOCUMENT': return 'DOC, DOCX (max 10 Mo)';
      case 'EXCEL': return 'XLS, XLSX (max 10 Mo)';
      case 'POWERPOINT': return 'PPT, PPTX (max 10 Mo)';
      case 'IMAGE': return 'PNG, JPG, GIF, WebP (max 10 Mo)';
      default: return '';
    }
  };

  if (uploadedFile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{uploadedFile.filename}</p>
            <p className="text-xs text-muted-foreground truncate">{uploadedFile.url}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {uploadError && (
          <p className="text-sm text-destructive">{uploadError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...inputProps} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Upload en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm">
              {isDragActive ? 'Déposez le fichier ici' : 'Glissez un fichier ou cliquez pour sélectionner'}
            </p>
            <p className="text-xs text-muted-foreground">{getTypeLabel()}</p>
          </div>
        )}
      </div>
      {!uploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => openFileDialog()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Parcourir mes fichiers
        </Button>
      )}
      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}
    </div>
  );
}

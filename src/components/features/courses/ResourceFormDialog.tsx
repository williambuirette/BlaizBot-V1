// src/components/features/courses/ResourceFormDialog.tsx
// Dialog pour créer/éditer une ressource

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, Youtube, FileText, Image, File, Upload, X, Loader2, CheckCircle, Table, Presentation } from 'lucide-react';
import { useDropzone, FileRejection } from 'react-dropzone';

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

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
  onSubmit: (data: ResourceFormData) => void;
}

const resourceTypes = [
  { value: 'LINK', label: 'Lien externe', icon: Link, description: 'Site web, article' },
  { value: 'YOUTUBE', label: 'Vidéo YouTube', icon: Youtube, description: 'Tutoriel, cours' },
  { value: 'PDF', label: 'Document PDF', icon: FileText, description: 'Fiche, support' },
  { value: 'DOCUMENT', label: 'Document Word', icon: File, description: 'DOC, DOCX' },
  { value: 'EXCEL', label: 'Tableur Excel', icon: Table, description: 'XLS, XLSX' },
  { value: 'POWERPOINT', label: 'Présentation', icon: Presentation, description: 'PPT, PPTX' },
  { value: 'IMAGE', label: 'Image', icon: Image, description: 'Schéma, illustration' },
] as const;


export function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
  onSubmit,
}: ResourceFormDialogProps) {
  const [selectedType, setSelectedType] = useState<ResourceType>(resource?.type || 'LINK');
  const [uploadedFile, setUploadedFile] = useState<{ filename: string; url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    defaultValues: {
      type: 'LINK',
    },
  });

  // Valid extensions per type
  const extensionConfig: Record<string, string[]> = {
    'PDF': ['.pdf'],
    'DOCUMENT': ['.doc', '.docx'],
    'EXCEL': ['.xls', '.xlsx'],
    'POWERPOINT': ['.ppt', '.pptx', '.ppsx'],
    'IMAGE': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  };

  // Validate file by extension
  const isValidExtension = (file: File, type: string): boolean => {
    const ext = '.' + (file.name.toLowerCase().split('.').pop() || '');
    const allowed = extensionConfig[type] || [];
    return allowed.includes(ext);
  };

  // File upload handler - validates extension manually
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file) return;

    // Manual extension validation (MIME types unreliable on Windows)
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
      setUploadedFile({ filename: data.filename, url: data.url });
      setValue('fileUrl', data.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  }, [setValue, selectedType]);

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    if (rejection) {
      // Only show size errors, ignore MIME type errors (we validate by extension in onDrop)
      const sizeError = rejection.errors.find(e => e.code === 'file-too-large');
      if (sizeError) {
        setUploadError('Fichier trop volumineux (max 10 MB)');
      }
      console.error('File rejected:', rejection.file.name, rejection.errors);
    }
  }, []);

  // Get HTML accept attribute for file dialog filtering
  const getInputAccept = (): string => {
    const extensions = extensionConfig[selectedType] || [];
    return extensions.join(',');
  };
  
  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    onDropRejected,
    // NO accept prop and NO validator - avoid react-dropzone MIME validation entirely
    // We validate by extension manually in onDrop
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
    noClick: false,
    noKeyboard: false,
    useFsAccessApi: false, // Disable File System Access API (causes MIME type issues on Windows)
  });

  // Merge input props with custom accept attribute for file dialog filtering
  const inputProps = {
    ...getInputProps(),
    accept: getInputAccept(), // HTML native accept attribute for file dialog filter
  };

  // Check if URL or FileURL is needed based on type
  const needsUrl = selectedType === 'LINK' || selectedType === 'YOUTUBE';
  const needsFileUrl = selectedType === 'PDF' || selectedType === 'DOCUMENT' || selectedType === 'EXCEL' || selectedType === 'POWERPOINT' || selectedType === 'IMAGE';

  // Reset form when dialog opens or resource changes
  useEffect(() => {
    if (open) {
      const type = resource?.type || 'LINK';
      setSelectedType(type);
      const isFileType = type === 'PDF' || type === 'DOCUMENT' || type === 'EXCEL' || type === 'POWERPOINT' || type === 'IMAGE';
      setUploadedFile(isFileType && resource?.fileUrl ? { filename: 'Fichier existant', url: resource.fileUrl } : null);
      setUploadError(null);
      reset({
        title: resource?.title || '',
        description: resource?.description || '',
        type: type,
        url: resource?.url || '',
        fileUrl: resource?.fileUrl || '',
      });
    }
  }, [open, resource, reset]);

  // Reset uploaded file when type changes to non-file type
  useEffect(() => {
    if (!needsFileUrl) {
      setUploadedFile(null);
      setUploadError(null);
    }
  }, [needsFileUrl]);

  const handleFormSubmit = (data: ResourceFormData) => {
    onSubmit({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      type: data.type,
      url: data.url?.trim() || undefined,
      fileUrl: data.fileUrl?.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {resource ? 'Modifier la ressource' : 'Nouvelle ressource'}
          </DialogTitle>
          <DialogDescription>
            {resource ? 'Modifiez les informations de la ressource.' : 'Ajoutez une nouvelle ressource à votre cours.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Ex: Documentation officielle React"
              {...register('title', { required: 'Le titre est requis' })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type de ressource *</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={(value: ResourceType) => {
                    field.onChange(value);
                    setSelectedType(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                          <span className="text-muted-foreground text-xs">
                            — {type.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* URL field for LINK and YOUTUBE */}
          {needsUrl && (
            <div className="space-y-2">
              <Label htmlFor="url">
                {selectedType === 'YOUTUBE' ? 'URL YouTube *' : 'URL *'}
              </Label>
              <Input
                id="url"
                type="url"
                placeholder={
                  selectedType === 'YOUTUBE'
                    ? 'https://www.youtube.com/watch?v=...'
                    : 'https://example.com/article'
                }
                {...register('url', {
                  required: needsUrl ? 'L\'URL est requise' : false,
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'URL invalide (doit commencer par http:// ou https://)',
                  },
                })}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
              {selectedType === 'YOUTUBE' && (
                <p className="text-xs text-muted-foreground">
                  Formats acceptés : youtube.com/watch?v=... ou youtu.be/...
                </p>
              )}
            </div>
          )}

          {/* FileURL field for PDF, DOCUMENT and IMAGE */}
          {needsFileUrl && (
            <div className="space-y-2">
              <Label>Fichier *</Label>
              
              {/* Upload zone */}
              {!uploadedFile ? (
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
                        <p className="text-xs text-muted-foreground">
                          {selectedType === 'PDF' && 'PDF uniquement (max 10 Mo)'}
                          {selectedType === 'DOCUMENT' && 'DOC, DOCX (max 10 Mo)'}
                          {selectedType === 'EXCEL' && 'XLS, XLSX (max 10 Mo)'}
                          {selectedType === 'POWERPOINT' && 'PPT, PPTX (max 10 Mo)'}
                          {selectedType === 'IMAGE' && 'PNG, JPG, GIF, WebP (max 10 Mo)'}
                        </p>
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
                </div>
              ) : (
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
                    onClick={() => {
                      setUploadedFile(null);
                      setValue('fileUrl', '');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}
              
              {errors.fileUrl && !uploadedFile && (
                <p className="text-sm text-destructive">Un fichier est requis</p>
              )}

              {/* Hidden input for form validation */}
              <input
                type="hidden"
                {...register('fileUrl', {
                  required: needsFileUrl ? 'Un fichier est requis' : false,
                })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description optionnelle de la ressource..."
              rows={2}
              {...register('description')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {resource ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

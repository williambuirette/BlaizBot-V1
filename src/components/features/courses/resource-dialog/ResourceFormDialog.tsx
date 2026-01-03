// src/components/features/courses/resource-dialog/ResourceFormDialog.tsx
// Dialog pour créer/éditer une ressource

'use client';

import { useEffect, useState } from 'react';
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
import { FileUploadZone } from './FileUploadZone';
import { 
  resourceTypes, 
  needsUrl, 
  needsFileUrl as checkNeedsFileUrl 
} from './types';
import type { Resource, ResourceFormData, ResourceType } from './types';

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: Resource | null;
  onSubmit: (data: ResourceFormData) => void;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  resource,
  onSubmit,
}: ResourceFormDialogProps) {
  const [selectedType, setSelectedType] = useState<ResourceType>(resource?.type || 'LINK');
  const [uploadedFile, setUploadedFile] = useState<{ filename: string; url: string } | null>(null);
  
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

  const requiresUrl = needsUrl(selectedType);
  const requiresFileUrl = checkNeedsFileUrl(selectedType);

  // Reset form when dialog opens or resource changes
  // Using a separate effect to avoid the react-hooks/set-state-in-effect warning
  // This is intentional: we need to reset local state when the dialog opens
  useEffect(() => {
    if (!open) return;
    
    const type = resource?.type || 'LINK';
    const isFileType = checkNeedsFileUrl(type);
    const newUploadedFile = isFileType && resource?.fileUrl 
      ? { filename: 'Fichier existant', url: resource.fileUrl } 
      : null;
    
    // Use timeout to batch state updates
    const timer = setTimeout(() => {
      setSelectedType(type);
      setUploadedFile(newUploadedFile);
    }, 0);
    
    reset({
      title: resource?.title || '',
      description: resource?.description || '',
      type: type,
      url: resource?.url || '',
      fileUrl: resource?.fileUrl || '',
    });
    
    return () => clearTimeout(timer);
  }, [open, resource, reset]);

  // Handle type change - reset uploaded file when switching to non-file type
  const handleTypeChange = (value: ResourceType) => {
    setSelectedType(value);
    if (!checkNeedsFileUrl(value)) {
      setUploadedFile(null);
    }
  };

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
          {/* Title */}
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

          {/* Type */}
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
                    handleTypeChange(value);
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

          {/* URL field */}
          {requiresUrl && (
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
                  required: requiresUrl ? 'L\'URL est requise' : false,
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

          {/* File upload */}
          {requiresFileUrl && (
            <div className="space-y-2">
              <Label>Fichier *</Label>
              <FileUploadZone
                selectedType={selectedType}
                uploadedFile={uploadedFile}
                onUpload={(file) => {
                  setUploadedFile(file);
                  setValue('fileUrl', file.url);
                }}
                onRemove={() => {
                  setUploadedFile(null);
                  setValue('fileUrl', '');
                }}
              />
              {errors.fileUrl && !uploadedFile && (
                <p className="text-sm text-destructive">Un fichier est requis</p>
              )}
              <input
                type="hidden"
                {...register('fileUrl', {
                  required: requiresFileUrl ? 'Un fichier est requis' : false,
                })}
              />
            </div>
          )}

          {/* Description */}
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

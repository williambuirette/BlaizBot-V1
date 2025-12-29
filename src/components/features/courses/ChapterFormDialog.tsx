// src/components/features/courses/ChapterFormDialog.tsx
// Dialog pour créer/éditer un chapitre

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Chapter {
  id: string;
  title: string;
  description: string | null;
}

interface ChapterFormData {
  title: string;
  description?: string;
}

interface ChapterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter: Chapter | null;
  onSubmit: (data: ChapterFormData) => void;
}

export function ChapterFormDialog({
  open,
  onOpenChange,
  chapter,
  onSubmit,
}: ChapterFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChapterFormData>();

  // Reset form when dialog opens or chapter changes
  useEffect(() => {
    if (open) {
      reset({
        title: chapter?.title || '',
        description: chapter?.description || '',
      });
    }
  }, [open, chapter, reset]);

  const handleFormSubmit = (data: ChapterFormData) => {
    onSubmit({
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {chapter ? 'Modifier le chapitre' : 'Nouveau chapitre'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Ex: Introduction aux concepts de base"
              {...register('title', { required: 'Le titre est requis' })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description optionnelle du chapitre..."
              rows={3}
              {...register('description')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {chapter ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

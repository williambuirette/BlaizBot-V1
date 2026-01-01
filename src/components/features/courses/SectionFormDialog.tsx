// src/components/features/courses/SectionFormDialog.tsx
// Dialog pour créer/éditer une section

'use client';

import { useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Video, FileQuestion, PenTool } from 'lucide-react';

type SectionType = 'LESSON' | 'EXERCISE' | 'QUIZ' | 'VIDEO';

interface Section {
  id: string;
  title: string;
  type: SectionType;
  duration: number | null;
}

interface SectionFormData {
  title: string;
  type: SectionType;
  duration?: number;
}

interface SectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: Section | null;
  onSubmit: (data: SectionFormData) => void;
}

const sectionTypes = [
  { value: 'LESSON', label: 'Leçon', icon: BookOpen, description: 'Contenu pédagogique' },
  { value: 'VIDEO', label: 'Vidéo', icon: Video, description: 'Vidéo explicative' },
  { value: 'EXERCISE', label: 'Exercice', icon: PenTool, description: 'Exercice pratique' },
  { value: 'QUIZ', label: 'Quiz', icon: FileQuestion, description: 'Questions à choix' },
] as const;

export function SectionFormDialog({
  open,
  onOpenChange,
  section,
  onSubmit,
}: SectionFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SectionFormData>({
    defaultValues: {
      type: 'LESSON',
    },
  });

  // Reset form when dialog opens or section changes
  useEffect(() => {
    if (open) {
      reset({
        title: section?.title || '',
        type: section?.type || 'LESSON',
        duration: section?.duration || undefined,
      });
    }
  }, [open, section, reset]);

  const handleFormSubmit = (data: SectionFormData) => {
    onSubmit({
      title: data.title.trim(),
      type: data.type,
      duration: data.duration ? Number(data.duration) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {section ? 'Modifier la section' : 'Nouvelle section'}
          </DialogTitle>
          <DialogDescription>
            {section 
              ? 'Modifiez les informations de cette section.'
              : 'Créez une nouvelle section pour ce chapitre.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              placeholder="Ex: Présentation du concept"
              {...register('title', { required: 'Le titre est requis' })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type de section *</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map((type) => (
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

          <div className="space-y-2">
            <Label htmlFor="duration">Durée estimée (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={300}
              placeholder="Ex: 15"
              {...register('duration', {
                valueAsNumber: true,
                min: { value: 1, message: 'Minimum 1 minute' },
                max: { value: 300, message: 'Maximum 300 minutes' },
              })}
            />
            {errors.duration && (
              <p className="text-sm text-destructive">{errors.duration.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {section ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

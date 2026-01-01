'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { CourseData } from './CoursesTable';

interface Subject {
  id: string;
  name: string;
}

interface CourseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: CourseData | null; // null = mode création
  subjects: Subject[];
  onSubmit: (data: { title: string; description: string; subjectId: string }) => Promise<void>;
}

export function CourseFormModal({
  open,
  onOpenChange,
  course,
  subjects,
  onSubmit,
}: CourseFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!course;

  // Pré-remplir en mode édition
  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description || '');
      setSubjectId(course.subjectId || '');
    } else {
      setTitle('');
      setDescription('');
      setSubjectId('');
    }
    setError('');
  }, [course, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }
    if (!subjectId) {
      setError('La matière est requise');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), subjectId });
      onOpenChange(false);
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier le cours' : 'Nouveau cours'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Modifiez les informations du cours.'
              : 'Créez un nouveau cours pour vos élèves.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Les fractions"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du cours (optionnel)"
              disabled={loading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Matière *</Label>
            <Select value={subjectId} onValueChange={setSubjectId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une matière" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : isEditMode ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

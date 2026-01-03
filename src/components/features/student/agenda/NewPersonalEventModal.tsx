// src/components/features/student/agenda/NewPersonalEventModal.tsx
// Modal de création/édition d'événement personnel

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import type { AgendaItem } from '@/app/(dashboard)/student/agenda/page';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingEvent?: AgendaItem | null;
}

export function NewPersonalEventModal({
  open,
  onOpenChange,
  onSuccess,
  editingEvent,
}: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');

  const isEditing = !!editingEvent;

  // Pré-remplir en mode édition
  useEffect(() => {
    if (editingEvent && open) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      const start = new Date(editingEvent.startDate);
      const end = new Date(editingEvent.endDate);
      setStartDate(start.toISOString().split('T')[0] ?? '');
      setStartTime(start.toTimeString().slice(0, 5) || '09:00');
      setEndDate(end.toISOString().split('T')[0] ?? '');
      setEndTime(end.toTimeString().slice(0, 5) || '10:00');
    } else if (!open) {
      // Reset
      setTitle('');
      setDescription('');
      setStartDate('');
      setStartTime('09:00');
      setEndDate('');
      setEndTime('10:00');
    }
  }, [editingEvent, open]);

  const handleSubmit = async () => {
    if (!title.trim() || !startDate || !endDate) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      const url = isEditing
        ? `/api/student/agenda/events/${editingEvent.id}`
        : '/api/student/agenda/events';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        toast({ title: isEditing ? 'Objectif modifié' : 'Objectif créé' });
        onSuccess();
      } else {
        const json = await response.json();
        throw new Error(json.error || 'Erreur');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: String(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/student/agenda/events/${editingEvent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Objectif supprimé' });
        onSuccess();
      }
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier l'objectif" : 'Nouvel objectif personnel'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réviser les fractions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes supplémentaires..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date début *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure début</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date fin *</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure fin</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {isEditing && (
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Supprimer
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

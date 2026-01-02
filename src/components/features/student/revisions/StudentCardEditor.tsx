/**
 * Éditeur de carte de révision étudiant (modal)
 */

'use client';

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentCardData } from './StudentCardExpanded';

interface StudentCardEditorProps {
  chapterId: string;
  card?: StudentCardData;
  onSave: (card: StudentCardData) => void;
  onCancel: () => void;
}

// Types alignés sur le professeur + NOTE spécifique élève
const cardTypes = [
  { value: 'NOTE', label: '📝 Note' },
  { value: 'LESSON', label: '📖 Leçon' },
  { value: 'VIDEO', label: '🎬 Vidéo' },
  { value: 'EXERCISE', label: '✏️ Exercice' },
  { value: 'QUIZ', label: '❓ Quiz' },
];

export function StudentCardEditor({ chapterId, card, onSave, onCancel }: StudentCardEditorProps) {
  const isEditing = !!card;
  const [title, setTitle] = useState(card?.title ?? '');
  const [content, setContent] = useState(card?.content ?? '');
  const [cardType, setCardType] = useState<StudentCardData['cardType']>(card?.cardType ?? 'NOTE');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);

    try {
      let savedCard: StudentCardData;
      
      if (isEditing) {
        // Mise à jour
        const res = await fetch(`/api/student/cards/${card.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, cardType }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        savedCard = data.data;
      } else {
        // Création
        const res = await fetch('/api/student/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapterId,
            title,
            content,
            cardType,
          }),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        savedCard = data.data;
      }
      
      if (savedCard) {
        onSave(savedCard);
      }
    } catch (error) {
      console.error('Erreur sauvegarde carte:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier la carte' : 'Nouvelle carte'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la carte..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={cardType} onValueChange={(v) => setCardType(v as StudentCardData['cardType'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cardTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écrivez vos notes ici..."
              rows={8}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

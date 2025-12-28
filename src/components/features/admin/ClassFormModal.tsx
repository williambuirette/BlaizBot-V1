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
import { ClassRow } from '@/types/admin';

interface ClassFormModalProps {
  open: boolean;
  onClose: () => void;
  classItem?: ClassRow | null;
  onSuccess: () => void;
}

const LEVELS = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale'];

export function ClassFormModal({ open, onClose, classItem, onSuccess }: ClassFormModalProps) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!classItem;

  useEffect(() => {
    if (classItem) {
      setName(classItem.name);
      setLevel(classItem.level);
    } else {
      setName('');
      setLevel('');
    }
    setError('');
  }, [classItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = isEdit ? `/api/admin/classes/${classItem?.id}` : '/api/admin/classes';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, level }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue');
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier la classe' : 'Nouvelle classe'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="name">Nom de la classe</Label>
            <Input
              id="name"
              placeholder="ex: 6ème A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Niveau</Label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Sélectionner un niveau</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'En cours...' : isEdit ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

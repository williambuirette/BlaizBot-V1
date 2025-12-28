'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { SubjectsTable, SubjectRow } from '@/components/features/admin/SubjectsTable';
import { SubjectFormModal } from '@/components/features/admin/SubjectFormModal';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectRow | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleEdit = (subject: SubjectRow) => {
    setSelectedSubject(subject);
    setModalOpen(true);
  };

  const handleDelete = async (subject: SubjectRow) => {
    if (!confirm(`Supprimer la matière ${subject.name} ?`)) return;

    try {
      const res = await fetch(`/api/admin/subjects/${subject.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        toast.success('Matière supprimée');
        fetchSubjects();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur de connexion');
    }
  };

  const handleCreate = () => {
    setSelectedSubject(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    toast.success(selectedSubject ? 'Matière modifiée' : 'Matière créée');
    fetchSubjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des matières</h1>
          <p className="text-muted-foreground">
            {subjects.length} matière{subjects.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : (
        <SubjectsTable subjects={subjects} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <SubjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        subject={selectedSubject}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

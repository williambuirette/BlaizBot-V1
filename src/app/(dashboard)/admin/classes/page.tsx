'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ClassesTable, ClassRow } from '@/components/features/admin/ClassesTable';
import { ClassFormModal } from '@/components/features/admin/ClassFormModal';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/classes');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleEdit = (classItem: ClassRow) => {
    setSelectedClass(classItem);
    setModalOpen(true);
  };

  const handleDelete = async (classItem: ClassRow) => {
    if (!confirm(`Supprimer la classe ${classItem.name} ?`)) return;

    try {
      const res = await fetch(`/api/admin/classes/${classItem.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        toast.success('Classe supprimée');
        fetchClasses();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur de connexion');
    }
  };

  const handleCreate = () => {
    setSelectedClass(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    toast.success(selectedClass ? 'Classe modifiée' : 'Classe créée');
    fetchClasses();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des classes</h1>
          <p className="text-muted-foreground">
            {classes.length} classe{classes.length > 1 ? 's' : ''}
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
        <ClassesTable classes={classes} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <ClassFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classItem={selectedClass}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

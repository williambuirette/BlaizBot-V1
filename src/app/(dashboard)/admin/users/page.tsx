'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { UsersTable, UserRow } from '@/components/features/admin/UsersTable';
import { UserFormModal } from '@/components/features/admin/UserFormModal';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: UserRow) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (user: UserRow) => {
    if (!confirm(`Supprimer ${user.firstName} ${user.lastName} ?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        toast.success('Utilisateur supprimé');
        fetchUsers();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch {
      toast.error('Erreur de connexion');
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    toast.success(selectedUser ? 'Utilisateur modifié' : 'Utilisateur créé');
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? 's' : ''}
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
        <UsersTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

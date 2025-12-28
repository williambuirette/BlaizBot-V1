'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserRow, Role } from '@/types/admin';

interface UseUserFormProps {
  user?: UserRow | null;
  onSuccess: () => void;
  onClose: () => void;
}

interface UseUserFormReturn {
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  role: Role;
  setRole: (value: Role) => void;
  loading: boolean;
  error: string;
  isEdit: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useUserForm({ user, onSuccess, onClose }: UseUserFormProps): UseUserFormReturn {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!user;

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email);
      setRole(user.role);
      setPassword('');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('STUDENT');
    }
    setError('');
  }, [user]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: Record<string, string> = { firstName, lastName, email, role };

      if (!isEdit && !password) {
        setError('Le mot de passe est requis');
        setLoading(false);
        return;
      }
      if (password) {
        payload.password = password;
      }

      const url = isEdit ? `/api/admin/users/${user?.id}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
  }, [firstName, lastName, email, password, role, isEdit, user?.id, onSuccess, onClose]);

  return {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    role, setRole,
    loading, error, isEdit,
    handleSubmit,
  };
}

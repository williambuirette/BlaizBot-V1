# 📄 Code & Templates — Phase 6 (Partie 2)

> Suite du code pour la Phase 6 (Admin Dashboard).
> **Précédent** : [phase-06-code.md](phase-06-code.md)
> **Suite** : [phase-06-code-fin.md](phase-06-code-fin.md)

---

## 5. UserFormModal Component

```tsx
// src/components/features/admin/UserFormModal.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess: () => void;
}

const userSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
});

type UserFormData = z.infer<typeof userSchema>;

export function UserFormModal({ open, onClose, user, onSuccess }: UserFormModalProps) {
  const isEdit = !!user;
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'STUDENT' },
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('password', '');
    } else {
      reset();
    }
  }, [user, setValue, reset]);

  const onSubmit = async (data: UserFormData) => {
    const url = isEdit ? `/api/admin/users/${user.id}` : '/api/admin/users';
    const method = isEdit ? 'PUT' : 'POST';
    const body = { ...data };
    if (isEdit && !body.password) delete body.password;

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) { onSuccess(); onClose(); reset(); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe {isEdit && '(optionnel)'}</Label>
            <Input id="password" type="password" {...register('password')} />
          </div>
          <div className="space-y-2">
            <Label>Rôle</Label>
            <Select onValueChange={(v) => setValue('role', v as User['role'])} defaultValue={user?.role || 'STUDENT'}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="TEACHER">Professeur</SelectItem>
                <SelectItem value="STUDENT">Élève</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 6. Admin Users Page

```tsx
// src/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UsersTable } from '@/components/features/admin/UsersTable';
import { UserFormModal } from '@/components/features/admin/UserFormModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user: User) => { setSelectedUser(user); setModalOpen(true); };
  const handleDelete = async (user: User) => {
    if (!confirm(`Supprimer ${user.name} ?`)) return;
    await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    fetchUsers();
  };
  const handleAdd = () => { setSelectedUser(null); setModalOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <Button onClick={handleAdd}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
      </div>
      <UsersTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
      <UserFormModal open={modalOpen} onClose={() => setModalOpen(false)} user={selectedUser} onSuccess={fetchUsers} />
    </div>
  );
}
```

---

## 7. API Classes

```typescript
// src/app/api/admin/classes/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const classSchema = z.object({
  name: z.string().min(2),
  level: z.string().min(1),
  year: z.number().int().min(2020).max(2030),
});

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(classes);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = classSchema.parse(body);
    const newClass = await prisma.class.create({ data });
    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 8. API Subjects

```typescript
// src/app/api/admin/subjects/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const subjectSchema = z.object({
  name: z.string().min(2),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format hex invalide'),
});

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

export async function GET() {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(subjects);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = subjectSchema.parse(body);
    const existing = await prisma.subject.findUnique({ where: { name: data.name } });
    if (existing) return NextResponse.json({ error: 'Matière existe déjà' }, { status: 400 });
    const subject = await prisma.subject.create({ data });
    return NextResponse.json(subject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

> **Suite** : [phase-06-code-fin.md](phase-06-code-fin.md) (Assignments, Dashboard)

---

*Dernière MAJ : 2025-12-22*

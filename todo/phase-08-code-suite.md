# 📄 Code & Templates — Phase 8 (Partie 2)

> Suite du code source pour la Phase 8 (Interface Élève).
> **Précédent** : [phase-08-code.md](phase-08-code.md)

---

## 6. API /api/student/progress

```typescript
// src/app/api/student/progress/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const progressSchema = z.object({
  courseId: z.string().cuid(),
  percentage: z.number().min(0).max(100),
  completed: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = progressSchema.parse(body);

    const progress = await prisma.progress.upsert({
      where: {
        userId_courseId: { userId: session.user.id, courseId: data.courseId },
      },
      update: { percentage: data.percentage, completed: data.completed ?? false },
      create: {
        userId: session.user.id,
        courseId: data.courseId,
        percentage: data.percentage,
        completed: data.completed ?? false,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 7. RevisionCard Component

```tsx
// src/components/features/student/RevisionCard.tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RevisionCardProps {
  revision: {
    id: string;
    title: string;
    subject: { name: string; color: string };
    createdAt: string;
  };
  onView: (id: string) => void;
}

export function RevisionCard({ revision, onView }: RevisionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg line-clamp-1">{revision.title}</CardTitle>
          <Badge style={{ backgroundColor: revision.subject.color }} className="text-white">
            {revision.subject.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {formatDistanceToNow(new Date(revision.createdAt), { addSuffix: true, locale: fr })}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onView(revision.id)} variant="outline" className="w-full">
          Voir la fiche
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 8. API /api/student/agenda

```typescript
// src/app/api/student/agenda/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));

  // Dates du mois
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Récupérer l'enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id },
  });

  if (!enrollment) {
    return NextResponse.json([]);
  }

  // Événements de la classe
  const events = await prisma.event.findMany({
    where: {
      classId: enrollment.classId,
      startDate: { gte: startDate, lte: endDate },
    },
    orderBy: { startDate: 'asc' },
  });

  return NextResponse.json(events);
}
```

---

## 9. PasswordChangeForm Component

```tsx
// src/components/features/student/PasswordChangeForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

export function PasswordChangeForm() {
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirm) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPwd.length < 8) {
      toast.error('Le mot de passe doit faire au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: newPwd }),
      });
      if (!res.ok) throw new Error('Erreur');
      toast.success('Mot de passe modifié');
      setCurrent('');
      setNewPwd('');
      setConfirm('');
    } catch {
      toast.error('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Modifier le mot de passe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Mot de passe actuel</Label>
            <Input id="current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">Nouveau mot de passe</Label>
            <Input id="new" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmer le nouveau</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Modification...' : 'Modifier le mot de passe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

## 10. Dashboard Student Page

```tsx
// src/app/(dashboard)/student/page.tsx
import { BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import { StatsCard } from '@/components/features/admin/StatsCard';
import { UpcomingLessons } from '@/components/features/student/UpcomingLessons';
import { RecentCourses } from '@/components/features/student/RecentCourses';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getStudentStats(userId: string) {
  const enrollment = await prisma.enrollment.findFirst({ where: { userId } });
  if (!enrollment) return { coursesCount: 0, progressAvg: 0, quizCount: 0 };

  const [coursesCount, progress, quizCount] = await Promise.all([
    prisma.course.count({
      where: { teacher: { teacherAssignments: { some: { classId: enrollment.classId } } } },
    }),
    prisma.progress.aggregate({ where: { userId }, _avg: { percentage: true } }),
    prisma.quizAttempt.count({ where: { userId, completed: true } }),
  ]);

  return { coursesCount, progressAvg: Math.round(progress._avg?.percentage ?? 0), quizCount };
}

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const stats = await getStudentStats(session.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mon tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Mes cours" value={stats.coursesCount} icon={BookOpen} iconColor="text-blue-600" />
        <StatsCard title="Progression" value={`${stats.progressAvg}%`} icon={TrendingUp} iconColor="text-green-600" />
        <StatsCard title="Quiz faits" value={stats.quizCount} icon={CheckCircle} iconColor="text-purple-600" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingLessons />
        <RecentCourses />
      </div>
    </div>
  );
}
```

---

> **Retour** : [phase-08-student.md](phase-08-student.md)

---

*Dernière MAJ : 2025-12-22*

# 📄 Code & Templates — Phase 6 (Partie 3)

> Fin du code pour la Phase 6 (Admin Dashboard).
> **Précédent** : [phase-06-code-suite.md](phase-06-code-suite.md)

---

## 9. API Assignments

```typescript
// src/app/api/admin/assignments/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const assignmentSchema = z.object({
  userId: z.string().cuid(),
  classId: z.string().cuid(),
  subjectId: z.string().cuid(),
});

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const assignments = await prisma.teacherAssignment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      class: { select: { id: true, name: true, level: true } },
      subject: { select: { id: true, name: true, color: true } },
    },
    orderBy: { class: { name: 'asc' } },
  });
  
  return NextResponse.json(assignments);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const data = assignmentSchema.parse(body);
    
    // Vérifier que c'est un TEACHER
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Doit être professeur' }, { status: 400 });
    }
    
    // Vérifier unicité
    const existing = await prisma.teacherAssignment.findFirst({
      where: { userId: data.userId, classId: data.classId, subjectId: data.subjectId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Affectation existe déjà' }, { status: 400 });
    }
    
    const assignment = await prisma.teacherAssignment.create({
      data,
      include: {
        user: { select: { name: true } },
        class: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });
    
    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 10. API Assignments [id]

```typescript
// src/app/api/admin/assignments/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  await prisma.teacherAssignment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

---

## 11. Color Picker Component

```tsx
// src/components/features/admin/ColorPicker.tsx
'use client';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const presets = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      {presets.map((color) => (
        <button
          key={color}
          type="button"
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            value === color ? 'border-foreground scale-110' : 'border-transparent'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border"
      />
    </div>
  );
}
```

---

## 12. Dashboard Admin Page

```tsx
// src/app/admin/page.tsx
import { Users, GraduationCap, BookOpen, FileText } from 'lucide-react';
import { StatsCard } from '@/components/features/admin/StatsCard';
import { prisma } from '@/lib/prisma';

async function getStats() {
  const [users, classes, subjects, courses] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.course.count(),
  ]);
  return { users, classes, subjects, courses };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord Admin</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Utilisateurs" 
          value={stats.users} 
          icon={Users} 
          iconColor="text-blue-600" 
        />
        <StatsCard 
          title="Classes" 
          value={stats.classes} 
          icon={GraduationCap} 
          iconColor="text-purple-600" 
        />
        <StatsCard 
          title="Matières" 
          value={stats.subjects} 
          icon={BookOpen} 
          iconColor="text-amber-600" 
        />
        <StatsCard 
          title="Cours" 
          value={stats.courses} 
          icon={FileText} 
          iconColor="text-green-600" 
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg bg-muted/50">
          <h3 className="font-medium mb-2">Activité récente</h3>
          <p className="text-sm text-muted-foreground">Coming soon...</p>
        </div>
        <div className="p-6 border rounded-lg bg-muted/50">
          <h3 className="font-medium mb-2">Raccourcis</h3>
          <p className="text-sm text-muted-foreground">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 13. API Enrollments

```typescript
// src/app/api/admin/enrollments/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const enrollmentSchema = z.object({
  userId: z.string().cuid(),
  classId: z.string().cuid(),
});

async function checkAdmin() {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

export async function GET(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');
  
  const where = classId ? { classId } : {};
  
  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      class: { select: { id: true, name: true, level: true } },
    },
    orderBy: { user: { name: 'asc' } },
  });
  
  return NextResponse.json(enrollments);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    const data = enrollmentSchema.parse(body);
    
    // Vérifier que c'est un STUDENT
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Doit être élève' }, { status: 400 });
    }
    
    // Vérifier unicité
    const existing = await prisma.enrollment.findFirst({
      where: { userId: data.userId, classId: data.classId },
    });
    if (existing) {
      return NextResponse.json({ error: 'Inscription existe déjà' }, { status: 400 });
    }
    
    const enrollment = await prisma.enrollment.create({
      data,
      include: {
        user: { select: { name: true } },
        class: { select: { name: true } },
      },
    });
    
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 14. API Stats

```typescript
// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [users, classes, subjects, courses] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.course.count(),
  ]);

  return NextResponse.json({ users, classes, subjects, courses });
}
```

---

*Dernière MAJ : 2025-12-22*

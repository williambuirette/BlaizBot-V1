# 📄 Code & Templates — Phase 7 (Partie 1)

> Code source pour la Phase 7 (Interface Professeur).
> **Utilisé par** : [phase-07-teacher.md](phase-07-teacher.md)
> **Suite** : [phase-07-code-suite.md](phase-07-code-suite.md)

---

## 1. API /api/teacher/stats

```typescript
// src/app/api/teacher/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const [classesCount, coursesCount, unreadMessages] = await Promise.all([
    prisma.teacherAssignment.count({ where: { userId } }),
    prisma.course.count({ where: { teacherId: userId } }),
    prisma.message.count({ where: { receiverId: userId, read: false } }),
  ]);

  return NextResponse.json({ classesCount, coursesCount, unreadMessages });
}
```

---

## 2. TeacherClassCard Component

```tsx
// src/components/features/teacher/TeacherClassCard.tsx
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface TeacherClassCardProps {
  classData: {
    id: string;
    className: string;
    level: string;
    subject: string;
    subjectColor: string;
    studentsCount: number;
  };
}

export function TeacherClassCard({ classData }: TeacherClassCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{classData.className}</CardTitle>
          <Badge style={{ backgroundColor: classData.subjectColor }} className="text-white">
            {classData.subject}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{classData.level}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{classData.studentsCount} élèves</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/teacher/classes/${classData.id}`}>Voir la classe</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 3. API /api/teacher/classes

```typescript
// src/app/api/teacher/classes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const assignments = await prisma.teacherAssignment.findMany({
    where: { userId: session.user.id },
    include: {
      class: { include: { enrollments: { select: { id: true } } } },
      subject: true,
    },
  });

  const classes = assignments.map((a) => ({
    id: a.class.id,
    className: a.class.name,
    level: a.class.level,
    subject: a.subject.name,
    subjectColor: a.subject.color,
    studentsCount: a.class.enrollments.length,
  }));

  return NextResponse.json(classes);
}
```

---

## 4. API /api/teacher/courses

```typescript
// src/app/api/teacher/courses/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const courseSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  subjectId: z.string().cuid(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const courses = await prisma.course.findMany({
    where: { teacherId: session.user.id },
    include: { subject: true, chapters: { select: { id: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = courseSchema.parse(body);

    // Vérifier que le prof enseigne cette matière
    const assignment = await prisma.teacherAssignment.findFirst({
      where: { userId: session.user.id, subjectId: data.subjectId },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Non autorisé pour cette matière' }, { status: 403 });
    }

    const course = await prisma.course.create({
      data: { ...data, teacherId: session.user.id },
      include: { subject: true },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 5. Dashboard Teacher Page

```tsx
// src/app/teacher/page.tsx
import { GraduationCap, FileText, Mail } from 'lucide-react';
import { StatsCard } from '@/components/features/admin/StatsCard';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function getTeacherStats(userId: string) {
  const [classesCount, coursesCount, unreadMessages] = await Promise.all([
    prisma.teacherAssignment.count({ where: { userId } }),
    prisma.course.count({ where: { teacherId: userId } }),
    prisma.message.count({ where: { receiverId: userId, read: false } }),
  ]);
  return { classesCount, coursesCount, unreadMessages };
}

export default async function TeacherDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const stats = await getTeacherStats(session.user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Mes classes" value={stats.classesCount} icon={GraduationCap} iconColor="text-purple-600" />
        <StatsCard title="Mes cours" value={stats.coursesCount} icon={FileText} iconColor="text-blue-600" />
        <StatsCard title="Messages" value={stats.unreadMessages} icon={Mail} iconColor="text-amber-600" />
      </div>
    </div>
  );
}
```

---

> **Suite** : [phase-07-code-suite.md](phase-07-code-suite.md) (CoursesTable, Messagerie)

---

*Dernière MAJ : 2025-12-22*

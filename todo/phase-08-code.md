# 📄 Code & Templates — Phase 8 (Partie 1)

> Code source pour la Phase 8 (Interface Élève).
> **Utilisé par** : [phase-08-student.md](phase-08-student.md)
> **Suite** : [phase-08-code-suite.md](phase-08-code-suite.md)

---

## 1. API /api/student/stats

```typescript
// src/app/api/student/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Récupérer l'enrollment de l'élève
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId },
    include: { class: true },
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'Pas inscrit dans une classe' }, { status: 404 });
  }

  // Compter les cours accessibles via la classe
  const coursesCount = await prisma.course.count({
    where: {
      teacher: {
        teacherAssignments: { some: { classId: enrollment.classId } },
      },
    },
  });

  // Calculer la progression moyenne
  const progress = await prisma.progress.aggregate({
    where: { userId },
    _avg: { percentage: true },
  });

  // Compter les quiz complétés
  const quizCount = await prisma.quizAttempt.count({
    where: { userId, completed: true },
  });

  return NextResponse.json({
    coursesCount,
    progressAvg: Math.round(progress._avg?.percentage ?? 0),
    quizCount,
  });
}
```

---

## 2. StudentCourseCard Component

```tsx
// src/components/features/student/StudentCourseCard.tsx
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StudentCourseCardProps {
  course: {
    id: string;
    title: string;
    subject: { name: string; color: string };
    teacher: { firstName: string; lastName: string };
    progress: number; // 0-100
  };
}

export function StudentCourseCard({ course }: StudentCourseCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
          <Badge style={{ backgroundColor: course.subject.color }} className="text-white">
            {course.subject.name}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {course.teacher.firstName} {course.teacher.lastName}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progression</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/student/courses/${course.id}`}>Voir le cours</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 3. API /api/student/courses

```typescript
// src/app/api/student/courses/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id },
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'Pas inscrit' }, { status: 404 });
  }

  // Cours accessibles via les profs de la classe
  const courses = await prisma.course.findMany({
    where: {
      teacher: {
        teacherAssignments: { some: { classId: enrollment.classId } },
      },
    },
    include: {
      subject: true,
      teacher: { select: { firstName: true, lastName: true } },
      progress: { where: { userId: session.user.id }, select: { percentage: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = courses.map((c) => ({
    id: c.id,
    title: c.title,
    subject: { name: c.subject.name, color: c.subject.color },
    teacher: c.teacher,
    progress: c.progress[0]?.percentage ?? 0,
  }));

  return NextResponse.json(formatted);
}
```

---

## 4. CourseContentViewer Component

```tsx
// src/components/features/student/CourseContentViewer.tsx
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CourseContentViewerProps {
  course: {
    title: string;
    content: string;
    subject: { name: string; color: string };
    teacher: { firstName: string; lastName: string };
  };
}

export function CourseContentViewer({ course }: CourseContentViewerProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/courses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux cours
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <Badge style={{ backgroundColor: course.subject.color }} className="text-white">
              {course.subject.name}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Prof : {course.teacher.firstName} {course.teacher.lastName}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <ReactMarkdown>{course.content}</ReactMarkdown>
      </div>
    </div>
  );
}
```

---

## 5. CourseDocuments Component

```tsx
// src/components/features/student/CourseDocuments.tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface CourseDocumentsProps {
  documents: Document[];
}

export function CourseDocuments({ documents }: CourseDocumentsProps) {
  if (documents.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between p-2 rounded-lg border">
              <span className="text-sm font-medium">{doc.name}</span>
              <Button asChild variant="ghost" size="sm">
                <a href={doc.url} download>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

---

> **Suite** : [phase-08-code-suite.md](phase-08-code-suite.md) (Révisions, Agenda, Messagerie, Profil)

---

*Dernière MAJ : 2025-12-22*

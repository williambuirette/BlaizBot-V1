# Phase 8 - Interface Élève (v2 - Améliorée)

> **Objectif** : Interface élève miroir du professeur  
> **Fichiers TODO** : `phase-08-student-v2.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 8.1 — Dashboard Élève

### Prompt 8.1.1 — API Dashboard

```markdown
Créer `src/app/api/student/dashboard/route.ts` :

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Trouver l'enrollment de l'élève
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id },
    include: { class: true }
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'No enrollment found' }, { status: 404 });
  }

  // 2. Compter les cours accessibles
  const coursesCount = await prisma.course.count({
    where: {
      teacherProfile: {
        Class: { some: { id: enrollment.classId } }
      },
      isFolder: false
    }
  });

  // 3. Calculer la progression moyenne
  const progress = await prisma.studentProgress.aggregate({
    where: { userId: session.user.id },
    _avg: { percentage: true }
  });
  const progression = Math.round(progress._avg?.percentage || 0);

  // 4. Compter les devoirs à faire
  const devoirsCount = await prisma.assignment.count({
    where: {
      OR: [
        { classId: enrollment.classId },
        { students: { some: { id: session.user.id } } }
      ],
      dueDate: { gte: new Date() },
      StudentScore: {
        none: { userId: session.user.id }
      }
    }
  });

  // 5. Calculer la moyenne des notes
  const scores = await prisma.studentScore.aggregate({
    where: { userId: session.user.id },
    _avg: { score: true }
  });
  const moyenne = scores._avg?.score ? (scores._avg.score / 5).toFixed(1) : null;

  // 6. Dernières notes (5)
  const dernieresNotes = await prisma.studentScore.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      assignment: {
        include: { course: { include: { subject: true } } }
      }
    }
  });

  // 7. Prochains devoirs (5)
  const prochainsDevoirs = await prisma.assignment.findMany({
    where: {
      OR: [
        { classId: enrollment.classId },
        { students: { some: { id: session.user.id } } }
      ],
      dueDate: { gte: new Date() }
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
    include: { course: { include: { subject: true } } }
  });

  return NextResponse.json({
    classInfo: {
      name: enrollment.class.name,
      level: enrollment.class.level
    },
    kpis: {
      progression,
      moyenne,
      devoirsCount,
      coursesCount
    },
    dernieresNotes: dernieresNotes.map(s => ({
      id: s.id,
      score: s.score,
      maxScore: 100,
      note20: (s.score / 5).toFixed(1),
      subject: s.assignment.course?.subject?.name || 'Sans matière',
      subjectColor: s.assignment.course?.subject?.color || '#6B7280',
      title: s.assignment.title,
      aiComment: s.score >= 80 ? 'Maîtrisé' : s.score >= 60 ? 'En bonne voie' : 'À revoir',
      date: s.updatedAt
    })),
    prochainsDevoirs: prochainsDevoirs.map(a => ({
      id: a.id,
      title: a.title,
      type: a.type,
      dueDate: a.dueDate,
      subject: a.course?.subject?.name || 'Sans matière',
      subjectColor: a.course?.subject?.color || '#6B7280'
    }))
  });
}
```

### Prompt 8.1.2 — Page Dashboard

```markdown
Modifier `src/app/(dashboard)/student/page.tsx` :

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { StudentKPIGrid } from '@/components/features/student/dashboard/StudentKPIGrid';
import { RecentGradesTable } from '@/components/features/student/dashboard/RecentGradesTable';
import { UpcomingDeadlines } from '@/components/features/student/dashboard/UpcomingDeadlines';

async function getDashboardData(userId: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/student/dashboard`, {
    headers: { 'x-user-id': userId },
    cache: 'no-store'
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function StudentDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    redirect('/login');
  }

  const data = await getDashboardData(session.user.id);
  if (!data) {
    return <div className="p-6">Erreur de chargement</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold">Salut {session.user.firstName} ! 👋</h1>
          <p className="opacity-90">
            {data.classInfo.name} - Tu as complété {data.kpis.progression}% de tes objectifs
          </p>
        </CardContent>
      </Card>

      {/* KPIs */}
      <StudentKPIGrid kpis={data.kpis} />

      {/* 2 colonnes : Deadlines + Notes */}
      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingDeadlines deadlines={data.prochainsDevoirs} />
        <RecentGradesTable grades={data.dernieresNotes} />
      </div>
    </div>
  );
}
```

### Prompt 8.1.3 — StudentKPIGrid

```markdown
Créer `src/components/features/student/dashboard/StudentKPIGrid.tsx` :

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, GraduationCap, FileText, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIs {
  progression: number;
  moyenne: string | null;
  devoirsCount: number;
  coursesCount: number;
}

interface StudentKPIGridProps {
  kpis: KPIs;
}

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-lg", color)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StudentKPIGrid({ kpis }: StudentKPIGridProps) {
  const progressColor = kpis.progression >= 70 ? 'bg-green-500' : kpis.progression >= 40 ? 'bg-orange-500' : 'bg-red-500';
  const moyenneNum = kpis.moyenne ? parseFloat(kpis.moyenne) : 0;
  const moyenneColor = moyenneNum >= 14 ? 'bg-green-500' : moyenneNum >= 10 ? 'bg-orange-500' : 'bg-red-500';
  const devoirsColor = kpis.devoirsCount > 3 ? 'bg-red-500' : kpis.devoirsCount > 0 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <KPICard
        title="Progression globale"
        value={`${kpis.progression}%`}
        icon={TrendingUp}
        color={progressColor}
      />
      <KPICard
        title="Moyenne actuelle"
        value={kpis.moyenne ? `${kpis.moyenne}/20` : '-'}
        icon={GraduationCap}
        color={moyenneColor}
      />
      <KPICard
        title="À faire"
        value={kpis.devoirsCount}
        icon={FileText}
        color={devoirsColor}
        subtitle="devoirs en attente"
      />
      <KPICard
        title="Mes cours"
        value={kpis.coursesCount}
        icon={BookOpen}
        color="bg-blue-500"
      />
    </div>
  );
}
```

### Prompt 8.1.4 — RecentGradesTable

```markdown
Créer `src/components/features/student/dashboard/RecentGradesTable.tsx` :

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Grade {
  id: string;
  score: number;
  note20: string;
  subject: string;
  subjectColor: string;
  title: string;
  aiComment: string;
  date: string;
}

interface RecentGradesTableProps {
  grades: Grade[];
}

export function RecentGradesTable({ grades }: RecentGradesTableProps) {
  if (grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Dernières notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucune note pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  const getCommentStyle = (comment: string) => {
    switch (comment) {
      case 'Maîtrisé':
        return 'bg-green-100 text-green-700';
      case 'En bonne voie':
        return 'bg-blue-100 text-blue-700';
      case 'À revoir':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📊 Dernières notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {grades.map((grade) => (
            <div 
              key={grade.id} 
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Badge 
                  style={{ backgroundColor: grade.subjectColor }}
                  className="text-white"
                >
                  {grade.subject}
                </Badge>
                <div>
                  <p className="font-medium">{grade.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(grade.date), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{grade.note20}/20</span>
                <Badge className={getCommentStyle(grade.aiComment)}>
                  {grade.aiComment}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Prompt 8.1.5 — UpcomingDeadlines

```markdown
Créer `src/components/features/student/dashboard/UpcomingDeadlines.tsx` :

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, isWithinInterval, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, FileText, GraduationCap, ClipboardCheck } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  type: 'HOMEWORK' | 'QUIZ' | 'EXAM';
  dueDate: string;
  subject: string;
  subjectColor: string;
}

interface UpcomingDeadlinesProps {
  deadlines: Deadline[];
}

const typeIcons = {
  HOMEWORK: FileText,
  QUIZ: ClipboardCheck,
  EXAM: GraduationCap
};

const typeLabels = {
  HOMEWORK: 'Devoir',
  QUIZ: 'Quiz',
  EXAM: 'Examen'
};

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📅 Prochaines échéances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Aucune échéance à venir 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📅 Prochaines échéances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {deadlines.map((deadline) => {
            const dueDate = new Date(deadline.dueDate);
            const isUrgent = isWithinInterval(dueDate, {
              start: new Date(),
              end: addHours(new Date(), 24)
            });
            const Icon = typeIcons[deadline.type];

            return (
              <div 
                key={deadline.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isUrgent ? 'bg-red-50 border border-red-200' : 'bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100' : 'bg-muted'}`}>
                  <Icon className={`h-4 w-4 ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{deadline.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      style={{ borderColor: deadline.subjectColor, color: deadline.subjectColor }}
                    >
                      {deadline.subject}
                    </Badge>
                    <Badge variant="secondary">{typeLabels[deadline.type]}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 text-sm ${isUrgent ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(dueDate, { addSuffix: true, locale: fr })}
                  </div>
                  {isUrgent && (
                    <Badge className="mt-1 bg-red-500">Urgent</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📋 Étape 8.2 — Mes Cours

### Prompt 8.2.1 — API Student Courses

```markdown
Créer `src/app/api/student/courses/route.ts` :

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const subjectId = searchParams.get('subject');
  const status = searchParams.get('status'); // all | in-progress | completed

  // 1. Trouver l'enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id }
  });

  if (!enrollment) {
    return NextResponse.json({ courses: [] });
  }

  // 2. Récupérer les cours de la classe
  const courses = await prisma.course.findMany({
    where: {
      isFolder: false,
      teacherProfile: {
        Class: { some: { id: enrollment.classId } }
      },
      ...(subjectId && { subjectId })
    },
    include: {
      subject: true,
      teacherProfile: {
        include: { User: { select: { firstName: true, lastName: true } } }
      },
      chapters: {
        include: { sections: true }
      }
    }
  });

  // 3. Calculer la progression pour chaque cours
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      const totalSections = course.chapters.reduce(
        (acc, ch) => acc + ch.sections.length, 0
      );
      
      const completedSections = await prisma.studentProgress.count({
        where: {
          userId: session.user.id,
          section: {
            chapter: { courseId: course.id }
          },
          completed: true
        }
      });

      const progress = totalSections > 0 
        ? Math.round((completedSections / totalSections) * 100) 
        : 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        subject: course.subject ? {
          id: course.subject.id,
          name: course.subject.name,
          color: course.subject.color
        } : null,
        teacher: {
          firstName: course.teacherProfile?.User.firstName,
          lastName: course.teacherProfile?.User.lastName
        },
        chaptersCount: course.chapters.length,
        progress,
        lastChapter: course.chapters[0]?.title || null
      };
    })
  );

  // 4. Filtrer par statut si demandé
  let filtered = coursesWithProgress;
  if (status === 'in-progress') {
    filtered = coursesWithProgress.filter(c => c.progress > 0 && c.progress < 100);
  } else if (status === 'completed') {
    filtered = coursesWithProgress.filter(c => c.progress === 100);
  }

  return NextResponse.json({ courses: filtered });
}
```

### Prompt 8.2.2 — StudentCourseCard

```markdown
Créer `src/components/features/student/courses/StudentCourseCard.tsx` :

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, User } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string | null;
  subject: { id: string; name: string; color: string } | null;
  teacher: { firstName: string; lastName: string };
  chaptersCount: number;
  progress: number;
  lastChapter: string | null;
}

interface StudentCourseCardProps {
  course: Course;
}

export function StudentCourseCard({ course }: StudentCourseCardProps) {
  const isCompleted = course.progress === 100;
  const isStarted = course.progress > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {course.subject && (
              <Badge style={{ backgroundColor: course.subject.color }} className="text-white">
                {course.subject.name}
              </Badge>
            )}
            {isCompleted && (
              <Badge className="bg-green-500">Terminé</Badge>
            )}
          </div>
          <BookOpen className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg mt-2">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{course.teacher.firstName} {course.teacher.lastName}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{course.chaptersCount} chapitre{course.chaptersCount > 1 ? 's' : ''}</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
          {course.lastChapter && (
            <p className="text-xs text-muted-foreground">
              Dernier : {course.lastChapter}
            </p>
          )}
        </div>

        <Button asChild className="w-full">
          <Link href={`/student/courses/${course.id}`}>
            {isStarted ? 'Continuer' : 'Commencer'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 📋 Étape 8.4 — Mes Exercices

### Prompt 8.4.1 — API Student Assignments

```markdown
Créer `src/app/api/student/assignments/route.ts` :

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const status = searchParams.get('status'); // pending | completed | all

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id }
  });

  if (!enrollment) {
    return NextResponse.json({ assignments: [], stats: { pending: 0, inProgress: 0, completed: 0 } });
  }

  // Récupérer les assignations
  const assignments = await prisma.assignment.findMany({
    where: {
      OR: [
        { classId: enrollment.classId },
        { students: { some: { id: session.user.id } } }
      ],
      ...(type && { type: type as any })
    },
    include: {
      course: { include: { subject: true } },
      StudentScore: {
        where: { userId: session.user.id }
      }
    },
    orderBy: { dueDate: 'asc' }
  });

  // Transformer et calculer statuts
  const transformed = assignments.map(a => {
    const score = a.StudentScore[0];
    const isPast = new Date(a.dueDate) < new Date();
    
    let assignmentStatus: 'pending' | 'in-progress' | 'completed';
    if (score?.submitted) {
      assignmentStatus = 'completed';
    } else if (score) {
      assignmentStatus = 'in-progress';
    } else {
      assignmentStatus = 'pending';
    }

    return {
      id: a.id,
      title: a.title,
      type: a.type,
      dueDate: a.dueDate,
      isOverdue: isPast && assignmentStatus !== 'completed',
      status: assignmentStatus,
      score: score?.score || null,
      subject: a.course?.subject?.name || 'Sans matière',
      subjectColor: a.course?.subject?.color || '#6B7280'
    };
  });

  // Filtrer par statut si demandé
  let filtered = transformed;
  if (status && status !== 'all') {
    filtered = transformed.filter(a => a.status === status);
  }

  // Stats
  const stats = {
    pending: transformed.filter(a => a.status === 'pending').length,
    inProgress: transformed.filter(a => a.status === 'in-progress').length,
    completed: transformed.filter(a => a.status === 'completed').length
  };

  return NextResponse.json({ assignments: filtered, stats });
}
```

---

## 📋 Étape 8.5 — Messagerie Élève

### Prompt 8.5.1 — API Classmates

```markdown
Créer `src/app/api/student/classmates/route.ts` :

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Trouver la classe de l'élève
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id }
  });

  if (!enrollment) {
    return NextResponse.json({ classmates: [], teachers: [] });
  }

  // Élèves de la même classe
  const classmates = await prisma.enrollment.findMany({
    where: {
      classId: enrollment.classId,
      userId: { not: session.user.id }
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, image: true }
      }
    }
  });

  // Professeurs de la classe
  const teacherAssignments = await prisma.teacherAssignment.findMany({
    where: { classId: enrollment.classId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, image: true }
      },
      subject: true
    }
  });

  return NextResponse.json({
    classmates: classmates.map(e => ({
      id: e.user.id,
      firstName: e.user.firstName,
      lastName: e.user.lastName,
      avatar: e.user.image
    })),
    teachers: teacherAssignments.map(ta => ({
      id: ta.user.id,
      firstName: ta.user.firstName,
      lastName: ta.user.lastName,
      avatar: ta.user.image,
      subject: ta.subject?.name || null
    }))
  });
}
```

---

## 📊 Validation Finale Phase 8

```markdown
Checklist :
1. ✅ Dashboard avec 4 KPIs (progression, moyenne, devoirs, cours)
2. ✅ Widget dernières notes avec commentaire IA
3. ✅ Widget prochaines échéances avec urgence
4. ✅ Liste "Mes Cours" avec progression et filtres
5. ✅ Détail cours avec chapitres/sections
6. ✅ "Mes Exercices" avec statuts et calendrier
7. ✅ Messagerie avec profs et camarades
8. ✅ Sécurité : élève voit uniquement sa classe
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Notes |
|-------|------|-------|------------|-------|
| 8.1 | | | | Dashboard complet |
| 8.2 | | | | Mes Cours |
| 8.3 | | | | Détail Cours |
| 8.4 | | | | Mes Exercices |
| 8.5 | | | | Messagerie |

---

*Dernière mise à jour : 2026-01-02*

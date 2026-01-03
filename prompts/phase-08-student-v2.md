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
8. ✅ Agenda Élève (assignations prof + events perso)
9. ✅ Sécurité : élève voit uniquement sa classe
```

---

## 📋 Étape 8.7 — Agenda Élève

### Prompt 8.7.1 — API GET Agenda (fusion assignments + events)

```markdown
Créer `src/app/api/student/agenda/route.ts` :

## Contexte
L'agenda élève combine 2 sources :
1. CourseAssignment (assignations prof ciblant l'élève ou sa classe)
2. CalendarEvent (événements personnels de l'élève)

## Code

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface AgendaItem {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  type: 'assignment' | 'personal';
  source: 'teacher' | 'student';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  course?: { id: string; title: string; subject?: { name: string; color?: string } };
  color: string;
  isEditable: boolean;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { searchParams } = new URL(request.url);
  
  // Filtres
  const typeFilter = searchParams.get('type') || 'all'; // 'all' | 'teacher' | 'personal'
  const subjectId = searchParams.get('subjectId');
  const courseId = searchParams.get('courseId');
  const statusFilter = searchParams.get('status') || 'all'; // 'all' | 'pending' | 'completed'

  // 1. Trouver l'enrollment de l'élève
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId },
    select: { classId: true }
  });

  if (!enrollment) {
    return NextResponse.json({ error: 'No enrollment found' }, { status: 404 });
  }

  const items: AgendaItem[] = [];

  // 2. Récupérer les assignations du professeur (si type = all ou teacher)
  if (typeFilter === 'all' || typeFilter === 'teacher') {
    const assignmentWhere: any = {
      OR: [
        { studentId: userId },
        { classId: enrollment.classId },
        { 
          targetType: 'CLASS',
          Class: { id: enrollment.classId }
        }
      ]
    };

    // Filtres optionnels
    if (subjectId) {
      assignmentWhere.Course = { subjectId };
    }
    if (courseId) {
      assignmentWhere.courseId = courseId;
    }

    const assignments = await prisma.courseAssignment.findMany({
      where: assignmentWhere,
      include: {
        Course: {
          include: { Subject: true }
        },
        Chapter: true,
        Section: true,
        StudentProgress: {
          where: { studentId: userId }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    for (const a of assignments) {
      const progress = a.StudentProgress[0];
      const status = progress?.status || 'NOT_STARTED';
      
      // Filtrer par statut si demandé
      if (statusFilter === 'pending' && status === 'COMPLETED') continue;
      if (statusFilter === 'completed' && status !== 'COMPLETED') continue;

      const priorityColors = {
        HIGH: '#ef4444',
        MEDIUM: '#f97316', 
        LOW: '#22c55e'
      };

      items.push({
        id: a.id,
        title: a.title,
        description: a.instructions,
        startDate: a.startDate?.toISOString() || a.dueDate?.toISOString() || new Date().toISOString(),
        endDate: a.dueDate?.toISOString() || new Date().toISOString(),
        type: 'assignment',
        source: 'teacher',
        priority: a.priority,
        status,
        course: a.Course ? {
          id: a.Course.id,
          title: a.Course.title,
          subject: a.Course.Subject ? {
            name: a.Course.Subject.name,
            color: a.Course.Subject.color || undefined
          } : undefined
        } : undefined,
        color: priorityColors[a.priority] || '#3b82f6',
        isEditable: false
      });
    }
  }

  // 3. Récupérer les événements personnels (si type = all ou personal)
  if (typeFilter === 'all' || typeFilter === 'personal') {
    const events = await prisma.calendarEvent.findMany({
      where: {
        ownerId: userId,
        isTeacherEvent: false
      },
      orderBy: { startDate: 'asc' }
    });

    for (const e of events) {
      items.push({
        id: e.id,
        title: e.title,
        description: e.description,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate.toISOString(),
        type: 'personal',
        source: 'student',
        color: '#10b981', // Vert pour perso
        isEditable: true
      });
    }
  }

  // 4. Trier par date
  items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // 5. Stats
  const stats = {
    pending: items.filter(i => i.type === 'assignment' && i.status !== 'COMPLETED').length,
    completed: items.filter(i => i.type === 'assignment' && i.status === 'COMPLETED').length,
    personal: items.filter(i => i.type === 'personal').length
  };

  return NextResponse.json({ 
    success: true, 
    data: items,
    stats
  });
}
```

---

### Prompt 8.7.2 — API CRUD Events personnels

```markdown
Créer `src/app/api/student/agenda/events/route.ts` :

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

// POST : Créer un événement personnel
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, startDate, endDate } = body;

  if (!title || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      id: randomUUID(),
      ownerId: session.user.id,
      title,
      description: description || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isTeacherEvent: false,
      updatedAt: new Date()
    }
  });

  return NextResponse.json({ success: true, data: event });
}

---

Créer `src/app/api/student/agenda/events/[id]/route.ts` :

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET : Détail d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  
  const event = await prisma.calendarEvent.findUnique({
    where: { id }
  });

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  // Vérifier propriété
  if (event.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: event });
}

// PUT : Modifier un événement personnel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Vérifier propriété
  const existing = await prisma.calendarEvent.findUnique({
    where: { id }
  });

  if (!existing || existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.calendarEvent.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description || null,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      updatedAt: new Date()
    }
  });

  return NextResponse.json({ success: true, data: updated });
}

// DELETE : Supprimer un événement personnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Vérifier propriété
  const existing = await prisma.calendarEvent.findUnique({
    where: { id }
  });

  if (!existing || existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.calendarEvent.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
```

---

### Prompt 8.7.3 — Page Agenda Élève

```markdown
Créer `src/app/(dashboard)/student/agenda/page.tsx` :

## Objectif
Page orchestratrice < 150 lignes avec :
- Toggle vue Calendrier / Liste
- Barre de filtres
- Stats (À faire, Terminé, Mes objectifs)
- Calendrier ou Liste selon vue
- Bouton "Nouvel objectif"

## Code

'use client';

import { useState, useEffect, useCallback } from 'react';
import { View, Views } from 'react-big-calendar';
import { Calendar, List, Plus, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StudentAgendaCalendar } from '@/components/features/student/agenda/StudentAgendaCalendar';
import { StudentAgendaList } from '@/components/features/student/agenda/StudentAgendaList';
import { StudentAgendaFilters, type AgendaFiltersState } from '@/components/features/student/agenda/StudentAgendaFilters';
import { AgendaStats } from '@/components/features/student/agenda/AgendaStats';
import { NewPersonalEventModal } from '@/components/features/student/agenda/NewPersonalEventModal';

export interface AgendaItem {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  type: 'assignment' | 'personal';
  source: 'teacher' | 'student';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: string;
  course?: { id: string; title: string; subject?: { name: string; color?: string } };
  color: string;
  isEditable: boolean;
}

type ViewMode = 'calendar' | 'list';

const initialFilters: AgendaFiltersState = {
  type: 'all',
  subjectId: null,
  courseId: null,
  status: 'all',
};

export default function StudentAgendaPage() {
  const [view, setView] = useState<ViewMode>('calendar');
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, personal: 0 });
  const [filters, setFilters] = useState<AgendaFiltersState>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [editingEvent, setEditingEvent] = useState<AgendaItem | null>(null);

  const fetchAgenda = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.subjectId) params.append('subjectId', filters.subjectId);
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.status !== 'all') params.append('status', filters.status);

      const response = await fetch(`/api/student/agenda?${params}`);
      const json = await response.json();
      
      if (json.success) {
        setItems(json.data);
        setStats(json.stats);
      }
    } catch (error) {
      console.error('Erreur chargement agenda:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const handleEventClick = (item: AgendaItem) => {
    if (item.isEditable) {
      setEditingEvent(item);
      setIsModalOpen(true);
    }
    // Si non éditable (assignment prof), afficher détails read-only ?
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mon Agenda</h1>
          <p className="text-muted-foreground">
            Mes devoirs et objectifs personnels
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle vue */}
          <div className="flex rounded-lg border bg-muted p-1">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendrier
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4 mr-1" />
              Liste
            </Button>
          </div>
          
          <Button variant="outline" size="icon" onClick={fetchAgenda} disabled={isLoading}>
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouvel objectif
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <StudentAgendaFilters filters={filters} onFiltersChange={setFilters} />

      {/* Stats */}
      <AgendaStats stats={stats} />

      {/* Vue principale */}
      {view === 'calendar' ? (
        <StudentAgendaCalendar
          items={items}
          isLoading={isLoading}
          onEventClick={handleEventClick}
          calendarView={calendarView}
          onCalendarViewChange={setCalendarView}
          calendarDate={calendarDate}
          onCalendarDateChange={setCalendarDate}
        />
      ) : (
        <StudentAgendaList
          items={items}
          isLoading={isLoading}
          onEventClick={handleEventClick}
        />
      )}

      {/* Modal */}
      <NewPersonalEventModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={() => {
          handleModalClose();
          fetchAgenda();
        }}
        editingEvent={editingEvent}
      />
    </div>
  );
}
```

---

### Prompt 8.7.4 — Composant StudentAgendaCalendar

```markdown
Créer `src/components/features/student/agenda/StudentAgendaCalendar.tsx` :

## Objectif
Calendrier react-big-calendar avec :
- Localisation FR
- Événements colorés (rouge/orange/vert pour priorité prof, vert pour perso)
- Légende 2 couleurs
- < 200 lignes

## Code

'use client';

import { useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { AgendaItem } from '@/app/(dashboard)/student/agenda/page';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';

const locales = { fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: AgendaItem;
}

interface Props {
  items: AgendaItem[];
  isLoading: boolean;
  onEventClick: (item: AgendaItem) => void;
  calendarView: View;
  onCalendarViewChange: (view: View) => void;
  calendarDate: Date;
  onCalendarDateChange: (date: Date) => void;
}

const messages = {
  today: "Aujourd'hui",
  previous: 'Précédent',
  next: 'Suivant',
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  noEventsInRange: 'Aucun événement sur cette période',
};

export function StudentAgendaCalendar({
  items,
  isLoading,
  onEventClick,
  calendarView,
  onCalendarViewChange,
  calendarDate,
  onCalendarDateChange,
}: Props) {
  const events: CalendarEvent[] = useMemo(() => {
    return items.map(item => ({
      id: item.id,
      title: `${item.type === 'personal' ? '🟢' : '📘'} ${item.title}`,
      start: new Date(item.startDate),
      end: new Date(item.endDate),
      allDay: true,
      resource: item,
    }));
  }, [items]);

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onEventClick(event.resource);
    },
    [onEventClick]
  );

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.75rem',
      },
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[500px]" />
        </CardContent>
      </Card>
    );
  }

  const teacherCount = items.filter(i => i.type === 'assignment').length;
  const personalCount = items.filter(i => i.type === 'personal').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Vue Calendrier</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-blue-500 text-blue-600">
              📘 Devoirs prof ({teacherCount})
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-600">
              🟢 Mes objectifs ({personalCount})
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[550px]">
          <Calendar
            localizer={localizer}
            events={events}
            view={calendarView}
            onView={onCalendarViewChange}
            date={calendarDate}
            onNavigate={onCalendarDateChange}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            messages={messages}
            culture="fr"
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            popup
          />
        </div>
        
        {/* Légende */}
        <div className="mt-4 pt-4 border-t flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span>Assignations professeur</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span>Mes objectifs personnels</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Prompt 8.7.5 — Composant StudentAgendaList

```markdown
Créer `src/components/features/student/agenda/StudentAgendaList.tsx` :

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, CheckCircle, Clock, Edit } from 'lucide-react';
import type { AgendaItem } from '@/app/(dashboard)/student/agenda/page';

interface Props {
  items: AgendaItem[];
  isLoading: boolean;
  onEventClick: (item: AgendaItem) => void;
}

const priorityLabels = {
  HIGH: { label: 'Haute', color: 'bg-red-100 text-red-700' },
  MEDIUM: { label: 'Moyenne', color: 'bg-orange-100 text-orange-700' },
  LOW: { label: 'Basse', color: 'bg-green-100 text-green-700' },
};

const statusLabels = {
  NOT_STARTED: { label: 'À faire', color: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
};

export function StudentAgendaList({ items, isLoading, onEventClick }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold">Aucun événement</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez un objectif personnel ou attendez les assignations du professeur.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des événements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(item => {
          const priority = item.priority ? priorityLabels[item.priority] : null;
          const status = item.status ? statusLabels[item.status as keyof typeof statusLabels] : null;
          
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Indicateur type */}
                <div 
                  className="h-10 w-1 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.title}</h4>
                    {item.type === 'personal' && (
                      <Badge variant="outline" className="text-xs">Perso</Badge>
                    )}
                  </div>
                  
                  {item.course && (
                    <p className="text-sm text-muted-foreground">
                      {item.course.subject?.name} — {item.course.title}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(item.endDate), 'PPP', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {priority && (
                  <Badge className={priority.color} variant="secondary">
                    {priority.label}
                  </Badge>
                )}
                {status && (
                  <Badge className={status.color} variant="secondary">
                    {status.label === 'Terminé' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {status.label}
                  </Badge>
                )}
                {item.isEditable && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEventClick(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

---

### Prompt 8.7.6 — Composant StudentAgendaFilters

```markdown
Créer `src/components/features/student/agenda/StudentAgendaFilters.tsx` :

'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface AgendaFiltersState {
  type: 'all' | 'teacher' | 'personal';
  subjectId: string | null;
  courseId: string | null;
  status: 'all' | 'pending' | 'completed';
}

interface Subject {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  subjectId: string;
}

interface Props {
  filters: AgendaFiltersState;
  onFiltersChange: (filters: AgendaFiltersState) => void;
}

export function StudentAgendaFilters({ filters, onFiltersChange }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Charger les matières et cours accessibles
  useEffect(() => {
    async function loadOptions() {
      const res = await fetch('/api/student/available-courses');
      const json = await res.json();
      if (json.success) {
        // Extraire les matières uniques
        const subjectsMap = new Map<string, Subject>();
        json.data.forEach((c: any) => {
          if (c.subject) {
            subjectsMap.set(c.subject.id, c.subject);
          }
        });
        setSubjects(Array.from(subjectsMap.values()));
        setCourses(json.data.map((c: any) => ({
          id: c.id,
          title: c.title,
          subjectId: c.subject?.id
        })));
      }
    }
    loadOptions();
  }, []);

  const filteredCourses = filters.subjectId 
    ? courses.filter(c => c.subjectId === filters.subjectId)
    : courses;

  const hasFilters = filters.type !== 'all' || filters.subjectId || filters.courseId || filters.status !== 'all';

  const resetFilters = () => {
    onFiltersChange({
      type: 'all',
      subjectId: null,
      courseId: null,
      status: 'all'
    });
  };

  return (
    <Card>
      <CardContent className="py-3 flex flex-wrap items-center gap-3">
        {/* Type */}
        <Select
          value={filters.type}
          onValueChange={(v) => onFiltersChange({ ...filters, type: v as any })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="teacher">📘 Prof</SelectItem>
            <SelectItem value="personal">🟢 Perso</SelectItem>
          </SelectContent>
        </Select>

        {/* Matière */}
        <Select
          value={filters.subjectId || 'all'}
          onValueChange={(v) => onFiltersChange({ 
            ...filters, 
            subjectId: v === 'all' ? null : v,
            courseId: null // Reset cours si matière change
          })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes matières</SelectItem>
            {subjects.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Cours */}
        <Select
          value={filters.courseId || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, courseId: v === 'all' ? null : v })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous cours</SelectItem>
            {filteredCourses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Statut */}
        <Select
          value={filters.status}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v as any })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="pending">À faire</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### Prompt 8.7.7 — Composant NewPersonalEventModal

```markdown
Créer `src/components/features/student/agenda/NewPersonalEventModal.tsx` :

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import type { AgendaItem } from '@/app/(dashboard)/student/agenda/page';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingEvent?: AgendaItem | null;
}

export function NewPersonalEventModal({ open, onOpenChange, onSuccess, editingEvent }: Props) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');

  const isEditing = !!editingEvent;

  // Pré-remplir en mode édition
  useEffect(() => {
    if (editingEvent && open) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      const start = new Date(editingEvent.startDate);
      const end = new Date(editingEvent.endDate);
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toTimeString().slice(0, 5));
    } else if (!open) {
      // Reset
      setTitle('');
      setDescription('');
      setStartDate('');
      setStartTime('09:00');
      setEndDate('');
      setEndTime('10:00');
    }
  }, [editingEvent, open]);

  const handleSubmit = async () => {
    if (!title.trim() || !startDate || !endDate) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      const url = isEditing 
        ? `/api/student/agenda/events/${editingEvent.id}`
        : '/api/student/agenda/events';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        toast({ title: isEditing ? 'Objectif modifié' : 'Objectif créé' });
        onSuccess();
      } else {
        const json = await response.json();
        throw new Error(json.error || 'Erreur');
      }
    } catch (error) {
      toast({ title: 'Erreur', description: String(error), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/student/agenda/events/${editingEvent.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({ title: 'Objectif supprimé' });
        onSuccess();
      }
    } catch (error) {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'objectif' : 'Nouvel objectif personnel'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réviser les fractions"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes supplémentaires..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date début *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure début</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date fin *</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Heure fin</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          {isEditing && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Supprimer
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Prompt 8.7.8 — Composant AgendaStats

```markdown
Créer `src/components/features/student/agenda/AgendaStats.tsx` :

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, Target } from 'lucide-react';

interface Props {
  stats: {
    pending: number;
    completed: number;
    personal: number;
  };
}

export function AgendaStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="py-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-orange-100">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">À faire</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-100">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-sm text-muted-foreground">Terminé</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-100">
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.personal}</p>
            <p className="text-sm text-muted-foreground">Mes objectifs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Prompt 8.7.9 — Index des exports

```markdown
Créer `src/components/features/student/agenda/index.ts` :

export { StudentAgendaCalendar } from './StudentAgendaCalendar';
export { StudentAgendaList } from './StudentAgendaList';
export { StudentAgendaFilters, type AgendaFiltersState } from './StudentAgendaFilters';
export { AgendaStats } from './AgendaStats';
export { NewPersonalEventModal } from './NewPersonalEventModal';
```

---

### Prompt 8.7.10 — API Deadline personnelle sur cours

```markdown
Créer `src/app/api/student/courses/[id]/deadline/route.ts` :

## Contexte
L'élève peut définir sa propre deadline sur un cours, indépendamment de celle du professeur.
Stockage via CalendarEvent avec pattern de titre `[COURS:{courseId}]`.

## GET — Récupérer les deadlines (prof + perso)
- Chercher CalendarEvent où title.startsWith(`[COURS:${courseId}]`) et ownerId=me
- Chercher CourseAssignment où courseId + (classId=myClass OR studentId=me) avec dueDate

Retourner :
{
  personal: { id, startDate, endDate } | null,
  teacher: { id, title, startDate, dueDate } | null
}

## PUT — Créer/modifier deadline personnelle
Body: { startDate: ISO8601, endDate: ISO8601, description?: string }

- Si CalendarEvent existe → update
- Sinon → create avec title: `[COURS:${courseId}] ${course.title}`
- Vérifier que le cours est accessible via enrollment

## DELETE — Supprimer deadline personnelle
- Supprimer CalendarEvent WHERE title.startsWith(`[COURS:${courseId}]`) AND ownerId=me

## Intégration page cours
Ajouter dans `student/courses/[id]/page.tsx` onglet Informations :
- Carte "Échéances" avec 2 sections :
  - 🔵 Échéance du prof (lecture seule) : startDate → dueDate
  - 🟣 Mon échéance (éditable) : startDate → endDate + boutons Modifier/Supprimer
- Modal avec 2 calendriers pour sélectionner les dates
```

### Prompt Optimal 8.7 (Agenda Élève Complet)

> **Itérations réelles** : 6 (idéal = 1)
> **Problèmes rencontrés** : KPIs incorrects, cours sans assignations manquants, filtres déconnectés, style liste différent du prof

```markdown
## Contexte
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript, Prisma, shadcn/ui).
L'élève est connecté via `session.user.id`. Il appartient à UNE classe via `Enrollment`.

## Sources de vérité OBLIGATOIRES
- `src/app/(dashboard)/teacher/assignments/page.tsx` — Interface professeur de référence
- `src/components/features/assignments/AssignmentsList.tsx` — Vue liste du prof (style à reproduire)
- `prisma/schema.prisma` — CourseAssignment, CalendarEvent, StudentProgress

## Ta mission : Agenda Élève miroir du professeur

### 1. API `GET /api/student/agenda`

**Sources de données (3 types) :**
1. `CourseAssignment` avec dueDate → type: 'assignment'
2. `Course` SANS CourseAssignment des profs de la classe → type: 'course' (pour KPIs)
3. `CalendarEvent` (ownerId=me, isTeacherEvent=false) → type: 'personal'

**Calcul des stats (CRITIQUE) :**
- `total` = assignments.length + courses.length
- `overdue` = assignments où dueDate < now
- `today` = assignments où dueDate = today
- `upcoming` = assignments où dueDate > today + courses sans deadline
- `personal` = events personnels count

**Query params filtrage :**
- `type`: 'all' | 'assignment' | 'course' | 'personal'
- `teacherIds[]`: filtrer par profs (multi-select)
- `subjectIds[]`: filtrer par matières (multi-select)
- `courseId`: filtrer par cours
- `status`: 'all' | 'pending' | 'overdue' | 'completed'
- `startDate`, `endDate`: plage de dates

**IMPORTANT** : Inclure `class.color` et `targetType` dans la réponse pour le style.

### 2. Composant `StudentAgendaList.tsx`

**Style miroir du professeur :**
- Grouper par date (DateGroup component)
- Cartes avec bordure gauche colorée (couleur classe ou indigo pour cours)
- Icône emoji par type : 📖 cours, 🎯 personnel, 📝 devoir
- Badge "📖 Cours" pour les cours sans deadline
- Afficher prof, matière, classe dans chaque carte

### 3. Composant `StudentAgendaFilters.tsx`

**Filtres en cascade (comme professeur) :**
```
[Type ▼] → [Prof ▼ multi] → [Matière ▼ multi] → [Cours ▼] → [Statut ▼] → [Période ▼]
```

- Type filtre tout
- Prof filtre matières et cours
- Matière filtre cours
- Statut : Tous / À faire / En retard / Terminé
- Période : Plage de dates avec 2 calendriers

### 4. Composant `AgendaStats.tsx`

**4 KPIs (PAS 3) :**
- Total (tous les éléments)
- En retard (dueDate < now)
- Aujourd'hui (dueDate = today)
- À venir (dueDate > today + cours sans deadline)

### 5. Deadlines personnelles sur cours

**API `PUT /api/student/courses/[id]/deadline`**
- Stocker dans CalendarEvent avec title: `[COURS:${courseId}] ${course.title}`
- Permet à l'élève de définir sa propre deadline sur un cours

**Page cours `student/courses/[id]`**
- Carte "Échéances" dans onglet Informations
- Section bleue = deadline prof (lecture seule, depuis CourseAssignment)
- Section violette = deadline perso (éditable, depuis CalendarEvent)

## Différences clés vs prompt original
1. **3 types de données** au lieu de 2 (ajouter 'course' pour les cours sans assignations)
2. **Stats = 4 KPIs** (total, overdue, today, upcoming) pas 3
3. **Filtres multi-select** pour Prof et Matière
4. **dateRange** obligatoire dans les filtres
5. **Style liste groupée par date** comme le professeur
6. **Couleur bordure = class.color** pas couleur priorité
7. **Deadline perso = CalendarEvent** avec pattern titre `[COURS:id]`
```

**Points clés manquants dans le prompt original :**
- Les cours SANS CourseAssignment n'apparaissaient pas → KPIs faux
- Les filtres n'étaient pas en cascade
- La vue liste n'était pas groupée par date
- Pas de filtre période (dateRange)
- Pas de deadline personnelle sur les cours

---

## � Étape 8.R — Refactorisation (Fichiers > 350 lignes)

### Prompt 8.R.1 — MultiSelectDropdown (composant partagé) ✅

```markdown
Créer `src/components/shared/filters/MultiSelectDropdown.tsx` :

## Specs
- Props : label?, options[], selectedIds[], onChange(), placeholder?, width?
- Options : { id: string, name: string, icon?: ReactNode }
- Dropdown avec checkboxes
- Header avec compteur + bouton "Effacer"
- Fermeture au clic extérieur
- Style shadcn/ui cohérent

## Usage
import { MultiSelectDropdown } from '@/components/shared/filters';

<MultiSelectDropdown
  label="Matières"
  options={subjects.map(s => ({ id: s.id, name: s.name }))}
  selectedIds={filters.subjectIds}
  onChange={(ids) => setFilters({ ...filters, subjectIds: ids })}
  placeholder="Toutes les matières"
/>
```

### Prompt 8.R.2 — SingleSelectDropdown (composant partagé) ✅

```markdown
Créer `src/components/shared/filters/SingleSelectDropdown.tsx` :

## Specs
- Props : label?, options[], selectedValue, onChange(), placeholder?, width?
- Options : { value: string, label: string, icon?: ReactNode }
- Dropdown single-select classique
- Fermeture au clic extérieur
- Style shadcn/ui cohérent

## Usage
import { SingleSelectDropdown } from '@/components/shared/filters';

<SingleSelectDropdown
  label="Statut"
  options={[
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'À faire' },
    { value: 'completed', label: 'Terminé' },
  ]}
  selectedValue={filters.status}
  onChange={(v) => setFilters({ ...filters, status: v })}
/>
```

### Prompt 8.R.3 — Refactoriser StudentAgendaFilters.tsx

```markdown
Refactoriser `src/components/features/student/agenda/StudentAgendaFilters.tsx` :

## Objectif
424 lignes → ~250 lignes en utilisant les composants partagés.

## Changements
1. Supprimer le composant local MultiSelectFilter (lignes 1-130)
2. Importer depuis '@/components/shared/filters'
3. Remplacer les usages de MultiSelectFilter par MultiSelectDropdown
4. Garder uniquement la logique métier (cascade, reset)

## Code de remplacement
import { MultiSelectDropdown, SingleSelectDropdown } from '@/components/shared/filters';

// Remplacer le popover profs par :
<MultiSelectDropdown
  options={teachers.map(t => ({ id: t.id, name: `${t.firstName} ${t.lastName}` }))}
  selectedIds={filters.teacherIds}
  onChange={(ids) => {
    onFiltersChange({ ...filters, teacherIds: ids, subjectIds: [], courseId: null });
  }}
  placeholder="Filtrer par prof"
  width="w-[180px]"
/>

// Remplacer le popover matières par :
<MultiSelectDropdown
  options={filteredSubjects.map(s => ({ id: s.id, name: s.name }))}
  selectedIds={filters.subjectIds}
  onChange={(ids) => {
    onFiltersChange({ ...filters, subjectIds: ids, courseId: null });
  }}
  placeholder="Matières"
  width="w-[160px]"
/>
```

### Prompt 8.R.4 — Refactoriser StudentCoursesFiltersMulti.tsx

```markdown
Refactoriser `src/components/features/student/StudentCoursesFiltersMulti.tsx` :

## Objectif
417 lignes → ~150 lignes en supprimant les composants dupliqués.

## Changements
1. Supprimer MultiSelectFilter et SingleSelectFilter locaux (lignes 1-200)
2. Importer depuis '@/components/shared/filters'
3. Garder uniquement la logique de cascade et le composant principal

## Structure finale
- Imports (10 lignes)
- Types locaux (20 lignes)
- Logique cascade (50 lignes)
- Rendu JSX avec composants partagés (70 lignes)
= ~150 lignes total
```

### Prompt 8.R.5 — Mutualiser QuizEditorInline ✅

```markdown
Mutualiser les 2 fichiers QuizEditorInline en 1 seul :

## Fichiers actuels
- src/components/features/courses/inline-editors/QuizEditorInline.tsx (351 lignes)
- src/components/features/student/revisions/inline-editors/QuizEditorInline.tsx (351 lignes)

## Action
1. Créer `src/components/shared/editors/QuizEditorInline.tsx`
2. Ajouter une prop `mode: 'teacher' | 'student'` si comportement différent
3. Exporter depuis `shared/editors/index.ts`
4. Mettre à jour les imports dans courses/ et revisions/
5. Supprimer les 2 fichiers originaux

## Validation
- npm run lint
- Vérifier que l'édition de quiz fonctionne côté prof ET élève
```

### Prompt Optimal 8.R.5

> **Itérations réelles** : 1
> **Résultat** : 702 lignes (2×351) → 433 lignes (232+80+121) + mutualisé

```markdown
Mutualiser QuizEditorInline en structure modulaire :

## Structure cible
src/components/shared/inline-editors/quiz-editor/
├── index.ts
├── QuizEditorInline.tsx  (composant principal)
├── QuestionCard.tsx      (carte question éditable)
├── OptionsSection.tsx    (section options réponse)
└── types.ts              (interfaces partagées)

## Règles
1. Créer `types.ts` AVANT les composants (QuizQuestion, Option interfaces)
2. Extraire QuestionCard avec drag handle, delete, edit
3. Extraire OptionsSection avec RadioGroup/Checkbox selon type
4. Garder QuizEditorInline < 250 lignes (orchestrateur)
5. Mettre à jour `courses/inline-editors/index.ts` pour réexporter
6. Mettre à jour `revisions/inline-editors/index.ts` pour réexporter
7. Supprimer les 2 anciens fichiers

## Validation
- npm run lint → 0 errors
- Compter lignes : tous < 350
```

**Différences clés vs prompt original** :
- Structure en sous-dossier avec types séparés
- Extraction en 3 sous-composants au lieu d'1 seul fichier
- Mise à jour des index.ts pour réexporter

---

### Prompt 8.R.6 — Extraire QuizViewer ✅

```markdown
Extraire `src/components/features/student/viewers/QuizQuestion.tsx` :

## Source
QuizViewer.tsx (439 lignes) → extraire le rendu d'une question

## Props
interface QuizQuestionProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean;
  onAnswerSelect: (answerId: string) => void;
}

## Contenu à extraire
- RadioGroup avec les options
- Affichage question
- Feedback correct/incorrect
- Badge numéro question
```

### Prompt 8.R.7 — *(Fusionné avec 8.R.6)* ✅

### Prompt Optimal 8.R.6+7

> **Itérations réelles** : 1
> **Résultat** : 439 lignes → 210+214+54 = 478 lignes (modularisé)

```markdown
Extraire QuizViewer en structure quiz/ :

## Structure cible
src/components/features/student/viewers/quiz/
├── index.ts
├── QuizViewer.tsx       (orchestrateur principal)
├── QuizSubComponents.tsx (QuizProgress, AnswerOption, AnswerFeedback, QuizActions, FinalScore)
└── types.ts             (interfaces + helpers formatScore, getScoreColor)

## Règles
1. Créer `types.ts` avec QuizQuestion, QuizData, QuizViewerProps + helpers
2. Créer QuizSubComponents avec 5 petits composants inline-export
3. Garder QuizViewer < 250 lignes (logique état + rendu principal)
4. Mettre à jour `viewers/index.ts` pour réexporter depuis './quiz'
5. Supprimer l'ancien QuizViewer.tsx

## Validation
- npm run lint → 0 errors
- Compter lignes : tous < 350
```

**Différences clés vs prompt original** :
- Fusionné 8.R.6 + 8.R.7 en une seule extraction
- Structure en sous-dossier quiz/
- Helpers (formatScore, getScoreColor) dans types.ts
- 5 sous-composants au lieu de 2

---

### Prompt 8.R.8 — Extraire ResourceFormDialog ✅

```markdown
Extraire `src/components/features/courses/ResourceTypeSelector.tsx` depuis ResourceFormDialog :

## Props
interface ResourceTypeSelectorProps {
  selectedType: ResourceType;
  onTypeSelect: (type: ResourceType) => void;
}

## Contenu à extraire
- Grid de cards avec les types de ressources
- Icônes et descriptions par type
- Style sélection active
```

### Prompt Optimal 8.R.8

> **Itérations réelles** : 2 (fix react-hooks/set-state-in-effect)
> **Résultat** : 431 lignes → 258+180+72 = 510 lignes (modularisé)

```markdown
Extraire ResourceFormDialog en structure resource-dialog/ :

## Structure cible
src/components/features/teacher/courses/resource-dialog/
├── index.ts
├── ResourceFormDialog.tsx  (dialog principal)
├── FileUploadZone.tsx      (dropzone + preview)
└── types.ts                (interfaces + resourceTypes config + helpers)

## Règles
1. Créer `types.ts` avec ResourceFormData, resourceTypes array, ACCEPTED_FILES
2. Extraire FileUploadZone avec useDropzone, preview, progression
3. ⚠️ Pour éviter react-hooks/set-state-in-effect : utiliser setTimeout dans onDrop
4. Garder ResourceFormDialog < 300 lignes (logique form + steps)
5. Mettre à jour les imports dans ResourcesManager.tsx
6. Mettre à jour resources/types.ts pour importer depuis '../resource-dialog'

## Validation
- npm run lint → 0 errors (pas de warning set-state)
- Compter lignes : tous < 350
```

**Différences clés vs prompt original** :
- Extraction FileUploadZone au lieu de ResourceTypeSelector
- setTimeout workaround pour éviter warning ESLint
- resourceTypes config dans types.ts (DRY)

---

### Prompt 8.R.9 — Extraire useAssignmentSubmit hook ✅

```markdown
Extraire `src/components/features/assignments/hooks/useAssignmentSubmit.ts` :

## Objectif
Séparer la logique de soumission du composant UI.

## Hook
function useAssignmentSubmit(options: {
  onSuccess: () => void;
  editingAssignment?: AssignmentWithDetails | null;
}) {
  return {
    submit: async (formData) => Promise<void>,
    isSubmitting: boolean,
    error: string | null,
  };
}

## Contenu à extraire
- Logique handleSubmit
- Appels fetch POST/PUT
- Gestion erreurs
- Toast notifications
```

### Prompt Optimal 8.R.9

> **Itérations réelles** : 1
> **Résultat** : 429 lignes → 258+189+59 = 506 lignes (modularisé)

```markdown
Extraire NewAssignmentModal en fichiers séparés :

## Structure cible
src/components/features/teacher/assignments/
├── NewAssignmentModal.tsx   (UI formulaire)
├── useAssignmentSubmit.ts   (hook logique soumission)
└── StepProgressBar.tsx      (indicateur d'étapes)

## Règles
1. Créer `useAssignmentSubmit.ts` avec toute la logique async :
   - handleSubmit, validateStep, buildPayload
   - États isSubmitting, error
   - Appels fetch POST/PUT /api/teacher/assignments
2. Créer `StepProgressBar.tsx` composant simple (steps, currentStep props)
3. Garder NewAssignmentModal < 300 lignes (états form + rendu)
4. Le hook reçoit courseId, classId, onSuccess en params

## Validation
- npm run lint → 0 errors
- Compter lignes : tous < 350
```

**Différences clés vs prompt original** :
- Pas de sous-dossier hooks/, fichiers au même niveau
- Extraction StepProgressBar en bonus
- Hook reçoit plus de params (courseId, classId)

---

### Prompt 8.R.10 — Extraire ConversationItem ✅

```markdown
Extraire `src/components/features/messages/ConversationItem.tsx` :

## Props
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

## Contenu à extraire
- Avatar du participant
- Nom et dernier message
- Badge non lu
- Timestamp formaté
```

### Prompt Optimal 8.R.10

> **Itérations réelles** : 1
> **Résultat** : 356 lignes → 216+106+88 = 410 lignes (modularisé)

```markdown
Extraire ConversationsList en fichiers séparés :

## Structure cible
src/components/features/shared/messages/
├── ConversationsList.tsx   (liste principale)
├── ConversationItem.tsx    (item individuel)
└── types.ts                (interfaces + categoryConfig + helpers)

## Règles
1. Créer `types.ts` avec :
   - Category, Conversation, Message interfaces
   - categoryConfig object (icons, labels, colors par catégorie)
   - Helpers : formatRelativeTime, getCategoryColor
2. Créer `ConversationItem.tsx` avec :
   - Avatar, nom, preview message, badge unread
   - Formatage timestamp avec formatRelativeTime
3. Garder ConversationsList < 250 lignes (filtrage + rendu liste)
4. ⚠️ Utiliser `@/components/features/shared/messages/types` dans les imports

## Validation
- npm run lint → 0 errors
- Compter lignes : tous < 350
```

**Différences clés vs prompt original** :
- Ajout types.ts avec categoryConfig centralisé
- Helpers formatRelativeTime, getCategoryColor
- Structure shared/messages/ (utilisé par student ET teacher)

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Notes |
|-------|------|-------|------------|-------|
| 8.1 | | | | Dashboard complet |
| 8.2 | | | | Mes Cours |
| 8.3 | | | | Détail Cours |
| 8.4 | | | | Mes Exercices |
| 8.5 | | | | Messagerie |
| 8.7 | 2026-01-03 | 3h | 6 | Agenda Élève + deadlines perso |
| 8.R.1-4 | 2026-01-03 | 1h | 4 | Composants partagés filters/ |
| 8.R.5 | 2026-01-03 | 30min | 1 | QuizEditorInline mutualisé |
| 8.R.6+7 | 2026-01-03 | 30min | 1 | QuizViewer extrait en quiz/ |
| 8.R.8 | 2026-01-03 | 30min | 2 | ResourceFormDialog extrait (fix ESLint) |
| 8.R.9 | 2026-01-03 | 20min | 1 | NewAssignmentModal extrait |
| 8.R.10 | 2026-01-03 | 20min | 1 | ConversationsList extrait |

### 📊 Bilan Phase 8.R

| Métrique | Avant | Après |
|----------|-------|-------|
| Fichiers > 350 lignes | 6 | 0 |
| Doublons éliminés | 1 (QuizEditorInline) | - |
| Composants partagés créés | 0 | 15+ |
| ESLint errors | 0 | 0 |

---

*Dernière mise à jour : 2026-01-03*

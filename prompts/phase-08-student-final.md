# 🎓 Prompts Phase 8 — Interface Élève (5 Onglets)

> **Objectif** : Prompts optimaux avec code prêt à l'emploi

---

## 📦 ONGLET 1 — Dashboard

### Prompt 8.1 — API Dashboard

```
Crée l'API /api/student/dashboard/route.ts qui retourne :

{
  student: { id, firstName, lastName, classId, className },
  kpis: {
    averageGrade: number (moyenne sur 20),
    progressPercent: number (% cours terminés),
    pendingAssignments: number (non rendus),
    coursesCount: number (cours dans ma classe)
  },
  recentGrades: [{
    id, courseName, subject, grade, maxGrade, 
    aiAssisted: boolean, completedAt: Date
  }], // 5 dernières
  upcomingDeadlines: [{
    id, title, type, deadline, courseName, subject
  }] // 5 prochaines
}

Sécurité : user.classId pour filtrer
Réponse : NextResponse + try/catch complet
```

### Code API Dashboard

```typescript
// src/app/api/student/dashboard/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { class: true }
    });

    if (!student?.classId) {
      return NextResponse.json({ error: 'Élève sans classe' }, { status: 400 });
    }

    // KPIs
    const [scores, assignments, courses, progress] = await Promise.all([
      // Moyenne générale
      prisma.studentScore.findMany({
        where: { studentId: student.id },
        select: { score: true, maxScore: true }
      }),
      // Assignations en attente
      prisma.assignment.count({
        where: {
          classId: student.classId,
          deadline: { gte: new Date() },
          NOT: {
            StudentScore: { some: { studentId: student.id } }
          }
        }
      }),
      // Nombre de cours
      prisma.course.count({
        where: { classId: student.classId, status: 'PUBLISHED' }
      }),
      // Progression
      prisma.studentProgress.findMany({
        where: { studentId: student.id },
        include: {
          section: { include: { chapter: { include: { course: true } } } }
        }
      })
    ]);

    // Calcul moyenne
    const totalPoints = scores.reduce((sum, s) => sum + (s.score || 0), 0);
    const maxPoints = scores.reduce((sum, s) => sum + (s.maxScore || 20), 0);
    const averageGrade = maxPoints > 0 ? (totalPoints / maxPoints) * 20 : 0;

    // Calcul progression
    const totalSections = await prisma.section.count({
      where: {
        chapter: { course: { classId: student.classId, status: 'PUBLISHED' } }
      }
    });
    const completedSections = progress.filter(p => p.completed).length;
    const progressPercent = totalSections > 0 
      ? Math.round((completedSections / totalSections) * 100) 
      : 0;

    // Dernières notes
    const recentGrades = await prisma.studentScore.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        assignment: {
          include: { course: { include: { subject: true } } }
        }
      }
    });

    // Prochaines échéances
    const upcomingDeadlines = await prisma.assignment.findMany({
      where: {
        classId: student.classId,
        deadline: { gte: new Date() },
        NOT: { StudentScore: { some: { studentId: student.id } } }
      },
      orderBy: { deadline: 'asc' },
      take: 5,
      include: {
        course: { include: { subject: true } }
      }
    });

    return NextResponse.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        classId: student.classId,
        className: student.class?.name
      },
      kpis: {
        averageGrade: Math.round(averageGrade * 10) / 10,
        progressPercent,
        pendingAssignments: assignments,
        coursesCount: courses
      },
      recentGrades: recentGrades.map(g => ({
        id: g.id,
        courseName: g.assignment.course?.title || 'Sans cours',
        subject: g.assignment.course?.subject?.name || 'Général',
        grade: g.score,
        maxGrade: g.maxScore,
        aiAssisted: g.aiAssisted,
        completedAt: g.createdAt
      })),
      upcomingDeadlines: upcomingDeadlines.map(d => ({
        id: d.id,
        title: d.title,
        type: d.type,
        deadline: d.deadline,
        courseName: d.course?.title,
        subject: d.course?.subject?.name
      }))
    });
  } catch (error) {
    console.error('[STUDENT_DASHBOARD]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

### Prompt 8.1.2 — StudentKPIGrid

```
Crée StudentKPIGrid.tsx avec 4 KPIs :
1. Progression (%) - icône BookOpen - bleu
2. Moyenne (/20) - icône Trophy - vert
3. À faire (count) - icône ClipboardList - orange (rouge si > 5)
4. Mes Cours (count) - icône GraduationCap - violet

Props: { kpis: { averageGrade, progressPercent, pendingAssignments, coursesCount } }
Réutilise KPICard si dispo sinon créer composant simple.
Animation: compteur progressif au chargement.
```

### Code StudentKPIGrid

```tsx
// src/components/features/student/dashboard/StudentKPIGrid.tsx
'use client';

import { BookOpen, Trophy, ClipboardList, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StudentKPIs {
  averageGrade: number;
  progressPercent: number;
  pendingAssignments: number;
  coursesCount: number;
}

export function StudentKPIGrid({ kpis }: { kpis: StudentKPIs }) {
  const items = [
    {
      label: 'Progression',
      value: `${kpis.progressPercent}%`,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
      trend: kpis.progressPercent > 50 ? '↑' : '↓'
    },
    {
      label: 'Moyenne',
      value: `${kpis.averageGrade}/20`,
      icon: Trophy,
      color: 'text-green-600 bg-green-100',
      trend: kpis.averageGrade >= 10 ? '✓' : '⚠'
    },
    {
      label: 'À faire',
      value: kpis.pendingAssignments.toString(),
      icon: ClipboardList,
      color: kpis.pendingAssignments > 5 
        ? 'text-red-600 bg-red-100' 
        : 'text-orange-600 bg-orange-100',
      trend: kpis.pendingAssignments > 5 ? '!' : ''
    },
    {
      label: 'Mes Cours',
      value: kpis.coursesCount.toString(),
      icon: GraduationCap,
      color: 'text-violet-600 bg-violet-100',
      trend: ''
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              {item.trend && (
                <span className="text-sm font-medium">{item.trend}</span>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold">{item.value}</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Prompt 8.1.3 — RecentGradesTable

```
Crée RecentGradesTable.tsx pour afficher les 5 dernières notes.
Colonnes: Matière, Cours, Note, Badge IA, Date
Badge couleur selon note: >= 15 vert, >= 10 orange, < 10 rouge
Badge IA si aiAssisted = true
Responsive: sur mobile, cacher certaines colonnes
```

### Code RecentGradesTable

```tsx
// src/components/features/student/dashboard/RecentGradesTable.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Grade {
  id: string;
  courseName: string;
  subject: string;
  grade: number | null;
  maxGrade: number;
  aiAssisted: boolean;
  completedAt: Date;
}

export function RecentGradesTable({ grades }: { grades: Grade[] }) {
  const getGradeBadge = (grade: number | null, max: number) => {
    if (grade === null) return <Badge variant="outline">En attente</Badge>;
    const percent = (grade / max) * 100;
    if (percent >= 75) return <Badge className="bg-green-500">{grade}/{max}</Badge>;
    if (percent >= 50) return <Badge className="bg-orange-500">{grade}/{max}</Badge>;
    return <Badge className="bg-red-500">{grade}/{max}</Badge>;
  };

  if (grades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📊 Dernières notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Aucune note pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

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
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{grade.subject}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {grade.courseName}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {grade.aiAssisted && (
                  <Sparkles className="h-4 w-4 text-purple-500" title="Assisté par IA" />
                )}
                {getGradeBadge(grade.grade, grade.maxGrade)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Prompt 8.1.4 — UpcomingDeadlines

```
Crée UpcomingDeadlines.tsx pour afficher les 5 prochaines échéances.
Pour chaque item: Titre, Type (Quiz/Devoir/Exercice), Date relative, Urgence
Urgence: 
- Rouge "!" si < 24h
- Orange "⚠" si < 3 jours
- Vert sinon
Clic: lien vers /student/assignments?id=X
```

### Code UpcomingDeadlines

```tsx
// src/components/features/student/dashboard/UpcomingDeadlines.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface Deadline {
  id: string;
  title: string;
  type: string;
  deadline: Date;
  courseName?: string;
  subject?: string;
}

export function UpcomingDeadlines({ deadlines }: { deadlines: Deadline[] }) {
  const getUrgency = (deadline: Date) => {
    const hours = differenceInHours(new Date(deadline), new Date());
    if (hours < 24) return { icon: AlertCircle, color: 'text-red-500', label: 'Urgent' };
    if (hours < 72) return { icon: AlertTriangle, color: 'text-orange-500', label: 'Bientôt' };
    return { icon: Clock, color: 'text-green-500', label: '' };
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      QUIZ: '📝 Quiz',
      HOMEWORK: '📄 Devoir',
      EXERCISE: '✏️ Exercice',
      PROJECT: '📊 Projet'
    };
    return types[type] || type;
  };

  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📅 Prochaines échéances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
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
          {deadlines.map((item) => {
            const urgency = getUrgency(item.deadline);
            const UrgencyIcon = urgency.icon;
            
            return (
              <Link
                key={item.id}
                href={`/student/assignments?id=${item.id}`}
                className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{item.title}</p>
                      <UrgencyIcon className={`h-4 w-4 ${urgency.color} shrink-0`} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.subject} • {getTypeBadge(item.type)}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {formatDistanceToNow(new Date(item.deadline), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📦 ONGLET 2 — Mes Cours

### Prompt 8.2 — API Cours Liste

```
Crée l'API /api/student/courses/route.ts qui retourne les cours de la classe de l'élève avec sa progression.

Response:
{
  courses: [{
    id, title, description, subject: { id, name, color },
    teacher: { firstName, lastName },
    totalSections: number,
    completedSections: number,
    progressPercent: number,
    lastAccessed: Date | null
  }]
}

Filtres query params optionnels:
- subject: string (filtrer par matière)
- status: 'in-progress' | 'completed' | 'not-started'
```

### Code API Cours

```typescript
// src/app/api/student/courses/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectFilter = searchParams.get('subject');
    const statusFilter = searchParams.get('status');

    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true }
    });

    if (!student?.classId) {
      return NextResponse.json({ error: 'Élève sans classe' }, { status: 400 });
    }

    const courses = await prisma.course.findMany({
      where: {
        classId: student.classId,
        status: 'PUBLISHED',
        ...(subjectFilter && { subjectId: subjectFilter })
      },
      include: {
        subject: true,
        teacher: { select: { firstName: true, lastName: true } },
        chapters: {
          include: {
            sections: {
              include: {
                progress: {
                  where: { studentId: session.user.id }
                }
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const coursesWithProgress = courses.map(course => {
      const allSections = course.chapters.flatMap(c => c.sections);
      const totalSections = allSections.length;
      const completedSections = allSections.filter(
        s => s.progress.some(p => p.completed)
      ).length;
      const progressPercent = totalSections > 0 
        ? Math.round((completedSections / totalSections) * 100)
        : 0;

      const lastProgress = allSections
        .flatMap(s => s.progress)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        subject: course.subject,
        teacher: course.teacher,
        totalSections,
        completedSections,
        progressPercent,
        lastAccessed: lastProgress?.updatedAt || null
      };
    });

    // Filtrer par status si demandé
    let filtered = coursesWithProgress;
    if (statusFilter === 'completed') {
      filtered = coursesWithProgress.filter(c => c.progressPercent === 100);
    } else if (statusFilter === 'in-progress') {
      filtered = coursesWithProgress.filter(c => c.progressPercent > 0 && c.progressPercent < 100);
    } else if (statusFilter === 'not-started') {
      filtered = coursesWithProgress.filter(c => c.progressPercent === 0);
    }

    return NextResponse.json({ courses: filtered });
  } catch (error) {
    console.error('[STUDENT_COURSES]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

### Prompt 8.2.2 — StudentCourseCard

```
Crée StudentCourseCard.tsx avec:
- Badge matière coloré
- Titre + description (2 lignes max)
- Nom du prof
- Barre de progression avec %
- Bouton "Continuer" ou "Commencer" ou "Revoir"
```

### Code StudentCourseCard

```tsx
// src/components/features/student/courses/StudentCourseCard.tsx
'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string | null;
  subject: { id: string; name: string; color: string } | null;
  teacher: { firstName: string | null; lastName: string | null } | null;
  progressPercent: number;
  totalSections: number;
  completedSections: number;
}

export function StudentCourseCard({ course }: { course: Course }) {
  const getStatus = () => {
    if (course.progressPercent === 100) return { label: 'Revoir', icon: RefreshCw, variant: 'outline' as const };
    if (course.progressPercent > 0) return { label: 'Continuer', icon: ArrowRight, variant: 'default' as const };
    return { label: 'Commencer', icon: Play, variant: 'default' as const };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardContent className="flex-1 p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge 
            style={{ backgroundColor: course.subject?.color || '#6366f1' }}
            className="text-white"
          >
            {course.subject?.name || 'Général'}
          </Badge>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <h3 className="font-semibold text-lg line-clamp-1 mt-2">
          {course.title}
        </h3>
        
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {course.description}
          </p>
        )}

        {course.teacher && (
          <p className="text-sm text-muted-foreground mt-2">
            👨‍🏫 {course.teacher.firstName} {course.teacher.lastName}
          </p>
        )}

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-medium">{course.progressPercent}%</span>
          </div>
          <Progress value={course.progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {course.completedSections}/{course.totalSections} sections
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button variant={status.variant} className="w-full" asChild>
          <Link href={`/student/courses/${course.id}`}>
            <StatusIcon className="h-4 w-4 mr-2" />
            {status.label}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 📦 ONGLET 3 — Assignations

### Prompt 8.3 — Page Assignations

```
Crée la page /student/assignments avec:
- 3 compteurs en haut (À faire, En cours, Terminé)
- Toggle Vue Liste / Vue Calendrier
- Filtres: Type (Quiz/Devoir/Exercice), Statut, Matière
- Liste des assignations avec cards
- Calendrier react-big-calendar (réutiliser le composant existant)
```

---

## 📦 ONGLET 4 — Assistant IA

### Prompt 8.4 — Page Assistant

```
Crée la page /student/ai avec 2 onglets :

1. "Mes Cours" : 
   - Grille des cours ayant un environnement IA configuré
   - Clic → ouvre le workspace IA avec sources du prof
   
2. "Lab Libre" :
   - Dashboard des projets personnels
   - Bouton "Nouveau projet"
   - Historique des conversations

Réutiliser StudentAIChatPage.tsx existant.
```

---

## 📦 ONGLET 5 — Messages

### Prompt 8.5 — Page Messages

```
Crée la page /student/messages avec:
- Sidebar: Chat classe + Profs + Élèves de ma classe
- Zone conversation (réutiliser MessageThread)
- Input message (réutiliser MessageInput)
- Badge non-lus sur chaque contact

Sécurité: L'élève ne peut envoyer qu'à sa classe (profs + élèves).
```

---

## 🔗 Navigation et Liens

| Onglet | Prompt Principal | Composants |
|:-------|:-----------------|:-----------|
| Dashboard | 8.1 | KPIGrid, GradesTable, Deadlines |
| Mes Cours | 8.2 | CourseCard, CourseDetail, Progress |
| Assignations | 8.3 | AssignmentCard, Calendar, Filters |
| Assistant IA | 8.4 | AIWorkspace, LabDashboard |
| Messages | 8.5 | ContactsList, MessageThread |

---

*Fichier : prompts/phase-08-student-final.md | ~350 lignes*

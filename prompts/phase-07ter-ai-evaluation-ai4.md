# Phase 7ter — AI4.4 : Page Détail Cours Élève

> **Tâche** : AI4.4 — Créer la page `/teacher/students/[id]/courses/[courseId]`  
> **Objectif** : Vue détaillée des activités d'un élève pour un cours spécifique  
> **Effort** : 1h  
> **Fichiers TODO** : [todo/phase-07ter-ai-evaluation.md](../todo/phase-07ter-ai-evaluation.md)

---

## 🎯 Objectif

Quand le prof clique sur un cours dans la fiche élève, il accède à une page détaillée montrant :
- KPIs du cours (continu, IA, examen, final)
- Timeline chronologique des activités IA
- Liste des quiz avec scores
- Liste des exercices avec scores
- Graphique de progression

---

## 📋 Prompt AI4.4.1 — Page Server Component

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6).

CONTEXTE :
- Page fiche élève existante avec CourseScoreRow
- Besoin d'une page détaillée quand on clique sur un cours
- URL : /teacher/students/[id]/courses/[courseId]

TÂCHE :
Créer `src/app/(dashboard)/teacher/students/[id]/courses/[courseId]/page.tsx`.

STRUCTURE :

```typescript
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { StudentCourseDetailPage } from '@/components/features/teacher/StudentCourseDetailPage';

interface PageProps {
  params: Promise<{
    id: string;      // studentId
    courseId: string;
  }>;
}

export default async function TeacherStudentCourseDetailPage({ params }: PageProps) {
  const { id: studentId, courseId } = await params;
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  // 1. Vérifier accès (prof possède la classe de l'élève)
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { classes: { select: { id: true } } },
  });

  if (!teacherProfile) {
    redirect('/login');
  }

  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      class: { select: { id: true, name: true, level: true } },
    },
  });

  if (!student) {
    notFound();
  }

  const hasAccess = teacherProfile.classes.some((c) => c.id === student.classId);
  if (!hasAccess) {
    notFound();
  }

  // 2. Récupérer le cours
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      title: true,
      subject: { select: { name: true } },
    },
  });

  if (!course) {
    notFound();
  }

  // 3. Récupérer StudentScore pour ce cours
  const studentScore = await prisma.studentScore.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });

  // 4. Récupérer toutes les activités IA pour ce cours
  const aiActivities = await prisma.aIActivityScore.findMany({
    where: { studentId, courseId },
    orderBy: { createdAt: 'desc' },
  });

  // 5. Récupérer les progrès (quiz/exercices)
  const progress = await prisma.studentProgress.findMany({
    where: {
      studentId,
      assignment: {
        course: { id: courseId },
      },
    },
    include: {
      assignment: {
        include: {
          section: { select: { title: true, type: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <StudentCourseDetailPage
      student={{
        id: student.user.id,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        className: student.class.name,
        level: student.class.level,
      }}
      course={{
        id: course.id,
        title: course.title,
        subject: course.subject.name,
      }}
      scores={studentScore}
      aiActivities={aiActivities}
      progress={progress}
    />
  );
}
```

RÈGLES :
- Server Component (auth + query)
- Vérification accès stricte
- < 100 lignes
```

---

## 📋 Prompt AI4.4.2 — Client Component Principal

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Page server créée (AI4.4.1)
- Besoin d'afficher les données côté client

TÂCHE :
Créer `src/components/features/teacher/StudentCourseDetailPage.tsx`.

STRUCTURE :

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { ScoreBadge, PercentageBadge } from '@/components/ui/score-badge';
import { CourseActivityTimeline } from './CourseActivityTimeline';
import { CourseProgressList } from './CourseProgressList';
import { CourseProgressChart } from './CourseProgressChart';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  className: string;
  level: string;
}

interface Course {
  id: string;
  title: string;
  subject: string;
}

interface StudentScore {
  continuousScore: number;
  examGrade: number | null;
  finalGrade: number | null;
  aiComprehension: number;
}

interface AIActivity {
  id: string;
  activityType: string;
  comprehensionScore: number;
  accuracyScore: number;
  autonomyScore: number;
  finalScore: number;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string | null;
  createdAt: Date;
  duration: number;
}

interface Progress {
  id: string;
  score: number;
  status: string;
  assignment: {
    section: {
      title: string;
      type: string;
    };
  };
  updatedAt: Date;
}

interface Props {
  student: Student;
  course: Course;
  scores: StudentScore | null;
  aiActivities: AIActivity[];
  progress: Progress[];
}

export function StudentCourseDetailPage({
  student,
  course,
  scores,
  aiActivities,
  progress,
}: Props) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'timeline' | 'quiz' | 'exercises'>('timeline');

  // Calculer alertLevel
  const alertLevel = scores?.finalGrade
    ? scores.finalGrade >= 4.5
      ? 'success'
      : scores.finalGrade >= 3.5
      ? 'warning'
      : 'danger'
    : 'none';

  // Filtrer par type
  const quizzes = progress.filter((p) => p.assignment.section.type === 'QUIZ');
  const exercises = progress.filter((p) => p.assignment.section.type === 'EXERCISE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {student.firstName} {student.lastName} — {course.title}
          </h1>
          <p className="text-muted-foreground">
            {student.className} ({student.level}) • {student.email} • {course.subject}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>📊 KPIs Cours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Continu</p>
              <PercentageBadge percentage={scores?.continuousScore || 0} size="lg" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Moy IA</p>
              <PercentageBadge percentage={scores?.aiComprehension || 0} size="lg" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Examen</p>
              {scores?.examGrade !== null ? (
                <ScoreBadge score={scores.examGrade} size="lg" />
              ) : (
                <span className="text-lg text-muted-foreground">—</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Final</p>
              {scores?.finalGrade !== null ? (
                <ScoreBadge score={scores.finalGrade} size="lg" />
              ) : (
                <span className="text-lg text-muted-foreground">—</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Statut</p>
              <span
                className={`text-2xl ${
                  alertLevel === 'success'
                    ? 'text-green-500'
                    : alertLevel === 'warning'
                    ? 'text-amber-500'
                    : alertLevel === 'danger'
                    ? 'text-red-500'
                    : 'text-gray-400'
                }`}
              >
                {alertLevel === 'success'
                  ? '🟢'
                  : alertLevel === 'warning'
                  ? '🟡'
                  : alertLevel === 'danger'
                  ? '🔴'
                  : '⚪'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedTab('timeline')}
          className={`px-4 py-2 font-medium ${
            selectedTab === 'timeline'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
        >
          🤖 Activités IA ({aiActivities.length})
        </button>
        <button
          onClick={() => setSelectedTab('quiz')}
          className={`px-4 py-2 font-medium ${
            selectedTab === 'quiz'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
        >
          📝 Quiz ({quizzes.length})
        </button>
        <button
          onClick={() => setSelectedTab('exercises')}
          className={`px-4 py-2 font-medium ${
            selectedTab === 'exercises'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
        >
          💻 Exercices ({exercises.length})
        </button>
      </div>

      {/* Content */}
      {selectedTab === 'timeline' && (
        <>
          <CourseActivityTimeline activities={aiActivities} />
          <CourseProgressChart activities={aiActivities} />
        </>
      )}
      {selectedTab === 'quiz' && <CourseProgressList items={quizzes} type="quiz" />}
      {selectedTab === 'exercises' && <CourseProgressList items={exercises} type="exercise" />}
    </div>
  );
}
```

RÈGLES :
- 'use client'
- Tabs pour timeline/quiz/exercices
- 5 KPIs en header
- < 200 lignes
```

---

## 📋 Prompt AI4.4.3 — CourseActivityTimeline

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Afficher timeline chronologique des activités IA
- Design type "feed" avec détails compréhension/précision/autonomie

TÂCHE :
Créer `src/components/features/teacher/CourseActivityTimeline.tsx`.

STRUCTURE :

```typescript
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PercentageBadge } from '@/components/ui/score-badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AIActivity {
  id: string;
  activityType: string;
  comprehensionScore: number;
  accuracyScore: number;
  autonomyScore: number;
  finalScore: number;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string | null;
  createdAt: Date;
  duration: number;
}

interface Props {
  activities: AIActivity[];
}

export function CourseActivityTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucune activité IA pour ce cours
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">🤖 Activités IA (Chronologique)</h2>
      {activities.map((activity) => {
        const strengths = activity.strengths ? JSON.parse(activity.strengths) : [];
        const weaknesses = activity.weaknesses ? JSON.parse(activity.weaknesses) : [];

        return (
          <Card key={activity.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">
                      {activity.activityType === 'QUIZ'
                        ? '📝'
                        : activity.activityType === 'EXERCISE'
                        ? '💻'
                        : '📚'}
                    </span>
                    <div>
                      <p className="font-medium">
                        {activity.activityType === 'QUIZ'
                          ? 'Quiz'
                          : activity.activityType === 'EXERCISE'
                          ? 'Exercice'
                          : 'Révision'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}{' '}
                        • {activity.duration} min
                      </p>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Score:</span>
                      <PercentageBadge percentage={activity.finalScore} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🧠</span>
                      <PercentageBadge percentage={activity.comprehensionScore} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✅</span>
                      <PercentageBadge percentage={activity.accuracyScore} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🚀</span>
                      <PercentageBadge percentage={activity.autonomyScore} />
                    </div>
                  </div>

                  {/* Strengths */}
                  {strengths.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-green-600">💪 Points forts :</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {strengths.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {weaknesses.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-amber-600">📝 À améliorer :</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {weaknesses.map((w: string, i: number) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation */}
                  {activity.recommendation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-sm font-medium text-blue-700">🎯 Recommandation :</p>
                      <p className="text-sm text-blue-600">{activity.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

RÈGLES :
- Tri chronologique (plus récent en haut)
- Couleurs cohérentes (strengths vert, weaknesses ambre)
- date-fns pour dates relatives
- < 150 lignes
```

---

## 📋 Prompt AI4.4.4 — CourseProgressChart

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Chart.js, react-chartjs-2).

CONTEXTE :
- Graphique évolution scores IA dans le temps
- Afficher les 3 scores (compréhension, précision, autonomie)

TÂCHE :
Créer `src/components/features/teacher/CourseProgressChart.tsx`.

PRÉREQUIS :
```bash
npm install chart.js react-chartjs-2
```

STRUCTURE :

```typescript
'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface AIActivity {
  comprehensionScore: number;
  accuracyScore: number;
  autonomyScore: number;
  createdAt: Date;
}

interface Props {
  activities: AIActivity[];
}

export function CourseProgressChart({ activities }: Props) {
  if (activities.length === 0) return null;

  // Trier par date croissante
  const sorted = [...activities].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const data = {
    labels: sorted.map((a, i) => `Activité ${i + 1}`),
    datasets: [
      {
        label: '🧠 Compréhension',
        data: sorted.map((a) => a.comprehensionScore),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
      {
        label: '✅ Précision',
        data: sorted.map((a) => a.accuracyScore),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      },
      {
        label: '🚀 Autonomie',
        data: sorted.map((a) => a.autonomyScore),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value: number) => `${value}%`,
        },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <Line data={data} options={options} />
      </CardContent>
    </Card>
  );
}
```

RÈGLES :
- 3 courbes (bleu, vert, violet)
- Axe Y : 0-100%
- Labels simples (Activité 1, 2, 3...)
- < 100 lignes
```

---

## 📋 Prompt AI4.4.5 — CourseProgressList

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Liste des quiz ou exercices pour ce cours
- Afficher score + status

TÂCHE :
Créer `src/components/features/teacher/CourseProgressList.tsx`.

STRUCTURE :

```typescript
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PercentageBadge } from '@/components/ui/score-badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Progress {
  id: string;
  score: number;
  status: string;
  assignment: {
    section: {
      title: string;
    };
  };
  updatedAt: Date;
}

interface Props {
  items: Progress[];
  type: 'quiz' | 'exercise';
}

export function CourseProgressList({ items, type }: Props) {
  const icon = type === 'quiz' ? '📝' : '💻';
  const label = type === 'quiz' ? 'Quiz' : 'Exercices';

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucun {type === 'quiz' ? 'quiz' : 'exercice'} pour ce cours
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {icon} {label} ({items.length})
      </h2>
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="font-medium">{item.assignment.section.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.updatedAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <PercentageBadge percentage={item.score} size="md" />
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'in_progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.status === 'completed'
                    ? 'Terminé'
                    : item.status === 'in_progress'
                    ? 'En cours'
                    : 'Pas commencé'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Card>
  );
}
```

RÈGLES :
- Grille simple de cartes
- Score + status visible
- Tri par updatedAt desc
- < 100 lignes
```

---

## 📋 Prompt AI4.4.6 — Rendre CourseScoreRow cliquable

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- CourseScoreRow existant dans StudentScorePage
- Besoin de le rendre cliquable vers /teacher/students/[id]/courses/[courseId]

TÂCHE :
Modifier `src/components/features/teacher/CourseScoreRow.tsx`.

MODIFICATION :

Wrapper l'AccordionTrigger dans un Link ou ajouter onClick sur le titre :

```typescript
import Link from 'next/link';

// Dans le composant, ajouter prop studentId
interface CourseScoreRowProps {
  studentId: string;  // NOUVEAU
  courseScore: CourseScoreData;
  onEditExam: () => void;
}

// Dans le render, ajouter Link sur le titre
<Link 
  href={`/teacher/students/${studentId}/courses/${courseScore.course.id}`}
  className="hover:underline"
>
  <span className="font-medium">{courseScore.course.title}</span>
</Link>
```

OU utiliser router.push dans onClick si tu préfères.

RÈGLES :
- Conserver l'accordion (ne pas casser le code existant)
- Link sur le titre uniquement
- Hover state visible
```

---

## ✅ Checklist AI4.4

- [ ] Page `/teacher/students/[id]/courses/[courseId]` créée
- [ ] Vérification accès prof OK
- [ ] StudentCourseDetailPage affiche 5 KPIs
- [ ] Tabs (Timeline / Quiz / Exercices) fonctionnels
- [ ] CourseActivityTimeline affiche activités IA
- [ ] CourseProgressChart affiche 3 courbes
- [ ] CourseProgressList affiche quiz et exercices
- [ ] CourseScoreRow cliquable
- [ ] npm install chart.js react-chartjs-2
- [ ] npm run build OK
- [ ] < 200 lignes par composant

---

*Lignes : ~500 | Dernière MAJ : 2025-12-30*

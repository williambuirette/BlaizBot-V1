# Phase 7bis — Système de Scoring & Fiche Élève

> **Objectif** : Créer le système de notation "Bottom-Up" avec fiche élève enrichie  
> **Fichiers TODO** : [todo/phase-07bis-scoring.md](../todo/phase-07bis-scoring.md)  
> **Statut** : ✅ TERMINÉ (7bis.1-8 + F1-F4 + S1-S6 + C1-C4 + CL1-CL7 + améliorations)

---

## 🎯 Récapitulatif des Tâches

| # | Tâche | Statut |
|:--|:------|:-------|
| 7bis.1 | Migration Prisma (`StudentScore`) | ✅ |
| 7bis.2 | API Scores Élève | ✅ |
| 7bis.3 | Service Stats | ✅ |
| 7bis.4 | Composant ScoreBadge | ✅ |
| 7bis.5 | Page Fiche Élève | ✅ |
| 7bis.6 | Composants Scores | ✅ |
| 7bis.7 | Dialog Saisie Examen | ✅ |
| 7bis.8 | Navigation depuis Liste | ✅ |
| **F1** | Seed StudentScore (données test) | ✅ |
| **F2** | Composant FilterBar | ✅ |
| **F3** | Logique de tri | ✅ |
| **F4** | Intégration page | ✅ |
| **S1** | Types & Interfaces | ✅ |
| **S2** | API stats élèves | ✅ |
| **S3** | StudentFilterBar | ✅ |
| **S4** | StudentCard enrichie | ✅ |
| **S5** | Logique filtrage | ✅ |
| **S6** | Intégration page | ✅ |
| **C1** | Types & calculs stats | ✅ |
| **C2** | Composant StatsCounters | ✅ |
| **C3** | Boutons sélection groupe | ✅ |
| **C4** | Intégration page | ✅ |
| **CL1** | Types & interfaces classes | ✅ |
| **CL2** | Fonctions filtrage/stats | ✅ |
| **CL3** | ClassFilterBar (multi-matières) | ✅ |
| **CL4** | ClassStatsCounters | ✅ |
| **CL5** | TeacherClassCard enrichie | ✅ |
| **CL6** | ClassesList intégration | ✅ |
| **CL7** | Page server + query | ✅ |

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Tâche 7bis.1 — Migration Prisma

### Prompt 7bis.1.1 — Ajouter modèle StudentScore

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6, Neon Postgres).

CONTEXTE :
- Système de notation suisse (notes sur 6)
- Score continu (Quiz + Exercices + IA) → calculé automatiquement
- Note examen → saisie par le professeur
- Score final = (Continu × 40%) + (Examen × 60%)

TÂCHE :
Modifier `prisma/schema.prisma` pour ajouter le modèle StudentScore.

MODÈLE À AJOUTER (après StudentProgress) :

```prisma
// Score agrégé par élève et par cours
model StudentScore {
  id          String   @id @default(cuid())
  
  studentId   String
  student     User     @relation("StudentScores", fields: [studentId], references: [id], onDelete: Cascade)
  
  courseId    String
  course      Course   @relation("CourseScores", fields: [courseId], references: [id], onDelete: Cascade)
  
  // Scores IA automatiques (0-100)
  quizAvg         Float    @default(0)
  exerciseAvg     Float    @default(0)
  aiComprehension Float    @default(0)
  continuousScore Float    @default(0)
  
  // Compteurs
  quizCount       Int      @default(0)
  exerciseCount   Int      @default(0)
  aiSessionCount  Int      @default(0)
  
  // Examen Final (note prof sur 6)
  examGrade       Float?
  examDate        DateTime?
  examComment     String?
  
  // Score Final calculé
  finalScore      Float?
  finalGrade      Float?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
}
```

RELATIONS À AJOUTER :
1. Dans `model User` : `studentScores StudentScore[] @relation("StudentScores")`
2. Dans `model Course` : `studentScores StudentScore[] @relation("CourseScores")`

APRÈS MODIFICATION :
- Exécuter : `npx prisma db push`
- Vérifier que le client est généré sans erreur
```

### Validation 7bis.1
- [ ] Modèle ajouté au schema
- [ ] Relations User et Course ajoutées
- [ ] `npx prisma db push` réussit

---

## 📋 Tâche 7bis.2 — API Scores Élève

### Prompt 7bis.2.1 — Créer API GET/PUT Scores

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma).

CONTEXTE :
- Le professeur veut voir les scores d'un élève
- Le professeur peut saisir la note d'examen
- SÉCURITÉ : Le prof ne voit que les élèves de SES classes

TÂCHE :
Créer `src/app/api/teacher/students/[id]/scores/route.ts`

STRUCTURE :

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET : Récupérer tous les scores d'un élève
export async function GET(req: Request, { params }: RouteParams) {
  const { id: studentId } = await params;
  const session = await auth();
  
  if (session?.user?.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Vérifier que le prof a accès à cet élève
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { classes: { select: { id: true } } },
  });
  
  if (!teacherProfile) {
    return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 });
  }

  // 2. Vérifier que l'élève est dans une des classes du prof
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    include: { 
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      class: { select: { id: true, name: true } },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const hasAccess = teacherProfile.classes.some(c => c.id === student.classId);
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Récupérer les scores par cours
  const scores = await prisma.studentScore.findMany({
    where: { studentId },
    include: {
      course: { select: { id: true, title: true, subject: { select: { name: true } } } },
    },
    orderBy: { course: { title: "asc" } },
  });

  // 4. Récupérer les détails Quiz/Exercices depuis StudentProgress
  const progressDetails = await prisma.studentProgress.findMany({
    where: { studentId },
    include: {
      assignment: {
        include: {
          course: { select: { id: true, title: true } },
          section: { select: { id: true, title: true, type: true } },
        },
      },
    },
  });

  // 5. Calculer les agrégats globaux
  const globalStats = calculateGlobalStats(scores);

  return NextResponse.json({
    student: {
      id: student.user.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      className: student.class.name,
    },
    globalStats,
    courseScores: scores,
    progressDetails,
  });
}

// PUT : Mettre à jour la note d'examen
export async function PUT(req: Request, { params }: RouteParams) {
  // ... vérifications similaires ...
  
  const body = await req.json();
  const { courseId, examGrade, examComment } = body;

  // Validation
  if (examGrade < 0 || examGrade > 6) {
    return NextResponse.json({ error: "Grade must be between 0 and 6" }, { status: 400 });
  }

  // Upsert le score
  const score = await prisma.studentScore.upsert({
    where: { studentId_courseId: { studentId, courseId } },
    create: {
      studentId,
      courseId,
      examGrade,
      examDate: new Date(),
      examComment,
    },
    update: {
      examGrade,
      examDate: new Date(),
      examComment,
      // Recalculer finalScore
      finalScore: calculateFinalScore(/* ... */),
      finalGrade: convertToGrade6(/* ... */),
    },
  });

  return NextResponse.json(score);
}

// Helper : Calcul stats globales
function calculateGlobalStats(scores: StudentScore[]) {
  if (scores.length === 0) return { continuous: 0, exams: null, final: null };
  
  const avgContinuous = scores.reduce((a, s) => a + s.continuousScore, 0) / scores.length;
  const examsWithGrade = scores.filter(s => s.examGrade !== null);
  const avgExams = examsWithGrade.length > 0 
    ? examsWithGrade.reduce((a, s) => a + (s.examGrade || 0), 0) / examsWithGrade.length 
    : null;
  const avgFinal = examsWithGrade.length > 0
    ? examsWithGrade.reduce((a, s) => a + (s.finalGrade || 0), 0) / examsWithGrade.length
    : null;

  return { continuous: avgContinuous, exams: avgExams, final: avgFinal };
}
```

RÈGLES :
- Toujours vérifier l'accès via teacherProfile.classes
- Utiliser upsert pour créer ou modifier le score
- Recalculer automatiquement finalScore après PUT
```

### Validation 7bis.2
- [ ] GET retourne les scores structurés
- [ ] PUT permet de saisir/modifier l'examen
- [ ] Erreur 403 si le prof n'a pas accès

---

## 📋 Tâche 7bis.3 — Service Stats

### Prompt 7bis.3.1 — Créer service de calculs

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- Pondération Score Continu : Quiz 35%, Exercices 40%, IA 25%
- Pondération Score Final : Continu 40%, Examen 60%
- Notes sur 6 (système suisse)
- Seuils : 🟢 ≥4.5 | 🟡 3.5-4.4 | 🔴 <3.5

TÂCHE :
Créer `src/lib/stats-service.ts`

```typescript
/**
 * Service de calcul des statistiques BlaizBot
 * Système de notation suisse (notes sur 6)
 */

// Types
export type AlertLevel = "success" | "warning" | "danger";

export interface StudentStats {
  continuousScore: number;  // 0-100
  examGrade: number | null; // 0-6
  finalGrade: number | null; // 0-6
  alertLevel: AlertLevel;
}

export interface ClassStats {
  className: string;
  studentCount: number;
  avgContinuous: number;
  avgExams: number | null;
  avgFinal: number | null;
  atRiskCount: number;
}

export interface GlobalStats {
  totalStudents: number;
  avgContinuous: number;
  avgExams: number | null;
  avgFinal: number | null;
  atRiskCount: number;
  topPerformersCount: number;
}

// Constantes
const WEIGHTS = {
  quiz: 0.35,
  exercise: 0.40,
  ai: 0.25,
  continuous: 0.40,
  exam: 0.60,
};

const THRESHOLDS = {
  success: 4.5,  // 🟢
  warning: 3.5,  // 🟡
  // < 3.5 = danger 🔴
};

// Fonctions de calcul
export const statsService = {
  /**
   * Calcule le score continu (0-100) à partir des moyennes
   */
  calculateContinuousScore(quizAvg: number, exerciseAvg: number, aiComprehension: number): number {
    return (
      quizAvg * WEIGHTS.quiz +
      exerciseAvg * WEIGHTS.exercise +
      aiComprehension * WEIGHTS.ai
    );
  },

  /**
   * Calcule le score final (0-100) après examen
   */
  calculateFinalScore(continuousScore: number, examGrade: number): number {
    const examScore100 = (examGrade / 6) * 100; // Convertir /6 en /100
    return (
      continuousScore * WEIGHTS.continuous +
      examScore100 * WEIGHTS.exam
    );
  },

  /**
   * Convertit un score /100 en note /6
   */
  convertToGrade6(score100: number): number {
    const grade = (score100 / 100) * 6;
    return Math.round(grade * 10) / 10; // Arrondi à 0.1
  },

  /**
   * Convertit une note /6 en score /100
   */
  convertTo100(grade6: number): number {
    return (grade6 / 6) * 100;
  },

  /**
   * Détermine le niveau d'alerte selon la note /6
   */
  getAlertLevel(grade6: number): AlertLevel {
    if (grade6 >= THRESHOLDS.success) return "success";
    if (grade6 >= THRESHOLDS.warning) return "warning";
    return "danger";
  },

  /**
   * Agrège les scores d'une classe
   */
  aggregateClassScores(studentScores: StudentStats[]): ClassStats {
    // ... implémentation
  },

  /**
   * Agrège les scores globaux (toutes classes)
   */
  aggregateGlobalScores(classStats: ClassStats[]): GlobalStats {
    // ... implémentation
  },
};
```

< 150 lignes, bien typé, exporté en named export.
```

### Validation 7bis.3
- [ ] Calculs conformes aux pondérations
- [ ] Conversion /6 correcte
- [ ] Seuils d'alerte respectés

---

## 📋 Tâche 7bis.4 — Composant ScoreBadge

### Prompt 7bis.4.1 — Créer ScoreBadge

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui, Tailwind).

CONTEXTE :
- Notes sur 6 (système suisse)
- Seuils : 🟢 ≥4.5 | 🟡 3.5-4.4 | 🔴 <3.5

TÂCHE :
Créer `src/components/ui/score-badge.tsx`

```typescript
"use client";

import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;           // Note sur 6
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;     // Afficher "/ 6"
  className?: string;
}

export function ScoreBadge({ score, size = "md", showLabel = true, className }: ScoreBadgeProps) {
  const getColorClass = (score: number) => {
    if (score >= 4.5) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 3.5) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm": return "px-2 py-0.5 text-xs";
      case "lg": return "px-4 py-2 text-lg font-bold";
      default: return "px-3 py-1 text-sm font-medium";
    }
  };

  const displayScore = score.toFixed(1);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border",
        getColorClass(score),
        getSizeClass(size),
        className
      )}
    >
      {displayScore}
      {showLabel && <span className="ml-1 opacity-70">/6</span>}
    </span>
  );
}
```

< 50 lignes, accessible, responsive.
```

### Prompt 7bis.4.2 — Créer PercentageBadge (variante)

```
TÂCHE : Ajouter variante pour pourcentages dans le même fichier.

```typescript
interface PercentageBadgeProps {
  percentage: number;      // 0-100
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PercentageBadge({ percentage, size = "md", className }: PercentageBadgeProps) {
  // Convertir en note /6 pour utiliser les mêmes seuils
  const grade6 = (percentage / 100) * 6;
  
  const getColorClass = (grade: number) => {
    if (grade >= 4.5) return "bg-green-100 text-green-700";
    if (grade >= 3.5) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      getColorClass(grade6),
      className
    )}>
      {Math.round(percentage)}%
    </span>
  );
}
```
```

### Validation 7bis.4
- [ ] Couleurs correctes selon seuils
- [ ] Variante pourcentage disponible
- [ ] Tailles sm/md/lg fonctionnelles

---

## 📋 Tâche 7bis.5 — Page Fiche Élève

### Prompt 7bis.5.1 — Créer page server

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

TÂCHE :
Créer `src/app/(dashboard)/teacher/students/[id]/page.tsx`

C'est un Server Component qui :
1. Vérifie l'authentification (TEACHER)
2. Vérifie l'accès à l'élève
3. Rend le client component StudentScorePage

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StudentScorePage } from "@/components/features/teacher/StudentScorePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherStudentDetailPage({ params }: PageProps) {
  const { id: studentId } = await params;
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "TEACHER") {
    redirect("/login");
  }

  // Vérifier accès
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { classes: { select: { id: true } } },
  });

  if (!teacherProfile) {
    redirect("/login");
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

  return (
    <StudentScorePage
      studentId={studentId}
      studentName={`${student.user.firstName} ${student.user.lastName}`}
      studentEmail={student.user.email}
      className={student.class.name}
    />
  );
}
```

< 60 lignes, Server Component, délègue au Client Component.
```

### Validation 7bis.5
- [ ] Page accessible `/teacher/students/[id]`
- [ ] Vérification d'accès fonctionnelle
- [ ] Délégation au client component

---

## 📋 Tâche 7bis.6 — Composants Scores

### Prompt 7bis.6.1 — StudentScorePage (Client)

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

TÂCHE :
Créer `src/components/features/teacher/StudentScorePage.tsx`

Props :
- studentId: string
- studentName: string
- studentEmail: string
- className: string

Fonctionnalités :
1. Fetch des scores via API /api/teacher/students/[id]/scores
2. Afficher header avec KPIs globaux (StudentScoreHeader)
3. Filtres (Select cours, période)
4. Liste des cours avec scores (Accordion)
5. Bouton retour

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion } from "@/components/ui/accordion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StudentScoreHeader } from "./StudentScoreHeader";
import { CourseScoreRow } from "./CourseScoreRow";
import { ExamGradeDialog } from "./ExamGradeDialog";

interface Props {
  studentId: string;
  studentName: string;
  studentEmail: string;
  className: string;
}

export function StudentScorePage({ studentId, studentName, studentEmail, className }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScoresData | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchScores();
  }, [studentId]);

  const fetchScores = async () => {
    setLoading(true);
    const res = await fetch(`/api/teacher/students/${studentId}/scores`);
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
    setLoading(false);
  };

  const handleSaveExam = async (grade: number, comment?: string) => {
    // POST to API, then refetch
    await fetch(`/api/teacher/students/${studentId}/scores`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: selectedCourse?.id, examGrade: grade, examComment: comment }),
    });
    await fetchScores();
    setExamDialogOpen(false);
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{studentName}</h1>
          <p className="text-muted-foreground">{className} • {studentEmail}</p>
        </div>
      </div>

      {/* KPIs globaux */}
      <StudentScoreHeader globalStats={data?.globalStats} />

      {/* Filtres */}
      <div className="flex gap-4">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les cours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les cours</SelectItem>
            {data?.courseScores.map((cs) => (
              <SelectItem key={cs.course.id} value={cs.course.id}>
                {cs.course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste des cours */}
      <Accordion type="single" collapsible className="space-y-2">
        {filteredCourses.map((courseScore) => (
          <CourseScoreRow
            key={courseScore.course.id}
            courseScore={courseScore}
            onEditExam={() => {
              setSelectedCourse(courseScore.course);
              setExamDialogOpen(true);
            }}
          />
        ))}
      </Accordion>

      {/* Dialog saisie examen */}
      <ExamGradeDialog
        open={examDialogOpen}
        onOpenChange={setExamDialogOpen}
        courseName={selectedCourse?.title || ""}
        currentGrade={selectedCourse?.examGrade}
        onSave={handleSaveExam}
      />
    </div>
  );
}
```

< 150 lignes, bien structuré.
```

### Prompt 7bis.6.2 — StudentScoreHeader

```
TÂCHE :
Créer `src/components/features/teacher/StudentScoreHeader.tsx`

```typescript
import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge, PercentageBadge } from "@/components/ui/score-badge";
import { TrendingUp, ClipboardCheck, Award } from "lucide-react";

interface Props {
  globalStats: {
    continuous: number;  // 0-100
    exams: number | null; // 0-6
    final: number | null; // 0-6
  } | null;
}

export function StudentScoreHeader({ globalStats }: Props) {
  if (!globalStats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-blue-100 p-3">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Évaluation Continue</p>
            <PercentageBadge percentage={globalStats.continuous} size="lg" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-amber-100 p-3">
            <ClipboardCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Moyenne Examens</p>
            {globalStats.exams !== null ? (
              <ScoreBadge score={globalStats.exams} size="lg" />
            ) : (
              <span className="text-lg text-muted-foreground">—</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-green-100 p-3">
            <Award className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Note Finale</p>
            {globalStats.final !== null ? (
              <ScoreBadge score={globalStats.final} size="lg" />
            ) : (
              <span className="text-lg text-muted-foreground">—</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

< 80 lignes.
```

### Prompt 7bis.6.3 — CourseScoreRow

```
TÂCHE :
Créer `src/components/features/teacher/CourseScoreRow.tsx`

Accordion item dépliable avec :
- Trigger : Nom cours | Quiz% | Exos% | IA% | Exam/6 | [✏️]
- Content : Liste détaillée des Quiz/Exercices

```typescript
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PercentageBadge, ScoreBadge } from "@/components/ui/score-badge";
import { Pencil, ChevronDown } from "lucide-react";

interface CourseScoreData {
  course: { id: string; title: string; subject: { name: string } };
  quizAvg: number;
  exerciseAvg: number;
  aiComprehension: number;
  examGrade: number | null;
  finalGrade: number | null;
}

interface Props {
  courseScore: CourseScoreData;
  onEditExam: () => void;
}

export function CourseScoreRow({ courseScore, onEditExam }: Props) {
  return (
    <AccordionItem value={courseScore.course.id} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">{courseScore.course.title}</span>
            <span className="text-sm text-muted-foreground">
              {courseScore.course.subject.name}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Quiz</p>
              <PercentageBadge percentage={courseScore.quizAvg} />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Exos</p>
              <PercentageBadge percentage={courseScore.exerciseAvg} />
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">IA</p>
              {courseScore.aiComprehension > 0 ? (
                <PercentageBadge percentage={courseScore.aiComprehension} />
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Exam</p>
              {courseScore.examGrade !== null ? (
                <ScoreBadge score={courseScore.examGrade} size="sm" />
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEditExam();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {/* Liste détaillée Quiz/Exercices */}
        <ScoreDetailsList courseId={courseScore.course.id} />
      </AccordionContent>
    </AccordionItem>
  );
}
```

< 100 lignes.
```

### Validation 7bis.6
- [ ] StudentScorePage fonctionnel
- [ ] Header avec 3 KPIs
- [ ] CourseScoreRow dépliable

---

## 📋 Tâche 7bis.7 — Dialog Saisie Examen

### Prompt 7bis.7.1 — ExamGradeDialog

```
Tu travailles sur BlaizBot-V1 (Next.js 16, shadcn/ui).

TÂCHE :
Créer `src/components/features/teacher/ExamGradeDialog.tsx`

```typescript
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  currentGrade?: number | null;
  onSave: (grade: number, comment?: string) => Promise<void>;
}

export function ExamGradeDialog({ open, onOpenChange, courseName, currentGrade, onSave }: Props) {
  const [grade, setGrade] = useState<string>(currentGrade?.toString() || "");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 6) {
      setError("La note doit être entre 0 et 6");
      return;
    }

    setSaving(true);
    try {
      await onSave(numGrade, comment || undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Note d'examen — {courseName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="grade">Note (sur 6)</Label>
            <Input
              id="grade"
              type="number"
              min="0"
              max="6"
              step="0.5"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setError(null);
              }}
              placeholder="Ex: 4.5"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Remarques sur l'examen..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

< 100 lignes, validation 0-6, feedback loading.
```

### Validation 7bis.7
- [ ] Validation de la note 0-6
- [ ] Feedback loading
- [ ] Fermeture après save

---

## 📋 Tâche 7bis.8 — Navigation depuis Liste

### Prompt 7bis.8.1 — Modifier page students

```
Tu travailles sur BlaizBot-V1 (Next.js 16).

TÂCHE :
Modifier `src/app/(dashboard)/teacher/students/page.tsx` pour :
1. Rendre les cartes cliquables (Link vers /teacher/students/[id])
2. Conserver le bouton œil pour la modale contact existante

CHANGEMENTS :
- Wrapper la carte dans <Link href={`/teacher/students/${student.id}`}>
- Le bouton œil doit avoir `onClick` avec `e.stopPropagation()`
- Cursor pointer sur la carte

OU

Créer un composant StudentCard qui gère les deux interactions.
```

### Validation 7bis.8
- [ ] Clic carte → page fiche
- [ ] Clic œil → modale contact
- [ ] Pas de régression

---

## 🆕 Filtres & Tri (F1-F4)

### 📊 Objectif
Ajouter un système de filtrage et tri sur la page fiche élève pour permettre au professeur de :
- Filtrer par matière
- Filtrer par état d'alerte (🟢🟡🔴)
- Filtrer par présence/absence de note examen
- Trier par note finale, continue, ou nom de cours

---

## 📋 Tâche F1 — Seed StudentScore

### Prompt F1.1 — Ajouter données de test

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6, Neon Postgres).

CONTEXTE :
- Le modèle StudentScore existe déjà dans le schéma Prisma
- Il faut créer des données de test pour 5 élèves × 3-6 cours
- Utiliser des scores variés pour tester les seuils (🟢 ≥4.5, 🟡 3.5-4.4, 🔴 <3.5)

TÂCHE :
Modifier `prisma/seed.ts` pour ajouter la fonction `seedStudentScores()`.

DONNÉES À CRÉER :

| Élève | Cours | Quiz% | Exos% | IA% | Continu | Examen | État |
|:------|:------|:------|:------|:----|:--------|:-------|:-----|
| Lucas MARTIN | Fractions | 85 | 78 | 70 | 77.7 | 5.2 | 🟢 |
| Lucas MARTIN | Équations | 60 | 55 | 45 | 54 | 4.0 | 🟡 |
| Lucas MARTIN | Photosynthèse | 40 | 35 | 30 | 35 | null | 🔴 |
| Emma DURAND | Fractions | 90 | 88 | 85 | 87.7 | 5.5 | 🟢 |
| Emma DURAND | Équations | 70 | 65 | 60 | 65 | null | 🟡 |
| Noah PETIT | Fractions | 50 | 45 | 40 | 45.3 | 3.2 | 🔴 |
| Noah PETIT | Photosynthèse | 75 | 70 | 68 | 71 | 4.8 | 🟢 |
| Léa MOREAU | Fractions | 80 | 82 | 75 | 79 | 5.0 | 🟢 |
| Hugo ROBERT | Fractions | 55 | 50 | 48 | 51 | 3.5 | 🟡 |

FORMULES (rappel) :
- continuousScore = (quiz * 0.35) + (exos * 0.40) + (ia * 0.25)
- finalScore = examGrade ? (continuousScore * 0.4) + ((examGrade/6)*100 * 0.6) : null
- finalGrade = finalScore ? (finalScore / 100) * 6 : null

FICHIER : `prisma/seed.ts`
- Ajouter fonction `seedStudentScores()` après `seedAssignments()`
- Appeler dans `main()`
- Utiliser `upsert` pour éviter les doublons

VÉRIFICATION :
- npx prisma db seed
- Les données apparaissent dans la fiche élève
```

### Checklist F1
- [ ] Fonction seedStudentScores() créée
- [ ] 9+ enregistrements StudentScore
- [ ] Mix d'états (🟢🟡🔴)
- [ ] Mix avec/sans note examen
- [ ] npx prisma db seed OK

---

## 📋 Tâche F2 — Composant FilterBar

### Prompt F2.1 — Créer ScoreFilterBar

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Tailwind, shadcn/ui).

CONTEXTE :
- Page fiche élève avec liste de cours et scores
- Besoin de filtrer et trier cette liste

TÂCHE :
Créer `src/components/features/teacher/ScoreFilterBar.tsx`

INTERFACE :

```tsx
interface ScoreFilters {
  subject: string | null;       // null = tous
  alertLevel: 'all' | 'success' | 'warning' | 'danger';
  hasExam: 'all' | 'with' | 'without';
}

interface ScoreSort {
  field: 'finalGrade' | 'continuousScore' | 'courseName' | 'subjectName';
  direction: 'asc' | 'desc';
}

interface ScoreFilterBarProps {
  subjects: { id: string; name: string }[];
  filters: ScoreFilters;
  sort: ScoreSort;
  onFiltersChange: (filters: ScoreFilters) => void;
  onSortChange: (sort: ScoreSort) => void;
  resultCount: number;
  totalCount: number;
}
```

UI ATTENDUE :
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Filtres                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Matière   ▼  │  │ État      ▼  │  │ Examen    ▼  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  📊 Trier par : [Note finale ▼] [↑↓]  │ 3/6 cours     │
└─────────────────────────────────────────────────────────┘
```

COMPOSANTS shadcn/ui À UTILISER :
- Select pour les filtres
- Button pour le toggle de direction
- Badge pour le compteur

FICHIER : `src/components/features/teacher/ScoreFilterBar.tsx`
- Max 150 lignes
- Export types et composant
- Responsive (stack sur mobile)
```

### Checklist F2
- [ ] Composant créé < 150 lignes
- [ ] 3 filtres (matière, état, examen)
- [ ] Tri bidirectionnel
- [ ] Compteur résultats
- [ ] Responsive

---

## 📋 Tâche F3 — Logique de tri

### Prompt F3.1 — Fonctions de filtrage/tri

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- CourseScoreData[] à filtrer et trier
- Filtres et tri définis dans ScoreFilterBar

TÂCHE :
Ajouter dans `src/lib/stats-service.ts` les fonctions de filtrage/tri.

FONCTIONS À AJOUTER :

```typescript
import { CourseScoreData } from '@/components/features/teacher/CourseScoreRow';

export interface ScoreFilters {
  subject: string | null;
  alertLevel: 'all' | 'success' | 'warning' | 'danger';
  hasExam: 'all' | 'with' | 'without';
}

export interface ScoreSort {
  field: 'finalGrade' | 'continuousScore' | 'courseName' | 'subjectName';
  direction: 'asc' | 'desc';
}

// Filtrer les scores
export function filterCourseScores(
  scores: CourseScoreData[],
  filters: ScoreFilters
): CourseScoreData[] {
  return scores.filter(score => {
    // Filtre matière
    if (filters.subject && score.course.subject.id !== filters.subject) {
      return false;
    }
    
    // Filtre état (utiliser getAlertLevel)
    if (filters.alertLevel !== 'all') {
      const level = getAlertLevel(score.finalGrade, score.continuousScore);
      if (level !== filters.alertLevel) return false;
    }
    
    // Filtre examen
    if (filters.hasExam === 'with' && score.examGrade === null) return false;
    if (filters.hasExam === 'without' && score.examGrade !== null) return false;
    
    return true;
  });
}

// Trier les scores
export function sortCourseScores(
  scores: CourseScoreData[],
  sort: ScoreSort
): CourseScoreData[] {
  return [...scores].sort((a, b) => {
    let comparison = 0;
    
    switch (sort.field) {
      case 'finalGrade':
        // null en dernier
        if (a.finalGrade === null && b.finalGrade === null) comparison = 0;
        else if (a.finalGrade === null) comparison = 1;
        else if (b.finalGrade === null) comparison = -1;
        else comparison = a.finalGrade - b.finalGrade;
        break;
      case 'continuousScore':
        comparison = a.continuousScore - b.continuousScore;
        break;
      case 'courseName':
        comparison = a.course.title.localeCompare(b.course.title);
        break;
      case 'subjectName':
        comparison = a.course.subject.name.localeCompare(b.course.subject.name);
        break;
    }
    
    return sort.direction === 'asc' ? comparison : -comparison;
  });
}

// Helper : extraire les matières uniques
export function extractSubjects(scores: CourseScoreData[]): { id: string; name: string }[] {
  const map = new Map<string, string>();
  scores.forEach(s => map.set(s.course.subject.id, s.course.subject.name));
  return Array.from(map, ([id, name]) => ({ id, name }));
}
```

FICHIER : `src/lib/stats-service.ts`
- Ajouter après les fonctions existantes
- Exporter les types et fonctions
```

### Checklist F3
- [ ] filterCourseScores() fonctionne
- [ ] sortCourseScores() fonctionne
- [ ] extractSubjects() fonctionne
- [ ] null géré correctement
- [ ] Types exportés

---

## 📋 Tâche F4 — Intégration page

### Prompt F4.1 — Intégrer FilterBar dans StudentScorePage

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- StudentScorePage affiche une liste de CourseScoreData
- ScoreFilterBar et fonctions de filtrage/tri créés

TÂCHE :
Modifier `src/components/features/teacher/StudentScorePage.tsx` pour intégrer les filtres.

MODIFICATIONS :

1. Imports :
```tsx
import { ScoreFilterBar } from './ScoreFilterBar';
import { 
  ScoreFilters, 
  ScoreSort, 
  filterCourseScores, 
  sortCourseScores,
  extractSubjects 
} from '@/lib/stats-service';
```

2. État local :
```tsx
const [filters, setFilters] = useState<ScoreFilters>({
  subject: null,
  alertLevel: 'all',
  hasExam: 'all',
});
const [sort, setSort] = useState<ScoreSort>({
  field: 'finalGrade',
  direction: 'desc',
});
```

3. Calcul filtré/trié :
```tsx
const courseScores = data?.courseScores ?? [];
const filteredScores = filterCourseScores(courseScores, filters);
const sortedScores = sortCourseScores(filteredScores, sort);
const subjects = extractSubjects(courseScores);
```

4. Ajouter FilterBar avant la liste :
```tsx
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-lg font-semibold">Scores par cours</h2>
  </div>
  
  <ScoreFilterBar
    subjects={subjects}
    filters={filters}
    sort={sort}
    onFiltersChange={setFilters}
    onSortChange={setSort}
    resultCount={sortedScores.length}
    totalCount={courseScores.length}
  />
  
  <CourseScoreList
    courseScores={sortedScores}
    onEditExam={handleEditExam}
  />
</div>
```

FICHIER : `src/components/features/teacher/StudentScorePage.tsx`
```

### Checklist F4
- [ ] FilterBar visible
- [ ] Filtres fonctionnels
- [ ] Tri fonctionnel
- [ ] Compteur mis à jour
- [ ] Reset quand changement d'élève

---

## 🆕 Extension : Filtres Liste Élèves (S1-S6)

> **Objectif** : Transformer "Mes Élèves" en tableau de bord filtrable avec stats sur les cartes

---

## 📋 Tâche S1 — Types & Interfaces

### Prompt S1.1 — Créer les types

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- Page "Mes Élèves" à enrichir avec filtres et stats
- Système de notation suisse /6 existant
- Seuils : 🟢 ≥4.5, 🟡 3.5-4.4, 🔴 <3.5

TÂCHE :
Créer le fichier `src/types/student-filters.ts` avec les types pour le filtrage.

CONTENU EXACT :

```typescript
// Types pour filtrage élèves sur page "Mes Élèves"

export interface StudentFilters {
  classId: string | null;           // null = toutes les classes
  alertLevel: 'all' | 'success' | 'warning' | 'danger';
  selectedStudentIds: string[];     // multi-sélection
}

export interface StudentWithStats {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  classes: { id: string; name: string }[];
  // Stats globales (moyennes sur tous les cours)
  avgContinuous: number | null;     // 0-100
  avgExam: number | null;           // 0-6
  avgFinal: number | null;          // 0-6
  alertLevel: 'success' | 'warning' | 'danger' | 'none';
  courseCount: number;
  examCount: number;
}

export const DEFAULT_STUDENT_FILTERS: StudentFilters = {
  classId: null,
  alertLevel: 'all',
  selectedStudentIds: [],
};
```

FICHIER : `src/types/student-filters.ts`

VÉRIFICATION :
- Fichier créé
- Types exportés
- Import possible depuis autres fichiers
```

### Checklist S1
- [ ] Fichier `src/types/student-filters.ts` créé
- [ ] Interface `StudentFilters` exportée
- [ ] Interface `StudentWithStats` exportée
- [ ] Constante `DEFAULT_STUDENT_FILTERS` exportée

---

## 📋 Tâche S2 — API stats élèves

### Prompt S2.1 — Enrichir la query Prisma

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6).

CONTEXTE :
- Page `/teacher/students/page.tsx` existante
- Affiche la liste des élèves du prof
- Doit maintenant inclure les stats (moyennes scores)

TÂCHE :
Modifier `src/app/(dashboard)/teacher/students/page.tsx` pour enrichir les données.

MODIFICATIONS :

1. Dans le include de `students > user`, ajouter :
```typescript
studentScores: {
  select: {
    continuousScore: true,
    examGrade: true,
    finalGrade: true,
  }
}
```

2. Dans le mapping des students, calculer les moyennes :
```typescript
// Calculer les stats pour chaque élève
const scores = student.user.studentScores || [];
const courseCount = scores.length;
const examCount = scores.filter(s => s.examGrade !== null).length;

// Moyennes
const avgContinuous = courseCount > 0
  ? scores.reduce((sum, s) => sum + s.continuousScore, 0) / courseCount
  : null;
  
const examsWithGrade = scores.filter(s => s.examGrade !== null);
const avgExam = examsWithGrade.length > 0
  ? examsWithGrade.reduce((sum, s) => sum + (s.examGrade || 0), 0) / examsWithGrade.length
  : null;
  
const finalsWithGrade = scores.filter(s => s.finalGrade !== null);
const avgFinal = finalsWithGrade.length > 0
  ? finalsWithGrade.reduce((sum, s) => sum + (s.finalGrade || 0), 0) / finalsWithGrade.length
  : null;

// Niveau d'alerte basé sur la note finale moyenne (ou continue si pas d'examen)
const refGrade = avgFinal ?? (avgContinuous ? avgContinuous / 100 * 6 : null);
const alertLevel = refGrade === null ? 'none'
  : refGrade >= 4.5 ? 'success'
  : refGrade >= 3.5 ? 'warning'
  : 'danger';
```

3. Passer les classes distinctes au composant pour le filtre.

FICHIER : `src/app/(dashboard)/teacher/students/page.tsx`

IMPORTANT :
- Conserver le code existant
- Ajouter les nouvelles données au type
- Passer `classes` pour le filtre
```

### Checklist S2
- [ ] Query enrichie avec studentScores
- [ ] Calcul avgContinuous, avgExam, avgFinal
- [ ] Calcul alertLevel
- [ ] Classes extraites pour filtre
- [ ] Build OK

---

## 📋 Tâche S3 — StudentFilterBar

### Prompt S3.1 — Créer le composant filtres

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Tailwind, shadcn/ui).

CONTEXTE :
- Page "Mes Élèves" avec filtres à ajouter
- Types définis dans `src/types/student-filters.ts`

TÂCHE :
Créer `src/components/features/teacher/StudentFilterBar.tsx`

PROPS :
```typescript
interface StudentFilterBarProps {
  classes: { id: string; name: string }[];
  allStudents: { id: string; firstName: string; lastName: string }[];
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  resultCount: number;
  totalCount: number;
}
```

UI ATTENDUE :
```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 Filtres                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐│
│  │ Classe    ▼  │  │ État      ▼  │  │ 🔎 Rechercher élève...    ││
│  │ Toutes       │  │ Tous        │  └────────────────────────────┘│
│  └──────────────┘  │ 🟢 Bon      │                                │
│                    │ 🟡 Surveiller│                                │
│                    │ 🔴 À risque │                                │
│                    └──────────────┘                                │
│  Sélection : [Lucas MARTIN ×] [Emma DURAND ×]  │ 4/5 élèves       │
└─────────────────────────────────────────────────────────────────────┘
```

COMPOSANTS shadcn/ui À UTILISER :
- Select pour classe et état
- Input pour recherche
- Badge pour chips sélection (avec bouton ×)
- Badge pour compteur

COMPORTEMENT :
- Recherche filtre en temps réel
- Clic sur résultat ajoute un chip
- Clic × sur chip le supprime
- Si sélection vide, tous les élèves affichés

FICHIER : `src/components/features/teacher/StudentFilterBar.tsx`
- Max 150 lignes
- Exporter types et composant

VÉRIFICATION :
- npm run build OK
- Responsive (stack sur mobile)
```

### Checklist S3
- [ ] Select classe
- [ ] Select état (🟢🟡🔴)
- [ ] Input recherche élève
- [ ] Chips multi-sélection avec ×
- [ ] Compteur résultats
- [ ] < 150 lignes

---

## 📋 Tâche S4 — StudentCard enrichie

### Prompt S4.1 — Créer la carte avec stats

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Tailwind, shadcn/ui).

CONTEXTE :
- Cartes élèves existantes dans StudentsList
- Doit maintenant afficher les stats directement

TÂCHE :
Créer `src/components/features/teacher/StudentCard.tsx`

PROPS :
```typescript
interface StudentCardProps {
  student: StudentWithStats;
  onViewContact: () => void;
}
```

UI ATTENDUE :
```
┌─────────────────────────────────────────────┐
│ 👤 Lucas MARTIN                             │
│    3ème A                                   │
│                                             │
│ ┌─────────┬─────────┬─────────┐            │
│ │   68%   │   4.2   │   4.4   │            │
│ │ Continu │  Exam   │  Final  │            │
│ └─────────┴─────────┴─────────┘            │
│                                             │
│ 🟡 À surveiller (2 cours)    [👁️] [→]     │
└─────────────────────────────────────────────┘
```

SI PAS DE STATS (courseCount = 0) :
```
│ Aucun cours assigné                         │
│ ⚪ Pas de données                           │
```

COMPOSANTS À UTILISER :
- Card de shadcn/ui
- ScoreBadge, PercentageBadge de `@/components/ui/score-badge`
- Button pour actions
- Link vers `/teacher/students/[id]`

FICHIER : `src/components/features/teacher/StudentCard.tsx`
- Max 100 lignes
- Utiliser les composants existants

VÉRIFICATION :
- npm run build OK
- Carte cliquable vers fiche
- Bouton contact avec stopPropagation
```

### Checklist S4
- [ ] Nom + classe(s)
- [ ] 3 mini-badges stats (ou message si vide)
- [ ] Indicateur couleur état
- [ ] Compteur cours
- [ ] Boutons contact + navigation
- [ ] < 100 lignes

---

## 📋 Tâche S5 — Logique filtrage

### Prompt S5.1 — Créer les fonctions de filtre

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- Types dans `src/types/student-filters.ts`
- Besoin de filtrer les élèves selon les critères

TÂCHE :
Créer `src/lib/student-filters.ts`

CONTENU :

```typescript
import type { StudentFilters, StudentWithStats } from '@/types/student-filters';

/**
 * Filtre les élèves selon les critères
 */
export function filterStudents(
  students: StudentWithStats[],
  filters: StudentFilters
): StudentWithStats[] {
  return students.filter(student => {
    // Filtre par classe
    if (filters.classId) {
      const hasClass = student.classes.some(c => c.id === filters.classId);
      if (!hasClass) return false;
    }
    
    // Filtre par état
    if (filters.alertLevel !== 'all') {
      if (student.alertLevel !== filters.alertLevel) return false;
    }
    
    // Filtre par sélection (si non vide, seuls les sélectionnés)
    if (filters.selectedStudentIds.length > 0) {
      if (!filters.selectedStudentIds.includes(student.id)) return false;
    }
    
    return true;
  });
}

/**
 * Extrait les classes uniques des élèves
 */
export function extractUniqueClasses(
  students: StudentWithStats[]
): { id: string; name: string }[] {
  const map = new Map<string, string>();
  students.forEach(s => {
    s.classes.forEach(c => map.set(c.id, c.name));
  });
  return Array.from(map, ([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Recherche d'élèves par nom
 */
export function searchStudents(
  students: StudentWithStats[],
  query: string
): StudentWithStats[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return students.filter(s => 
    s.firstName.toLowerCase().includes(q) ||
    s.lastName.toLowerCase().includes(q)
  ).slice(0, 5); // Max 5 résultats
}
```

FICHIER : `src/lib/student-filters.ts`

VÉRIFICATION :
- npm run build OK
- Fonctions exportées
```

### Checklist S5
- [ ] filterStudents() fonctionne
- [ ] extractUniqueClasses() fonctionne
- [ ] searchStudents() fonctionne
- [ ] Types corrects

---

## 📋 Tâche S6 — Intégration page

### Prompt S6.1 — Modifier StudentsList

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- StudentsList existant affiche les cartes
- StudentFilterBar et StudentCard créés
- Logique de filtrage dans student-filters.ts

TÂCHE :
Modifier `src/components/features/teacher/StudentsList.tsx` pour intégrer filtres et nouvelles cartes.

MODIFICATIONS :

1. Imports :
```typescript
import { useState } from 'react';
import Link from 'next/link';
import { StudentFilterBar } from './StudentFilterBar';
import { StudentCard } from './StudentCard';
import { StudentDetailsDialog } from './StudentDetailsDialog';
import type { StudentFilters, StudentWithStats } from '@/types/student-filters';
import { filterStudents, extractUniqueClasses, DEFAULT_STUDENT_FILTERS } from '@/lib/student-filters';
```

2. Modifier le type des props :
```typescript
interface StudentsListProps {
  students: StudentWithStats[];
}
```

3. Ajouter le state :
```typescript
const [filters, setFilters] = useState<StudentFilters>(DEFAULT_STUDENT_FILTERS);
const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);
```

4. Calculs :
```typescript
const classes = extractUniqueClasses(students);
const filteredStudents = filterStudents(students, filters);
const allStudentsForSearch = students.map(s => ({
  id: s.id,
  firstName: s.firstName,
  lastName: s.lastName,
}));
```

5. Afficher FilterBar + Grid de StudentCard :
```typescript
<StudentFilterBar
  classes={classes}
  allStudents={allStudentsForSearch}
  filters={filters}
  onFiltersChange={setFilters}
  resultCount={filteredStudents.length}
  totalCount={students.length}
/>

<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {filteredStudents.map(student => (
    <StudentCard
      key={student.id}
      student={student}
      onViewContact={() => setSelectedStudent(student)}
    />
  ))}
</div>

{selectedStudent && (
  <StudentDetailsDialog
    student={selectedStudent}
    open={!!selectedStudent}
    onOpenChange={(open) => !open && setSelectedStudent(null)}
  />
)}
```

FICHIER : `src/components/features/teacher/StudentsList.tsx`

VÉRIFICATION :
- npm run build OK
- Filtres fonctionnels
- Cartes affichent stats
- Navigation vers fiche
```

### Checklist S6
- [ ] FilterBar intégré
- [ ] StudentCard utilisé
- [ ] Grille responsive
- [ ] Dialog contact fonctionne
- [ ] Navigation vers fiche
- [ ] Build OK

---

## 🔄 Ordre d'exécution recommandé (S1-S6)

```
1. S1  → Types & Interfaces (base)
2. S5  → Logique filtrage (fonctions)
3. S2  → API stats élèves (données)
4. S4  → StudentCard (composant unitaire)
5. S3  → StudentFilterBar (composant filtres)
6. S6  → Intégration page (assemblage)
```

---

## 🔄 Ordre d'exécution recommandé

```
1. 7bis.1  → Migration Prisma (base de données)
2. 7bis.3  → Service Stats (calculs)
3. 7bis.4  → ScoreBadge (UI)
4. 7bis.2  → API Scores (backend)
5. 7bis.6  → Composants Scores (UI)
6. 7bis.5  → Page Fiche Élève (assemblage)
7. 7bis.7  → Dialog Examen (interaction)
8. 7bis.8  → Navigation (intégration)
9. F1      → Seed données test
10. F3     → Logique filtrage/tri
11. F2     → Composant FilterBar
12. F4     → Intégration page
13. S1     → Types filtres élèves
14. S5     → Logique filtrage élèves
15. S2     → API stats élèves
16. S4     → StudentCard enrichie
17. S3     → StudentFilterBar
18. S6     → Intégration page élèves
19. C1     → Types & calculs stats groupe
20. C2     → Composant StatsCounters
21. C3     → Boutons sélection groupe
22. C4     → Intégration page
```

---

## 📊 Extension : Compteurs & Sélection Groupe (C1-C4)

> **Objectif** : Ajouter des compteurs agrégés et boutons de sélection groupe sur la page "Mes Élèves"

---

## 📋 Tâche C1 — Types & calculs stats

### Prompt C1.1 — Ajouter GroupStats et calculateGroupStats

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- Page "Mes Élèves" avec filtres S1-S6 déjà implémentés
- Fichier `src/lib/student-filters.ts` existant
- Système de notation suisse /6
- Seuils : 🟢 ≥4.5, 🟡 3.5-4.4, 🔴 <3.5

TÂCHE :
Ajouter dans `src/lib/student-filters.ts` :

1. Interface `GroupStats` :
```typescript
export interface GroupStats {
  total: number;
  successCount: number;   // 🟢 ≥4.5
  warningCount: number;   // 🟡 3.5-4.4
  dangerCount: number;    // 🔴 <3.5
  noDataCount: number;    // ⚪ sans notes
  averageGrade: number | null;  // Moyenne /6 du groupe
}
```

2. Fonction `calculateGroupStats()` :
```typescript
export function calculateGroupStats<T extends FilterableStudent>(
  students: T[]
): GroupStats {
  // Compter par niveau d'alerte
  // Calculer moyenne pondérée des averageGrade
  // Retourner l'objet GroupStats
}
```

RÈGLES :
- Moyenne = somme(averageGrade) / nb élèves avec notes
- Si 0 élèves avec notes → averageGrade = null
- Utiliser stats.alertLevel pour compter

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche C2 — Composant StatsCounters

### Prompt C2.1 — Créer les cartes KPI

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Interface GroupStats disponible dans student-filters.ts
- 4 KPIs à afficher : 🟢 succès, 🟡 warning, 🔴 danger, moyenne générale

TÂCHE :
Créer `src/components/features/teacher/StatsCounters.tsx`

UI CIBLE :
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐
│   🟢 2       │  │   🟡 1       │  │   🔴 1       │  │  4.2/6   │
│  En réussite │  │ À surveiller │  │ En difficulté│  │ Moyenne  │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────┘
```

PROPS :
```typescript
interface StatsCountersProps {
  stats: GroupStats;
  selectedCount: number;
  totalCount: number;
}
```

STRUCTURE :
- 4 cartes côte à côte (grid 4 cols sur desktop)
- Icône/emoji coloré + nombre grand
- Label sous le nombre
- Header avec "📊 Statistiques (X sélectionnés sur Y)"

COMPOSANTS shadcn :
- Card, CardContent

RÈGLES :
- < 80 lignes
- Responsive (2 cols sur mobile)

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche C3 — Boutons sélection groupe

### Prompt C3.1 — Créer SelectionButtons

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Liste d'élèves filtrée avec multi-sélection existante
- Besoin de boutons pour gérer la sélection en masse

TÂCHE :
Créer `src/components/features/teacher/SelectionButtons.tsx`

UI CIBLE :
```
[☑ Tout] [☐ Aucun] [⟲ Inverser]     Sélection: 4 élèves
```

PROPS :
```typescript
interface SelectionButtonsProps {
  allIds: string[];              // IDs de tous les élèves filtrés
  selectedIds: string[];         // IDs actuellement sélectionnés
  onSelectionChange: (ids: string[]) => void;
}
```

COMPORTEMENTS :
- "Tout" → sélectionne allIds
- "Aucun" → vide la sélection
- "Inverser" → toggle chaque élément (allIds - selectedIds)

COMPOSANTS shadcn :
- Button (variant="outline", size="sm")
- Badge pour le compteur

RÈGLES :
- < 50 lignes
- Icônes lucide-react (CheckSquare, Square, RefreshCw)

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche C4 — Intégration StudentsList

### Prompt C4.1 — Assembler dans la page

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- `StudentsList.tsx` existant avec filtres S1-S6
- Nouveaux composants : StatsCounters, SelectionButtons
- Fonction calculateGroupStats disponible

TÂCHE :
Modifier `src/components/features/teacher/StudentsList.tsx` pour intégrer :

1. IMPORTS :
```typescript
import { StatsCounters } from './StatsCounters';
import { SelectionButtons } from './SelectionButtons';
import { calculateGroupStats } from '@/lib/student-filters';
```

2. CALCUL STATS (dans le composant) :
```typescript
const groupStats = useMemo(() => {
  // Si sélection → stats des sélectionnés
  // Sinon → stats des filtrés
  const source = filters.selectedStudentIds.length > 0
    ? filteredStudents.filter(s => filters.selectedStudentIds.includes(s.id))
    : filteredStudents;
  return calculateGroupStats(source);
}, [filteredStudents, filters.selectedStudentIds]);
```

3. LAYOUT :
```tsx
<div className="space-y-4">
  {/* Stats en haut */}
  <StatsCounters 
    stats={groupStats}
    selectedCount={filters.selectedStudentIds.length}
    totalCount={students.length}
  />

  {/* Filtres existants */}
  <StudentFilterBar ... />

  {/* Boutons sélection */}
  <div className="flex items-center justify-between">
    <SelectionButtons
      allIds={filteredStudents.map(s => s.id)}
      selectedIds={filters.selectedStudentIds}
      onSelectionChange={(ids) => setFilters({...filters, selectedStudentIds: ids})}
    />
    {/* Toggle vue existant */}
  </div>

  {/* Grille élèves */}
  ...
</div>
```

RÈGLES :
- Ne pas dépasser 200 lignes pour StudentsList
- Conserver tout le code existant

VÉRIFICATION :
- npm run build passe
- Stats se mettent à jour selon sélection
```

---

## ✅ Checklist Finale Phase 7bis

- [x] Migration Prisma appliquée
- [x] API fonctionnelle (GET + PUT)
- [x] Service de calculs testé
- [x] Page fiche élève accessible
- [x] KPIs globaux affichés
- [x] Liste cours dépliable
- [x] Saisie note examen fonctionnelle
- [x] Navigation depuis liste élèves
- [x] Filtres fiche élève (F1-F4)
- [x] Filtres liste élèves (S1-S6)
- [x] Compteurs & sélection groupe (C1-C4)
- [ ] Filtres page classes (CL1-CL7)
- [ ] `npm run lint` OK
- [ ] `npm run build` OK
- [ ] Aucun fichier > 350 lignes

---

## 🆕 Extension : Page "Mes Classes" (CL1-CL7)

> **Objectif** : Ajouter filtres multi-matières, stats agrégées et sélection multi-classes

---

## 📋 Tâche CL1 — Types & Interfaces

### Prompt CL1 — Créer types filtres classes

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6).

CONTEXTE :
- Page "Mes Classes" `/teacher/classes`
- Besoin de filtrer par matières (multi-select), niveau, recherche
- Besoin de sélectionner plusieurs classes pour voir leurs stats agrégées
- Pattern identique à student-filters.ts

TÂCHE :
Créer `src/types/class-filters.ts` avec les interfaces suivantes.

CONTENU :

```typescript
/**
 * Types pour le filtrage des classes
 * @module class-filters
 */

/** Filtres actifs sur la page "Mes Classes" */
export interface ClassFilters {
  /** IDs des matières sélectionnées ([] = toutes) */
  subjectIds: string[];
  /** Niveau sélectionné (null = tous) */
  level: string | null;
  /** Recherche par nom de classe */
  search: string;
  /** IDs des classes sélectionnées pour stats */
  selectedClassIds: string[];
}

export const DEFAULT_CLASS_FILTERS: ClassFilters = {
  subjectIds: [],
  level: null,
  search: '',
  selectedClassIds: [],
};

/** Stats agrégées d'un groupe de classes */
export interface ClassGroupStats {
  /** Nombre total d'élèves */
  totalStudents: number;
  /** Élèves en réussite (🟢 ≥4.5) */
  successCount: number;
  /** Élèves à surveiller (🟡 3.5-4.4) */
  warningCount: number;
  /** Élèves en difficulté (🔴 <3.5) */
  dangerCount: number;
  /** Élèves sans notes */
  noDataCount: number;
  /** Moyenne générale (/6) */
  averageGrade: number | null;
}

export type ClassAlertLevel = 'success' | 'warning' | 'danger' | 'no-data';

/** Classe enrichie avec stats pour la liste */
export interface ClassWithStats {
  id: string;
  name: string;
  level: string;
  studentsCount: number;
  subjects: { id: string; name: string }[];
  stats: {
    successCount: number;
    warningCount: number;
    dangerCount: number;
    averageGrade: number | null;
    alertLevel: ClassAlertLevel;
  };
}
```

RÈGLES :
- Export nommés uniquement
- JSDoc sur chaque interface
- < 80 lignes

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche CL2 — Fonctions filtrage/stats

### Prompt CL2 — Créer fonctions filtrage classes

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- Types créés dans `src/types/class-filters.ts`
- Pattern identique à `src/lib/student-filters.ts`
- Filtrage multi-matières = OR (classe visible si au moins une matière match)

TÂCHE :
Créer `src/lib/class-filters.ts` avec les fonctions suivantes.

FONCTIONS :

1. filterClasses(classes, filters) :
   - Si subjectIds non vide → classe visible si au moins 1 matière match (OR)
   - Si level non null → filtrer par niveau exact
   - Si search non vide → recherche dans le nom
   - Ne PAS filtrer par selectedClassIds (comme pour les élèves)

2. calculateClassGroupStats(classes) :
   - Agrège les stats de toutes les classes
   - totalStudents = somme des studentsCount
   - successCount = somme des stats.successCount
   - etc.
   - averageGrade = moyenne pondérée par studentsCount

3. extractSubjectsFromClasses(classes) :
   - Retourne liste unique des matières
   - Triée par nom

4. extractLevelsFromClasses(classes) :
   - Retourne liste unique des niveaux
   - Triée alphabétiquement

RÈGLES :
- Fonctions génériques avec TypeScript
- < 150 lignes
- Export nommés

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche CL3 — ClassFilterBar

### Prompt CL3 — Créer barre filtres avec multi-matières

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Pattern identique à StudentFilterBar
- MAIS : matières en multi-select avec badges cliquables
- Utiliser Popover + Badge de shadcn/ui

TÂCHE :
Créer `src/components/features/teacher/ClassFilterBar.tsx`.

PROPS :

interface ClassFilterBarProps {
  subjects: { id: string; name: string }[];
  levels: string[];
  filters: ClassFilters;
  onFiltersChange: (filters: ClassFilters) => void;
  resultCount: number;
  totalCount: number;
}

STRUCTURE UI :

```
┌──────────────────────────────────────────────────────────────┐
│ Matières: [Math ×] [Info ×] [+ Matière]  │ Niveau ▼ │ 🔎    │
│ 📊 3 classes sur 5                                           │
└──────────────────────────────────────────────────────────────┘
```

COMPORTEMENT MULTI-SELECT :
1. Badges des matières sélectionnées avec X pour supprimer
2. Badge "+ Matière" ouvre Popover avec liste des non-sélectionnées
3. Clic sur une matière dans Popover → l'ajoute aux filtres
4. Si aucune matière → afficher "Toutes les matières"

COMPOSANTS shadcn/ui :
- Badge, Popover, PopoverTrigger, PopoverContent
- Select pour niveau
- Input pour recherche

RÈGLES :
- 'use client'
- < 120 lignes
- Icônes lucide-react

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche CL4 — ClassStatsCounters

### Prompt CL4 — Créer compteurs stats classes

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Pattern quasi identique à StatsCounters (élèves)
- MAIS : affiche stats des ÉLÈVES dans les classes sélectionnées
- 4 cartes : Total élèves, En réussite, En difficulté, Moyenne

TÂCHE :
Créer `src/components/features/teacher/ClassStatsCounters.tsx`.

PROPS :

interface ClassStatsCountersProps {
  stats: ClassGroupStats;
  selectedCount: number;  // Nombre de classes sélectionnées
  totalCount: number;     // Nombre total de classes
}

CARTES :
1. 👨‍🎓 {stats.totalStudents} - "Élèves"
2. 🟢 {stats.successCount} - "En réussite"
3. 🔴 {stats.dangerCount} - "En difficulté"
4. 📊 {stats.averageGrade?.toFixed(1)}/6 - "Moyenne"

TITRE :
"📊 Statistiques ({selectedCount} classe(s) sélectionnée(s) sur {totalCount})"
Si selectedCount = 0 → "📊 Statistiques ({totalCount} classes)"

RÈGLES :
- Réutiliser le même style que StatsCounters
- < 80 lignes

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche CL5 — TeacherClassCard enrichie

### Prompt CL5 — Enrichir carte classe

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Fichier existant : `src/components/features/teacher/TeacherClassCard.tsx`
- Ajouter : checkbox sélection, badge alertLevel, affichage moyenne
- Pattern identique à StudentCard

TÂCHE :
Modifier `TeacherClassCard.tsx` pour ajouter sélection et stats visuels.

PROPS AJOUTÉES :

interface TeacherClassCardProps {
  classData: ClassWithStats;  // Enrichi avec stats
  selected?: boolean;
  onToggleSelect?: () => void;
}

MODIFICATIONS :
1. Checkbox en haut à gauche (si onToggleSelect fourni)
2. Badge alertLevel à côté du nom :
   - 🟢 si success
   - 🟡 si warning  
   - 🔴 si danger
   - ⚪ si no-data
3. Afficher moyenne : "Moy: 4.5/6" sous le nombre d'élèves
4. Ring si selected (comme StudentCard)

RÈGLES :
- Conserver le code existant
- < 100 lignes total

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche CL6 — ClassesList intégration

### Prompt CL6 — Créer liste classes avec filtres

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- Pattern identique à StudentsList
- Intègre : ClassFilterBar, ClassStatsCounters, SelectionButtons (réutilisé!), TeacherClassCard

TÂCHE :
Créer `src/components/features/teacher/ClassesList.tsx`.

PROPS :

interface ClassesListProps {
  classes: ClassWithStats[];
}

STRUCTURE :

'use client';

import { useState, useMemo } from 'react';
// Imports...

export function ClassesList({ classes }: ClassesListProps) {
  const [filters, setFilters] = useState<ClassFilters>(DEFAULT_CLASS_FILTERS);

  // Extraire sujets et niveaux uniques
  const subjects = useMemo(() => extractSubjectsFromClasses(classes), [classes]);
  const levels = useMemo(() => extractLevelsFromClasses(classes), [classes]);

  // Filtrage
  const filteredClasses = useMemo(() => 
    filterClasses(classes, filters), 
    [classes, filters]
  );

  // Stats (selon sélection ou tous)
  const groupStats = useMemo(() => {
    const source = filters.selectedClassIds.length > 0
      ? filteredClasses.filter(c => filters.selectedClassIds.includes(c.id))
      : filteredClasses;
    return calculateClassGroupStats(source);
  }, [filteredClasses, filters.selectedClassIds]);

  // IDs pour SelectionButtons
  const filteredIds = useMemo(() => 
    filteredClasses.map(c => c.id), 
    [filteredClasses]
  );

  return (
    <div className="space-y-4">
      <ClassFilterBar
        subjects={subjects}
        levels={levels}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredClasses.length}
        totalCount={classes.length}
      />

      <ClassStatsCounters
        stats={groupStats}
        selectedCount={filters.selectedClassIds.length}
        totalCount={filteredClasses.length}
      />

      <SelectionButtons
        allIds={filteredIds}
        selectedIds={filters.selectedClassIds}
        onSelectionChange={(ids) => setFilters({...filters, selectedClassIds: ids})}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => (
          <TeacherClassCard
            key={cls.id}
            classData={cls}
            selected={filters.selectedClassIds.includes(cls.id)}
            onToggleSelect={() => {
              const newSelection = filters.selectedClassIds.includes(cls.id)
                ? filters.selectedClassIds.filter(id => id !== cls.id)
                : [...filters.selectedClassIds, cls.id];
              setFilters({...filters, selectedClassIds: newSelection});
            }}
          />
        ))}
      </div>
    </div>
  );
}

RÈGLES :
- Réutiliser SelectionButtons (générique!)
- < 150 lignes

VÉRIFICATION :
- npm run build passe
```

---

## 📋 Tâche CL7 — Page server + query enrichie

### Prompt CL7 — Modifier page classes

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6).

CONTEXTE :
- Page existante : `src/app/(dashboard)/teacher/classes/page.tsx`
- Besoin d'enrichir avec stats élèves par classe
- Utiliser ClassesList au lieu du grid manuel

TÂCHE :
Modifier la page pour enrichir les données et utiliser ClassesList.

QUERY ENRICHIE :

async function getTeacherClasses(userId: string): Promise<ClassWithStats[]> {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      classes: {
        include: {
          students: {
            include: {
              user: {
                include: {
                  studentScores: true,  // Pour calculer les stats
                },
              },
            },
          },
        },
      },
      subjects: true,
    },
  });

  // ... mapper vers ClassWithStats avec calcul alertLevel
}

CALCUL alertLevel PAR CLASSE :
- Calculer moyenne des élèves de la classe
- Si moyenne >= 4.5 → 'success'
- Si moyenne >= 3.5 → 'warning'
- Si moyenne < 3.5 → 'danger'
- Si aucune note → 'no-data'

PAGE SIMPLIFIÉE :

export default async function TeacherClassesPage() {
  // ... auth check
  const classes = await getTeacherClasses(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes Classes</h1>
        <p className="text-muted-foreground">...</p>
      </div>

      {classes.length === 0 ? (
        // Empty state
      ) : (
        <ClassesList classes={classes} />
      )}
    </div>
  );
}

RÈGLES :
- Server component pour la query
- < 100 lignes
- Ne pas dupliquer la logique de calcul (utiliser des helpers)

VÉRIFICATION :
- npm run build passe
- Page affiche les classes avec stats
```

---

## 🔄 Itérations & Améliorations (CL1-CL7)

### Itération 1 : Implémentation initiale (CL1-CL7)
**Résultat** : ✅ Fonctionnel mais interface non optimale
- Filtres en premier → masquait les stats principales
- Pas de bouton toggle pour replier les filtres
- Incohérence de style avec la page "Mes Élèves" (fond gris vs blanc)

### Itération 2 : Réorganisation de la mise en page
**Prompt amélioré** :
```
Réorganiser l'ordre des composants dans ClassesList :
1. ClassSelectionButtons (Tout/Aucun/Inverser) en premier
2. ClassStatsCounters (4 KPIs) ensuite
3. ClassFilterBar en dernier
4. Puis la grille de cartes

Objectif : L'utilisateur voit d'abord les stats, puis peut filtrer si besoin.
```

**Résultat** : ✅ Meilleure hiérarchie visuelle

### Itération 3 : Ajout des boutons toggle collapse
**Problème** : Les filtres prennent de la place, besoin de les replier.

**Prompt amélioré** :
```
Ajouter un bouton toggle (ChevronUp/Down) dans ClassFilterBar pour permettre à l'utilisateur de replier/déplier le bloc des filtres.

Pattern : 
- useState(isOpen) initialisé à true
- Afficher le bouton avec icône chevron
- Conditionner l'affichage du contenu des filtres sur isOpen
```

**Résultat** : ✅ Fonctionnel sur page Classes et Élèves

### Itération 4 : Cohérence stylistique
**Problème** : StudentFilterBar avait `bg-muted/30`, ClassFilterBar avait `bg-white`.

**Prompt amélioré** :
```
Mettre à jour StudentFilterBar pour utiliser `bg-white` au lieu de `bg-muted/30` pour cohérence avec ClassFilterBar.
```

**Résultat** : ✅ Style uniforme

### Itération 5 : Correction bouton suppression matière
**Problème** : Clic sur la croix (×) déclenchait le clic du parent (Popover).

**Prompt amélioré** :
```
Dans ClassFilterBar, le bouton × de suppression de matière ne fonctionne pas car le clic propage au parent.

Ajouter `e.stopPropagation()` dans le onClick du bouton × pour bloquer la propagation d'événement.
```

**Résultat** : ✅ Bouton fonctionnel

### Itération 6 : Filtrage matières sur les cartes
**Problème** : Les cartes affichaient TOUTES les matières même après filtrage, donnant l'impression que le filtre ne fonctionnait pas.

**Prompt amélioré** :
```
Dans ClassesList, lorsque des matières sont filtrées (filters.subjectIds non vide), n'afficher sur les cartes QUE les matières filtrées, pas toutes les matières de la classe.

Ajouter la logique :
```typescript
const displayedSubjects = filters.subjectIds.length > 0
  ? cls.subjects.filter(s => filters.subjectIds.includes(s.id))
  : cls.subjects;
```

Passer `displayedSubjects` à TeacherClassCard au lieu de `cls.subjects`.
```

**Résultat** : ✅ Feedback visuel immédiat du filtrage

### Itération 7 : Console.log debug
**Ajout** : Logs dans le useMemo de `groupStats` pour tracer le recalcul :
```typescript
console.log('📊 ClassesList groupStats recalculé:', {
  filtresMatières: filters.subjectIds,
  classesFiltrées: filteredClasses.length,
  classesSélectionnées: selectedClasses.length,
  stats: result,
});
```

**Résultat** : 🔍 Facilite le debug sans DevTools React

---

## 📝 Prompt Optimal Final CL1-CL7

**Contexte attendu** :
- Types créés (`ClassFilters`, `ClassWithStats`, `ClassGroupStats`)
- Fonctions utilitaires dans `class-filters.ts`
- Pattern identique à `student-filters.ts` et `StudentsList.tsx`

**Prompt optimal qui aurait évité les itérations** :

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, shadcn/ui).

CONTEXTE :
- Extension de la page "Mes Classes" avec filtres multi-matières, stats agrégées et sélection multi-classes
- Pattern identique à "Mes Élèves" (student-filters.ts, StudentsList.tsx)

TÂCHES (CL1-CL7) :

1. CL1 : Créer `src/types/class-filters.ts` avec ClassFilters (subjectIds[], level, search, selectedClassIds), ClassWithStats, ClassGroupStats
2. CL2 : Créer `src/lib/class-filters.ts` avec filterClasses() (OR sur matières), calculateClassGroupStats(), extractSubjectsFromClasses(), extractLevelsFromClasses()
3. CL3 : Créer `src/components/features/teacher/ClassFilterBar.tsx` avec :
   - Multi-select matières via Popover + Badges avec X (IMPORTANT : e.stopPropagation() sur le bouton X)
   - Select niveau
   - Input recherche
   - Bouton toggle ChevronUp/Down pour replier/déplier (useState(isOpen) initialisé à true)
   - Fond blanc (bg-white) pour cohérence avec StudentFilterBar
4. CL4 : Créer `src/components/features/teacher/ClassStatsCounters.tsx` (4 KPIs : totalStudents, successCount, dangerCount, averageGrade)
5. CL5 : Enrichir `TeacherClassCard.tsx` avec checkbox sélection, badge alertLevel, moyenne
6. CL6 : Créer `ClassesList.tsx` avec :
   - ORDRE DES COMPOSANTS : SelectionButtons → StatsCounters → FilterBar (repliable) → Grid
   - Logique filtrage : displayedSubjects = filters.subjectIds.length > 0 ? filter : all (pour afficher uniquement les matières filtrées sur les cartes)
   - Console.log dans useMemo(groupStats) pour debug
7. CL7 : Enrichir page server avec query StudentScores, calcul alertLevel par classe, helper calculateClassStats()

RÈGLES CRITIQUES :
- Ordre UI : Sélection → Stats → Filtres (pas Filtres en premier !)
- Matières multi-select = OR (classe visible si au moins 1 matière match)
- Cards n'affichent QUE les matières filtrées (displayedSubjects)
- Toggle collapse pour FilterBar (isOpen state)
- e.stopPropagation() sur bouton × de suppression
- Fond blanc partout (cohérence)
- Console.log pour debug des stats recalculées

VALIDATION :
- npm run build passe
- Tous fichiers < 350 lignes
```

**Différences clés vs prompts originaux** :
- ❌ Original : Ordre UI non précisé → filtres placés en premier
- ✅ Optimal : Spécifier "SelectionButtons → StatsCounters → FilterBar → Grid"
- ❌ Original : Pas mentionné e.stopPropagation() → bouton × ne marchait pas
- ✅ Optimal : Préciser explicitement la gestion de l'événement
- ❌ Original : Cards affichent toutes les matières → feedback visuel du filtrage peu clair
- ✅ Optimal : Spécifier "displayedSubjects = filtered if subjectIds not empty"
- ❌ Original : Pas de toggle collapse mentionné → UI encombrée
- ✅ Optimal : Intégrer le toggle dès le prompt CL3

**Bénéfices** :
- 🎯 Implémentation correcte du premier coup
- 🚀 Pas de back-and-forth sur l'ordre des composants
- 🐛 Bugs d'interaction évités
- 📐 Cohérence UI garantie

---

*Lignes : ~1070 | Dernière MAJ : 2025-01-XX*

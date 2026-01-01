# Phase 7-sexies — Centre de Pilotage Pédagogique (Prompts)

> **Fichier prompt** pour la phase 7-sexies : transformation du dashboard en centre de pilotage KPIs.

---

## 📋 Étape 7S.1 — Types & Utilitaires

### Prompt 7S.1.1 — Types Dashboard Filters

```markdown
## Contexte
BlaizBot-V1 (Next.js 15, TypeScript, Prisma). 
Le professeur veut un centre de pilotage avec filtres combinables.

## Ta mission
Créer le fichier de types pour les filtres et KPIs du dashboard.

## Fichier à créer
`src/types/dashboard-filters.ts`

## Contenu attendu

// Filtres du centre de pilotage
export interface DashboardFilters {
  classId: string | null;
  subjectId: string | null;
  courseId: string | null;
  chapterId: string | null;
  period: DashboardPeriod;
  alertLevel: AlertLevel;
  studentSearch: string;
}

export type DashboardPeriod = 'week' | 'month' | 'trimester' | 'year' | 'all';
export type AlertLevel = 'all' | 'critical' | 'warning' | 'good';

// KPIs calculés
export interface DashboardKPIs {
  averageScore: number;        // Moyenne générale (0-100)
  successRate: number;         // Taux de réussite % (score >= 50)
  progressionRate: number;     // Progression moyenne %
  engagementRate: number;      // % élèves actifs (< 7 jours)
  activeAlerts: number;        // Nb élèves en difficulté
  aiAverageScore: number;      // Score IA moyen
}

// Tendances (comparaison période précédente)
export interface KPITrend {
  value: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;  // Ex: +5 ou -3
}

export interface DashboardKPIsWithTrends {
  averageScore: KPITrend;
  successRate: KPITrend;
  progressionRate: KPITrend;
  engagementRate: KPITrend;
  activeAlerts: KPITrend;
}

// Performance cours
export interface CoursePerformance {
  courseId: string;
  courseTitle: string;
  chapterTitle?: string;
  averageScore: number;
  studentCount: number;
  trend: 'up' | 'down' | 'stable';
  weakPoint?: string;  // Point de blocage identifié
}

// Alerte élève
export interface StudentAlert {
  studentId: string;
  firstName: string;
  lastName: string;
  className: string;
  averageScore: number;
  alertLevel: 'critical' | 'warning' | 'good';
  lastActivity: Date | null;
  weakCourse?: string;
}

// Defaults
export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  classId: null,
  subjectId: null,
  courseId: null,
  chapterId: null,
  period: 'month',
  alertLevel: 'all',
  studentSearch: '',
};

## Validation
- Types exportés sans erreur TS
- < 100 lignes
```

---

### Prompt 7S.1.2 — Utilitaires Calcul KPIs

```markdown
## Contexte
BlaizBot-V1. On a les types de dashboard. Besoin de fonctions de calcul.

## Ta mission
Créer les fonctions utilitaires pour calculer les KPIs.

## Fichier à créer
`src/lib/utils/kpi-calculations.ts`

## Contenu attendu

import { DashboardKPIs, KPITrend } from '@/types/dashboard-filters';

// Calcul moyenne avec gestion division par zéro
export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Calcul taux de réussite (score >= seuil)
export function calculateSuccessRate(scores: number[], threshold = 50): number {
  if (scores.length === 0) return 0;
  const passed = scores.filter(s => s >= threshold).length;
  return Math.round((passed / scores.length) * 100);
}

// Calcul tendance (comparaison 2 valeurs)
export function calculateTrend(current: number, previous: number): KPITrend {
  const diff = current - previous;
  return {
    value: current,
    trend: diff > 2 ? 'up' : diff < -2 ? 'down' : 'stable',
    trendValue: Math.round(diff),
  };
}

// Calcul engagement (actifs < X jours)
export function calculateEngagement(
  lastActivities: (Date | null)[],
  daysThreshold = 7
): number {
  if (lastActivities.length === 0) return 0;
  const now = new Date();
  const active = lastActivities.filter(date => {
    if (!date) return false;
    const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= daysThreshold;
  });
  return Math.round((active.length / lastActivities.length) * 100);
}

// Déterminer niveau d'alerte élève
export function getAlertLevel(score: number): 'critical' | 'warning' | 'good' {
  if (score < 40) return 'critical';
  if (score < 60) return 'warning';
  return 'good';
}

// Couleur selon niveau alerte
export function getAlertColor(level: 'critical' | 'warning' | 'good'): string {
  const colors = {
    critical: 'text-red-600',
    warning: 'text-orange-500',
    good: 'text-green-600',
  };
  return colors[level];
}

// Badge couleur
export function getAlertBadgeClass(level: 'critical' | 'warning' | 'good'): string {
  const classes = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-orange-100 text-orange-800',
    good: 'bg-green-100 text-green-800',
  };
  return classes[level];
}

## Validation
- Fonctions pures, testables
- < 80 lignes
```

---

## 📋 Étape 7S.2 — API Dashboard Agrégations

### Prompt 7S.2.1 — API KPIs avec Filtres

```markdown
## Contexte
BlaizBot-V1. API pour récupérer les KPIs du dashboard avec filtres query params.

## Ta mission
Créer l'API GET /api/teacher/dashboard/kpis qui :
1. Vérifie que l'utilisateur est TEACHER
2. Accepte les filtres en query params
3. Agrège les données de StudentScore, Progression, AIActivityScore
4. Retourne les KPIs calculés

## Fichier à créer
`src/app/api/teacher/dashboard/kpis/route.ts`

## Query params acceptés
- classId (optional)
- subjectId (optional)
- courseId (optional)
- period: 'week' | 'month' | 'trimester' | 'year' | 'all'

## Logique Prisma

// 1. Construire le where clause selon filtres
const where = {
  Course: {
    teacherId: teacherProfile.id,
    ...(classId && { 
      CourseAssignment: { some: { classId } }
    }),
    ...(subjectId && { subjectId }),
    ...(courseId && { id: courseId }),
  },
  ...(periodFilter && { updatedAt: { gte: periodDate } }),
};

// 2. Récupérer StudentScores filtrés
const scores = await prisma.studentScore.findMany({
  where,
  select: {
    continuousScore: true,
    quizAvg: true,
    aiComprehension: true,
  },
});

// 3. Récupérer Progressions pour engagement
const progressions = await prisma.progression.findMany({
  where: { Course: { teacherId: teacherProfile.id, ...filters } },
  select: { percentage: true, lastActivity: true },
});

// 4. Calculer KPIs
const kpis: DashboardKPIs = {
  averageScore: calculateAverage(scores.map(s => s.continuousScore)),
  successRate: calculateSuccessRate(scores.map(s => s.continuousScore)),
  progressionRate: calculateAverage(progressions.map(p => p.percentage)),
  engagementRate: calculateEngagement(progressions.map(p => p.lastActivity)),
  activeAlerts: scores.filter(s => s.continuousScore < 40).length,
  aiAverageScore: calculateAverage(scores.map(s => s.aiComprehension)),
};

## Réponse
{ success: true, data: kpis }

## Validation
- Protection TEACHER
- Filtrage par teacherId obligatoire
- < 120 lignes
```

---

### Prompt 7S.2.2 — API Courses Performance

```markdown
## Contexte
BlaizBot-V1. API pour récupérer les cours top/flop.

## Ta mission
Créer l'API GET /api/teacher/dashboard/courses-performance

## Fichier à créer
`src/app/api/teacher/dashboard/courses-performance/route.ts`

## Logique

// Récupérer cours du prof avec leurs scores moyens
const courses = await prisma.course.findMany({
  where: { teacherId: teacherProfile.id, isFolder: false },
  include: {
    StudentScore: {
      select: { continuousScore: true },
    },
    Chapter: {
      select: { id: true, title: true },
    },
  },
});

// Calculer moyenne par cours
const performance = courses.map(course => {
  const scores = course.StudentScore.map(s => s.continuousScore);
  return {
    courseId: course.id,
    courseTitle: course.title,
    averageScore: calculateAverage(scores),
    studentCount: scores.length,
    trend: 'stable', // TODO: comparer avec période précédente
  };
});

// Trier: top 3 + flop 3
const sorted = performance.sort((a, b) => b.averageScore - a.averageScore);
const top = sorted.slice(0, 3);
const bottom = sorted.slice(-3).reverse();

## Réponse
{ success: true, data: { top, bottom } }

## Validation
- Filtrage teacherId
- < 100 lignes
```

---

### Prompt 7S.2.3 — API Students Alerts

```markdown
## Contexte
BlaizBot-V1. API pour récupérer les élèves à surveiller.

## Ta mission
Créer l'API GET /api/teacher/dashboard/students-alerts

## Fichier à créer
`src/app/api/teacher/dashboard/students-alerts/route.ts`

## Query params
- classId (optional)
- alertLevel: 'all' | 'critical' | 'warning' | 'good'
- limit: number (default 10)

## Logique

// Classes du prof
const teacherClasses = await prisma.class.findMany({
  where: { TeacherProfile: { some: { userId: session.user.id } } },
  select: { id: true },
});

const classIds = classId ? [classId] : teacherClasses.map(c => c.id);

// Élèves avec leurs scores
const students = await prisma.user.findMany({
  where: {
    role: 'STUDENT',
    StudentProfile: { classId: { in: classIds } },
  },
  include: {
    StudentProfile: {
      include: { Class: { select: { name: true } } },
    },
    StudentScore: {
      select: { continuousScore: true, Course: { select: { title: true } } },
    },
    Progression: {
      select: { lastActivity: true },
      orderBy: { lastActivity: 'desc' },
      take: 1,
    },
  },
});

// Mapper vers StudentAlert
const alerts: StudentAlert[] = students.map(student => {
  const scores = student.StudentScore.map(s => s.continuousScore);
  const avgScore = calculateAverage(scores);
  const weakCourse = student.StudentScore
    .sort((a, b) => a.continuousScore - b.continuousScore)[0]?.Course.title;
  
  return {
    studentId: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    className: student.StudentProfile?.Class.name || '',
    averageScore: avgScore,
    alertLevel: getAlertLevel(avgScore),
    lastActivity: student.Progression[0]?.lastActivity || null,
    weakCourse,
  };
});

// Filtrer par alertLevel si précisé
const filtered = alertLevel === 'all' 
  ? alerts 
  : alerts.filter(a => a.alertLevel === alertLevel);

// Trier par score croissant (pires en premier)
const sorted = filtered.sort((a, b) => a.averageScore - b.averageScore);

## Réponse
{ success: true, data: sorted.slice(0, limit) }

## Validation
- Filtrage par classes du prof uniquement
- < 120 lignes
```

---

## 📋 Étape 7S.3 — Composants UI Filtres

### Prompt 7S.3.1 — Dashboard Filter Bar

```markdown
## Contexte
BlaizBot-V1, shadcn/ui. Barre de filtres pour le centre de pilotage.

## Ta mission
Créer le composant DashboardFilterBar avec sélecteurs combinables.

## Fichier à créer
`src/components/features/dashboard/DashboardFilterBar.tsx`

## Props
interface DashboardFilterBarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  courses: { id: string; title: string; subjectId: string }[];
}

## Comportement
1. Select "Classe" : liste des classes du prof
2. Select "Matière" : liste des matières
3. Select "Cours" : filtré par matière sélectionnée
4. Select "Période" : Semaine / Mois / Trimestre / Année / Tout
5. Bouton "Réinitialiser"
6. Badge "X filtres actifs" si filtres appliqués

## UI shadcn
- Select pour chaque filtre
- Badge pour compteur filtres actifs
- Button variant="ghost" pour reset

## Validation
- < 150 lignes
- Cascade matière → cours
```

---

### Prompt 7S.3.2 — Hook useDashboardFilters

```markdown
## Contexte
BlaizBot-V1. Hook pour gérer l'état des filtres avec sync URL.

## Ta mission
Créer le hook useDashboardFilters.

## Fichier à créer
`src/hooks/useDashboardFilters.ts`

## Comportement
1. État local des filtres
2. Sync avec URL search params (optionnel)
3. Fonction updateFilter(key, value)
4. Fonction resetFilters()
5. Compteur filtres actifs

## Code attendu

'use client';

import { useState, useCallback, useMemo } from 'react';
import { DashboardFilters, DEFAULT_DASHBOARD_FILTERS } from '@/types/dashboard-filters';

export function useDashboardFilters(initialFilters?: Partial<DashboardFilters>) {
  const [filters, setFilters] = useState<DashboardFilters>({
    ...DEFAULT_DASHBOARD_FILTERS,
    ...initialFilters,
  });

  const updateFilter = useCallback(<K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_DASHBOARD_FILTERS);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.classId) count++;
    if (filters.subjectId) count++;
    if (filters.courseId) count++;
    if (filters.period !== 'month') count++;
    return count;
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    activeFiltersCount,
  };
}

## Validation
- Hook réutilisable
- < 60 lignes
```

---

## 📋 Étape 7S.4 — Composants UI KPIs

### Prompt 7S.4.1 — KPI Card

```markdown
## Contexte
BlaizBot-V1, shadcn/ui. Carte KPI individuelle avec tendance.

## Ta mission
Créer le composant KPICard.

## Fichier à créer
`src/components/features/dashboard/KPICard.tsx`

## Props
interface KPICardProps {
  title: string;
  value: number;
  unit?: string;  // '%', 'pts', etc.
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: LucideIcon;
  status?: 'good' | 'warning' | 'critical';
}

## UI
- Card shadcn
- Icône en haut à droite
- Valeur grande + unité
- Flèche tendance colorée (vert up, rouge down, gris stable)
- Bord coloré selon status

## Validation
- < 60 lignes
- Couleurs accessibles
```

---

### Prompt 7S.4.2 — KPI Grid

```markdown
## Contexte
BlaizBot-V1. Grille des 4 KPIs principaux.

## Ta mission
Créer le composant KPIGrid qui affiche les 4 KPIs.

## Fichier à créer
`src/components/features/dashboard/KPIGrid.tsx`

## Props
interface KPIGridProps {
  kpis: DashboardKPIsWithTrends | null;
  isLoading?: boolean;
}

## KPIs affichés
1. Moyenne Générale (Target, %)
2. Taux de Réussite (CheckCircle, %)
3. Progression (TrendingUp, %)
4. Alertes (AlertTriangle, nombre)

## UI
- Grid 4 colonnes responsive (1 mobile, 2 tablet, 4 desktop)
- Skeleton si isLoading
- Message si kpis null

## Validation
- < 80 lignes
- Responsive
```

---

### Prompt 7S.4.3 — Courses Performance Panel

```markdown
## Contexte
BlaizBot-V1. Panel Top/Flop des cours.

## Ta mission
Créer CoursesPerformancePanel.

## Fichier à créer
`src/components/features/dashboard/CoursesPerformancePanel.tsx`

## Props
interface CoursesPerformancePanelProps {
  top: CoursePerformance[];
  bottom: CoursePerformance[];
  isLoading?: boolean;
}

## UI
- Card avec 2 sections : "Mieux compris" (vert) / "À améliorer" (orange)
- Liste avec: titre cours, score %, nb élèves
- Badge coloré selon score
- Point de blocage si présent (weakPoint)

## Validation
- < 100 lignes
```

---

### Prompt 7S.4.4 — Students Alerts Panel

```markdown
## Contexte
BlaizBot-V1. Panel des élèves à surveiller.

## Ta mission
Créer StudentsAlertsPanel.

## Fichier à créer
`src/components/features/dashboard/StudentsAlertsPanel.tsx`

## Props
interface StudentsAlertsPanelProps {
  alerts: StudentAlert[];
  isLoading?: boolean;
  onStudentClick?: (studentId: string) => void;
}

## UI
- Card avec titre "Élèves à surveiller"
- Liste triée par urgence
- Chaque élève: avatar initiales, nom, classe, score, badge niveau
- Bouton "Voir fiche" si onStudentClick fourni
- Indicateur couleur (rouge critique, orange warning, vert good)

## Validation
- < 100 lignes
- Clickable pour navigation
```

---

## 📋 Étape 7S.5 — Assemblage Dashboard

### Prompt 7S.5.1 — Dashboard Page Refactor

```markdown
## Contexte
BlaizBot-V1. Transformer teacher/page.tsx en centre de pilotage.

## Ta mission
Refactorer src/app/(dashboard)/teacher/page.tsx pour intégrer le centre de pilotage.

## Structure attendue

Page serveur qui récupère:
- Classes du prof
- Matières du prof
- Cours du prof

Passe ces données à un Client Component <ControlCenterDashboard />

## Nouveau layout

1. Carte bienvenue (existante)
2. Section "Centre de Pilotage" avec:
   - DashboardFilterBar
   - KPIGrid
   - Grid 2 colonnes: CoursesPerformancePanel | StudentsAlertsPanel
3. (Bonus) AIInsightsCard

## Validation
- Server + Client components séparés
- < 150 lignes pour la page
```

---

### Prompt 7S.5.2 — Control Center Client Component

```markdown
## Contexte
BlaizBot-V1. Client component pour le centre de pilotage.

## Ta mission
Créer ControlCenterDashboard (client component).

## Fichier à créer
`src/components/features/dashboard/ControlCenterDashboard.tsx`

## Props
interface ControlCenterDashboardProps {
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
  courses: { id: string; title: string; subjectId: string }[];
}

## Comportement
1. useDashboardFilters() pour état filtres
2. useSWR ou fetch pour charger KPIs selon filtres
3. Afficher DashboardFilterBar
4. Afficher KPIGrid
5. Afficher CoursesPerformancePanel + StudentsAlertsPanel

## Data fetching
const { data: kpis, isLoading: kpisLoading } = useSWR(
  `/api/teacher/dashboard/kpis?${buildQueryString(filters)}`,
  fetcher
);

## Validation
- 'use client' en haut
- Rechargement auto au changement de filtre
- < 120 lignes
```

---

## 📋 Étape 7S.6 — Recommandations IA (Bonus)

### Prompt 7S.6.1 — API AI Insights

```markdown
## Contexte
BlaizBot-V1, Gemini. Générer des recommandations IA basées sur les KPIs.

## Ta mission
Créer POST /api/teacher/dashboard/ai-insights

## Fichier à créer
`src/app/api/teacher/dashboard/ai-insights/route.ts`

## Body attendu
{
  kpis: DashboardKPIs,
  topCourses: CoursePerformance[],
  bottomCourses: CoursePerformance[],
  alerts: StudentAlert[],
  filters: DashboardFilters
}

## Prompt Gemini
Tu es un assistant pédagogique. Analyse ces métriques et suggère 2-3 actions concrètes.

Données:
- Moyenne générale: ${kpis.averageScore}%
- Taux réussite: ${kpis.successRate}%
- Cours en difficulté: ${bottomCourses.map(c => c.courseTitle).join(', ')}
- Élèves en alerte: ${alerts.length}

Réponds en JSON:
{
  "summary": "Résumé en 1 phrase",
  "actions": [
    { "type": "remediation|content|individual", "description": "...", "target": "..." }
  ]
}

## Validation
- Protection TEACHER
- < 100 lignes
```

---

### Prompt 7S.6.2 — AI Insights Card

```markdown
## Contexte
BlaizBot-V1. Afficher les recommandations IA.

## Ta mission
Créer AIInsightsCard.

## Fichier à créer
`src/components/features/dashboard/AIInsightsCard.tsx`

## Props
interface AIInsightsCardProps {
  onGenerate: () => void;
  insights: AIInsight | null;
  isLoading?: boolean;
}

interface AIInsight {
  summary: string;
  actions: { type: string; description: string; target?: string }[];
}

## UI
- Card avec icône Sparkles (IA)
- Bouton "Générer analyse"
- Si insights: afficher summary + liste actions
- Badge par type action (remediation=orange, content=blue, individual=purple)

## Validation
- < 80 lignes
```

---

## 🔄 Rétro-Prompts (À compléter après implémentation)

### Template

```markdown
### Prompt Optimal 7S.X.X

> **Itérations réelles** : X (idéal = 1)
> **Problèmes rencontrés** : [liste]

\`\`\`
[Le prompt optimisé]
\`\`\`

**Différences clés vs prompt original** :
- [Point 1]
- [Point 2]
```

---

## ✅ Validation Finale

```bash
# Vérifications obligatoires
npm run lint
npm run build
npx tsc --noEmit

# Tests manuels
1. Changer filtre Classe → KPIs recalculés
2. Changer filtre Matière → Liste cours filtrée
3. Voir élèves critiques en premier
4. Voir cours à améliorer
5. (Bonus) Générer insights IA
```

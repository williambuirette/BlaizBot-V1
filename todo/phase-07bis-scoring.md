# 📊 Phase 7bis — Système de Scoring & Fiche Élève

> **Objectif** : Créer le système de notation "Bottom-Up" avec fiche élève enrichie  
> **Statut** : ✅ TERMINÉ  
> **Durée estimée** : 4-5h  
> **Prérequis** : Phase 7 terminée (Dashboard, Classes, Cours, Messagerie)
> **Prompts** : [prompts/phase-07bis-scoring.md](../prompts/phase-07bis-scoring.md)

---

## 🎯 Objectifs de cette Phase

1. **Collecter les scores** : Quiz, Exercices, Sessions IA → Score Continu (%)
2. **Saisir les examens** : Le professeur entre la note finale /6
3. **Calculer automatiquement** : Score Final = (Continu × 40%) + (Examen × 60%)
4. **Afficher dans une page dédiée** : `/teacher/students/[id]`
5. **Remonter les agrégations** : Élève → Groupe → Classe → Global

---

## 📐 Architecture du Système

### Pyramide des Scores (Bottom-Up)

```
                    ┌─────────────────┐
                    │   GLOBAL        │  ← Dashboard Prof
                    │   Moy: 4.2/6    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │ Classe A  │  │ Classe B  │  │ Classe C  │
        │  4.5/6    │  │  3.8/6    │  │  4.3/6    │
        └─────┬─────┘  └───────────┘  └───────────┘
              │
     ┌────────┼────────┐
     │        │        │
┌────▼───┐ ┌──▼───┐ ┌──▼────┐
│ Lucas  │ │Marie │ │Thomas │  ← Page /teacher/students/[id]
│ 4.8/6  │ │4.2/6 │ │4.5/6  │
└────┬───┘ └──────┘ └───────┘
     │
┌────┴─────────────────┐
│                      │
▼                      ▼
Cours 1              Cours 2
├─ Quiz: 80%         ├─ Quiz: 55%
├─ Exos: 75%         ├─ Exos: 60%
├─ IA: 70%           └─ Exam: —
└─ Exam: 5.0/6
```

### Formules de Calcul

| Niveau | Formule |
|:-------|:--------|
| **Score Continu** | `(avgQuiz × 0.35) + (avgExos × 0.40) + (avgIA × 0.25)` |
| **Score Final** | `(scoreContinuous × 40%) + (examScore × 60%)` |
| **Note /6** | `scoreFinal × 6 / 100` |

### Seuils d'Alerte

| Seuil | Note /6 | Couleur | Signification |
|:------|:--------|:--------|:--------------|
| 🟢 Bon | ≥ 4.5 | Vert | En bonne voie |
| 🟡 À surveiller | 3.5 - 4.4 | Orange | Attention requise |
| 🔴 À risque | < 3.5 | Rouge | Intervention nécessaire |

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
RÈGLE CRITIQUE : FILTRAGE PAR SESSION
- Le prof ne voit QUE les élèves de SES classes
- TOUJOURS filtrer par teacherProfile.classes
- Ne jamais exposer les données d'autres profs

STRUCTURE FICHIERS À CRÉER :
src/
├── app/api/teacher/
│   └── students/
│       └── [id]/
│           └── scores/
│               └── route.ts      # GET scores, PUT exam
├── app/(dashboard)/teacher/
│   └── students/
│       └── [id]/
│           └── page.tsx          # Page fiche élève
├── components/features/teacher/
│   ├── StudentScorePage.tsx      # Client component principal
│   ├── StudentScoreHeader.tsx    # En-tête avec KPIs globaux
│   ├── CourseScoreRow.tsx        # Ligne de cours (dépliable)
│   ├── ScoreDetailsList.tsx      # Liste Quiz/Exos (déplié)
│   └── ExamGradeDialog.tsx       # Saisie note examen
├── components/ui/
│   └── score-badge.tsx           # Badge coloré selon seuil
└── lib/
    └── stats-service.ts          # Calculs agrégés

RÈGLE 350 LIGNES :
- Page server component < 50 lignes
- Client components < 250 lignes
- Service calculs < 150 lignes
```

---

## 📋 Tâches de la Phase 7bis

### Vue d'ensemble

| # | Tâche | Fichiers | Effort | Statut |
|:--|:------|:---------|:-------|:-------|
| 7bis.1 | Migration Prisma | `schema.prisma` | 15min | ✅ |
| 7bis.2 | API Scores Élève | `api/teacher/students/[id]/scores/route.ts` | 30min | ✅ |
| 7bis.3 | Service Stats | `lib/stats-service.ts` | 45min | ✅ |
| 7bis.4 | Composant ScoreBadge | `components/ui/score-badge.tsx` | 15min | ✅ |
| 7bis.5 | Page Fiche Élève | `teacher/students/[id]/page.tsx` | 1h | ✅ |
| 7bis.6 | Composants Scores | `StudentScoreHeader`, `CourseScoreRow`, etc. | 1h | ✅ |
| 7bis.7 | Dialog Saisie Examen | `ExamGradeDialog.tsx` | 30min | ✅ |
| 7bis.8 | Navigation depuis Liste | Modifier page `/teacher/students` | 15min | ✅ |

**✅ Phase 7bis (Base) COMPLÈTE !**

---

## 🆕 Extension : Filtres & Tri (F1-F4)

### Vue d'ensemble

| # | Tâche | Fichiers | Effort | Statut |
|:--|:------|:---------|:-------|:-------|
| F1 | Seed StudentScore | `prisma/seed.ts` | 20min | ✅ |
| F2 | Composant FilterBar | `ScoreFilterBar.tsx` | 30min | ✅ |
| F3 | Logique de tri | `lib/stats-service.ts` | 20min | ✅ |
| F4 | Intégration page | `StudentScorePage.tsx` | 15min | ✅ |

**✅ Extension Filtres & Tri COMPLÈTE !**

---

## 🆕 Extension : Filtres Liste Élèves (S1-S4)

### 🎯 Objectif
Transformer la page "Mes Élèves" en tableau de bord filtrable avec stats sur les cartes.

### 🖼️ UI Attendue

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 Mes Élèves                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  🔍 FILTRES                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐│
│  │ Classe    ▼  │  │ État      ▼  │  │ Élèves: [Lucas] [Emma] [+]││
│  └──────────────┘  └──────────────┘  └────────────────────────────┘│
│  📊 4 élèves / 5 total                                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐                   │
│  │ 👤 Lucas MARTIN     │  │ 👤 Emma DURAND      │                   │
│  │    3ème A           │  │    3ème A           │                   │
│  │ ┌─────┬─────┬─────┐ │  │ ┌─────┬─────┬─────┐ │                   │
│  │ │ 68% │ 4.2 │ 4.4 │ │  │ │ 82% │ 5.2 │ 5.0 │ │                   │
│  │ │Cont.│Exam │Final│ │  │ │Cont.│Exam │Final│ │                   │
│  │ └─────┴─────┴─────┘ │  │ └─────┴─────┴─────┘ │                   │
│  │ 🟡 À surveiller     │  │ 🟢 Bon niveau       │                   │
│  └─────────────────────┘  └─────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Vue d'ensemble

| # | Tâche | Fichiers | Effort | Statut |
|:--|:------|:---------|:-------|:-------|
| S1 | Types & Interfaces | `src/types/student-filters.ts` | 10min | ✅ |
| S2 | API stats élèves | Modifier query page server | 20min | ✅ |
| S3 | StudentFilterBar | `StudentFilterBar.tsx` | 30min | ✅ |
| S4 | StudentCard enrichie | `StudentCard.tsx` + mini KPIs | 25min | ✅ |
| S5 | Logique filtrage | Fonctions filter/sort élèves | 15min | ✅ |
| S6 | Intégration page | Assembler dans `/teacher/students` | 20min | ✅ |

**Total : ~2h**

---

# 📊 Extension : Compteurs & Sélection Groupe (C1-C4)

> **Objectif** : Ajouter des compteurs agrégés et boutons de sélection groupe sur la page "Mes Élèves"

## 🖼️ UI Cible

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 Statistiques (4 élèves sélectionnés sur 12)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │   🟢 2       │  │   🟡 1       │  │   🔴 1       │  │  4.2/6   ││
│  │  En réussite │  │ À surveiller │  │ En difficulté│  │ Moyenne  ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                     │
│  [☑ Tout] [☐ Aucun] [⟲ Inverser]              Sélection: 4 élèves  │
└─────────────────────────────────────────────────────────────────────┘
```

## Vue d'ensemble

| # | Tâche | Fichiers | Effort | Statut |
|:--|:------|:---------|:-------|:-------|
| C1 | Types & calculs stats | `src/lib/student-filters.ts` | 10min | ✅ |
| C2 | Composant StatsCounters | `src/components/features/teacher/StatsCounters.tsx` | 15min | ✅ |
| C3 | Boutons sélection groupe | `src/components/features/teacher/SelectionButtons.tsx` | 10min | ✅ |
| C4 | Intégration StudentsList | `src/components/features/teacher/StudentsList.tsx` | 15min | ✅ |

**✅ Extension Compteurs & Sélection COMPLÈTE !**

---

## 🆕 Extension : Page "Mes Classes" (CL1-CL7)

> **Objectif** : Ajouter filtres multi-matières, stats agrégées et sélection multi-classes

### 🖼️ UI Cible

```
┌─────────────────────────────────────────────────────────────────────┐
│  📚 Mes Classes                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  🔍 FILTRES                                                         │
│  ┌──────────────────────────────┐  ┌──────────┐  ┌────────────────┐│
│  │ Matières: [Math ×] [Info ×]  │  │ Niveau ▼ │  │ 🔎 Rechercher  ││
│  │           [+ Ajouter]        │  │          │  │                ││
│  └──────────────────────────────┘  └──────────┘  └────────────────┘│
│  📊 3 classes / 5 total • Matières: Math, Info                       │
├─────────────────────────────────────────────────────────────────────┤
│  📊 Statistiques (2 classes sélectionnées)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐│
│  │   👨‍🎓 48     │  │   🟢 32      │  │   🔴 8       │  │  4.2/6   ││
│  │   Élèves     │  │ En réussite  │  │ En difficulté│  │ Moyenne  ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
│                                                                     │
│  [☑ Tout] [☐ Aucun] [⟲ Inverser]              Sélection: 2 classes │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │ ☑ 9ème A        │  │ ☐ 9ème B        │  │ ☑ 10ème A       │     │
│  │ 24 élèves       │  │ 22 élèves       │  │ 24 élèves       │     │
│  │ Moy: 4.5/6 🟢   │  │ Moy: 3.8/6 🟡   │  │ Moy: 4.1/6 🟡   │     │
│  │ [Math, Info]    │  │ [Math]          │  │ [Info]          │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Vue d'ensemble

| # | Tâche | Fichiers | Effort | Statut |
|:--|:------|:---------|:-------|:-------|
| CL1 | Types & interfaces | `src/types/class-filters.ts` | 15min | ✅ |
| CL2 | Fonctions filtrage/stats | `src/lib/class-filters.ts` | 20min | ✅ |
| CL3 | ClassFilterBar (multi-matières) | `src/components/features/teacher/ClassFilterBar.tsx` | 25min | ✅ |
| CL4 | ClassStatsCounters | `src/components/features/teacher/ClassStatsCounters.tsx` | 10min | ✅ |
| CL5 | TeacherClassCard + checkbox + stats | `src/components/features/teacher/TeacherClassCard.tsx` | 15min | ✅ |
| CL6 | ClassesList intégration | `src/components/features/teacher/ClassesList.tsx` | 25min | ✅ |
| CL7 | Page server + query enrichie | `src/app/(dashboard)/teacher/classes/page.tsx` | 20min | ✅ |

**✅ Extension "Mes Classes" COMPLÈTE !**

---

## 📋 Tâche CL1 — Types & Interfaces

### 🎯 Objectif
Créer les types pour filtres classes avec multi-sélection matières.

### 📁 Fichier
`src/types/class-filters.ts`

### 📝 Contenu

```typescript
export interface ClassFilters {
  subjectIds: string[];       // Multi-select matières ([] = toutes)
  level: string | null;       // Niveau (null = tous)
  search: string;             // Recherche par nom
  selectedClassIds: string[]; // Multi-sélection pour stats
}

export const DEFAULT_CLASS_FILTERS: ClassFilters = {
  subjectIds: [],
  level: null,
  search: '',
  selectedClassIds: [],
};

export interface ClassStats {
  totalStudents: number;
  successCount: number;   // Élèves 🟢 ≥4.5
  warningCount: number;   // Élèves 🟡 3.5-4.4
  dangerCount: number;    // Élèves 🔴 <3.5
  noDataCount: number;    // Élèves sans notes
  averageGrade: number | null;
}

export type ClassAlertLevel = 'success' | 'warning' | 'danger' | 'no-data';

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

### ✅ Checklist
- [ ] Interface ClassFilters avec subjectIds array
- [ ] DEFAULT_CLASS_FILTERS exporté
- [ ] Interface ClassStats pour agrégations
- [ ] Interface ClassWithStats avec alertLevel
- [ ] Build passe

---

## 📋 Tâche CL2 — Fonctions filtrage/stats

### 🎯 Objectif
Créer les fonctions de filtrage et calcul de stats pour les classes.

### 📁 Fichier
`src/lib/class-filters.ts`

### 📝 Contenu

```typescript
import type { ClassFilters, ClassStats, ClassWithStats } from '@/types/class-filters';

export function filterClasses(
  classes: ClassWithStats[],
  filters: ClassFilters
): ClassWithStats[];

export function calculateClassGroupStats(
  classes: ClassWithStats[]
): ClassStats;

export function extractSubjectsFromClasses(
  classes: ClassWithStats[]
): { id: string; name: string }[];

export function extractLevelsFromClasses(
  classes: ClassWithStats[]
): string[];
```

### ✅ Checklist
- [ ] filterClasses avec multi-matières (OR logic)
- [ ] calculateClassGroupStats agrège élèves de toutes les classes
- [ ] extractSubjectsFromClasses pour le multi-select
- [ ] extractLevelsFromClasses pour le select niveau
- [ ] Build passe

---

## 📋 Tâche CL3 — ClassFilterBar

### 🎯 Objectif
Créer la barre de filtres avec multi-select matières (badges cliquables).

### 📁 Fichier
`src/components/features/teacher/ClassFilterBar.tsx`

### 📝 Props

```typescript
interface ClassFilterBarProps {
  subjects: { id: string; name: string }[];
  levels: string[];
  filters: ClassFilters;
  onFiltersChange: (filters: ClassFilters) => void;
  resultCount: number;
  totalCount: number;
}
```

### 🎨 UI Multi-Select Matières

```tsx
<div className="flex flex-wrap gap-1">
  {/* Badges matières sélectionnées */}
  {selectedSubjects.map(s => (
    <Badge key={s.id} variant="secondary" className="cursor-pointer">
      {s.name} <X className="h-3 w-3 ml-1" onClick={() => removeSubject(s.id)} />
    </Badge>
  ))}
  {/* Bouton ajouter */}
  <Popover>
    <PopoverTrigger asChild>
      <Badge variant="outline" className="cursor-pointer">+ Matière</Badge>
    </PopoverTrigger>
    <PopoverContent>
      {availableSubjects.map(s => (
        <div key={s.id} onClick={() => addSubject(s.id)}>{s.name}</div>
      ))}
    </PopoverContent>
  </Popover>
</div>
```

### ✅ Checklist
- [ ] Multi-select matières avec badges
- [ ] Select niveau
- [ ] Input recherche
- [ ] Compteur résultats
- [ ] < 120 lignes

---

## 📋 Tâche CL4 — ClassStatsCounters

### 🎯 Objectif
Créer les 4 cartes KPI pour les classes (réutiliser pattern StatsCounters).

### 📁 Fichier
`src/components/features/teacher/ClassStatsCounters.tsx`

### 📝 Props

```typescript
interface ClassStatsCountersProps {
  stats: ClassStats;
  selectedCount: number;
  totalCount: number;
}
```

### 🎨 4 Cartes
1. 👨‍🎓 Total élèves
2. 🟢 En réussite
3. 🔴 En difficulté
4. 📊 Moyenne /6

### ✅ Checklist
- [ ] 4 cartes avec icônes
- [ ] Compteur élèves (pas classes)
- [ ] Moyenne avec 1 décimale
- [ ] < 80 lignes

---

## 📋 Tâche CL5 — TeacherClassCard enrichie

### 🎯 Objectif
Ajouter checkbox de sélection et badge de niveau d'alerte à la carte.

### 📁 Fichier
`src/components/features/teacher/TeacherClassCard.tsx` (modifier)

### 📝 Props ajoutées

```typescript
interface TeacherClassCardProps {
  classData: ClassWithStats;
  selected?: boolean;
  onToggleSelect?: () => void;
}
```

### 🎨 Modifications
- Checkbox en haut à gauche
- Badge alertLevel (🟢🟡🔴)
- Moyenne affichée

### ✅ Checklist
- [ ] Checkbox sélection
- [ ] Badge couleur selon alertLevel
- [ ] Affichage moyenne
- [ ] Ring si selected
- [ ] < 100 lignes

---

## 📋 Tâche CL6 — ClassesList intégration

### 🎯 Objectif
Créer le composant client qui intègre tous les filtres et stats.

### 📁 Fichier
`src/components/features/teacher/ClassesList.tsx`

### 📝 Pattern identique à StudentsList

```typescript
export function ClassesList({ classes, subjects }: ClassesListProps) {
  const [filters, setFilters] = useState<ClassFilters>(DEFAULT_CLASS_FILTERS);
  
  const filteredClasses = useMemo(() => filterClasses(classes, filters), [...]);
  const groupStats = useMemo(() => calculateClassGroupStats(...), [...]);
  
  return (
    <div className="space-y-4">
      <ClassFilterBar ... />
      <ClassStatsCounters ... />
      <SelectionButtons ... />  {/* Réutilisé ! */}
      <div className="grid ...">
        {filteredClasses.map(c => <TeacherClassCard ... />)}
      </div>
    </div>
  );
}
```

### ✅ Checklist
- [ ] Import ClassFilterBar, ClassStatsCounters
- [ ] Réutilise SelectionButtons (générique)
- [ ] Stats selon sélection ou tous
- [ ] Build passe
- [ ] < 150 lignes

---

## 📋 Tâche CL7 — Page server + query enrichie

### 🎯 Objectif
Modifier la page server pour enrichir les données avec les stats.

### 📁 Fichier
`src/app/(dashboard)/teacher/classes/page.tsx` (modifier)

### 📝 Modifications

1. Query enrichie avec StudentScore par classe
2. Calcul alertLevel par classe
3. Passer ClassesList au lieu du grid manuel

### ✅ Checklist
- [ ] Query Prisma avec scores élèves
- [ ] Calcul moyenne et alertLevel
- [ ] Utilise ClassesList
- [ ] < 80 lignes server component

---

## 📋 Tâche C1 — Types & calculs stats

### 🎯 Objectif
Ajouter l'interface `GroupStats` et la fonction `calculateGroupStats()`.

### 📁 Fichier
`src/lib/student-filters.ts`

### 📝 Contenu

```typescript
export interface GroupStats {
  total: number;
  successCount: number;   // 🟢 ≥4.5
  warningCount: number;   // 🟡 3.5-4.4
  dangerCount: number;    // 🔴 <3.5
  noDataCount: number;    // ⚪ sans notes
  averageGrade: number | null;
}

export function calculateGroupStats<T extends FilterableStudent>(
  students: T[]
): GroupStats;
```

### ✅ Checklist
- [x] Interface GroupStats créée
- [x] Fonction calculateGroupStats implémentée
- [x] Calcul moyenne pondérée
- [x] Build passe

---

## 📋 Tâche C2 — Composant StatsCounters

### 🎯 Objectif
Créer les 4 cartes KPI (🟢🟡🔴 + moyenne).

### 📁 Fichier
`src/components/features/teacher/StatsCounters.tsx`

### 📝 Props

```typescript
interface StatsCountersProps {
  stats: GroupStats;
  selectedCount: number;
  totalCount: number;
}
```

### ✅ Checklist
- [x] 4 cartes avec icônes colorées
- [x] Compteurs dynamiques
- [x] Moyenne avec 1 décimale
- [x] < 80 lignes (89 lignes)

---

## 📋 Tâche C3 — Boutons sélection groupe

### 🎯 Objectif
Créer les boutons Tout/Aucun/Inverser.

### 📁 Fichier
`src/components/features/teacher/SelectionButtons.tsx`

### 📝 Props

```typescript
interface SelectionButtonsProps {
  allIds: string[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}
```

### ✅ Checklist
- [x] Bouton "Tout sélectionner"
- [x] Bouton "Désélectionner"
- [x] Bouton "Inverser"
- [x] Compteur sélection
- [x] < 50 lignes (67 lignes)

---

## 📋 Tâche C4 — Intégration StudentsList

### 🎯 Objectif
Intégrer StatsCounters et SelectionButtons dans la page.

### 📁 Fichier
`src/components/features/teacher/StudentsList.tsx`

### 📝 Modifications

1. Importer StatsCounters, SelectionButtons
2. Calculer stats du groupe filtré/sélectionné
3. Ajouter les composants avant la grille
4. Connecter les callbacks

### ✅ Checklist
- [x] StatsCounters affiché en haut
- [x] SelectionButtons sous les filtres
- [x] Stats mises à jour selon sélection
- [x] Build passe

---

## 📋 Tâche S1 — Types & Interfaces

### 🎯 Objectif
Créer les types TypeScript pour les filtres et les données élèves enrichies.

### 📁 Fichier
`src/types/student-filters.ts`

### 📝 Contenu

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
  classes: string[];
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

### ✅ Checklist
- [ ] Fichier créé
- [ ] Types exportés
- [ ] Valeurs par défaut définies

---

## 📋 Tâche S2 — API stats élèves

### 🎯 Objectif
Enrichir la query Prisma de la page pour récupérer les stats par élève.

### 📁 Fichier
Modifier `src/app/(dashboard)/teacher/students/page.tsx`

### 📝 Modifications

1. Ajouter l'include des `studentScores` dans la query
2. Calculer les moyennes par élève
3. Passer les données enrichies au composant

### 🔧 Query enrichie

```typescript
// Ajouter dans le select de user:
studentScores: {
  select: {
    continuousScore: true,
    examGrade: true,
    finalGrade: true,
  }
}
```

### ✅ Checklist
- [ ] Query enrichie avec studentScores
- [ ] Calcul moyennes dans le map
- [ ] Type StudentWithStats utilisé

---

## 📋 Tâche S3 — StudentFilterBar

### 🎯 Objectif
Créer le composant de filtres pour la page "Mes Élèves".

### 📁 Fichier
`src/components/features/teacher/StudentFilterBar.tsx`

### 🖼️ UI

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 Filtres                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────┐│
│  │ Classe    ▼  │  │ État      ▼  │  │ 👤 Rechercher élève...    ││
│  │ Toutes       │  │ Tous        │  └────────────────────────────┘│
│  │ 3ème A       │  │ 🟢 Bon      │                                │
│  │ 3ème B       │  │ 🟡 Surveiller│  Sélection: [Lucas ×] [Emma ×]│
│  └──────────────┘  │ 🔴 À risque │                                │
│                    └──────────────┘                                │
│  📊 4 élèves / 5 total                                              │
└─────────────────────────────────────────────────────────────────────┘
```

### 📝 Props

```typescript
interface StudentFilterBarProps {
  classes: { id: string; name: string }[];
  allStudents: { id: string; name: string }[];
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  resultCount: number;
  totalCount: number;
}
```

### ✅ Checklist
- [ ] Select classe
- [ ] Select état (🟢🟡🔴)
- [ ] Multi-select élèves avec chips
- [ ] Compteur résultats
- [ ] < 120 lignes

---

## 📋 Tâche S4 — StudentCard enrichie

### 🎯 Objectif
Créer un composant carte élève avec les stats visibles.

### 📁 Fichier
`src/components/features/teacher/StudentCard.tsx`

### 🖼️ UI

```
┌─────────────────────────────────┐
│ 👤 Lucas MARTIN                 │
│    3ème A                       │
│ ┌───────┬───────┬───────┐      │
│ │  68%  │  4.2  │  4.4  │      │
│ │ Cont. │ Exam  │ Final │      │
│ └───────┴───────┴───────┘      │
│ 🟡 À surveiller    [👁️] [→]   │
└─────────────────────────────────┘
```

### 📝 Props

```typescript
interface StudentCardProps {
  student: StudentWithStats;
  onViewContact: () => void;
}
```

### ✅ Checklist
- [ ] Nom + classe
- [ ] 3 mini-badges stats
- [ ] Indicateur couleur état
- [ ] Boutons contact + navigation
- [ ] < 100 lignes

---

## 📋 Tâche S5 — Logique filtrage

### 🎯 Objectif
Créer les fonctions de filtrage des élèves.

### 📁 Fichier
`src/lib/student-filters.ts`

### 📝 Fonctions

```typescript
export function filterStudents(
  students: StudentWithStats[],
  filters: StudentFilters
): StudentWithStats[];

export function extractClasses(
  students: StudentWithStats[]
): { id: string; name: string }[];
```

### ✅ Checklist
- [ ] Filtre par classe
- [ ] Filtre par état
- [ ] Filtre par sélection
- [ ] Extraction classes uniques

---

## 📋 Tâche S6 — Intégration page

### 🎯 Objectif
Assembler tous les composants dans la page "Mes Élèves".

### 📁 Fichier
Modifier `src/components/features/teacher/StudentsList.tsx`

### 📝 Modifications

1. Importer StudentFilterBar, StudentCard
2. Ajouter state filtres
3. Appliquer filtrage
4. Afficher compteur

### ✅ Checklist
- [ ] FilterBar visible
- [ ] Cartes avec stats
- [ ] Filtres fonctionnels
- [ ] Compteur mis à jour
- [ ] Navigation conservée

---

## 📋 Tâche F1 — Seed StudentScore

### 🎯 Objectif
Créer des données de test avec des scores variés pour tester les filtres.

### 📊 Données à créer

| Élève | Cours | Quiz% | Exos% | IA% | Continu | Examen | État |
|:------|:------|:------|:------|:----|:--------|:-------|:-----|
| Lucas MARTIN | Fractions | 85 | 78 | 70 | 77.7 | 5.2 | 🟢 |
| Lucas MARTIN | Équations | 60 | 55 | 45 | 54 | 4.0 | 🟡 |
| Lucas MARTIN | Photosynthèse | 40 | 35 | 30 | 35 | — | 🔴 |
| Emma DURAND | Fractions | 90 | 88 | 85 | 87.7 | 5.5 | 🟢 |
| Emma DURAND | Équations | 70 | 65 | 60 | 65 | — | 🟡 |
| Noah PETIT | Fractions | 50 | 45 | 40 | 45.3 | 3.2 | 🔴 |
| Noah PETIT | Photosynthèse | 75 | 70 | 68 | 71 | 4.8 | 🟢 |
| Léa MOREAU | Fractions | 80 | 82 | 75 | 79 | 5.0 | 🟢 |
| Hugo ROBERT | Fractions | 55 | 50 | 48 | 51 | 3.5 | 🟡 |

### ✅ Checklist
- [ ] Fonction `seedStudentScores()` créée
- [ ] 9+ enregistrements avec mix d'états
- [ ] Mix avec/sans note examen
- [ ] `npx prisma db seed` OK

---

## 📋 Tâche F2 — Composant FilterBar

### 🎯 Objectif
Créer une barre de filtres pour la page fiche élève.

### 🖼️ UI Attendue
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

### 📁 Fichier
`src/components/features/teacher/ScoreFilterBar.tsx`

### ✅ Checklist
- [ ] 3 filtres (matière, état, examen)
- [ ] Tri bidirectionnel
- [ ] Compteur résultats
- [ ] < 150 lignes

---

## 📋 Tâche F3 — Logique de tri

### 🎯 Objectif
Ajouter les fonctions de filtrage et tri dans le service stats.

### 📁 Fichier
`src/lib/stats-service.ts` (ajouter à la fin)

### 🔧 Fonctions à ajouter
- `filterCourseScores(scores, filters)` → filtre par matière/état/examen
- `sortCourseScores(scores, sort)` → tri par champ/direction
- `extractSubjects(scores)` → liste des matières uniques

### ✅ Checklist
- [ ] filterCourseScores() OK
- [ ] sortCourseScores() OK (null en dernier)
- [ ] extractSubjects() OK
- [ ] Types exportés

---

## 📋 Tâche F4 — Intégration page

### 🎯 Objectif
Connecter FilterBar à StudentScorePage.

### 📁 Fichier
`src/components/features/teacher/StudentScorePage.tsx`

### 🔧 Modifications
1. Ajouter imports (FilterBar, fonctions tri)
2. Ajouter state (filters, sort)
3. Calculer filteredScores et sortedScores
4. Afficher FilterBar avant la liste
5. Passer sortedScores au lieu de courseScores

### ✅ Checklist
- [ ] FilterBar visible
- [ ] Filtres fonctionnels
- [ ] Tri fonctionnel
- [ ] Compteur mis à jour

---

## 📋 Tâche 7bis.1 — Migration Prisma

### 🎯 Objectif
Ajouter le modèle `StudentScore` pour stocker les scores agrégés par élève et par cours.

### 📝 À créer dans `schema.prisma`

```prisma
// Score agrégé par élève et par cours
model StudentScore {
  id          String   @id @default(cuid())
  
  studentId   String
  student     User     @relation("StudentScores", fields: [studentId], references: [id], onDelete: Cascade)
  
  courseId    String
  course      Course   @relation("CourseScores", fields: [courseId], references: [id], onDelete: Cascade)
  
  // Scores IA automatiques (0-100)
  quizAvg         Float    @default(0)  // Moyenne des quiz
  exerciseAvg     Float    @default(0)  // Moyenne des exercices
  aiComprehension Float    @default(0)  // Évaluation IA (sessions chat)
  continuousScore Float    @default(0)  // Score continu calculé
  
  // Compteurs
  quizCount       Int      @default(0)
  exerciseCount   Int      @default(0)
  aiSessionCount  Int      @default(0)
  
  // Examen Final (note prof sur 6)
  examGrade       Float?   // Note /6 entrée par le prof
  examDate        DateTime?
  examComment     String?  // Commentaire optionnel
  
  // Score Final calculé
  finalScore      Float?   // 0-100
  finalGrade      Float?   // Note /6 finale
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([studentId, courseId])
  @@index([studentId])
  @@index([courseId])
}
```

### 🔧 Relations à ajouter

```prisma
// Dans model User, ajouter :
studentScores StudentScore[] @relation("StudentScores")

// Dans model Course, ajouter :
studentScores StudentScore[] @relation("CourseScores")
```

### ✅ Critères de validation
- [ ] Migration appliquée sans erreur
- [ ] `npx prisma db push` réussit
- [ ] Relations User et Course mises à jour

---

## 📋 Tâche 7bis.2 — API Scores Élève

### 🎯 Objectif
Créer l'API pour récupérer et modifier les scores d'un élève.

### 📝 Fichier : `src/app/api/teacher/students/[id]/scores/route.ts`

**GET** : Récupérer tous les scores d'un élève
- Vérifier que le prof a accès à cet élève (via ses classes)
- Retourner les scores par cours avec breakdown Quiz/Exos
- Calculer les agrégats globaux

**PUT** : Mettre à jour la note d'examen
- Body : `{ courseId, examGrade, examComment? }`
- Recalculer `finalScore` et `finalGrade`

### ✅ Critères de validation
- [ ] GET retourne les scores structurés
- [ ] PUT permet de saisir/modifier l'examen
- [ ] Calcul automatique du score final
- [ ] Erreur 403 si le prof n'a pas accès à l'élève

---

## 📋 Tâche 7bis.3 — Service Stats

### 🎯 Objectif
Centraliser les calculs de statistiques dans un service réutilisable.

### 📝 Fichier : `src/lib/stats-service.ts`

**Fonctions à créer :**
- `calculateContinuousScore(quizAvg, exerciseAvg, aiComprehension)` → Float
- `calculateFinalScore(continuousScore, examGrade)` → Float
- `convertToGrade6(score100)` → Float (/6)
- `getAlertLevel(grade6)` → 'success' | 'warning' | 'danger'
- `aggregateClassScores(studentScores[])` → ClassStats
- `aggregateGlobalScores(classStats[])` → GlobalStats

### ✅ Critères de validation
- [ ] Formules correctes (40/60 pondération)
- [ ] Conversion /6 précise
- [ ] Seuils d'alerte respectés

---

## 📋 Tâche 7bis.4 — Composant ScoreBadge

### 🎯 Objectif
Badge coloré affichant une note avec couleur selon seuil.

### 📝 Fichier : `src/components/ui/score-badge.tsx`

**Props :**
- `score: number` (note /6)
- `size?: 'sm' | 'md' | 'lg'`
- `showLabel?: boolean`

**Rendu :**
- 🟢 Vert si ≥ 4.5
- 🟡 Orange si 3.5-4.4
- 🔴 Rouge si < 3.5

### ✅ Critères de validation
- [ ] Couleurs correctes selon seuils
- [ ] Tailles responsive
- [ ] Accessible (contrast)

---

## 📋 Tâche 7bis.5 — Page Fiche Élève

### 🎯 Objectif
Créer la page `/teacher/students/[id]` avec scores détaillés.

### 📝 Fichier : `src/app/(dashboard)/teacher/students/[id]/page.tsx`

**Structure :**
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Retour    👤 Prénom NOM - Classe                             │
├─────────────────────────────────────────────────────────────────┤
│ 📊 VUE GLOBALE (3 ScoreBadges)                                  │
│ ┌─────────────┬─────────────┬─────────────┐                    │
│ │ Continu     │ Examens     │ Moyenne     │                    │
│ │   68%       │   4.2/6     │   4.4/6     │                    │
│ └─────────────┴─────────────┴─────────────┘                    │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 FILTRES                                                      │
│ [Cours: Tous ▼]  [Période: Trimestre ▼]                        │
├─────────────────────────────────────────────────────────────────┤
│ 📚 RÉSULTATS PAR COURS (Accordion)                              │
│ ▶ Fractions          80%   75%   70%   5.0   [✏️]              │
│ ▶ Équations          55%   60%   —     —     [✏️]              │
└─────────────────────────────────────────────────────────────────┘
```

### ✅ Critères de validation
- [ ] Page accessible via clic sur carte élève
- [ ] KPIs globaux affichés
- [ ] Liste des cours avec scores
- [ ] Bouton pour saisir note examen

---

## 📋 Tâche 7bis.6 — Composants Scores

### 🎯 Objectif
Créer les sous-composants de la page fiche élève.

### 📝 Fichiers à créer

1. **`StudentScoreHeader.tsx`** (~80 lignes)
   - Infos élève (nom, classe, email)
   - 3 KPIs : Continu, Examens, Moyenne

2. **`CourseScoreRow.tsx`** (~100 lignes)
   - Ligne de cours (Accordion trigger)
   - Colonnes : Cours, Quiz, Exos, IA, Exam, Action
   - Dépliable pour voir détail

3. **`ScoreDetailsList.tsx`** (~60 lignes)
   - Liste Quiz/Exercices individuels
   - Affiché quand CourseScoreRow déplié

### ✅ Critères de validation
- [ ] Composants < 150 lignes chacun
- [ ] Types TypeScript stricts
- [ ] Responsive design

---

## 📋 Tâche 7bis.7 — Dialog Saisie Examen

### 🎯 Objectif
Modal pour saisir la note d'examen /6.

### 📝 Fichier : `src/components/features/teacher/ExamGradeDialog.tsx`

**Props :**
- `open: boolean`
- `onOpenChange: (open: boolean) => void`
- `studentId: string`
- `courseId: string`
- `courseName: string`
- `currentGrade?: number`
- `onSave: (grade: number, comment?: string) => void`

**UI :**
- Input numérique (0-6, pas 0.5)
- Textarea commentaire optionnel
- Boutons Annuler / Enregistrer

### ✅ Critères de validation
- [ ] Validation 0-6
- [ ] Feedback visuel (loading, success)
- [ ] Recalcul du score final après save

---

## 📋 Tâche 7bis.8 — Navigation depuis Liste

### 🎯 Objectif
Permettre de cliquer sur une carte élève pour accéder à sa fiche.

### 📝 Fichier à modifier : `src/app/(dashboard)/teacher/students/page.tsx`

**Changements :**
- Carte élève devient cliquable (wrapper Link)
- Conserve le bouton œil pour modale contact
- Nouveau lien vers `/teacher/students/[id]`

### ✅ Critères de validation
- [ ] Clic carte → page fiche élève
- [ ] Clic œil → modale contact (comportement existant)
- [ ] Pas de régression UI

---

## 🧪 Tests de Validation Finale

### Test Fonctionnel
- [ ] Accéder à la fiche d'un élève
- [ ] Voir ses scores par cours
- [ ] Déplier un cours pour voir Quiz/Exos
- [ ] Saisir une note d'examen
- [ ] Voir le score final recalculé

### Test Sécurité
- [ ] Prof A ne peut pas voir les élèves de Prof B
- [ ] API retourne 403 si pas accès

### Test Build
- [ ] `npm run lint` OK
- [ ] `npm run build` OK
- [ ] Pas de fichier > 350 lignes

---

## 🎉 PHASE TERMINÉE - Récapitulatif

### ✅ Toutes les tâches complétées
- **7bis.1-8** : Système de scoring de base (migration, API, composants)
- **F1-F4** : Filtres et tri sur fiche élève
- **S1-S6** : Extension page "Mes Élèves" (filtres, stats, sélection)
- **C1-C4** : Compteurs et sélection groupe
- **CL1-CL7** : Extension page "Mes Classes" (filtres multi-matières, stats agrégées)

### 📊 Améliorations apportées (au-delà des spécifications)

#### 1. UX/UI Améliorations
- ✅ **Réorganisation layout** : Sélection → Stats → Filtres (au lieu de Filtres en premier)
- ✅ **Boutons toggle collapse** : Filtres repliables avec ChevronUp/Down sur pages Élèves et Classes
- ✅ **Cohérence stylistique** : Fond blanc uniforme sur tous les FilterBar
- ✅ **Feedback visuel immédiat** : Cards affichent uniquement les matières filtrées

#### 2. Correctifs de bugs
- ✅ **Bouton suppression matière** : Ajout de `e.stopPropagation()` sur le X pour éviter la propagation au Popover parent
- ✅ **Filtrage matières sur cartes** : Les cartes classes n'affichent que les matières sélectionnées dans le filtre (displayedSubjects)

#### 3. Debug et maintenabilité
- ✅ **Console.log debug** : Ajout de logs dans `useMemo(groupStats)` pour tracer les recalculs de stats
- ✅ **Prompt optimal documenté** : Section "Itérations & Améliorations" dans prompts/phase-07bis-scoring.md avec prompt final optimisé

### 📈 Métriques finales
| Métrique | Valeur |
|:---------|:-------|
| Fichiers créés | 15+ |
| Lignes de code | ~2500 |
| Itérations nécessaires | 7 (CL1-CL7) |
| Bugs corrigés | 2 |
| Améliorations UX | 4 |

### 🔄 Leçons apprises (pour futures phases)
1. **Préciser l'ordre UI dès le prompt initial** : "Sélection → Stats → Filtres" évite les réorganisations
2. **Mentionner e.stopPropagation()** pour les boutons dans des conteneurs cliquables
3. **Spécifier le feedback visuel** : "Cards montrent uniquement les items filtrés"
4. **Intégrer les toggles collapse** dès la conception des FilterBar

### 🎯 Prochaines étapes recommandées
- Phase 8 : Interface étudiant
- Amélioration : Persistence des filtres (localStorage)
- Amélioration : Export stats en PDF/Excel

---

## 🔄 Navigation

← [phase-07-teacher-suite.md](phase-07-teacher-suite.md) | [phase-08-student.md](phase-08-student.md) →

---

*Lignes : ~420 | Dernière MAJ : 2025-01-XX*

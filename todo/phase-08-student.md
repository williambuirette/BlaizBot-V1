# 🎓 Phase 8 — Interface Élève

> **Objectif** : L'Élève consomme le contenu pédagogique  
> **Statut** : 🔴 EN COURS  
> **Durée estimée** : 6-8h  
> **Prérequis** : Phase 7 terminée (Prof fonctionnel)

---

## 📊 Récapitulatif

| Étape | Description | Statut |
|:------|:------------|:-------|
| 8.1-8.3 | Dashboard, Sidebar, API, Cours | ✅ |
| 8.R | Refactoring fichiers > 350 lignes | ✅ |
| **8.4** | **Révisions Élève (Suppléments & Cours perso)** | ⬜ À FAIRE |
| 8.5 | Quiz avec scoring | ⬜ |

---

## ✅ Tâches Terminées (Phase 8)

| Tâche | Description | Statut |
|:------|:------------|:-------|
| 8.1 | Dashboard Élève (KPIs, widgets) | ✅ |
| 8.2 | Sidebar navigation élève | ✅ |
| 8.3.1 | API GET /api/student/courses | ✅ |
| 8.3.2 | API GET /api/student/courses/[id] | ✅ |
| 8.3.3 | API POST /api/student/courses/[id]/progress | ✅ |
| 8.3.4 | Page Mes Cours avec filtres | ✅ |
| 8.3.5 | Filtres multi-select dynamiques (cascade) | ✅ |
| 8.3.6 | Page détail cours avec chapitres | ✅ |
| 8.3.7 | Affichage ressources globales du cours | ✅ 02/01 |

---

## 🚨 Phase 8.R — Refactoring Fichiers > 350 lignes (PRIORITAIRE)

> **Date** : 02/01/2026
> **Objectif** : Ramener tous les fichiers .tsx sous 350 lignes
> **Statut** : 🔴 À FAIRE (BLOQUANT)

### Fichiers à refactorer (par priorité)

| Priorité | Fichier | Lignes | Dépassement | Action |
|:---------|:--------|:-------|:------------|:-------|
| 🔴 P1 | `SectionViewerModal.tsx` | 960 | +610 | Extraire 4 viewers |
| 🟠 P2 | `VideoEditorInline.tsx` | 520 | +170 | Extraire composants |
| 🟠 P2 | `NewConversationDialog.tsx` | 517 | +167 | Extraire steps |
| 🟠 P2 | `AssignmentFiltersBar.tsx` | 500 | +150 | Extraire filtres |
| 🟡 P3 | `ResourcesManager.tsx` | 462 | +112 | Extraire modales |
| 🟡 P3 | `AssignmentCard.tsx` | 460 | +110 | Extraire sections |
| 🟡 P3 | `ChaptersManager.tsx` | 444 | +94 | Extraire items |
| 🟡 P3 | `MessageThread.tsx` | 411 | +61 | Extraire bubbles |
| 🟡 P3 | `NewAssignmentModal.tsx` | 407 | +57 | Extraire steps |
| 🟡 P3 | `ResourceFormDialog.tsx` | 403 | +53 | Extraire form |
| ⚪ P4 | `StudentCoursesFiltersMulti.tsx` | 387 | +37 | Optimiser |
| ⚪ P4 | `AssignmentsManager.tsx` | 376 | +26 | Optimiser |
| ⚪ P4 | `ExerciseEditorInline.tsx` | 370 | +20 | Optimiser |
| ⚪ P4 | `ExercisesManager.tsx` | 362 | +12 | Optimiser |
| ⚪ P4 | `ExerciseEditor.tsx` | 362 | +12 | Optimiser |

### Tâche 8.R.1 — Refactoring SectionViewerModal (CRITIQUE) ⬜

| Critère | Attendu |
|:--------|:--------|
| Fichier actuel | `src/components/features/student/SectionViewerModal.tsx` (960 lignes) |
| Objectif | < 200 lignes (modal orchestrateur) |
| Extraction | 4 viewers séparés dans `viewers/` |

**Fichiers à créer :**
```
src/components/features/student/viewers/
├── LessonViewer.tsx    (~150 lignes)
├── VideoViewer.tsx     (~120 lignes)
├── QuizViewer.tsx      (~200 lignes)
├── ExerciseViewer.tsx  (~250 lignes)
└── index.ts            (re-exports)
```

**Structure SectionViewerModal après refactoring :**
```tsx
// SectionViewerModal.tsx (~180 lignes)
import { LessonViewer, VideoViewer, QuizViewer, ExerciseViewer } from './viewers';

export function SectionViewerModal({ section, ... }) {
  switch (section.type) {
    case 'LESSON': return <LessonViewer content={section.content} />;
    case 'VIDEO': return <VideoViewer content={section.content} />;
    case 'QUIZ': return <QuizViewer content={section.content} onSubmit={...} />;
    case 'EXERCISE': return <ExerciseViewer content={section.content} onSubmit={...} />;
  }
}
```

### Tâche 8.R.2 — Refactoring VideoEditorInline ⬜

| Critère | Attendu |
|:--------|:--------|
| Fichier actuel | 520 lignes |
| Objectif | < 300 lignes |
| Extraction | `VideoUploader.tsx`, `VideoPreview.tsx` |

### Tâche 8.R.3 — Refactoring NewConversationDialog ⬜

| Critère | Attendu |
|:--------|:--------|
| Fichier actuel | 517 lignes |
| Objectif | < 250 lignes |
| Extraction | `ConversationSteps.tsx`, `RecipientSelector.tsx` |

### Tâche 8.R.4 — Refactoring AssignmentFiltersBar ⬜

| Critère | Attendu |
|:--------|:--------|
| Fichier actuel | 500 lignes |
| Objectif | < 250 lignes |
| Extraction | Composants de filtres individuels |

### Validation finale

| Critère | Commande |
|:--------|:---------|
| Aucun fichier > 350 lignes | Script PowerShell de vérification |
| Lint OK | `npm run lint` |
| Build OK | `npm run build` |
| Tests manuels | Navigation élève/prof fonctionne |

---

## ⚠️ Instructions IA

```
RÈGLE 350 LIGNES (rappel) :
- Chaque composant feature dans src/components/features/student/
- Page orchestrateur < 100 lignes
- Composants individuels < 250 lignes

IMPORTANT :
- L'élève ne voit QUE les cours de SA classe
- L'élève peut CONSULTER mais pas CRÉER de contenu (sauf messages)
- Focus sur l'UX de consommation (lecture, progression)
- Réutiliser les composants Phase 7 (MessageThread, AgendaCalendar)
```

---

## 📚 Sources de vérité

| Source | Usage |
|--------|-------|
| `blaizbot-wireframe/student.html` | Sections, layout, comportements |
| `docs/03-CARTOGRAPHIE_UI.md` | Specs détaillées interface élève |
| `docs/04-MODELE_DONNEES.md` | Schéma Enrollment, Progress |
| `docs/05-API_ENDPOINTS.md` | Routes `/api/student/*` |

---

## 📋 Étape 8.1 — Dashboard Élève

### 🎯 Objectif
Tableau de bord affichant les KPIs de l'élève et ses prochains cours/devoirs.

### 📝 Comment
Créer une page serveur qui récupère les stats via Prisma et affiche les widgets.

### 🔧 Par quel moyen
- RSC (React Server Components) pour les données
- Composant `StatsCard` réutilisé de la Phase 6
- Widgets "Prochains cours" et "Cours récents"

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.1.1 | API Stats | `GET /api/student/stats` | Retourne 3 KPIs |
| 8.1.2 | Page Dashboard | `student/page.tsx` | < 100 lignes |
| 8.1.3 | Widget Prochains | `UpcomingLessons.tsx` | Liste 3 items |
| 8.1.4 | Widget Récents | `RecentCourses.tsx` | Liste 3 items |
| 8.1.5 | Assembler | Intégrer tous les widgets | Dashboard complet |

### 💡 INSTRUCTION 8.1 (Dashboard Élève)

```markdown
## Contexte
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript, Prisma, shadcn/ui).
L'élève est connecté, son ID est dans `session.user.id`.
L'élève a une `Enrollment` vers une `Class`.

## Ta mission
Créer le dashboard élève avec :
1. KPI "Mes Cours" : nombre de cours accessibles via sa classe
2. KPI "Progression" : pourcentage moyen de completion
3. KPI "Quiz faits" : nombre de quiz complétés
4. Widget "Prochains cours" (3 prochains événements)
5. Widget "Cours récents" (3 derniers cours consultés)

## Fichiers à créer/modifier
1. `src/app/api/student/stats/route.ts` — API stats
2. `src/components/features/student/UpcomingLessons.tsx`
3. `src/components/features/student/RecentCourses.tsx`
4. `src/app/(dashboard)/student/page.tsx` — Orchestrateur

## Contraintes
- L'élève ne voit que les cours de SA classe (via Enrollment)
- Requête Prisma via `enrollment.classId`
- Progression calculée depuis la table `Progress`
- Réutiliser `StatsCard` de Phase 6

## Code de référence
Voir [phase-08-code.md](phase-08-code.md) section 1
```

**Layout Dashboard** :
```
┌─────────────┬─────────────┬─────────────┐
│ Mes Cours   │ Progression │ Quiz faits  │
│     6       │    72%      │     4       │
└─────────────┴─────────────┴─────────────┘
┌───────────────────┬───────────────────────┐
│ 📅 Prochains      │ 📚 Cours récents      │
│ • Maths - Lundi   │ • Théorème Pythagore  │
│ • SVT - Mardi     │ • La Révolution       │
└───────────────────┴───────────────────────┘
```

---

## 📋 Étape 8.2 — Mes Cours

### 🎯 Objectif
Lister tous les cours accessibles à l'élève avec leur progression.

### 📝 Comment
Page avec grille de cards, chaque card montre le cours, la matière, le prof et la progression.

### 🔧 Par quel moyen
- API filtrée par `enrollment.classId`
- Card avec barre de progression
- Filtres par matière et état (en cours, terminé)

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.2.1 | API Cours | `GET /api/student/courses` | Cours de l'élève |
| 8.2.2 | Page Liste | `student/courses/page.tsx` | < 80 lignes |
| 8.2.3 | CourseCard | `StudentCourseCard.tsx` | < 100 lignes |
| 8.2.4 | Progress Bar | Afficher progression | Barre visible |
| 8.2.5 | Filtres | Par matière, par état | 2 filtres |

### 💡 INSTRUCTION 8.2 (Liste Mes Cours)

```markdown
## Contexte
L'élève veut voir tous les cours auxquels il a accès via sa classe.

## Ta mission
1. API `GET /api/student/courses` :
   - Récupérer l'enrollment de l'élève
   - Lister les cours via `TeacherAssignment` de sa classe
   - Inclure la progression de l'élève (table Progress)

2. Composant `StudentCourseCard` :
   - Titre du cours
   - Badge matière (couleur)
   - Nom du professeur
   - Barre de progression (%)
   - Bouton "Voir le cours"

3. Page avec filtres :
   - Filtre par matière (Select)
   - Filtre par état (Tous / En cours / Terminés)

## Code de référence
Voir [phase-08-code.md](phase-08-code.md) section 2
```

---

## 📋 Étape 8.3 — Vue Cours Détail

### 🎯 Objectif
Page où l'élève consulte le contenu d'un cours et peut le marquer comme terminé.

### 📝 Comment
Route dynamique `[id]` avec contenu markdown, documents téléchargeables, bouton progression.

### 🔧 Par quel moyen
- Markdown renderer (react-markdown ou similar)
- Liste de documents avec téléchargement
- API POST pour sauver la progression

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.3.1 | Route | `student/courses/[id]/page.tsx` | Route dynamique |
| 8.3.2 | API GET | `GET /api/student/courses/[id]` | Détails cours |
| 8.3.3 | Viewer | `CourseContentViewer.tsx` | < 150 lignes |
| 8.3.4 | Documents | `CourseDocuments.tsx` | < 80 lignes |
| 8.3.5 | API Progress | `POST /api/student/progress` | Sauver progression |
| 8.3.6 | Bouton | "Marquer comme terminé" | Toast + MAJ |

### 💡 INSTRUCTION 8.3 (Détail Cours)

```markdown
## Contexte
L'élève clique sur un cours et veut le lire, télécharger les docs, marquer sa progression.

## Ta mission
1. API `GET /api/student/courses/[id]` :
   - Vérifier que l'élève a accès (via enrollment)
   - Retourner : titre, contenu, documents, progression actuelle

2. `CourseContentViewer` :
   - Header : titre, prof, matière
   - Contenu markdown rendu
   - react-markdown avec syntax highlighting si code

3. `CourseDocuments` :
   - Liste des fichiers attachés
   - Bouton télécharger pour chaque
   - Icône selon type (PDF, Word, etc.)

4. API `POST /api/student/progress` :
   - Body : { courseId, completed: true }
   - Upsert dans table Progress

## Layout
┌─────────────────────────────────────────┐
│ ← Retour aux cours                      │
│ # Le Théorème de Pythagore              │
│ Prof : M. Dupont | Maths                │
├─────────────────────────────────────────┤
│ [Contenu markdown rendu]                │
├─────────────────────────────────────────┤
│ 📎 Documents (2)                        │
│ • exercices.pdf       [Télécharger]     │
│ • correction.pdf      [Télécharger]     │
├─────────────────────────────────────────┤
│ [✓ Marquer comme terminé]               │
└─────────────────────────────────────────┘

## Code de référence
Voir [phase-08-code.md](phase-08-code.md) section 3
```

---

## 🔄 Navigation

← [phase-07-teacher.md](phase-07-teacher.md) | [phase-08-student-suite.md](phase-08-student-suite.md) →

---

## 📋 Étape 8.3.7 — Affichage Ressources Globales du Cours

### 🎯 Objectif
Afficher les fichiers globaux du cours (uploadés par le prof via 7.11) dans l'onglet "Informations" de l'élève.

### 📝 Contexte
- Dépend de **7.11** (côté prof) pour que les fichiers existent
- La section "Ressources du cours" existe déjà côté élève
- Il faut s'assurer que l'API retourne bien les `CourseFile`

### 🔧 À vérifier/modifier

| Composant | Fichier | Action |
|:----------|:--------|:-------|
| API Student | `api/student/courses/[id]/route.ts` | Vérifier include CourseFile |
| Page Élève | `student/courses/[id]/page.tsx` | Déjà en place (affiche si files existe) |

---

### Tâche 8.3.7.1 — Vérifier API retourne CourseFile

| Critère | Attendu |
|:--------|:--------|
| Route | `GET /api/student/courses/[id]` |
| Include | `files: true` dans la query Prisma |
| Réponse | `course.files` = tableau de CourseFile |

💡 **INSTRUCTION pour l'IA** :
```
1. VÉRIFIER: src/app/api/student/courses/[id]/route.ts
2. S'ASSURER que la query inclut:
   files: {
     select: {
       id: true,
       filename: true,
       fileType: true,
       url: true,
     }
   }
3. SI manquant, AJOUTER l'include
```

---

### Tâche 8.3.7.2 — Vérifier affichage côté élève

| Critère | Attendu |
|:--------|:--------|
| Fichier | `src/app/(dashboard)/student/courses/[id]/page.tsx` |
| Section | "Ressources du cours" dans onglet Informations |
| Comportement | Affiche les fichiers OU message "Aucune ressource" |

💡 **INSTRUCTION pour l'IA** :
```
1. VÉRIFIER que la section "Ressources du cours" :
   - S'affiche même si vide (avec message explicatif)
   - Affiche les fichiers avec boutons Ouvrir/Télécharger
   - Correspond au design de l'interface prof
2. CODE déjà en place - juste s'assurer que ça fonctionne
```

---

## 📋 Étape 8.4 — Révisions Élève (Suppléments & Cours Personnels)

> **Date** : 02/01/2026
> **Objectif** : L'élève peut créer ses propres notes, cours et quiz privés
> **Confidentialité** : 100% privé — Le professeur ne voit JAMAIS ces contenus

### 🎯 Concept

| Type | Description | Lié à un cours prof ? |
|------|-------------|----------------------|
| **Supplément** | Notes/fichiers ajoutés à un cours existant | ✅ Optionnel |
| **Cours personnel** | Cours créé de toute pièce par l'élève | ❌ Indépendant |

### 📐 Modèle de données

```prisma
model StudentSupplement {
  id          String   @id
  studentId   String   // → StudentProfile
  courseId    String?  // → Course (optionnel)
  title       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  student     StudentProfile @relation(...)
  course      Course?        @relation(...)
  chapters    StudentChapter[]
}

model StudentChapter {
  id              String   @id
  supplementId    String
  title           String
  description     String?
  orderIndex      Int
  createdAt       DateTime @default(now())

  supplement      StudentSupplement @relation(...)
  cards           StudentCard[]
}

model StudentCard {
  id          String   @id
  chapterId   String
  title       String
  content     String   @db.Text
  cardType    StudentCardType @default(NOTE)
  orderIndex  Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  chapter     StudentChapter @relation(...)
  files       StudentFile[]
  quiz        StudentQuiz?
}

enum StudentCardType {
  NOTE        // Texte libre
  SUMMARY     // Résumé
  QUIZ        // Auto-évaluation
  EXERCISE    // Exercice perso
  FLASHCARD   // Carte mémoire
}

model StudentFile {
  id        String   @id
  cardId    String
  filename  String
  fileType  String
  url       String
  createdAt DateTime @default(now())

  card      StudentCard @relation(...)
}

model StudentQuiz {
  id          String   @id
  cardId      String   @unique
  questions   Json
  aiGenerated Boolean  @default(false)
  createdAt   DateTime @default(now())

  card        StudentCard @relation(...)
  attempts    StudentQuizAttempt[]
}

model StudentQuizAttempt {
  id          String   @id
  quizId      String
  score       Int      // 0-100
  answers     Json
  completedAt DateTime @default(now())

  quiz        StudentQuiz @relation(...)
}
```

### 📋 Tâches 8.4

| # | Tâche | Description | Statut |
|:--|:------|:------------|:-------|
| **8.4.1** | Schéma Prisma | Ajouter les 6 modèles Student* | ⬜ |
| **8.4.2** | Migration | `npx prisma migrate dev` | ⬜ |
| **8.4.3** | API Suppléments CRUD | `/api/student/supplements/*` | ⬜ |
| **8.4.4** | API Chapitres | `/api/student/supplements/[id]/chapters/*` | ⬜ |
| **8.4.5** | API Cartes | `/api/student/cards/*` | ⬜ |
| **8.4.6** | API Files Upload | `/api/student/cards/[id]/files` | ⬜ |
| **8.4.7** | Page Révisions | `/student/revisions` (liste) | ⬜ |
| **8.4.8** | Page Détail Supplément | `/student/revisions/[id]` | ⬜ |
| **8.4.9** | Page Création | `/student/revisions/create` | ⬜ |
| **8.4.10** | Composant SupplementCard | Card avec stats | ⬜ |
| **8.4.11** | Composant StudentChapterManager | Gestion chapitres | ⬜ |
| **8.4.12** | Composant StudentCardEditor | Éditeur de cartes | ⬜ |
| **8.4.13** | Onglet "Mes notes" cours | Dans page cours détail | ⬜ |
| **8.4.14** | API Quiz IA | `/api/student/quiz/generate` | ⬜ |
| **8.4.15** | Composant StudentQuizViewer | Auto-évaluation | ⬜ |
| **8.4.16** | KPI Révisions perso | Stats séparées (privées) | ⬜ |

### 🔗 APIs à créer

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/student/supplements` | GET | Liste suppléments de l'élève |
| `/api/student/supplements` | POST | Créer supplément |
| `/api/student/supplements/[id]` | GET/PUT/DELETE | CRUD supplément |
| `/api/student/supplements/[id]/chapters` | GET/POST | Chapitres |
| `/api/student/supplements/[id]/chapters/[chId]` | PUT/DELETE | CRUD chapitre |
| `/api/student/cards` | POST | Créer carte |
| `/api/student/cards/[id]` | GET/PUT/DELETE | CRUD carte |
| `/api/student/cards/[id]/files` | POST/DELETE | Upload fichiers |
| `/api/student/quiz/generate` | POST | **IA génère quiz** |
| `/api/student/quiz/[id]/attempt` | POST | Soumettre tentative |

### 🎨 UX Page Révisions

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Mes Révisions                          [+ Nouveau]      │
├─────────────────────────────────────────────────────────────┤
│  🔗 LIÉS À MES COURS                                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📖 Mathématiques Avancées (M. Dupont)                 │ │
│  │    📝 3 notes · 📄 2 fichiers · ❓ 1 quiz perso       │ │
│  │    Score auto-éval : 78%                              │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  📓 MES COURS PERSONNELS                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📝 Prépa Concours 2026                    [Éditer]    │ │
│  │    5 chapitres · 12 cartes · 3 quiz                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  📊 MES STATS PERSO (privées)                               │
│  │  Quiz perso : 15    Score moyen : 82%                 │ │
└─────────────────────────────────────────────────────────────┘
```

### ⚠️ Règles importantes

```
CONFIDENTIALITÉ :
- StudentSupplement.studentId = SEUL propriétaire
- Aucune API prof ne peut accéder à ces données
- KPI séparés (n'impactent PAS les stats prof)

GÉNÉRATION IA :
- L'IA peut lire : cours prof + supplément élève + knowledge base
- L'IA génère quiz/exercices selon instructions élève
- Questions stockées dans StudentQuiz.questions (même format que Quiz prof)

STRUCTURE :
- Même logique Chapitre → Carte que le système prof
- Réutiliser les composants existants si possible
- Fichiers < 350 lignes
```

---

*Lignes : ~415 | Prompts détaillés dans prompts/phase-08-4-*.md*

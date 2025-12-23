# 🎓 Phase 8 — Interface Élève

> **Objectif** : L'Élève consomme le contenu pédagogique  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 6-8h  
> **Prérequis** : Phase 7 terminée (Prof fonctionnel)

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

*Lignes : ~220 | Suite dans phase-08-student-suite.md*

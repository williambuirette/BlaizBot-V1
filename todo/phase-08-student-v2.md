# 🎓 Phase 8 — Interface Élève (v2 - Améliorée)

> **Objectif** : Interface élève complète, miroir du professeur avec KPIs et interactions  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 10-12h  
> **Prérequis** : Phase 7 terminée (Prof fonctionnel)

---

## 🧭 Navigation Élève (5 onglets)

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Dashboard  │  📚 Mes Cours  │  📋 Assignations  │  🤖 Assistant IA  │  💬 Messages  │
└─────────────────────────────────────────────────────────────┘
```

| Onglet | Route | Description |
|--------|-------|-------------|
| **Dashboard** | `/student` | KPIs, notes récentes, deadlines |
| **Mes Cours** | `/student/courses` | Cours de ma classe + progression |
| **Assignations** | `/student/assignments` | Exercices, devoirs, calendrier |
| **Assistant IA** | `/student/ai` | Chat guidé + Lab libre |
| **Messages** | `/student/messages` | Profs + camarades |

---

## ⚠️ Instructions IA

```
RÈGLE 350 LIGNES (rappel) :
- Chaque composant feature dans src/components/features/student/
- Page orchestrateur < 100 lignes
- Composants individuels < 250 lignes

IMPORTANT :
- L'élève ne voit QUE les cours de SA classe (via Enrollment)
- L'élève peut CONSULTER mais pas CRÉER de contenu (sauf messages)
- Réutiliser les composants Phase 7 (KPICard, MessageThread, Calendar)
- Interface miroir du professeur avec adaptations élève
```

---

## 📚 Sources de vérité

| Source | Usage |
|--------|-------|
| `blaizbot-wireframe/student.html` | Sections, layout, comportements |
| `blaizbot-wireframe/student.js` | Interactions JS de référence |
| `docs/03-CARTOGRAPHIE_UI.md` | Specs détaillées interface élève |
| `docs/04-MODELE_DONNEES.md` | Schéma Enrollment, Progress |
| `docs/05-API_ENDPOINTS.md` | Routes `/api/student/*` |

---

## 📋 Étape 8.1 — Dashboard Élève (Refonte complète)

### 🎯 Objectif
Dashboard miroir du professeur avec KPIs personnels, devoirs à venir, et dernières notes.

### 📝 Comment
Réutiliser les composants KPI du professeur avec des données filtrées pour l'élève.

### 🔧 Par quel moyen
- `StudentKPIGrid` basé sur `KPIGrid` existant
- API `/api/student/dashboard` pour toutes les stats
- Widgets dédiés élève

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.1.1 | API Dashboard | `GET /api/student/dashboard` | Stats complètes |
| 8.1.2 | Page Dashboard | `student/page.tsx` | < 100 lignes |
| 8.1.3 | KPI Grid | `StudentKPIGrid.tsx` | 4 KPIs |
| 8.1.4 | Recent Grades | `RecentGradesTable.tsx` | < 120 lignes |
| 8.1.5 | Upcoming Deadlines | `UpcomingDeadlines.tsx` | < 100 lignes |
| 8.1.6 | Progress Overview | `ProgressOverview.tsx` | < 100 lignes |

### 💡 INSTRUCTION 8.1 (Dashboard Élève)

```markdown
## Contexte
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript, Prisma, shadcn/ui).
L'élève est connecté, son ID est dans `session.user.id`.
L'élève appartient à UNE SEULE classe via `Enrollment`.

## Ta mission
Créer le dashboard élève style professeur avec :

### 1. API `GET /api/student/dashboard`
Retourne :
- `progression` : % moyen de completion (chapitres terminés / total)
- `moyenne` : moyenne des notes (StudentScore)
- `devoirsCount` : assignations à faire
- `coursAccessibles` : nombre de cours de sa classe
- `dernieresNotes` : 5 dernières notes avec matière et commentaire IA
- `prochainsDevoirs` : 5 prochaines deadlines

### 2. Composant `StudentKPIGrid`
4 KPIs avec icônes et couleurs selon seuils :
- 📊 Progression globale (%) — vert si > 70%, orange si > 40%
- 📈 Moyenne actuelle (/20) — vert si > 14, orange si > 10
- 📝 Devoirs à faire — rouge si > 3
- 📚 Cours accessibles — neutre

### 3. Composant `RecentGradesTable`
Table avec colonnes :
- Matière (badge couleur)
- Évaluation (titre)
- Note (/20)
- Commentaire IA (tag : Maîtrisé, À revoir, etc.)

### 4. Composant `UpcomingDeadlines`
Liste des devoirs/examens à venir :
- Date + heure
- Titre
- Type (devoir, exam, quiz)
- Badge urgence (si < 24h)

## Layout
┌─────────────────────────────────────────────────────┐
│ Salut Lucas ! 👋                                    │
│ Tu as complété 75% de tes objectifs cette semaine.  │
└─────────────────────────────────────────────────────┘
┌────────────┬────────────┬────────────┬────────────┐
│ Progression│  Moyenne   │  À faire   │   Cours    │
│    75%     │  15.2/20   │ 3 devoirs  │     6      │
└────────────┴────────────┴────────────┴────────────┘
┌─────────────────────────┬───────────────────────────┐
│ 📅 Prochaines échéances │ 📊 Dernières notes        │
│ • Maths - Demain 14h    │ • Maths 18/20 ✓ Maîtrisé │
│ • Français - 05/01      │ • Anglais 14/20 ⚠ À voir │
└─────────────────────────┴───────────────────────────┘

## Code de référence
Voir prompts/phase-08-student-v2.md
```

---

## 📋 Étape 8.2 — Mes Cours (avec progression)

### 🎯 Objectif
Lister les cours de sa classe avec progression et accès au contenu.

### 📝 Comment
Grille de cards avec barre de progression, filtres par matière.

### 🔧 Par quel moyen
- API filtrée par `enrollment.classId` + `TeacherAssignment`
- Card avec progression visuelle
- Filtres matière + état

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.2.1 | API Cours | `GET /api/student/courses` | Cours avec progression |
| 8.2.2 | Page Liste | `student/courses/page.tsx` | < 100 lignes |
| 8.2.3 | Course Card | `StudentCourseCard.tsx` | < 120 lignes |
| 8.2.4 | Course Filters | `StudentCourseFilters.tsx` | < 80 lignes |
| 8.2.5 | Empty State | Si aucun cours assigné | Message approprié |

### 💡 INSTRUCTION 8.2 (Mes Cours)

```markdown
## Contexte
L'élève veut voir tous les cours auxquels il a accès.

## Ta mission
### 1. API `GET /api/student/courses`
- Trouver `Enrollment` de l'élève
- Récupérer les cours via `Class.courses` ou `TeacherAssignment`
- Calculer progression par cours (chapitres complétés / total)
- Query params : `?subject=id` pour filtrer par matière

### 2. Composant `StudentCourseCard`
Props : `{ course, progress }`
- Titre du cours
- Badge matière (couleur Subject.color)
- Nom du prof (via TeacherProfile)
- Barre de progression (%)
- Dernier chapitre vu
- Bouton "Continuer" ou "Commencer"

### 3. Filtres
- Select matière (toutes / Maths / Français / etc.)
- Toggle état (Tous / En cours / Terminés)

## Layout
┌────────────────────────────────────────────────────┐
│ Mes Cours                                          │
│ [Matière ▼] [Tous ▼]                              │
├────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│ │ Maths        │ │ Français     │ │ Histoire     ││
│ │ Les fractions│ │ La poésie    │ │ Révolution   ││
│ │ [████░░] 60% │ │ [██████] 100%│ │ [██░░░░] 30% ││
│ │ [Continuer]  │ │ [Revoir]     │ │ [Continuer]  ││
│ └──────────────┘ └──────────────┘ └──────────────┘│
└────────────────────────────────────────────────────┘
```

---

## 📋 Étape 8.3 — Détail Cours (Chapitres + Sections)

### 🎯 Objectif
Vue détaillée d'un cours avec navigation chapitres/sections et marquage progression.

### 📝 Comment
Layout 2 colonnes : sidebar chapitres + contenu section.

### 🔧 Par quel moyen
- API détail avec chapitres et sections inclus
- Navigation sidebar
- Contenu markdown rendu
- Bouton marquer terminé

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.3.1 | Route | `student/courses/[id]/page.tsx` | < 100 lignes |
| 8.3.2 | API GET | `GET /api/student/courses/[id]` | Cours + chapitres |
| 8.3.3 | Sidebar | `ChaptersSidebar.tsx` | < 150 lignes |
| 8.3.4 | Content | `SectionContent.tsx` | < 150 lignes |
| 8.3.5 | Progress | `POST /api/student/progress` | Marquer section |
| 8.3.6 | Resources | `SectionResources.tsx` | < 80 lignes |

### 💡 INSTRUCTION 8.3 (Détail Cours)

```markdown
## Ta mission
### 1. API `GET /api/student/courses/[id]`
- Vérifier accès via enrollment
- Inclure chapitres et sections (include nested)
- Inclure progression de l'élève

### 2. Layout
┌──────────────────────────────────────────────────┐
│ ← Mes Cours   |   Les Fractions   |   M. Dupont │
├────────────┬─────────────────────────────────────┤
│ Chapitres  │  Section : Introduction             │
│            │                                     │
│ ▼ Chap 1   │  [Contenu markdown rendu]           │
│   • Intro ✓│                                     │
│   • Bases  │  📎 Ressources (2)                  │
│            │  • exercices.pdf  [Télécharger]     │
│ ▼ Chap 2   │                                     │
│   • Suite  │  [✓ Marquer comme terminé]          │
└────────────┴─────────────────────────────────────┘

### 3. Interactions
- Click chapitre → déplie sections
- Click section → charge contenu
- Marquer terminé → toast + MAJ sidebar (✓)
```

---

## 📋 Étape 8.4 — Mes Exercices & Assignations

### 🎯 Objectif
Liste des exercices, devoirs, quiz assignés avec statuts et deadlines.

### 📝 Comment
Page avec filtres, cards par assignation, indication temps restant.

### 🔧 Par quel moyen
- API assignments filtrée pour l'élève
- Cards avec statut visuel
- Calendrier personnel intégré

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.4.1 | API | `GET /api/student/assignments` | Assignations élève |
| 8.4.2 | Page | `student/assignments/page.tsx` | < 100 lignes |
| 8.4.3 | Card | `StudentAssignmentCard.tsx` | < 120 lignes |
| 8.4.4 | Filters | `StudentAssignmentFilters.tsx` | < 80 lignes |
| 8.4.5 | Calendar | `StudentCalendar.tsx` | Réutiliser react-big-calendar |
| 8.4.6 | Stats | `AssignmentStats.tsx` | À faire / En cours / Terminé |

### 💡 INSTRUCTION 8.4 (Mes Exercices)

```markdown
## Ta mission
### 1. API `GET /api/student/assignments`
- Filtrer par `Assignment.classId = enrollment.classId` OU `Assignment.students includes userId`
- Inclure StudentScore si existe
- Query params : `?type=HOMEWORK|QUIZ|EXAM&status=pending|completed`

### 2. Composant `StudentAssignmentCard`
- Titre + Type (badge couleur)
- Matière
- Date limite (format relatif : "Dans 2 jours", "Demain")
- Statut : À faire / En cours / Terminé
- Score si terminé
- Bouton "Commencer" ou "Voir résultat"

### 3. Layout avec tabs ou vue calendrier
┌────────────────────────────────────────────────────┐
│ Mes Exercices                                       │
│ [Liste] [Calendrier]   [Type ▼] [Statut ▼]         │
├────────────────────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┐                    │
│ │ À faire │ En cours│ Terminé │ ← Stats compteurs  │
│ │    3    │    1    │    8    │                    │
│ └─────────┴─────────┴─────────┘                    │
├────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐   │
│ │ 📝 Quiz Fractions          ⏰ Demain 14h     │   │
│ │ Mathématiques              [À faire]         │   │
│ │                            [Commencer →]     │   │
│ └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

---

## 📋 Étape 8.5 — Messagerie Élève

### 🎯 Objectif
Messagerie avec profs et camarades de classe, organisée par matière/thème.

### 📝 Comment
Réutiliser `MessageThread` avec filtres élève spécifiques.

### 🔧 Par quel moyen
- API filtrée : profs de sa classe + élèves de sa classe
- Conversations groupées (classe) + privées (prof)
- Badge messages non lus

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.5.1 | API GET | `GET /api/student/messages` | Conversations |
| 8.5.2 | API POST | `POST /api/student/messages` | Envoyer message |
| 8.5.3 | Page | `student/messages/page.tsx` | < 100 lignes |
| 8.5.4 | Contacts | `StudentContactsList.tsx` | < 150 lignes |
| 8.5.5 | Thread | Réutiliser `MessageThread.tsx` | Composant partagé |
| 8.5.6 | Classmates | `GET /api/student/classmates` | Élèves de sa classe |

### 💡 INSTRUCTION 8.5 (Messagerie)

```markdown
## Ta mission
### 1. API `GET /api/student/classmates`
- Liste des élèves de la même classe (via enrollment)
- Exclure l'élève connecté
- Retourne : id, firstName, lastName, avatar

### 2. API `GET /api/student/messages`
- Conversations de l'élève
- Query : `?with=userId` pour filtrer

### 3. Contacts groupés
- "💬 Chat de classe" (groupe)
- "👨‍🏫 Mes Professeurs" (liste)
- "👥 Ma Classe" (camarades)

### 4. Layout
┌────────────────┬────────────────────────────────────┐
│ Conversations  │  💬 Chat de Classe (Général)       │
│                │                                    │
│ 📢 Chat Classe │  [Messages thread]                 │
│                │                                    │
│ 👨‍🏫 Professeurs │                                    │
│  • M. Dupont   │                                    │
│  • Mme Martin  │  ────────────────────────────────  │
│                │  [Input message]        [Envoyer]  │
│ 👥 Ma Classe   │                                    │
│  • Lucas       │                                    │
│  • Emma        │                                    │
└────────────────┴────────────────────────────────────┘
```

---

## 📋 Étape 8.6 — Profil Élève

### 🎯 Objectif
Page profil avec infos personnelles et paramètres.

### 📝 Comment
Réutiliser `ProfileModal` créé en Phase 7.

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 8.6.1 | Modal | Réutiliser `ProfileModal.tsx` | Déjà fait |
| 8.6.2 | Infos | Afficher classe + année scolaire | Via enrollment |
| 8.6.3 | Settings | Réutiliser `SettingsModal.tsx` | Déjà fait |

---

## 🧪 TEST CHECKPOINT 8.A — Validation

> ⚠️ **OBLIGATOIRE** : Tests fonctionnels complets

| Test | Commande | Résultat |
|:-----|:---------|:---------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ Warnings only |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Tests fonctionnels** :
- [ ] Dashboard → 4 KPIs affichés avec bonnes valeurs
- [ ] Dashboard → Dernières notes visibles
- [ ] Dashboard → Prochaines deadlines visibles
- [ ] Mes Cours → Liste filtrée par classe
- [ ] Mes Cours → Progression par cours
- [ ] Détail Cours → Chapitres + Sections navigables
- [ ] Détail Cours → Marquer section terminée
- [ ] Exercices → Liste avec statuts
- [ ] Exercices → Vue calendrier
- [ ] Messagerie → Chat classe fonctionne
- [ ] Messagerie → Message privé prof fonctionne

**Tests sécurité** :
- [ ] Élève voit seulement ses cours (sa classe)
- [ ] Impossible de voir progression d'un autre élève
- [ ] Messages uniquement avec sa classe

---

## 📝 EXPOSÉ CHECKPOINT 8.C

> 📚 Mise à jour BlaizBot-projet

| Tâche | Fichier cible |
|:------|:--------------|
| Incrémenter `developmentHours` (+10h) | `progress.json` |
| Ajouter résumé Phase 8 | `content/09-phase-developpement.md` |
| Captures dashboard élève | `assets/screenshots/phase-08-*.png` |

---

## ✅ Checklist fin de phase

- [ ] Dashboard avec 4 KPIs + dernières notes + deadlines
- [ ] Mes Cours avec progression et filtres
- [ ] Détail cours avec chapitres/sections navigables
- [ ] Mes Exercices avec statuts et calendrier
- [ ] Messagerie classe + profs
- [ ] Aucun fichier > 350 lignes
- [ ] Composants partagés réutilisés

---

## 🔄 Navigation

← [phase-07-audit-refactoring.md](phase-07-audit-refactoring.md) | [phase-09-ai-student.md](phase-09-ai-student.md) →

---

*Lignes : ~330 | Dernière MAJ : 2026-01-02*

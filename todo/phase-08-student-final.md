# 🎓 Phase 8 — Interface Élève (5 Onglets)

> **Objectif** : Interface élève complète, miroir du professeur  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 12-15h  
> **Prérequis** : Phase 7 terminée (Prof fonctionnel)

---

### 🧭 Navigation Élève (5 Onglets)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  🏠 Dashboard  │  📚 Mes Cours  │  📋 Assignations  │  🤖 Assistant IA  │  💬 Messages  │
└──────────────────────────────────────────────────────────────────────────┘
```

| # | Onglet | Route | État | Description |
|---|--------|-------|:----:|-------------|
| 1 | **Dashboard** | `/student` | ⚠️ Placeholder | KPIs personnels, notes récentes, deadlines |
| 2 | **Mes Cours** | `/student/courses` | ⚠️ Placeholder | Cours de ma classe + détail + progression |
| 3 | **Assignations** | `/student/assignments` | ❌ À créer | Exercices, devoirs, calendrier personnel |
| 4 | **Assistant IA** | `/student/ai` | ✅ **FAIT** | Chat guidé (profs) + Lab libre |
| 5 | **Messages** | `/student/messages` | ⚠️ Placeholder | Profs + camarades de classe |

**Légende** : ✅ Implémenté | ⚠️ Placeholder (page existe mais vide) | ❌ À créer

---

## ⚠️ Instructions IA

```
RÈGLE 350 LIGNES :
- Chaque composant feature dans src/components/features/student/
- Page orchestrateur < 100 lignes
- Composants individuels < 250 lignes

SÉCURITÉ ÉLÈVE :
- L'élève ne voit QUE les cours de SA classe (via Enrollment)
- L'élève appartient à UNE SEULE classe
- L'élève peut CONSULTER mais pas CRÉER de contenu (sauf messages)
- Messages limités à sa classe (profs + élèves)

RÉUTILISATION :
- KPICard, KPIGrid du professeur
- MessageThread, MessageInput partagés
- AssignmentsCalendar réutilisable
- ProfileModal déjà créé
```

---

## 📚 Sources de vérité

| Source | Usage |
|--------|-------|
| `blaizbot-wireframe/student.html` | Layout, sections, comportements |
| `blaizbot-wireframe/student.js` | Interactions JS de référence |
| `docs/04-MODELE_DONNEES.md` | Enrollment, Progress, StudentScore |

---

# 📋 ONGLET 1 — Dashboard (`/student`)

## 🎯 Objectif
Page d'accueil avec KPIs personnels, notes récentes et échéances à venir.

## 📁 Fichiers à créer

| Fichier | Lignes max | Description |
|---------|------------|-------------|
| `app/api/student/dashboard/route.ts` | 150 | API stats complètes |
| `app/(dashboard)/student/page.tsx` | 80 | Page orchestratrice |
| `components/features/student/dashboard/StudentKPIGrid.tsx` | 100 | 4 KPIs |
| `components/features/student/dashboard/RecentGradesTable.tsx` | 120 | Dernières notes |
| `components/features/student/dashboard/UpcomingDeadlines.tsx` | 100 | Échéances |
| `components/features/student/dashboard/ProgressOverview.tsx` | 80 | Résumé progression |

## 🔧 Tâches

| # | Tâche | Validation |
|:--|:------|:-----------|
| 8.1.1 | API `/api/student/dashboard` | Retourne KPIs + notes + deadlines |
| 8.1.2 | Welcome Card | Prénom + classe + % objectifs |
| 8.1.3 | StudentKPIGrid | 4 cards : Progression, Moyenne, À faire, Cours |
| 8.1.4 | RecentGradesTable | 5 dernières notes avec badge IA |
| 8.1.5 | UpcomingDeadlines | 5 prochaines échéances avec urgence |
| 8.1.6 | Assembler page | Layout responsive 2 colonnes |

## 📐 Layout

```
┌─────────────────────────────────────────────────────────┐
│ Salut Lucas ! 👋  (6ème A)                              │
│ Tu as complété 75% de tes objectifs cette semaine.      │
└─────────────────────────────────────────────────────────┘
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Progression │   Moyenne   │   À faire   │    Cours    │
│     75%     │   15.2/20   │  3 devoirs  │      6      │
│    ↑ +5%    │    ↑ +0.3   │   ⚠ urgent  │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
┌─────────────────────────┬───────────────────────────────┐
│ 📅 Prochaines échéances │ 📊 Dernières notes            │
│                         │                               │
│ • Quiz Fractions        │ • Maths     18/20  ✓ Maîtrisé│
│   ⏰ Demain 14h [!]     │ • Anglais   14/20  ⚠ À revoir│
│ • Devoir Français       │ • Histoire  16/20  ✓ Bien    │
│   📅 Dans 3 jours       │                               │
└─────────────────────────┴───────────────────────────────┘
```

---

# 📋 ONGLET 2 — Mes Cours (`/student/courses`)

## 🎯 Objectif
Liste des cours accessibles avec progression, et vue détail pour consulter le contenu.

## 📁 Fichiers à créer

| Fichier | Lignes max | Description |
|---------|------------|-------------|
| `app/api/student/courses/route.ts` | 100 | Liste cours avec progression |
| `app/api/student/courses/[id]/route.ts` | 120 | Détail cours + chapitres |
| `app/api/student/progress/route.ts` | 80 | POST marquer section |
| `app/(dashboard)/student/courses/page.tsx` | 80 | Liste cours |
| `app/(dashboard)/student/courses/[id]/page.tsx` | 100 | Détail cours |
| `components/features/student/courses/StudentCourseCard.tsx` | 100 | Card cours |
| `components/features/student/courses/StudentCourseFilters.tsx` | 60 | Filtres |
| `components/features/student/courses/ChaptersSidebar.tsx` | 150 | Navigation chapitres |
| `components/features/student/courses/SectionContent.tsx` | 150 | Contenu section |
| `components/features/student/courses/SectionResources.tsx` | 80 | Documents |

## 🔧 Tâches

| # | Tâche | Validation |
|:--|:------|:-----------|
| 8.2.1 | API GET `/api/student/courses` | Cours de la classe avec % |
| 8.2.2 | StudentCourseCard | Titre, prof, matière, progression |
| 8.2.3 | StudentCourseFilters | Par matière, par état |
| 8.2.4 | Page liste | Grille responsive |
| 8.2.5 | API GET `/api/student/courses/[id]` | Chapitres + sections |
| 8.2.6 | ChaptersSidebar | Navigation collapsible |
| 8.2.7 | SectionContent | Markdown + vidéos |
| 8.2.8 | SectionResources | Documents téléchargeables |
| 8.2.9 | API POST `/api/student/progress` | Marquer section terminée |

## 📐 Layout Liste

```
┌──────────────────────────────────────────────────────────┐
│ Mes Cours                       [Matière ▼] [État ▼]    │
├──────────────────────────────────────────────────────────┤
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐│
│ │ 📐 Maths       │ │ ✍️ Français    │ │ 🌍 Histoire    ││
│ │ Les fractions  │ │ La poésie      │ │ Révolution     ││
│ │ M. Dupont      │ │ Mme Martin     │ │ M. Bernard     ││
│ │ [████░░░] 60%  │ │ [███████] 100% │ │ [██░░░░░] 30%  ││
│ │ [Continuer →]  │ │ [Revoir]       │ │ [Continuer →]  ││
│ └────────────────┘ └────────────────┘ └────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## 📐 Layout Détail

```
┌──────────────────────────────────────────────────────────┐
│ ← Mes Cours    │    Les Fractions    │    M. Dupont     │
├────────────────┬─────────────────────────────────────────┤
│ 📚 Chapitres   │  📖 Introduction aux fractions          │
│                │                                         │
│ ▼ Chap 1       │  Une fraction représente une partie    │
│   • Intro    ✓ │  d'un tout. Elle s'écrit sous la forme │
│   • Bases      │  a/b où a est le numérateur...         │
│   • Exercices  │                                         │
│                │  [Contenu markdown rendu]               │
│ ▶ Chap 2       │                                         │
│                │  ──────────────────────────────────────  │
│ ▶ Chap 3       │  📎 Ressources (2)                      │
│                │  • cours.pdf          [Télécharger]     │
│                │  • exercices.pdf      [Télécharger]     │
│                │  ──────────────────────────────────────  │
│                │  [✓ Marquer comme terminé]              │
└────────────────┴─────────────────────────────────────────┘
```

---

# 📋 ONGLET 3 — Assignations (`/student/assignments`)

## 🎯 Objectif
Voir tous les exercices, devoirs et quiz assignés avec calendrier intégré.

## 📁 Fichiers à créer

| Fichier | Lignes max | Description |
|---------|------------|-------------|
| `app/api/student/assignments/route.ts` | 120 | Liste assignations |
| `app/(dashboard)/student/assignments/page.tsx` | 100 | Page avec tabs |
| `components/features/student/assignments/StudentAssignmentCard.tsx` | 120 | Card assignation |
| `components/features/student/assignments/StudentAssignmentFilters.tsx` | 80 | Filtres |
| `components/features/student/assignments/AssignmentStats.tsx` | 60 | Compteurs |
| `components/features/student/assignments/StudentCalendar.tsx` | 150 | Calendrier |

## 🔧 Tâches

| # | Tâche | Validation |
|:--|:------|:-----------|
| 8.3.1 | API GET `/api/student/assignments` | Assignations + scores |
| 8.3.2 | AssignmentStats | 3 compteurs (À faire, En cours, Terminé) |
| 8.3.3 | StudentAssignmentCard | Type, deadline, statut, score |
| 8.3.4 | StudentAssignmentFilters | Type + Statut + Matière |
| 8.3.5 | StudentCalendar | Réutiliser react-big-calendar |
| 8.3.6 | Toggle Liste/Calendrier | Switch de vue |

## 📐 Layout

```
┌──────────────────────────────────────────────────────────┐
│ Mes Assignations                                         │
│ [📋 Liste] [📅 Calendrier]    [Type ▼] [Statut ▼]       │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐          │
│ │   À faire    │   En cours   │   Terminé    │          │
│ │      3       │      1       │      8       │          │
│ └──────────────┴──────────────┴──────────────┘          │
├──────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📝 Quiz Fractions              ⏰ Demain 14h  [!]  │  │
│ │ Mathématiques                  Statut: À faire     │  │
│ │                                    [Commencer →]   │  │
│ └────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📄 Devoir Poésie               📅 Dans 5 jours    │  │
│ │ Français                       Statut: À faire     │  │
│ │                                    [Commencer →]   │  │
│ └────────────────────────────────────────────────────┘  │
│ ┌────────────────────────────────────────────────────┐  │
│ │ ✅ Contrôle Révolution         Score: 16/20       │  │
│ │ Histoire                       Statut: Terminé     │  │
│ │                                    [Voir résultat] │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

# 📋 ONGLET 4 — Assistant IA (`/student/ai`) ✅ FAIT

## 🎯 État actuel
**Implémenté** via `StudentAIChatPage.tsx` (285 lignes)

### Fonctionnalités existantes :
- ✅ Chat interactif avec l'IA
- ✅ Badge de score en temps réel (`LiveScoreBadge`)
- ✅ Modal de résultats (`AIScoreModal`)
- ✅ Sélection du type d'activité (Quiz/Exercise/Revision)
- ✅ Appel API `/api/ai/chat` et `/api/ai/evaluate`

### Fichiers existants :
- `src/app/(dashboard)/student/ai/page.tsx` - Page wrapper
- `src/components/features/student/StudentAIChatPage.tsx` - Composant principal (285L)
- `src/components/features/student/AIScoreModal.tsx` - Modal résultats
- `src/components/features/student/LiveScoreBadge.tsx` - Badge temps réel
- `src/components/features/student/AIProgressCard.tsx` - Card progression
- `src/components/features/student/AIScoreBadge.tsx` - Badge score

### 🔧 Améliorations optionnelles (BONUS)

| # | Tâche | Priorité |
|:--|:------|:---------|
| 8.4.1 | Ajouter 2 tabs "Mes Cours" + "Lab Libre" | 🟠 Optionnel |
| 8.4.2 | AICoursesGrid - Liste cours avec contexte IA | 🟠 Optionnel |
| 8.4.3 | TeacherSources - Sources imposées (🔒) | 🟠 Optionnel |
| 8.4.4 | LabDashboard - Projets personnels | 🟠 Optionnel |

## 📐 Layout Assistant IA (Cours)

```
┌──────────────────────────────────────────────────────────┐
│ Assistant IA                                             │
│ [🎓 Mes Cours] [🧪 Lab Libre]                           │
├──────────────────────────────────────────────────────────┤
│ Choisis un cours pour commencer :                        │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐│
│ │ 📐 Les Fractions│ │ ✍️ La Poésie  │ │ 🌍 Révolution  ││
│ │ 3 sources prof │ │ 2 sources prof │ │ 4 sources prof ││
│ │ [Ouvrir →]     │ │ [Ouvrir →]     │ │ [Ouvrir →]     ││
│ └────────────────┘ └────────────────┘ └────────────────┘│
└──────────────────────────────────────────────────────────┘
```

## 📐 Layout Workspace IA

```
┌──────────────────────────────────────────────────────────┐
│ ← Retour   │   Les Fractions   │   Blaiz'bot Assistant   │
├────────────┬───────────────────────────────┬─────────────┤
│ 📚 Sources │         💬 Chat              │ 🛠️ Outils   │
│            │                               │             │
│ 🔒 Prof:   │  [B] Bonjour Lucas !         │ Générer:    │
│ • Cours.pdf│      Comment puis-je         │ [📝 Quiz]   │
│ • Exos.pdf │      t'aider sur les         │ [📄 Fiche]  │
│ • Video.yt │      fractions ?             │ [🧠 Méthode]│
│            │                               │ [❓ Expli.] │
│ 👤 Moi:    │  [Lucas] Je ne comprends     │             │
│ + Ajouter  │  pas les fractions           │ ───────────  │
│            │  équivalentes                │ Résultat:   │
│            │                               │ [Zone       │
│            │  ─────────────────           │  output]    │
│            │  [Tape ta question...]       │             │
└────────────┴───────────────────────────────┴─────────────┘
```

---

# 📋 ONGLET 5 — Messages (`/student/messages`)

## 🎯 Objectif
Messagerie avec profs et camarades, limité à sa classe.

## 📁 Fichiers à créer

| Fichier | Lignes max | Description |
|---------|------------|-------------|
| `app/api/student/classmates/route.ts` | 60 | Élèves de la classe |
| `app/api/student/messages/route.ts` | 100 | GET + POST messages |
| `app/(dashboard)/student/messages/page.tsx` | 80 | Page messages |
| `components/features/student/messages/StudentContactsList.tsx` | 150 | Contacts groupés |
| `components/features/student/messages/ClassChatBadge.tsx` | 40 | Badge non lus |

## 🔧 Tâches

| # | Tâche | Validation |
|:--|:------|:-----------|
| 8.5.1 | API GET `/api/student/classmates` | Élèves même classe |
| 8.5.2 | API GET/POST `/api/student/messages` | Conversations |
| 8.5.3 | StudentContactsList | Groupes: Classe, Profs, Élèves |
| 8.5.4 | Réutiliser MessageThread | Composant partagé |
| 8.5.5 | Badge messages non lus | Sidebar + header |

## 📐 Layout

```
┌──────────────────────────────────────────────────────────┐
│ Messages                                    🔍 Recherche │
├────────────────┬─────────────────────────────────────────┤
│ Conversations  │  📢 Chat de Classe (6ème A)            │
│                │                                         │
│ 📢 Classe [3]  │  ┌─────────────────────────────────────┤
│                │  │ M. Dupont (14:30)                   │
│ 👨‍🏫 Professeurs │  │ Bonjour à tous ! N'oubliez pas le  │
│  • M. Dupont   │  │ devoir pour demain.                 │
│  • Mme Martin  │  ├─────────────────────────────────────┤
│                │  │ Emma (14:35)                        │
│ 👥 Ma Classe   │  │ Merci monsieur !                    │
│  • Lucas       │  └─────────────────────────────────────┤
│  • Emma        │                                         │
│  • Thomas [1]  │  ─────────────────────────────────────  │
│                │  [📎] [Écrire un message...]  [Envoyer] │
└────────────────┴─────────────────────────────────────────┘
```

---

## 🧪 TEST CHECKPOINT

| Test | Commande | Attendu |
|:-----|:---------|:--------|
| Build | `npm run build` | ✅ Success |
| Lint | `npm run lint` | ✅ 0 errors |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Tests fonctionnels par onglet** :
- [ ] Dashboard : 4 KPIs + notes + deadlines
- [ ] Mes Cours : Liste + Détail + Progression
- [ ] Assignations : Liste + Calendrier + Filtres
- [ ] Assistant IA : Chat guidé + Lab libre
- [ ] Messages : Classe + Profs + Élèves

**Tests sécurité** :
- [ ] Élève voit uniquement sa classe
- [ ] Messages limités à sa classe
- [ ] Pas d'accès aux données autres élèves

---

## ✅ Checklist fin Phase 8

- [ ] 5 onglets fonctionnels
- [ ] Dashboard avec KPIs dynamiques
- [ ] Mes Cours avec progression tracking
- [ ] Assignations avec vue calendrier
- [ ] Assistant IA avec sources profs
- [ ] Messagerie classe + profs
- [ ] Aucun fichier > 350 lignes
- [ ] Build sans erreurs

---

## 🔄 Navigation

← [phase-07-audit-refactoring.md](phase-07-audit-refactoring.md) | [phase-09-execution.md](phase-09-execution.md) →

---

*Lignes : ~350 | Dernière MAJ : 2026-01-02*

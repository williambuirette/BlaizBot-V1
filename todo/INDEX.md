# 📋 TODO - Index Principal

> **Point d'entrée pour l'IA** : Ce fichier indique où trouver l'information.

---

## 🎯 Phase Active

**Phase actuelle** : Phase 8 — Interface Élève (5 Onglets)  
**TODO** : [todo/phase-08-student-v2.md](phase-08-student-v2.md)  
**Prompts** : `prompts/phase-08-*`  
**Étape en cours** : Dashboard (8.1) + Refactoring  
**Dernière MAJ** : 2026-01-03

### 🧭 Navigation Élève (5 Onglets)

| # | Onglet | Route | État |
|:--|:-------|:------|:----:|
| 1 | **Dashboard** | `/student` | ⚠️ À faire |
| 2 | **Mes Cours** | `/student/courses` | ✅ **FAIT** |
| 3 | **Mes Révisions** | `/student/revisions` | ✅ **FAIT** |
| 4 | **Assignations** | `/student/assignments` | ❌ À créer |
| 5 | **Assistant IA** | `/student/ai` | ✅ **FAIT** |
| 6 | **Messages** | `/student/messages` | ⚠️ Placeholder |

**Légende** : ✅ Implémenté | ⚠️ Placeholder | ❌ À créer

### 🔧 Refactorisation en attente

**19 fichiers > 350 lignes** à découper.  
**TODO** : [todo/refactoring-350-lines.md](refactoring-350-lines.md)  
**Prompts** : [prompts/refactoring-350-lines-prompts.md](../prompts/refactoring-350-lines-prompts.md)

### 📁 Fichiers de référence (archives)

| Fichier | Statut |
|:--------|:-------|
| phase-08-student-v2.md | 📦 Archivé |
| phase-08-student-old.md | 📦 Archivé |
| phase-08-student-suite-old.md | 📦 Archivé |

---

## 🟢 FINALISÉ — Phase 7 Audit (Corrections)

### Résumé
- **7 erreurs TypeScript** corrigées
- **5 erreurs React Hooks** corrigées  
- **0 errors / 29 warnings** au lint final
- **Build réussi** ✅

### Commit
```
82eea7a fix: résoudre erreurs TypeScript et ESLint (Phase 7 Audit)
```

---

## 🟢 FINALISÉ — Phase 7 Quinquies (Précédent)

---

## 🟢 FINALISÉ — Phase 7 Quinquies Corrections

### Tâches du Calendrier (COMPLÉTÉES)

| Tâche | Description | Statut |
|:------|:------------|:-------|
| AS-CAL1 | Toolbar personnalisée sans "Aujourd'hui" | ✅ FAIT |
| AS-CAL2 | Clic cellule → Agenda du jour | ✅ FAIT |
| AS-CAL3 | État calendrier remonté dans parent | ✅ FAIT |
| AS-CAL4 | Vue Mois par défaut | ✅ FAIT |
| AS-FIX-DATE | Plage date 00:00:00 → 23:59:59 | ✅ FAIT |

### Tâches de correction (VALIDÉES)

| Tâche | Description | Statut |
|:------|:------------|:-------|
| AS-FIX1 | Corriger parsing API filtres | ✅ |
| AS-FIX3 | Vue liste par défaut (calendrier si filtres) | ✅ |
| AS-FIX4 | Sidebar collapsible avec badge | ✅ |
| AS-FIX5 | CSS react-big-calendar toolbar | ✅ |
| AS-REF1 | Refactorer NewAssignmentModal (1039→281L) | ✅ |
| AS-REF2 | Refactorer AssignDialog (881→10 fichiers) | ✅ |

### ⏭️ Tâches restantes (OPTIONNEL - Phase 7 Quinquies)

| Tâche | Description | Priorité |
|:------|:------------|:----------|
| AS-FIX2 | Ajouter filtres Matières + Sections | 🟠 BONUS |

**État** : Phase 7 Quinquies 95% complète ✅

### Architecture NewAssignmentModal (après refactoring)

```
src/components/features/assignments/
├── NewAssignmentModal.tsx (281 lines) ← Orchestrateur
├── types.ts ← Interfaces partagées
├── useAssignmentForm.ts (260 lines) ← Hook état + fetch
├── MultiSelectDropdown.tsx (132 lines) ← Composant réutilisable
└── steps/
    ├── index.ts
    ├── StepSubjects.tsx (50 lines)
    ├── StepCourses.tsx (63 lines)
    ├── StepSections.tsx (103 lines)
    ├── StepClasses.tsx (50 lines)
    ├── StepStudents.tsx (119 lines)
    ├── StepDeadline.tsx (108 lines)
    └── StepValidation.tsx (214 lines)
```

### Architecture AssignDialog (après refactoring)

```
src/components/features/courses/assign-dialog/
├── index.tsx (152 lines) ← Orchestrateur
├── types.ts (79 lines) ← Interfaces partagées
├── useAssignDialogState.ts (247 lines) ← Hook état + fetch
├── AssignDialogStep1.tsx (123 lines) ← Quoi assigner
├── AssignDialogStep2.tsx (120 lines) ← À qui assigner
├── AssignDialogStep3.tsx (61 lines) ← Détails
├── AssignDialogStep4.tsx (106 lines) ← Récapitulatif
├── ClassSelection.tsx (55 lines) ← Multi-select classes
├── TeamSelection.tsx (173 lines) ← Sélection équipe
└── SingleStudentSelection.tsx (81 lines) ← Un seul élève
```

---

## ✅ Blocs Dépliables Structure (BL1-BL11) — TERMINÉ

| Tâche | Description | Statut |
|:------|:------------|:-------|
| BL1 | Composant SectionCard accordéon | ✅ |
| BL2 | Éditeurs inline (LessonEditorInline) | ✅ |
| BL3 | Formulaire section inline (SectionFormDialog) | ✅ |
| BL4 | Chargement contenu existant | ✅ |
| BL5 | Boutons Save/Cancel | ✅ |
| BL6 | Animations transitions | ✅ |
| BL7 | Intégration ChaptersManager | ✅ |
| BL8 | Tests et validation (CRUD sections) | ✅ |
| **BL9** | **Fichiers base de connaissance par section** | ✅ |
| **BL10** | **Instructions IA par section** | ⬜ (reporté) |
| **BL11** | **Simplification menu (2 options)** | ✅ |

**Résumé des corrections effectuées** :
- ✅ Création sections (POST 201)
- ✅ Affichage cartes après création (transform Section→sections)
- ✅ Suppression sections (fix PascalCase Chapter/Course)
- ✅ Modification sections (fix PascalCase)
- ✅ Upload fichiers ressources (fix TeacherProfile)
- ✅ Suppression fichiers (fix TeacherProfile)
- ✅ Statistiques _count (transform camelCase)
- ✅ Menu simplifié (Modifier le cours + Supprimer)
- ✅ Suppression page /edit obsolète

**Prompts** : [prompts/phase-08-blocs-structure.md](../prompts/phase-08-blocs-structure.md)

---

## ✅ Compteurs Performance Cours (CP1-CP6) — TERMINÉ

| Tâche | Description | Statut |
|:------|:------------|:-------|
| CP1 | Types CoursePerformance | ✅ |
| CP2 | API stats cours enrichie | ✅ |
| CP3 | Badge Performance A+/A/B/C/D | ✅ |
| CP4 | Header Stats vue d'ensemble | ✅ |
| CP5 | Intégration page courses | ✅ |
| CP6 | Tests et validation | ✅ |

**Fichiers créés** :
- `src/types/course-stats.ts`
- `src/components/features/teacher/CoursePerformanceBadge.tsx`
- `src/components/features/teacher/CoursesStatsHeader.tsx`

**Prompts** : [prompts/phase-07ter-ai-evaluation.md](../prompts/phase-07ter-ai-evaluation.md#phase-cp--compteurs-performance-cours)

---

## ✅ Messagerie Avancée (AI5.ter) — TERMINÉ

| Tâche | Description | Statut |
|:------|:------------|:-------|
| AI5.ter.1 | Affichage bulles chat | ✅ |
| AI5.ter.2 | Bouton fichiers joints | ✅ |
| AI5.ter.3 | API upload fichiers | ✅ |
| AI5.ter.4.1-6 | Téléchargement complet | ✅ |

**Tests validés** :
- ✅ Upload multi-fichiers Excel, PDF
- ✅ Stockage physique `/public/uploads/messages/`
- ✅ Téléchargement nouveaux fichiers
- ✅ Debugging système avec logs détaillés

**Prompts** : [prompts/phase-07ter-ai-evaluation.md](../prompts/phase-07ter-ai-evaluation.md#-amélioration-messagerie-ai5ter)

---

## ⏸️ Évaluation Automatique IA (AI1-AI7) — EN PAUSE

| Tâche | Description | Statut |
|:------|:------------|:-------|
| AI1.1 | Modèle BDD AIActivityScore | ⬜ |
| AI1.2 | Relations User/Course/ChatSession | ⬜ |
| AI2.1 | Service évaluation IA | ⬜ |
| AI2.2 | Prompts templates | ⬜ |
| AI2.3 | Agrégation scores | ⬜ |

**Prompts** : [prompts/phase-07ter-ai-evaluation.md](../prompts/phase-07ter-ai-evaluation.md#-tâche-ai11--modèle-bdd-aiactivityscore)

---

## ✅ Filtres Liste Élèves (S1-S6) — TERMINÉ

| Tâche | Description | Statut |
|:------|:------------|:-------|
| S1 | Types & Interfaces | ✅ |
| S2 | API stats élèves | ✅ |
| S3 | StudentFilterBar | ✅ |
| S4 | StudentCard enrichie | ✅ |
| S5 | Logique filtrage | ✅ |
| S6 | Intégration page | ✅ |

**Prompts** : [prompts/phase-07bis-scoring.md](../prompts/phase-07bis-scoring.md#-extension--filtres-liste-élèves-s1-s6)

---

## ✅ Filtres & Tri (F1-F4) — TERMINÉ

| Tâche | Description | Statut |
|:------|:------------|:-------|
| F1 | Seed StudentScore (données test) | ✅ |
| F2 | Composant FilterBar | ✅ |
| F3 | Logique de tri | ✅ |
| F4 | Intégration page | ✅ |

**Prompts** : [prompts/phase-07bis-scoring.md](../prompts/phase-07bis-scoring.md#-filtres--tri-f1-f4)

---

## ✅ Phase 7bis — Scoring & Fiche Élève (TERMINÉ)

| Tâche | Description | Statut |
|:------|:------------|:-------|
| 7bis.1 | Migration Prisma (StudentScore) | ✅ |
| 7bis.2 | API Scores Élève (GET/PUT) | ✅ |
| 7bis.3 | Service Stats (calculs, agrégations) | ✅ |
| 7bis.4 | Composant ScoreBadge | ✅ |
| 7bis.5 | Page Fiche Élève /teacher/students/[id] | ✅ |
| 7bis.6 | Composants Scores (Header, CourseRow) | ✅ |
| 7bis.7 | Dialog Saisie Examen | ✅ |
| 7bis.8 | Navigation depuis Liste Élèves | ✅ |

**✅ Phase 7bis COMPLÈTE !**

**Prompts** : [prompts/phase-07bis-scoring.md](../prompts/phase-07bis-scoring.md)

---

## ✅ Tâches terminées (Phase 7.9 - Messagerie Avancée)

| Tâche | Description | Statut |
|:------|:------------|:-------|
| 7.9.1 | Migration Prisma (Notification, MessageReadStatus, schoolYear) | ✅ |
| 7.9.2 | API /teacher/classes/[id]/students (backend) | ✅ |
| 7.9.3 | API Notifications (backend) | ✅ |
| 7.9.4 | NewConversationDialog (frontend) | ✅ |
| 7.9.5 | ConversationsList amélioré (frontend) | ✅ |
| 7.9.6 | MessageThread avec noms (frontend) | ✅ |
| 7.9.7 | NotificationBell (frontend) | ✅ |
| 7.9.8 | Intégration Header | ✅ |
| 7.9.9 | Créer notifications à l'envoi | ✅ |
| 7.9.10 | Refonte UI NewConversationDialog (cartes visuelles) | ✅ |
| 7.9.11 | ConversationsList groupé par catégorie (Collapsible) | ✅ |

**Documentation** : [docs/11-MESSAGERIE_AVANCEE.md](../docs/11-MESSAGERIE_AVANCEE.md)

---

## 📁 Structure du dossier

| Fichier | Contenu | Lignes |
|:--------|:--------|:-------|
| [INDEX.md](INDEX.md) | 🎯 Navigation (ce fichier) | ~100 |
| [RULES.md](RULES.md) | ⚠️ Règles IA obligatoires | ~190 |
| [STRUCTURE.md](STRUCTURE.md) | 🗂️ Arborescence cible | ~240 |

### Fichiers de phases

| Phase | Fichier(s) | Durée | Statut |
|:------|:-----------|:------|:-------|
| 1 | [phase-01-init.md](phase-01-init.md) → [suite](phase-01-init-suite.md) → [fin](phase-01-init-fin.md) + [code](phase-01-fichiers.md) | 2-3h | ✅ |
| 2 | [phase-02-layout.md](phase-02-layout.md) → [suite](phase-02-layout-suite.md) + [code](phase-02-code.md) | 3-4h | ✅ |
| 3 | [phase-03-slice.md](phase-03-slice.md) → [suite](phase-03-slice-suite.md) + [code](phase-03-code.md) | 3-4h | ✅ |
| 4 | [phase-04-database.md](phase-04-database.md) → [suite](phase-04-database-suite.md) + [code](phase-04-code.md) → [code-suite](phase-04-code-suite.md) | 3-4h | ✅ |
| 5 | [phase-05-auth.md](phase-05-auth.md) → [suite](phase-05-auth-suite.md) + [code](phase-05-code.md) → [code-suite](phase-05-code-suite.md) | 4-5h | ✅ |
| 6 | [phase-06-admin.md](phase-06-admin.md) → [suite](phase-06-admin-suite.md) + [code](phase-06-code.md) → [suite](phase-06-code-suite.md) → [fin](phase-06-code-fin.md) | 6-8h | ✅ |
| 7 | [phase-07-teacher.md](phase-07-teacher.md) | 6-8h | ✅ |
| **7bis** | [phase-07bis-scoring.md](phase-07bis-scoring.md) | 4-5h | ✅ |
| 8 | [phase-08-student.md](phase-08-student.md) | 6-8h | ⬜ |
| 9 | [phase-09-ai.md](phase-09-ai.md) | 8-10h | ⬜ |
| 10 | [phase-10-demo.md](phase-10-demo.md) | 4-6h | ⬜ |

**Note** : Phases 1-3 divisées (350 lignes max). Code/templates dans fichiers séparés.

**Durée totale estimée** : 45-60h

---

## 📊 Progression Globale

```
Phase 0   Phase 1   Phase 2   Phase 3   Phase 4   Phase 5
  PRD  →   Init  →  Layout →  Slice →    DB   →   Auth
  ✅        ✅        ✅        ✅        ✅        ✅

Phase 6   Phase 7   Phase 8   Phase 9   Phase 10
 Admin →   Prof  →  Élève  →    IA   →   Démo
   ✅        🔴        ⬜        ⬜        ⬜
```

| Phase | Nom | Statut | Progression | Tests | Refactor | Exposé |
|:------|:----|:-------|:------------|:------|:---------|:-------|
| 0 | PRD & Specs | ✅ Done | 100% | — | — | — |
| 1 | Initialisation | ✅ Done | 100% | ✅ | ✅ | ✅ |
| 2 | Layout | ✅ Done | 100% | ✅ | ✅ | ✅ |
| 3 | Vertical Slice | ✅ Done | 100% | ✅ | ✅ | ✅ |
| 4 | Base de données | ✅ Done | 100% | ✅ | ✅ | ✅ |
| 5 | Authentification | ✅ Done | 100% | ✅ | ✅ | ⬜ |
| 6 | Admin | ✅ Done | 100% | ✅ | ✅ | ⬜ |
| 7 | Professeur | ✅ Done | 100% | ⬜ | ⬜ | ⬜ |
| 7bis | Scoring | ✅ Done | 100% | ⬜ | ⬜ | ⬜ |
| 8 | Élève | ⬜ À faire | 0% | ⬜ | ⬜ | ⬜ |
| 9 | IA | ⬜ À faire | 0% | ⬜ | ⬜ | ⬜ |
| 10 | Démo | ⬜ À faire | 0% | ⬜ | ⬜ | ⬜ |

**Légende** : ✅ Fait | ⬜ À faire | 🔴 En cours | — Non applicable

**Progression globale** : 73% (8/11 phases)

---

## 🔍 Comment utiliser (pour l'IA)

```
WORKFLOW OBLIGATOIRE :

1. LIRE INDEX.md     → Identifier la phase active
2. LIRE RULES.md     → Contraintes 350 lignes, secrets, etc.
3. LIRE STRUCTURE.md → Où créer chaque fichier
4. OUVRIR phase-XX.md → Tâches détaillées avec instructions
5. EXÉCUTER tâche par tâche (dans l'ordre)
6. VALIDER chaque tâche avant la suivante
7. METTRE À JOUR la progression ici
```

---

## 🚨 Rappel Critique

> **AVANT de coder**, l'IA DOIT :
> 1. Lire `RULES.md` — Contraintes obligatoires (350 lignes, secrets, etc.)
> 2. Lire `STRUCTURE.md` — Savoir où placer les fichiers
> 3. Lire `phase-XX.md` actif — Instructions détaillées

---

## 📚 Autres sources de vérité

| Document | Rôle |
|:---------|:-----|
| `../docs/03-CARTOGRAPHIE_UI.md` | Inventaire des écrans |
| `../docs/04-MODELE_DONNEES.md` | Schéma Prisma complet |
| `../docs/05-API_ENDPOINTS.md` | Routes et payloads |
| `../docs/WIREFRAME_MAPPING.md` | 🆕 Correspondance wireframe ↔ composants |
| `blaizbot-wireframe/` | QUOI coder (maquettes) |

---

## 🆕 Templates Pré-Créés

Ces fichiers sont prêts à l'emploi pour accélérer le développement :

| Fichier | Usage |
|:--------|:------|
| `../.env.example` | Copier vers `.env.local` |
| `../src/types/index.ts` | Types globaux (Role, User, ApiResponse...) |
| `../src/constants/index.ts` | Constantes (ROUTES, NAV_ITEMS, AI_CONFIG...) |
| `../src/lib/mock-data.ts` | Données mockées pour Phase 3 |
| `../prisma/seed-template.ts` | Template du script de seed |

---

*Dernière mise à jour : 23.12.2025*

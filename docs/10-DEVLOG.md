# 10 - DevLog (Journal de Développement)

> **Objectif** : Capturer le processus de développement pour l'exposé Vibecoding
> **Format** : Entrées chronologiques avec contexte, décisions, apprentissages

---

## 📅 Format des entrées

```markdown
## [DATE] - Titre de la session

**Durée** : X heures
**Objectif** : Ce qu'on voulait accomplir

### ✅ Réalisé
- Point 1
- Point 2

### 🤔 Décisions prises
- Décision A → Pourquoi
- Décision B → Alternative rejetée

### 🐛 Problèmes rencontrés
- Problème → Solution

### 📚 Apprentissages
- Ce que l'IA a bien fait
- Ce qui a nécessité intervention humaine

### 🔜 Prochaine session
- TODO 1
- TODO 2
```

---

## 📝 Entrées

---

### [2024-12-22] - Initialisation du projet

**Durée** : ~3 heures
**Objectif** : Créer la structure documentaire complète AVANT le code

#### ✅ Réalisé
- Analyse du wireframe `blaizbot-wireframe/`
- Création du repo `BlaizBot-V1` avec structure Vibecoding
- Documentation technique :
  - [x] 00-INDEX.md (index + checklist)
  - [x] 01-STACK_TECHNOLOGIQUE.md (Next.js, Prisma, Vercel Postgres, etc.)
  - [x] 02-ARCHITECTURE_GLOBALE.md (schémas, flux, structure)
  - [x] 03-CARTOGRAPHIE_UI.md (~800 lignes, toutes pages/sections)
  - [x] 04-MODELE_DONNEES.md (schéma Prisma complet)
  - [x] 05-API_ENDPOINTS.md (~70 endpoints)
  - [x] 06-COMPOSANTS_UI.md (design system, composants)
  - [x] 07-FONCTIONNALITES_IA.md (chat, RAG, génération)
  - [x] 08-AUTHENTIFICATION.md (NextAuth, rôles, permissions)
  - [x] 09-PLAN_DEVELOPPEMENT.md (4 phases, ~3 semaines)
- Import des templates Vibe-Coding :
  - [x] 7 agents spécialisés (.github/agents/)
  - [x] Prompts Copilot (.github/prompts/)
  - [x] Scripts de vérification (scripts/)
  - [x] Configuration VS Code (.vscode/)
- Fichiers de gouvernance :
  - [x] copilot-instructions.md personnalisé
  - [x] AGENTS.md
  - [x] CONTRIBUTING.md

#### 🤔 Décisions prises
- **3 repos séparés** → Séparation des responsabilités claire :
  - `blaizbot-wireframe` = QUOI coder (specs fonctionnelles)
  - `Vibe-Coding` = COMMENT l'IA doit coder (méthodologie)
  - `BlaizBot-V1` = OÙ le code va (produit final)
- **Next.js 15 App Router** → Standard moderne, SSR, API routes intégrées
- **Vercel Postgres + Prisma** → Simplicité + typage fort
- **shadcn/ui** → Composants accessibles, personnalisables
- **Pas de code avant documentation complète** → Éviter les réécritures

#### 🐛 Problèmes rencontrés
- Création initiale des docs dans le mauvais repo → Corrigé par restructuration
- Fichier copilot-instructions.md déjà existant → Utilisé replace_string_in_file

#### 📚 Apprentissages Vibecoding
- **IA efficace pour** :
  - Structurer la documentation à partir d'un wireframe
  - Proposer des architectures cohérentes
  - Inventorier exhaustivement (pages, API, composants)
  - Appliquer des templates de façon cohérente
- **Intervention humaine nécessaire pour** :
  - Clarifier la séparation des repos
  - Valider les choix technologiques
  - Définir les priorités (documentation AVANT code)

#### 🔜 Prochaine session
1. Initialiser Next.js avec `create-next-app`
2. Configurer Prisma + Vercel Postgres
3. Créer la structure de dossiers
4. Implémenter l'authentification (Phase 1)

---

### [2024-12-28] - Phase 6 Admin complète

**Durée** : ~7 heures (sessions cumulées)
**Objectif** : Interface Admin avec CRUD complet (Users, Classes, Subjects)

#### ✅ Réalisé
- API `/api/admin/stats` avec 4 KPIs (users, classes, subjects, courses)
- CRUD Users : API collection + item, UsersTable, UserFormModal, page orchestrator
- CRUD Classes : API collection + item, ClassesTable, ClassFormModal, page orchestrator
- CRUD Subjects : API collection + item, SubjectsTable, SubjectFormModal, page orchestrator
- StatsCard component réutilisable
- Protection ADMIN sur toutes les routes (16 checks)

#### 🤔 Décisions prises
- **Users unifiés** : Un seul endpoint `/api/admin/users` au lieu de teachers/students séparés → Simplifie le CRUD
- **Color mapping côté client** : Subjects n'ont pas de champ `color` en DB → Mapping par nom dans SubjectsTable
- **studentCount dynamique** : Classes retournent `_count.students` via Prisma include

#### 🐛 Problèmes rencontrés
- **Zod `.issues` vs `.errors`** : L'API Zod utilise `.issues` pour les erreurs de validation, pas `.errors` → Corrigé dans toutes les routes
- **Prisma schema mismatch** : `User.name` n'existe pas (c'est `firstName`/`lastName`), `password` est `passwordHash` → Adaptation des types et API
- **Class sans `year`** : Le schéma Prisma n'a pas de champ `year` → Types adaptés avec `studentCount`

#### 📚 Apprentissages Vibecoding
- **IA efficace pour** :
  - Générer patterns CRUD répétitifs (copy/adapt)
  - Créer composants table/modal cohérents
  - Appliquer la protection ADMIN systématiquement
- **Intervention humaine nécessaire pour** :
  - Vérifier concordance Prisma schema vs types
  - Corriger les erreurs d'API Zod
  - Valider les badges/couleurs selon le design system

#### 🔜 Prochaine session
- Phase 7 : Interface Professeur
- Dashboard avec ses classes et cours
- CRUD Cours et Évaluations

---

### [TEMPLATE] - Session suivante

**Durée** : X heures
**Objectif** : ...

#### ✅ Réalisé
- ...

#### 🤔 Décisions prises
- ...

#### 🐛 Problèmes rencontrés
- ...

#### 📚 Apprentissages
- ...

#### 🔜 Prochaine session
- ...

---

## 📊 Métriques globales

| Métrique | Valeur |
| :--- | :--- |
| Sessions de travail | 1 |
| Heures totales | ~3h |
| Lignes de docs | ~2500+ |
| Fichiers créés | 15+ |
| Commits | - |
| Lignes de code | 0 (phase planification) |

---

## 🎯 Objectifs pour l'exposé

### Démontrer
1. **Planification exhaustive** avant le code
2. **Collaboration humain-IA** efficace
3. **Documentation comme source de vérité**
4. **Micro-itérations** contrôlées
5. **Standards appliqués** automatiquement (agents)

### Capturer
- Temps passé en planification vs code
- Interventions humaines vs génération IA
- Problèmes détectés par les agents vs manuellement
- Qualité du code (lint, tests, structure)

---

## 📎 Ressources liées

- [Wireframe](../../../blaizbot-wireframe/README.md)
- [Méthodologie Vibe-Coding](../../../Vibe-Coding/README.md)
- [TODO.md](../TODO.md) (à créer)

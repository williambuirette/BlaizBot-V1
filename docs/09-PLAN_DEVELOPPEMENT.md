# 📅 Plan de Développement - BlaizBot V1

> **Document** : 09/10 - Roadmap et phases de développement
> **Statut** : 🟡 En cours
> **Méthodologie** : Vibecoding (itératif, documenté, AI-assisted)

---

## 🎯 Objectifs du Projet

### Livrable 1 : Application Fonctionnelle
- Application full-stack déployée
- 3 interfaces (Élève, Professeur, Admin)
- Intégration IA (chat, génération, RAG)
- Authentification et gestion des rôles

### Livrable 2 : Documentation Exposé
- Journal de développement (DEVLOG)
- Captures d'écran et métriques
- Démonstration des techniques Vibecoding

---

## 📊 Vue d'Ensemble des Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        TIMELINE PROJET BLAIZBOT V1                          │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 0 ─────► Phase 1 ─────► Phase 2 ─────► Phase 3 ─────► Phase 4
(Actuelle)

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   PLAN   │  │  SETUP   │  │   CORE   │  │   IA     │  │  POLISH  │
│          │  │          │  │          │  │          │  │          │
│ Docs     │  │ Projet   │  │ UI       │  │ Chat     │  │ Tests    │
│ Specs    │  │ Auth     │  │ CRUD     │  │ RAG      │  │ Optim    │
│ Stack    │  │ BDD      │  │ API      │  │ Génér.   │  │ Deploy   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
   ~3 jours      ~3 jours      ~7 jours      ~5 jours      ~3 jours

                         TOTAL ESTIMÉ : ~3 semaines
```

---

## 📋 PHASE 0 : PLANIFICATION (Actuelle)

> **Objectif** : Documenter entièrement avant de coder
> **Durée estimée** : 2-3 jours
> **Statut** : 🟡 En cours

### Checklist

| Tâche | Document | Statut |
|-------|----------|--------|
| Index documentation | 00-INDEX.md | ✅ Fait |
| Stack technologique | 01-STACK_TECHNOLOGIQUE.md | ✅ Fait |
| Architecture globale | 02-ARCHITECTURE_GLOBALE.md | ✅ Fait |
| Cartographie UI | 03-CARTOGRAPHIE_UI.md | ✅ Fait |
| Modèle de données | 04-MODELE_DONNEES.md | ✅ Fait |
| API Endpoints | 05-API_ENDPOINTS.md | ✅ Fait |
| Composants UI | 06-COMPOSANTS_UI.md | 🔴 À faire |
| Fonctionnalités IA | 07-FONCTIONNALITES_IA.md | 🔴 À faire |
| Authentification | 08-AUTHENTIFICATION.md | 🔴 À faire |
| Plan développement | 09-PLAN_DEVELOPPEMENT.md | ✅ Fait |
| DEVLOG | 10-DEVLOG.md | 🔴 À faire |

### Critère de Sortie
- [ ] Tous les documents validés par l'utilisateur
- [ ] Stack technologique confirmé
- [ ] Aucune ambiguïté sur les fonctionnalités

---

## 🚀 PHASE 1 : SETUP PROJET

> **Objectif** : Infrastructure de base opérationnelle
> **Durée estimée** : 2-3 jours
> **Prérequis** : Phase 0 terminée

### Sprint 1.1 : Création Dépôt

| Tâche | Détails |
|-------|---------|
| Créer repo GitHub | `BlaizBot-V1` |
| Init Next.js 15 | `npx create-next-app@latest` |
| Configurer TypeScript | tsconfig.json strict |
| Installer dépendances | Tailwind, shadcn/ui, Prisma, etc. |
| Copier agents IA | Depuis Vibe-Coding/TEMPLATES |

### Sprint 1.2 : Base de Données

| Tâche | Détails |
|-------|---------|
| Créer Vercel Postgres | Nouveau projet |
| Configurer Prisma | schema.prisma complet |
| Première migration | `prisma migrate dev` |
| Seed data | Données de test |

### Sprint 1.3 : Authentification

| Tâche | Détails |
|-------|---------|
| Installer NextAuth v5 | Configuration |
| Page Login | UI + logique |
| Middleware protection | Routes protégées |
| Gestion rôles | ADMIN, TEACHER, STUDENT |

### Critère de Sortie
- [ ] Login fonctionnel
- [ ] Redirection par rôle
- [ ] BDD avec seed data
- [ ] Déploiement Vercel (preview)

---

## 🎨 PHASE 2 : DÉVELOPPEMENT CORE

> **Objectif** : Toutes les pages et fonctionnalités (hors IA)
> **Durée estimée** : 5-7 jours
> **Prérequis** : Phase 1 terminée

### Sprint 2.1 : Layout & Navigation

| Tâche | Interface | Priorité |
|-------|-----------|----------|
| Sidebar component | Toutes | 🔴 Haute |
| Header component | Toutes | 🔴 Haute |
| Navigation routing | Toutes | 🔴 Haute |

### Sprint 2.2 : Interface Admin

| Tâche | Section | Priorité |
|-------|---------|----------|
| CRUD Matières | Matières | 🔴 Haute |
| CRUD Classes | Classes | 🔴 Haute |
| CRUD Professeurs | Professeurs | 🔴 Haute |
| CRUD Élèves | Élèves | 🔴 Haute |
| CRUD Programmes | Programmes | 🟡 Moyenne |
| Statistiques (mock) | Statistiques | 🟢 Basse |
| Gestion Utilisateurs | Utilisateurs | 🟡 Moyenne |
| Paramètres (sans IA) | Settings | 🟢 Basse |

### Sprint 2.3 : Interface Professeur

| Tâche | Section | Priorité |
|-------|---------|----------|
| Dashboard (mock KPIs) | Dashboard | 🔴 Haute |
| Vue Mes Matières | Matières | 🟢 Basse |
| Vue Mes Classes | Classes | 🟡 Moyenne |
| Explorateur Cours | Cours & Contenus | 🔴 Haute |
| Upload fichiers | Cours & Contenus | 🔴 Haute |
| Gestion Attributions | Attributions | 🟡 Moyenne |
| Liste Élèves | Mes Élèves | 🟡 Moyenne |
| Messagerie | Messages | 🟡 Moyenne |
| Calendrier | Planning | 🟢 Basse |

### Sprint 2.4 : Interface Élève

| Tâche | Section | Priorité |
|-------|---------|----------|
| Dashboard progression | Ma Progression | 🔴 Haute |
| Liste cours | Mes Cours | 🔴 Haute |
| Liste exercices | Mes Exercices | 🟡 Moyenne |
| Base connaissances | Base de connaissances | 🟡 Moyenne |
| Messagerie | Centre de Communication | 🟡 Moyenne |
| Calendrier | Planning de Révision | 🟢 Basse |
| Lab (UI sans IA) | Blaiz'bot Lab | 🔴 Haute |
| Assistant (UI sans IA) | Mon Assistant IA | 🔴 Haute |

### Critère de Sortie
- [ ] Toutes les pages navigables
- [ ] CRUD Admin fonctionnel
- [ ] Upload fichiers opérationnel
- [ ] Messagerie temps réel
- [ ] Calendrier avec événements

---

## 🤖 PHASE 3 : INTÉGRATION IA

> **Objectif** : Fonctionnalités d'intelligence artificielle
> **Durée estimée** : 4-5 jours
> **Prérequis** : Phase 2 terminée

### Sprint 3.1 : Configuration IA

| Tâche | Détails |
|-------|---------|
| Page Paramètres IA | Admin settings |
| Stockage sécurisé clés | Encryption |
| Test connexion API | Endpoint test |
| Multi-provider support | OpenAI, Anthropic, etc. |

### Sprint 3.2 : Chat IA Basic

| Tâche | Interface |
|-------|-----------|
| Endpoint chat streaming | /api/ai/chat |
| UI Chat | ChatInterface component |
| Historique conversations | Stockage BDD |

### Sprint 3.3 : RAG (Retrieval)

| Tâche | Détails |
|-------|---------|
| Extraction texte PDF | pdf-parse |
| Génération embeddings | OpenAI Embeddings |
| Stockage pgvector | Vercel Postgres |
| Recherche similarité | Query pgvector |
| Context injection | Prompt augmentation |

### Sprint 3.4 : Génération Contenu

| Tâche | Endpoint |
|-------|----------|
| Génération Quiz | /api/ai/generate/quiz |
| Génération Résumé | /api/ai/generate/summary |
| Génération Flashcards | /api/ai/generate/flashcards |
| Génération Mind Map | /api/ai/generate/mindmap |

### Sprint 3.5 : Assistant Pédagogique

| Tâche | Interface |
|-------|-----------|
| Recommandations Prof | Dashboard teacher |
| Alertes IA | Dashboard teacher |
| Analyse progression | Analytics |

### Critère de Sortie
- [ ] Chat IA avec contexte fonctionnel
- [ ] Génération de quiz/résumés
- [ ] RAG sur les documents uploadés
- [ ] Dashboard prof avec recommandations IA

---

## ✨ PHASE 4 : POLISH & DÉPLOIEMENT

> **Objectif** : Production-ready
> **Durée estimée** : 2-3 jours
> **Prérequis** : Phase 3 terminée

### Sprint 4.1 : Tests & QA

| Tâche | Type |
|-------|------|
| Tests unitaires | Jest/Vitest |
| Tests E2E | Playwright |
| Tests manuels | Parcours utilisateur |
| Fix bugs | Debug |

### Sprint 4.2 : Optimisation

| Tâche | Détails |
|-------|---------|
| Performance | Lazy loading, caching |
| SEO | Meta tags, sitemap |
| Accessibilité | ARIA, keyboard nav |
| Mobile responsive | Media queries |

### Sprint 4.3 : Déploiement Final

| Tâche | Détails |
|-------|---------|
| Env production | Variables Vercel |
| Migration BDD prod | Vercel Postgres production |
| DNS custom (optionnel) | Domain |
| Monitoring | Logs, analytics |

### Sprint 4.4 : Documentation Exposé

| Tâche | Détails |
|-------|---------|
| Compiler DEVLOG | Journal complet |
| Screenshots finaux | Captures d'écran |
| Métriques comparées | Wireframe vs App |
| Slides présentation | Support exposé |

### Critère de Sortie
- [ ] Application déployée en production
- [ ] Documentation complète
- [ ] Métriques documentées
- [ ] Présentation prête

---

## 📊 Estimation Globale

| Phase | Durée | Effort |
|-------|-------|--------|
| Phase 0 : Plan | 2-3 jours | Documentation |
| Phase 1 : Setup | 2-3 jours | Configuration |
| Phase 2 : Core | 5-7 jours | Développement intensif |
| Phase 3 : IA | 4-5 jours | Intégration complexe |
| Phase 4 : Polish | 2-3 jours | Finalisation |
| **TOTAL** | **15-21 jours** | **~3 semaines** |

---

## 🚦 Indicateurs de Suivi

### Par Phase
- ✅ Terminé
- 🟡 En cours
- 🔴 Non démarré
- ⚠️ Bloqué

### Métriques à Capturer (pour l'exposé)
- Temps par fonctionnalité
- Lignes de code générées vs écrites
- Nombre d'itérations avec l'IA
- Problèmes rencontrés et solutions

---

## ✅ Prochaine Action

**Valider ce plan** puis :
1. Compléter les documents restants (06, 07, 08, 10)
2. Valider le stack technologique
3. Créer le dépôt GitHub `BlaizBot-V1`
4. Démarrer la Phase 1

# 🛠️ Stack Technologique - BlaizBot V1

> **Document** : 01/10 - Choix des technologies
> **Statut** : 🟡 En cours de validation
> **Dernière mise à jour** : 22 décembre 2025

---

## 🎯 Critères de Sélection

Le stack doit respecter les principes **Vibecoding** :
1. **AI-Readable** : Code clair et modulaire pour l'assistance IA
2. **Feedback rapide** : Hot reload, pas de build complexe
3. **Full-Stack cohérent** : Même langage front/back si possible
4. **Production-Ready** : Pas un jouet, une vraie application

---

## 🖥️ FRONTEND

### Framework Principal
| Option | Avantages | Inconvénients | Recommandation |
|--------|-----------|---------------|----------------|
| **Next.js 15** (React) | SSR, API Routes intégrées, écosystème riche | Complexité initiale | ⭐ **RECOMMANDÉ** |
| Vue 3 + Nuxt | Syntaxe simple, progression douce | Moins de libs IA | ✅ Alternatif |
| Vanilla JS (comme wireframe) | Simple, pas de build | Maintenance difficile | ❌ Non adapté |

**Choix proposé : Next.js 15 (App Router)**
- TypeScript pour le typage
- Server Components pour les performances
- API Routes pour le backend léger

### UI & Styling
| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| CSS Framework | **Tailwind CSS** | Rapide, design system intégré |
| Composants | **shadcn/ui** | Composants accessibles, customisables |
| Icônes | **Lucide React** | Cohérent avec shadcn |
| Animations | **Framer Motion** | UX fluide |

### État & Données
| Besoin | Technologie |
|--------|-------------|
| État global | **Zustand** (léger) ou Context API |
| Fetching | **TanStack Query** (React Query) |
| Formulaires | **React Hook Form + Zod** |

---

## 🔧 BACKEND

### Option A : Backend Intégré (Next.js API Routes)
```
/app
  /api
    /auth/[...nextauth]/route.ts
    /users/route.ts
    /courses/route.ts
    /ai/chat/route.ts
```
✅ **Recommandé pour démarrer** : Pas de serveur séparé

### Option B : Backend Séparé (pour scalabilité future)
| Option | Langage | Avantages |
|--------|---------|-----------|
| **Fastify** | Node.js/TS | Ultra rapide, plugins |
| Express | Node.js | Classique, docs abondantes |
| FastAPI | Python | Excellent pour IA/ML |

**Recommandation** : Commencer avec Next.js API Routes, migrer si besoin.

---

## 🗄️ BASE DE DONNÉES

### Choix Principal
| Option | Type | Avantages | Hébergement |
|--------|------|-----------|-------------|
| **PostgreSQL** | Relationnel | Robuste, relations complexes | Vercel, Neon, Railway |
| MongoDB | Document | Flexible, schéma libre | MongoDB Atlas |
| SQLite | Fichier | Simple pour dev local | Local |

**Choix proposé : PostgreSQL via Vercel Postgres**
- Intégration native avec Vercel (même dashboard)
- Powered by Neon (serverless PostgreSQL)
- Auto-configuration des variables d'environnement
- Plan gratuit : 256 MB storage, 60h compute/mois

### ORM
| Option | Avantages |
|--------|-----------|
| **Prisma** | Type-safe, migrations, studio | ⭐ **RECOMMANDÉ** |
| Drizzle | Plus léger, SQL-like |

---

## 🤖 INTÉGRATIONS IA

### LLM Provider
| Service | Usage | Coût |
|---------|-------|------|
| **OpenAI API** | Chat, génération, embeddings | Pay-per-use |
| Anthropic Claude | Alternative, plus sûr | Pay-per-use |
| Ollama (local) | Dev, tests gratuits | Gratuit |

### SDK & Outils
| Outil | Usage |
|-------|-------|
| **Vercel AI SDK** | Streaming, chat UI, multi-provider |
| LangChain.js | RAG, chaînes complexes |
| OpenAI Embeddings | Recherche sémantique documents |

### Stockage Vectoriel (pour RAG)
| Option | Intégration |
|--------|-------------|
| **pgvector** | Extension PostgreSQL (Vercel Postgres compatible) |
| Pinecone | Service dédié (si besoin scalabilité) |

---

## 🔐 AUTHENTIFICATION

| Option | Fonctionnalités |
|--------|-----------------|
| **NextAuth.js v5** | Multi-provider, sessions, JWT | ⭐ **RECOMMANDÉ** |
| Clerk | UX premium, payant |

### Rôles Prévus
```typescript
enum Role {
  ADMIN = 'admin',
  TEACHER = 'teacher', 
  STUDENT = 'student',
  PARENT = 'parent'
}
```

---

## 📦 HÉBERGEMENT & DÉPLOIEMENT

| Service | Usage | Gratuit? |
|---------|-------|----------|
| **Vercel** | Frontend Next.js + Postgres | Oui (hobby) |
| **Vercel Postgres** | BDD PostgreSQL (Neon) | Oui (256MB) |
| **Vercel Blob** | Storage fichiers (si besoin) | Oui (1GB) |
| GitHub Actions | CI/CD | Oui |

### Coût Total : 0 CHF 💰

---

## 📁 Structure de Projet Proposée

```
blaizbot-v1/
├── .github/
│   ├── agents/              # Agents IA (copié de Vibe-Coding)
│   └── workflows/           # CI/CD
├── docs/
│   └── PLAN_TECHNIQUE/      # Cette documentation
├── prisma/
│   └── schema.prisma        # Modèle BDD
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/          # Routes authentification
│   │   ├── (dashboard)/     # Routes protégées
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   └── admin/
│   │   └── api/             # API Routes
│   ├── components/          # Composants React
│   │   ├── ui/              # shadcn/ui
│   │   └── features/        # Composants métier
│   ├── lib/                 # Utilitaires
│   ├── hooks/               # Custom hooks
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript types
├── public/
├── .env.local
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ✅ Validation Requise

Avant de passer au document suivant, confirme :

- [ ] **Frontend** : Next.js 15 + TypeScript + Tailwind + shadcn/ui
- [ ] **Backend** : Next.js API Routes (ou autre?)
- [ ] **BDD** : Vercel Postgres + Prisma
- [ ] **Auth** : NextAuth.js v5
- [ ] **IA** : Vercel AI SDK + OpenAI/Claude/Gemini
- [ ] **Hébergement** : Vercel (tout-en-un)

---

**Questions pour validation** :
1. Ce stack te convient-il ou préfères-tu des alternatives ?
2. As-tu des contraintes (budget, hébergement spécifique) ?
3. Souhaites-tu un backend séparé (Python/FastAPI) pour plus de contrôle IA ?

# BlaizBot V1 🎓

> **Application éducative full-stack** avec IA intégrée (chat, RAG, génération)

## 🚀 Quick Start

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Remplir DATABASE_URL, AUTH_SECRET, etc.

# 3. Initialiser la BDD
npx prisma migrate dev

# 4. Lancer le serveur
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📊 Progression

```
Phase 1-6  ✅ Terminées (Init, Layout, Slice, DB, Auth, Admin)
Phase 7    🔴 En cours (Interface Professeur)
Phase 8-10 ⬜ À faire (Élève, IA, Démo)
```

## 🛠️ Stack Technique

| Catégorie | Technologies |
|:----------|:-------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **UI** | shadcn/ui, Lucide Icons |
| **Backend** | Next.js API Routes, Prisma ORM |
| **BDD** | PostgreSQL (Vercel Postgres) |
| **Auth** | NextAuth.js v5 (Auth.js) |
| **IA** | OpenAI, Claude, Gemini (à venir) |

## 📁 Structure

```
src/
├── app/
│   ├── (auth)/          # Pages publiques (login)
│   ├── (dashboard)/     # Pages protégées (student, teacher, admin)
│   └── api/             # Routes API REST
├── components/
│   ├── ui/              # shadcn/ui
│   ├── layout/          # Sidebar, Header
│   └── features/        # Composants métier
├── lib/                 # Prisma, Auth, utils
└── types/               # Types TypeScript
```

## 📚 Documentation

| Document | Description |
|:---------|:------------|
| [docs/00-INDEX.md](docs/00-INDEX.md) | Plan technique complet |
| [todo/INDEX.md](todo/INDEX.md) | Progression et tâches |
| [AGENTS.md](AGENTS.md) | Règles pour l'IA |

## 🔐 Comptes de Test

| Rôle | Email | Password |
|:-----|:------|:---------|
| Admin | admin@blaizbot.com | admin123 |
| Prof | prof@blaizbot.com | prof123 |
| Élève | eleve@blaizbot.com | eleve123 |

## 📝 Scripts

```bash
npm run dev      # Serveur dev
npm run build    # Build production
npm run lint     # ESLint
npm run db:push  # Sync Prisma schema
npm run db:seed  # Seed données test
```

## 📄 License

MIT © 2025 BlaizBot


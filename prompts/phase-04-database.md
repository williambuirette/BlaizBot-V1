# Phase 4 - Base de Données

> **Objectif** : Données persistantes et reproductibles  
> **Fichiers TODO** : `phase-04-database.md`, `phase-04-database-suite.md`  
> **Fichiers code** : `phase-04-code.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 4.1 — Créer Neon Database via Vercel

### Prompt 4.1.1 — Création Database (Manuel)

```
⚠️ IMPORTANT : En 2025, Vercel Postgres utilise des providers externes (Neon, Supabase...)

Actions manuelles :
1. https://vercel.com/dashboard → Storage
2. Browse Marketplace → Neon (PostgreSQL serverless)
3. Accept Terms → Continue
4. Create Database :
   - Nom : blaizbot-db
   - Region : US-East-1 (ou la plus proche)
   - Plan : Free tier
5. Une fois créé, récupérer les credentials dans l'onglet "Quickstart"
```

### Prompt 4.1.2 — .env.local et .env

```
⚠️ Prisma 6 lit .env automatiquement (pas .env.local)

Créer .env.local ET .env avec :

# Pooled connection (pour les requêtes normales)
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/neondb?sslmode=require"

# Direct connection (pour les migrations Prisma)
DIRECT_URL="postgresql://USER:PASSWORD@HOST.REGION.aws.neon.tech/neondb?sslmode=require"

⚠️ Différence clé :
- DATABASE_URL : contient "-pooler" dans le host
- DIRECT_URL : host direct (sans "-pooler")

Vérifier .gitignore contient : .env*
```

---

## 📋 Étape 4.2 — Configurer Prisma

### Prompt 4.2.1 — Installation

```
⚠️ UTILISER PRISMA 6 (pas Prisma 7 qui a des breaking changes)

npm install prisma@6 @prisma/client@6

Si dossier prisma/ existe déjà, ne pas faire `npx prisma init`
```

### Prompt 4.2.2 — schema.prisma datasource

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Prompt 4.2.3 — Singleton Prisma

```typescript
// src/lib/prisma.ts (< 20 lignes)

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : []
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

---

## 📋 Étape 4.3 — Définir les modèles

### Prompt 4.3.1 — Schema complet

```
Consulter docs/04-MODELE_DONNEES.md pour le schéma complet.

22 modèles à créer :
- User, TeacherProfile, StudentProfile (auth)
- Subject, Class (organisation)
- Course, CourseFile, Exercise (contenu)
- Assignment, Grade, Progression (suivi)
- LabProject, LabSource (lab élève)
- KnowledgeBase (RAG)
- Conversation, Message (messagerie)
- CalendarEvent (calendrier)
- AISettings, AIChat (IA)

9 enums : Role, AssignmentTargetType, AssignmentStatus, 
LabSourceType, KnowledgeOwnerType, ConversationType,
AIProvider, AIRestrictionLevel

Valider : npx prisma validate
```

---

## 📋 Étape 4.4 — Migrer et Seed

### Prompt 4.4.1 — Migration

```bash
npx prisma migrate dev --name init

# Vérifie que DIRECT_URL est bien configuré (connexion directe, pas pooled)
# En cas d'erreur connexion : vérifier les URLs dans .env
```

### Prompt 4.4.2 — Seed complet

```bash
# Installer les dépendances
npm install bcryptjs
npm install -D @types/bcryptjs tsx

# Configurer package.json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}

# Exécuter
npm run db:seed
```

### Prompt 4.4.3 — Données de seed

```
Créer prisma/seed.ts avec :

UTILISATEURS (8 total) :
- 1 Admin : admin@blaizbot.edu / admin123
- 2 Profs : m.dupont@blaizbot.edu, s.bernard@blaizbot.edu / prof123
- 5 Élèves : lucas.martin, emma.durand, noah.petit, lea.moreau, hugo.robert / eleve123

ORGANISATION :
- 6 Matières : Maths, Français, Histoire-Géo, SVT, Physique-Chimie, Anglais
- 3 Classes : 3ème A, 3ème B, 4ème A

COURS (6 total) :
- M. Dupont : Les Fractions, Équations 1er degré, La Photosynthèse
- Mme Bernard : La Révolution Française, L'Empire Napoléonien, L'argumentation

Utiliser upsert pour idempotence (relançable sans erreur).
Passwords hashés avec bcrypt (12 rounds).
```

---

## 📋 Étape 4.5 — Connexion VS Code ↔ Vercel

### Prompt 4.5.1 — Lier le projet local

```bash
# Déconnecter si mauvais compte
npx vercel logout

# Se reconnecter (ouvre navigateur)
npx vercel login

# Lier au projet Vercel existant
npx vercel link

# Synchroniser les variables d'environnement
npx vercel env pull .env.local
```

---

## 📊 Validation Finale Phase 4

```
Checklist :
1. npx prisma validate → "schema is valid"
2. npx prisma migrate dev --name init → migration appliquée
3. npm run db:seed → 8 users, 3 classes, 6 subjects, 6 courses
4. npm run db:studio → données visibles sur localhost:5555
5. npm run build → OK
6. npx vercel ls → déploiement Ready
7. .env et .env.local non commités (vérifier git status)
```

---

## 📖 Journal des Itérations (23.12.2025)

| Étape | Durée | Itérations | Problème | Solution |
|-------|-------|------------|----------|----------|
| 4.1 | 30min | 1 | Vercel UI changée (Marketplace) | Utiliser Neon via Marketplace |
| 4.2 | 45min | 3 | Prisma 7 breaking changes | Downgrade vers Prisma 6 |
| 4.3 | 20min | 1 | Dossier prisma/ existait | Ne pas faire `prisma init` |
| 4.4 | 30min | 2 | Seed incomplet | Ajouter 2 élèves + 4 cours |
| 4.5 | 15min | 2 | Mauvais compte Vercel | Logout + login correct |

**Total** : ~2h30 (vs 4h estimées)

### Prompts Optimaux Identifiés

**Problème Prisma 7** :
> Prisma 7 a cassé la rétrocompatibilité. Utiliser `npm install prisma@6 @prisma/client@6` pour éviter les problèmes de configuration.

**Problème .env** :
> Prisma CLI ne lit pas `.env.local`, seulement `.env`. Créer les deux fichiers avec les mêmes variables, ou utiliser `dotenv-cli`.

**Problème Vercel Marketplace** :
> En 2025, Vercel Postgres n'est plus natif. Aller dans Storage → Browse Marketplace → Neon.

---

*Dernière mise à jour : 23.12.2025*

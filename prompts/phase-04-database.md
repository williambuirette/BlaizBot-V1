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
⚠️ IMPORTANT : En 2025, Vercel Postgres utilise des providers externes (Neon)

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

---

## 🎯 PROMPTS OPTIMAUX (Post-Mortem)

> Format selon AGENTS.md : le prompt qu'il AURAIT FALLU écrire pour réussir du premier coup.

---

### Prompt Optimal 4.1 — Database Neon

> **Itérations réelles** : 1  
> **Problèmes rencontrés** : UI Vercel a changé, Postgres n'est plus natif

```
Créer une base PostgreSQL pour BlaizBot via Vercel Marketplace :

1. Dashboard Vercel → Storage → Browse Marketplace
2. Sélectionner "Neon" (PostgreSQL serverless) ⚠️ PAS "Vercel Postgres" qui n'existe plus
3. Accept Terms → Continue → Create Database
   - Nom : blaizbot-db
   - Region : US-East-1
   - Plan : Free tier

4. Récupérer dans l'onglet Quickstart :
   - DATABASE_URL (avec "-pooler" dans le host)
   - DIRECT_URL (host direct sans "-pooler")

5. Créer .env ET .env.local avec ces 2 variables
   ⚠️ Prisma CLI lit .env (pas .env.local)

6. Vérifier .gitignore contient : .env*
```

**Différences clés vs prompt original** :
- Préciser que Vercel Postgres → Neon via Marketplace
- Insister sur la différence pooled vs direct URL
- Mentionner que Prisma lit .env (pas .env.local)

---

### Prompt Optimal 4.2 — Prisma Setup

> **Itérations réelles** : 3  
> **Problèmes rencontrés** : Prisma 7 breaking changes, dossier existant

```
Configurer Prisma 6 pour le projet :

⚠️ UTILISER PRISMA 6, PAS PRISMA 7 (breaking changes en décembre 2024)

1. npm install prisma@6 @prisma/client@6

2. SI dossier prisma/ existe déjà → NE PAS faire `npx prisma init`
   SI dossier n'existe pas → npx prisma init

3. Configurer prisma/schema.prisma datasource :
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")  // Important pour Neon
   }

4. Créer src/lib/prisma.ts (singleton pattern, < 20 lignes)
   - Import PrismaClient
   - Cache sur globalThis pour éviter connexions multiples en dev
   - Log queries en dev seulement

5. Valider : npx prisma validate
```

**Différences clés vs prompt original** :
- ⚠️ Expliciter "Prisma 6" avec numéro de version exact
- Vérifier existence dossier prisma/ avant init
- Mentionner directUrl obligatoire pour Neon

---

### Prompt Optimal 4.3 — Schema Prisma

> **Itérations réelles** : 1  
> **Problèmes rencontrés** : Aucun (bien documenté)

```
Créer le schema Prisma complet selon docs/04-MODELE_DONNEES.md :

ENUMS (9) :
- Role : ADMIN | TEACHER | STUDENT
- AssignmentTargetType, AssignmentStatus, LabSourceType
- KnowledgeOwnerType, ConversationType
- AIProvider, AIRestrictionLevel

MODÈLES (22) :
Auth : User, TeacherProfile, StudentProfile
Organisation : Subject, Class, ClassStudent
Contenu : Course, CourseFile, Exercise
Suivi : Assignment, Grade, Progression
Lab : LabProject, LabSource
RAG : KnowledgeBase
Messagerie : Conversation, ConversationParticipant, Message
Calendrier : CalendarEvent
IA : AISettings, AIChat

Relations clés :
- User 1↔1 TeacherProfile | StudentProfile (selon role)
- Teacher M↔N Subject
- Course → Teacher + Subject
- Grade → Student + Assignment

Valider : npx prisma validate → "schema is valid"
```

**Différences clés vs prompt original** :
- Lister explicitement les 9 enums
- Lister les 22 modèles par catégorie
- Mentionner les relations clés

---

### Prompt Optimal 4.4 — Migration et Seed

> **Itérations réelles** : 2  
> **Problèmes rencontrés** : Seed incomplet (6 users → 8, 2 courses → 6)

```
Migrer et seeder la base de données :

MIGRATION :
npx prisma migrate dev --name init
⚠️ Nécessite DIRECT_URL (pas pooled) pour les migrations

SEED - Dépendances :
npm install bcryptjs
npm install -D @types/bcryptjs tsx

SEED - package.json :
{
  "prisma": { "seed": "tsx prisma/seed.ts" },
  "scripts": {
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force"
  }
}

SEED - Données (COMPLET) :
- 8 Users :
  • 1 Admin : admin@blaizbot.edu / admin123
  • 2 Teachers : m.dupont@blaizbot.edu, s.bernard@blaizbot.edu / prof123
  • 5 Students : lucas.martin, emma.durand, noah.petit, lea.moreau, hugo.robert / eleve123

- 6 Subjects : Maths, Français, Histoire-Géo, SVT, Physique-Chimie, Anglais

- 3 Classes : 3ème A, 3ème B, 4ème A

- 6 Courses :
  • M. Dupont : Les Fractions, Équations 1er degré, La Photosynthèse
  • Mme Bernard : La Révolution Française, L'Empire Napoléonien, L'argumentation

TECHNIQUE :
- Utiliser upsert (idempotent, relançable)
- bcrypt.hashSync(password, 12)
- < 350 lignes

Valider : npm run db:seed → logs montrent 8 users, 6 subjects, 3 classes, 6 courses
```

**Différences clés vs prompt original** :
- Spécifier EXACTEMENT 8 users, 5 students (pas 3)
- Spécifier EXACTEMENT 6 courses (pas 2)
- Mentionner le script db:reset utile pour debug
- Préciser "upsert" pour idempotence

---

### Prompt Optimal 4.5 — Vercel Link

> **Itérations réelles** : 2  
> **Problèmes rencontrés** : Connecté au mauvais compte Vercel

```
Lier VS Code au projet Vercel :

1. Vérifier le compte actuel :
   npx vercel whoami
   → Doit afficher TON compte, pas celui d'un client

2. Si mauvais compte :
   npx vercel logout
   npx vercel login  // Ouvre navigateur, se connecter au bon compte

3. Lier le projet :
   npx vercel link
   → Sélectionner le projet existant "blaiz-bot-v1"

4. Synchroniser les variables :
   npx vercel env pull .env.local
   → Récupère DATABASE_URL, DIRECT_URL depuis Vercel

5. Vérifier :
   npx vercel ls
   → Doit montrer le déploiement "Ready"

⚠️ Si plusieurs comptes Vercel, toujours vérifier `whoami` d'abord
```

**Différences clés vs prompt original** :
- Commencer par `whoami` pour vérifier le compte
- Étape logout explicite si mauvais compte
- Préciser que `env pull` récupère les vars depuis Vercel

---

## 📝 Leçons Apprises (Capitalisation)

| Problème | Impact | Solution Pérenne |
|----------|--------|------------------|
| Prisma 7 breaking changes | 45 min perdues | Toujours vérifier changelog avant `npm install` sans version |
| .env vs .env.local | Confusion, erreurs connexion | Créer les 2 fichiers identiques |
| Vercel UI changée | Documentation obsolète | Vérifier l'UI actuelle, ne pas suivre aveuglément les tutos |
| Seed incomplet | Données manquantes pour tests | Toujours relire les specs (TODO) avant de coder |
| Multi-comptes Vercel | Déploiement sur mauvais projet | `whoami` systématique avant `link` |

---

*Dernière mise à jour : 23.12.2025*

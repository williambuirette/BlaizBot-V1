# Phase 4 - Base de Données

> **Objectif** : Données persistantes et reproductibles  
> **Fichiers TODO** : `phase-04-database.md`, `phase-04-database-suite.md`  
> **Fichiers code** : `phase-04-code.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 4.1 — Créer Vercel Postgres

### Prompt 4.1.1 — Création Database (Manuel)

```
Actions manuelles :
1. https://vercel.com/dashboard → Storage
2. Create Database → Postgres
3. Nom : blaizbot-db
4. Plan : Hobby (gratuit)
5. Région : fra1 (Frankfurt)
6. Connect to Project → sélectionner BlaizBot
```

### Prompt 4.1.2 — .env.local

```
Dans le dashboard Vercel Postgres :
1. Onglet ".env.local"
2. Cliquer "Show secret" puis "Copy Snippet"
3. Coller dans `.env.local` à la racine

Les variables auto-générées :
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://...?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="default"
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="verceldb"

Ajouter les alias Prisma :
DATABASE_URL="${POSTGRES_PRISMA_URL}"
DIRECT_URL="${POSTGRES_URL_NON_POOLING}"

NE JAMAIS committer ce fichier.
```

---

## 📋 Étape 4.2 — Configurer Prisma

### Prompt 4.2.1 — Installation

```
npm install prisma @prisma/client
npx prisma init
```

### Prompt 4.2.2 — Singleton Prisma

```
Créer `src/lib/prisma.ts` :

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 📋 Étape 4.3 — Définir les modèles

### Prompt 4.3.1 — Schema complet

```
Dans prisma/schema.prisma, ajouter :

1. enum Role { ADMIN, TEACHER, STUDENT }

2. model User (id, email, password, name, role, relations)

3. model Class (id, name, level, year, enrollments)

4. model Subject (id, name, color, courses)

5. model Enrollment (userId, classId - N:N)

6. model TeacherAssignment (userId, classId, subjectId)

7. model Course (title, teacherId, subjectId, chapters)

8. model Chapter (title, content, order, courseId)

9. model Message (content, senderId, receiverId, read)

Valider : npx prisma validate
```

---

## 📋 Étape 4.4 — Migrer et Seed

### Prompt 4.4.1 — Migration

```
npx prisma migrate dev --name init
```

### Prompt 4.4.2 — Seed

```
Créer prisma/seed.ts avec :
- 1 Admin (admin@blaizbot.fr)
- 2 Teachers
- 3 Students
- 2 Classes
- 3 Subjects
- Enrollments + TeacherAssignments

Passwords hashés avec bcrypt.
Utiliser upsert pour idempotence.

npm install bcryptjs @types/bcryptjs ts-node -D
npx prisma db seed
```

---

## 📊 Validation Finale Phase 4

```
Checklist :
1. Tables visibles dans Vercel Dashboard (Storage → Postgres → Data Browser)
2. .env.local non commité
3. npx prisma validate → OK
4. npx prisma db seed → 6 users créés
5. npm run build → OK
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 4.1 | | | | |
| 4.2 | | | | |
| 4.3 | | | | |
| 4.4 | | | | |

---

*Dernière mise à jour : 2025-01-13*

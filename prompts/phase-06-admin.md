# Phase 6 - Interface Admin

> **Objectif** : L'Admin peut gérer toutes les données (CRUD complet)  
> **Fichiers TODO** : `phase-06-admin.md`, `phase-06-admin-suite.md`  
> **Fichiers code** : `phase-06-code.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 6.1 — Dashboard Admin avec KPIs

### Prompt 6.1.1 — API Stats

```
Créer `src/app/api/admin/stats/route.ts` :

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [users, classes, subjects, courses] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.course.count(),
  ]);

  return Response.json({ users, classes, subjects, courses });
}
```

### Prompt 6.1.2 — StatsCard Component

```
Créer `src/components/features/admin/StatsCard.tsx` :

Props : { title: string, value: number, icon: LucideIcon, color?: string }

Card shadcn avec icône colorée + valeur + label.
< 50 lignes.
```

### Prompt 6.1.3 — Dashboard Page

```
Modifier `src/app/(dashboard)/admin/page.tsx` :

- Fetch /api/admin/stats (Server Component)
- Afficher 4 StatsCards en grid
- Icônes : Users, GraduationCap, BookOpen, FileText
```

---

## 📋 Étape 6.2 — CRUD Utilisateurs

### Prompt 6.2.1 — API Users Collection

```
Créer `src/app/api/admin/users/route.ts` :

GET : Liste tous les users (sans password)
POST : Créer un user (hasher le password)

Valider avec Zod si possible.
```

### Prompt 6.2.2 — API Users Item

```
Créer `src/app/api/admin/users/[id]/route.ts` :

GET : Un user par ID
PUT : Modifier un user
DELETE : Supprimer un user
```

### Prompt 6.2.3 — UsersTable Component

```
Créer `src/components/features/admin/UsersTable.tsx` :

- DataTable avec colonnes : Nom, Email, Rôle, Actions
- Actions : Edit, Delete
- Installer Table si nécessaire : npx shadcn@latest add table

< 200 lignes.
```

### Prompt 6.2.4 — UserFormModal

```
Créer `src/components/features/admin/UserFormModal.tsx` :

- Dialog shadcn avec formulaire
- Champs : name, email, password, role (select)
- Mode create / edit
- Validation basique

npx shadcn@latest add dialog select
< 150 lignes.
```

### Prompt 6.2.5 — Page Users

```
Créer `src/app/(dashboard)/admin/users/page.tsx` :

- Fetch users
- UsersTable
- Bouton "Ajouter" qui ouvre UserFormModal
- Refresh après CRUD

< 100 lignes (orchestrateur).
```

---

## 📋 Étape 6.3 — CRUD Classes

### Prompt 6.3.1 — API Classes

```
Créer `src/app/api/admin/classes/route.ts` :
GET, POST

Créer `src/app/api/admin/classes/[id]/route.ts` :
GET, PUT, DELETE
```

### Prompt 6.3.2 — ClassesTable + ClassFormModal

```
Pattern identique à Users :
- ClassesTable.tsx (< 150 lignes)
- ClassFormModal.tsx (< 100 lignes)
- Champs : name, level, year
```

---

## 📋 Étape 6.4 — CRUD Matières

### Prompt 6.4.1 — API Subjects

```
Même pattern :
- /api/admin/subjects (GET, POST)
- /api/admin/subjects/[id] (GET, PUT, DELETE)
```

### Prompt 6.4.2 — SubjectsTable + SubjectFormModal

```
- Champs : name, color (color picker optionnel)
- Afficher pastille de couleur dans la table
```

---

## 📊 Validation Finale Phase 6

```
Checklist :
1. Dashboard affiche les 4 KPIs corrects
2. CRUD Users : Create, Read, Update, Delete OK
3. CRUD Classes : idem
4. CRUD Subjects : idem
5. Toutes les API protégées (role ADMIN only)
6. npm run lint → 0 erreur
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 6.1 | | | | |
| 6.2 | | | | |
| 6.3 | | | | |
| 6.4 | | | | |

---

*Dernière mise à jour : 2025-01-13*

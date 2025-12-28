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
1. Dashboard affiche les 4 KPIs corrects ✅
2. CRUD Users : Create, Read, Update, Delete OK ✅
3. CRUD Classes : idem ✅
4. CRUD Subjects : idem ✅
5. Toutes les API protégées (role ADMIN only) ✅ (16 checks)
6. npm run lint → 0 erreur ✅
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 6.1 | 27.12.2025 | 1h | 2 | Voir ci-dessous |
| 6.2 | 27.12.2025 | 2h | 4 | Voir ci-dessous |
| 6.3 | 28.12.2025 | 1h | 2 | Voir ci-dessous |
| 6.4 | 28.12.2025 | 1h | 2 | Voir ci-dessous |
| Audit | 28.12.2025 | 1h | 3 | Bug firstName/lastName |

---

## 🔄 Rétro-Prompts Phase 6

### Prompt Optimal 6.1 — Dashboard KPIs

> **Itérations réelles** : 2 (idéal = 1)
> **Problèmes rencontrés** : Aucun majeur

```
Créer l'API stats et le composant StatsCard pour le dashboard admin.

API `src/app/api/admin/stats/route.ts` :
- Protection ADMIN obligatoire (session?.user?.role !== 'ADMIN')
- Prisma count sur User, Class, Subject, Course en Promise.all
- Retourner { users, classes, subjects, courses }

Composant `src/components/features/admin/StatsCard.tsx` :
- Props: { title: string, value: number, icon: LucideIcon, iconColor?: string }
- Card shadcn avec icône + valeur + titre
- < 50 lignes

Page `src/app/(dashboard)/admin/page.tsx` :
- Server Component avec fetch direct Prisma (pas d'API call)
- Grid 4 colonnes avec StatsCards
- Icônes: Users, GraduationCap, BookOpen, FileText
```

**Différences clés vs prompt original** :
- Préciser Server Component vs Client Component
- Mentionner la protection ADMIN explicitement

---

### Prompt Optimal 6.2 — CRUD Users

> **Itérations réelles** : 4 (idéal = 1)
> **Problèmes rencontrés** : Mismatch Prisma schema (name vs firstName/lastName)

```
IMPORTANT: Le schéma Prisma utilise firstName + lastName (pas name).
IMPORTANT: Le champ password s'appelle passwordHash dans Prisma.

API Users Collection `src/app/api/admin/users/route.ts` :
- GET: Liste users avec select { id, email, firstName, lastName, role, createdAt }
- POST: Validation Zod avec { email, firstName, lastName, password, role }
- Hasher password avec bcrypt → passwordHash
- Vérifier unicité email avant création

API Users Item `src/app/api/admin/users/[id]/route.ts` :
- GET, PUT, DELETE avec protection ADMIN
- PUT: Validation Zod optionnelle sur tous les champs
- Si password fourni → hasher en passwordHash
- DELETE: Empêcher suppression du dernier admin et auto-suppression

Types `src/types/admin.ts` :
interface UserRow {
  id: string;
  email: string;
  firstName: string;  // PAS name !
  lastName: string;   // PAS name !
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: Date | string;
}

Hook `src/hooks/admin/useUserForm.ts` :
- États: firstName, lastName (PAS name)
- Payload envoyé: { firstName, lastName, email, password, role }

Composants :
- UserFormModal: 2 inputs (Prénom + Nom) en grid
- UsersTable: Afficher `${user.firstName} ${user.lastName}`
```

**Différences clés vs prompt original** :
- ⚠️ CRITIQUE: Préciser firstName/lastName au lieu de name
- ⚠️ CRITIQUE: Préciser passwordHash au lieu de password
- Mentionner les validations de sécurité (dernier admin, auto-suppression)

---

### Prompt Optimal 6.3 — CRUD Classes

> **Itérations réelles** : 2 (idéal = 1)
> **Problèmes rencontrés** : Pas de champ `year` dans Prisma

```
IMPORTANT: Le schéma Prisma Class n'a PAS de champ year.
Champs disponibles: id, name, level, createdAt, updatedAt

API Classes `src/app/api/admin/classes/route.ts` + `[id]/route.ts` :
- GET liste: Inclure _count.students pour afficher studentCount
- POST/PUT: Validation { name: string, level: string }
- DELETE: Bloquer si students.length > 0

Types:
interface ClassRow {
  id: string;
  name: string;
  level: string;
  studentCount: number;  // PAS year !
  createdAt: Date | string;
}

Composants:
- ClassesTable: Colonnes Nom, Niveau (badge), Élèves, Actions
- ClassFormModal: 2 champs (name + level select)
- LEVELS = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']
```

**Différences clés vs prompt original** :
- ⚠️ Supprimer year du prompt (n'existe pas dans Prisma)
- Ajouter studentCount via _count.students

---

### Prompt Optimal 6.4 — CRUD Subjects

> **Itérations réelles** : 2 (idéal = 1)
> **Problèmes rencontrés** : Pas de champ `color` dans Prisma

```
IMPORTANT: Le schéma Prisma Subject n'a PAS de champ color.
Champs disponibles: id, name, createdAt, updatedAt

API Subjects `src/app/api/admin/subjects/route.ts` + `[id]/route.ts` :
- GET liste: Inclure _count.courses et _count.teachers
- POST/PUT: Validation { name: string } uniquement
- DELETE: Bloquer si courses.length > 0

Types:
interface SubjectRow {
  id: string;
  name: string;
  courseCount: number;
  teacherCount: number;
  createdAt: Date | string;
}

Composants:
- SubjectsTable: Mapping couleur CÔTÉ CLIENT par nom de matière
  const SUBJECT_COLORS: Record<string, string> = {
    'Mathématiques': 'bg-blue-100 text-blue-800',
    'Français': 'bg-purple-100 text-purple-800',
    // etc.
  };
- SubjectFormModal: 1 seul champ (name)
```

**Différences clés vs prompt original** :
- ⚠️ Supprimer color du prompt (n'existe pas dans Prisma)
- Préciser le mapping couleur côté client

---

## 🐛 Bugs Documentés Phase 6

| Bug | Cause | Solution | Fichiers |
|-----|-------|----------|----------|
| Zod `.errors` undefined | API Zod utilise `.issues` | Remplacer `.errors` par `.issues` | API routes |
| UserRow.name inexistant | Prisma a firstName/lastName | Mettre à jour types + composants | 7 fichiers |
| Class.year inexistant | Champ non prévu dans Prisma | Utiliser studentCount | ClassRow |
| Subject.color inexistant | Champ non prévu dans Prisma | Mapping client par nom | SubjectsTable |

---

*Dernière mise à jour : 28.12.2025*

# 👔 Phase 6 — Interface Admin (Partie 1)

> **Objectif** : L'Admin peut gérer toutes les données (CRUD complet)  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 6-8h  
> **Prérequis** : Phase 5 terminée (Auth + RBAC)
> **Suite** : [phase-06-admin-suite.md](phase-06-admin-suite.md)

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
RÈGLE 350 LIGNES (rappel) :
- Chaque page CRUD = 1 fichier page + 1 composant table + 1 composant form
- Ex: users/page.tsx < 100, UsersTable.tsx < 200, UserForm.tsx < 150

PATTERN CRUD OBLIGATOIRE :
1. Créer les routes API d'abord (GET, POST, PUT, DELETE)
2. Créer le composant DataTable avec colonnes
3. Créer le composant FormModal (dialog + form)
4. Assembler dans la page
5. Tester E2E chaque opération

STRUCTURE FICHIERS (pour Users par ex) :
src/
├── app/api/admin/users/
│   ├── route.ts           (GET all, POST create)
│   └── [id]/route.ts      (GET one, PUT, DELETE)
├── app/admin/users/
│   └── page.tsx           (< 100 lignes)
└── components/features/admin/
    ├── UsersTable.tsx     (< 200 lignes)
    └── UserFormModal.tsx  (< 150 lignes)
```

---

## 📋 Étape 6.1 — Dashboard Admin avec KPIs

### 🎯 Objectif
Afficher une vue d'ensemble avec les compteurs clés (Users, Classes, Cours, Matières).

### 📝 Comment
1. Créer une route API qui agrège les stats
2. Créer un composant StatsCard réutilisable
3. Afficher 4 cards sur le dashboard

### 🔧 Par quel moyen
- API : `GET /api/admin/stats`
- Prisma : `prisma.user.count()`, `prisma.class.count()`...
- Component : `StatsCard` avec icône + nombre + label

---

### Tâche 6.1.1 — Créer route API stats

| Critère | Attendu |
| :--- | :--- |
| Route | `GET /api/admin/stats` |
| Réponse | `{ users, classes, subjects, courses }` |
| Protection | Middleware admin only |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/admin/stats/route.ts
2. CONTENU:
   import { prisma } from '@/lib/prisma';
   import { auth } from '@/lib/auth';
   
   export async function GET() {
     const session = await auth();
     if (!session?.user || session.user.role !== 'ADMIN') {
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

---

### Tâche 6.1.2 — Créer composant StatsCard

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/admin/StatsCard.tsx` |
| Props | `title, value, icon, className` |
| Style | Card avec icône colorée |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/admin/StatsCard.tsx
2. PROPS:
   interface StatsCardProps {
     title: string;
     value: number;
     icon: LucideIcon;
     iconColor?: string;
   }
3. UTILISER Card de shadcn/ui
4. LAYOUT: Icône à gauche, value + title à droite
5. CODE: Voir [phase-06-code.md](phase-06-code.md) section 1
```

---

### Tâche 6.1.3 — Assembler Dashboard

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/admin/page.tsx` |
| Fetch | Appeler `/api/admin/stats` |
| Affichage | 4 StatsCards en grille |

💡 **INSTRUCTION pour l'IA** :
```
1. MODIFIER: src/app/admin/page.tsx
2. FETCH stats au chargement (Server Component)
3. AFFICHER 4 cards:
   - Users (icône Users)
   - Classes (icône GraduationCap)
   - Matières (icône BookOpen)
   - Cours (icône FileText)
4. GRID: grid grid-cols-2 md:grid-cols-4 gap-4
```

**Layout visuel** :
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 👥 Users    │ 🎓 Classes  │ 📚 Matières │ 📄 Cours    │
│     8       │      3      │      4      │      6      │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 📋 Étape 6.2 — CRUD Utilisateurs (API)

### 🎯 Objectif
Créer les routes API pour la gestion complète des utilisateurs.

### 📝 Comment
1. Route collection : GET all, POST create
2. Route item : GET one, PUT update, DELETE
3. Hasher le password pour les nouveaux users
4. Valider avec Zod

### 🔧 Par quel moyen
- Prisma : CRUD complet sur User
- bcryptjs : Hash password
- Zod : Validation input

---

### Tâche 6.2.1 — GET /api/admin/users

| Critère | Attendu |
| :--- | :--- |
| Route | `src/app/api/admin/users/route.ts` |
| Réponse | Array de users (sans password) |
| Select | Exclure le champ password |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/admin/users/route.ts
2. GET handler:
   export async function GET() {
     const session = await auth();
     if (session?.user?.role !== 'ADMIN') {
       return Response.json({ error: 'Unauthorized' }, { status: 401 });
     }
     
     const users = await prisma.user.findMany({
       select: {
         id: true,
         email: true,
         name: true,
         role: true,
         createdAt: true,
       },
       orderBy: { createdAt: 'desc' },
     });
     
     return Response.json(users);
   }
```

---

### Tâche 6.2.2 — POST /api/admin/users

| Critère | Attendu |
| :--- | :--- |
| Body | `{ email, name, password, role }` |
| Hash | Password hashé avec bcrypt |
| Validation | Email unique, champs requis |

💡 **INSTRUCTION pour l'IA** :
```
1. DANS le même fichier route.ts, ajouter POST:
2. VALIDER body avec Zod schema
3. VÉRIFIER email unique
4. HASHER password: bcrypt.hash(password, 10)
5. CRÉER user avec prisma.user.create
6. RETOURNER user (sans password)
7. CODE: Voir [phase-06-code.md](phase-06-code.md) section 2
```

---

### Tâche 6.2.3 — PUT/DELETE /api/admin/users/[id]

| Critère | Attendu |
| :--- | :--- |
| Route | `src/app/api/admin/users/[id]/route.ts` |
| PUT | Update user (password optionnel) |
| DELETE | Supprimer user |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/admin/users/[id]/route.ts
2. GET: Récupérer un user par ID
3. PUT: 
   - Si password fourni → hasher
   - Sinon → ne pas modifier le password
   - prisma.user.update({ where: { id }, data })
4. DELETE:
   - Empêcher suppression du dernier admin
   - prisma.user.delete({ where: { id } })
5. CODE: Voir [phase-06-code.md](phase-06-code.md) section 3
```

---

## 📋 Étape 6.3 — CRUD Utilisateurs (UI)

### 🎯 Objectif
Interface pour lister, créer, modifier et supprimer des utilisateurs.

### 📝 Comment
1. Composant table avec shadcn/ui DataTable
2. Modal de formulaire pour create/edit
3. Confirmation avant delete
4. Toast de feedback

### 🔧 Par quel moyen
- shadcn/ui : Table, Dialog, Form, Input, Select, Button
- react-hook-form + Zod : Validation client
- sonner (ou toast) : Notifications

---

### Tâche 6.3.1 — Créer UsersTable

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/admin/UsersTable.tsx` |
| Colonnes | Nom, Email, Rôle, Actions |
| Actions | Edit (ouvre modal), Delete (confirm) |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/admin/UsersTable.tsx
2. PROPS: { users, onEdit, onDelete, onRefresh }
3. UTILISER Table de shadcn/ui (ou @tanstack/react-table)
4. COLONNES:
   - Nom (triable)
   - Email
   - Rôle (badge coloré)
   - Actions (DropdownMenu avec Edit/Delete)
5. BADGE ROLES:
   - ADMIN: bg-red-100 text-red-800
   - TEACHER: bg-blue-100 text-blue-800
   - STUDENT: bg-green-100 text-green-800
6. CODE: Voir [phase-06-code.md](phase-06-code.md) section 4
```

---

### Tâche 6.3.2 — Créer UserFormModal

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/admin/UserFormModal.tsx` |
| Champs | name, email, password, role |
| Mode | Create (password requis) / Edit (password optionnel) |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/admin/UserFormModal.tsx
2. PROPS:
   interface UserFormModalProps {
     open: boolean;
     onClose: () => void;
     user?: User | null; // Si fourni = edit mode
     onSuccess: () => void;
   }
3. FORM avec react-hook-form + zodResolver
4. CHAMPS:
   - name (Input, required)
   - email (Input type=email, required)
   - password (Input type=password, required si create)
   - role (Select: ADMIN, TEACHER, STUDENT)
5. SUBMIT:
   - Si user prop → PUT /api/admin/users/[id]
   - Sinon → POST /api/admin/users
6. CODE: Voir [phase-06-code.md](phase-06-code.md) section 5
```

---

### Tâche 6.3.3 — Assembler page Users

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/admin/users/page.tsx` |
| Header | Titre + bouton "Ajouter" |
| Content | UsersTable |
| Modal | UserFormModal |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/admin/users/page.tsx (client component)
2. STATE:
   - users: User[]
   - selectedUser: User | null
   - modalOpen: boolean
3. FETCH users au mount (useEffect)
4. LAYOUT:
   <div>
     <header: titre + Button "Ajouter utilisateur">
     <UsersTable 
       users={users}
       onEdit={(user) => { setSelectedUser(user); setModalOpen(true); }}
       onDelete={handleDelete}
     />
     <UserFormModal open={modalOpen} user={selectedUser} ... />
   </div>
5. RAFRAÎCHIR la liste après create/edit/delete
```

---

## 📋 Étape 6.4 — CRUD Classes

### 🎯 Objectif
Gérer les classes (ex: 3ème A, 4ème B).

### 📝 Comment
Même pattern que Users mais plus simple (3 champs).

### 🔧 Par quel moyen
- API : `/api/admin/classes`
- Champs : `name`, `level`, `year`

---

### Tâche 6.4.1 — API Classes

| Critère | Attendu |
| :--- | :--- |
| GET | `GET /api/admin/classes` |
| POST | `POST /api/admin/classes` |
| PUT | `PUT /api/admin/classes/[id]` |
| DELETE | `DELETE /api/admin/classes/[id]` |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/admin/classes/route.ts
   - GET: prisma.class.findMany()
   - POST: prisma.class.create({ data: { name, level, year } })

2. CRÉER: src/app/api/admin/classes/[id]/route.ts
   - PUT: prisma.class.update()
   - DELETE: prisma.class.delete()

3. VALIDATION Zod:
   const classSchema = z.object({
     name: z.string().min(2),
     level: z.string(),
     year: z.number().int().min(2020).max(2030),
   });
```

---

### Tâche 6.4.2 — UI Classes

| Critère | Attendu |
| :--- | :--- |
| Table | `ClassesTable.tsx` (< 150 lignes) |
| Modal | `ClassFormModal.tsx` (< 100 lignes) |
| Page | `admin/classes/page.tsx` |

💡 **INSTRUCTION pour l'IA** :
```
1. COPIER le pattern de Users mais adapté à Class
2. COLONNES table: Nom, Niveau, Année, Actions
3. CHAMPS form: name, level (select 6ème-Terminale), year
4. CODE: Voir [phase-06-code-suite.md](phase-06-code-suite.md) section 1
```

---

## 🔄 Navigation

← [phase-05-auth-suite.md](phase-05-auth-suite.md) | [phase-06-admin-suite.md](phase-06-admin-suite.md) →

---

*Lignes : ~320 | Dernière MAJ : 2025-12-22*

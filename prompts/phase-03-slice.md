# Phase 3 - Vertical Slice (Démo Mock)

> **Objectif** : Montrer quelque chose SANS vraie DB  
> **Fichiers TODO** : `phase-03-slice.md`, `phase-03-slice-suite.md`  
> **Fichiers code** : `phase-03-code.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 3.1 — Page login mockée

### Prompt 3.1.1 — Route Login

```
Créer `src/app/(auth)/login/page.tsx` :
- (auth) = route group → URL = /login
- N'utilise PAS le layout dashboard
- Contenu : centrer un <LoginForm />
```

### Prompt Optimal 3.1.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer `src/app/(auth)/login/page.tsx` :

1. PAS de 'use client' (Server Component)

2. Import : LoginForm depuis @/components/auth

3. Structure :
   <div className="min-h-screen flex items-center justify-center bg-gray-50">
     <LoginForm />
   </div>

4. Note : (auth) = route group → URL = /login (pas /auth/login)
   Ce groupe n'a PAS de layout.tsx donc pas de Sidebar/Header
```

**Différences clés vs prompt original** :
- Aucune différence majeure, prompt original suffisant
- Préciser que c'est un Server Component

---

### Prompt 3.1.2 — LoginForm

```
Créer `src/components/auth/LoginForm.tsx` :

1. 'use client' (useState, useRouter)
2. Card shadcn avec :
   - Logo BlaizBot
   - Champs email/password (décoratifs)
   - Bouton "Se connecter"

3. Section DEV "Connexion rapide" :
   - 3 boutons : Élève | Professeur | Admin

4. Fonction loginAs :
   const loginAs = (role) => {
     localStorage.setItem('mockRole', role);
     router.push(`/${role}`);
   };
```

### Prompt Optimal 3.1.2

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Nécessitait shadcn Label + couleurs boutons

```
Créer `src/components/auth/LoginForm.tsx` :

1. 'use client' en première ligne (useState, useRouter de next/navigation)

2. Prérequis : npx shadcn@latest add label -y

3. Imports shadcn :
   - Card, CardContent, CardDescription, CardHeader, CardTitle
   - Input, Button, Label

4. Structure Card :
   <Card className="w-full max-w-md">
     <CardHeader className="text-center">
       <span className="text-5xl">🤖</span>  ← Logo emoji
       <CardTitle>BlaizBot</CardTitle>
       <CardDescription>Plateforme éducative avec IA</CardDescription>
     </CardHeader>
     <CardContent>
       <form>...</form>
       <div className="border-t pt-4">DEV section</div>
     </CardContent>
   </Card>

5. Section DEV "Connexion rapide" :
   - Titre : "🛠️ Connexion rapide (DEV)"
   - 3 boutons avec couleurs distinctes :
     - Élève : className="border-blue-500 text-blue-600 hover:bg-blue-50"
     - Professeur : className="border-green-500 text-green-600 hover:bg-green-50"
     - Admin : className="border-purple-500 text-purple-600 hover:bg-purple-50"

6. Fonction loginAs typée :
   const loginAs = (role: 'student' | 'teacher' | 'admin') => {
     localStorage.setItem('mockRole', role);
     router.push(`/${role}`);
   };

7. Créer aussi src/components/auth/index.ts (barrel export)
```

**Différences clés vs prompt original** :
- Préciser `next/navigation` pour useRouter (pas `next/router`)
- Mentionner l'installation de Label
- Typer explicitement le paramètre role
- Ajouter les couleurs des boutons DEV
- Mentionner le barrel export

---

## 📋 Étape 3.2 — Dashboard élève mock

### Prompt 3.2.1 — mockData.ts

```
Créer `src/data/mockData.ts` :

export const currentUser = {
  id: '1', name: 'Lucas Martin', email: 'lucas@example.com',
  role: 'student' as const, class: '3ème A'
};

export const courses = [
  { id: '1', title: 'Algèbre', teacher: 'M. Dupont', progress: 75 },
  { id: '2', title: 'La Révolution', teacher: 'Mme Bernard', progress: 40 },
  { id: '3', title: 'Photosynthèse', teacher: 'M. Martin', progress: 90 },
];

export const studentProgress = {
  coursesCompleted: 4, totalCourses: 6, averageScore: 85, hoursSpent: 12
};
```

### Prompt Optimal 3.2.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer `src/data/mockData.ts` avec sections commentées :

// -----------------------------------------------------
// DONNÉES MOCK - Student
// -----------------------------------------------------

export const currentUser = {
  id: '1',
  name: 'Lucas Martin',
  email: 'lucas@example.com',
  role: 'student' as const,
  class: '3ème A',
};

export const courses = [
  { id: '1', title: 'Algèbre', teacher: 'M. Dupont', progress: 75 },
  { id: '2', title: 'La Révolution', teacher: 'Mme Bernard', progress: 40 },
  { id: '3', title: 'Photosynthèse', teacher: 'M. Martin', progress: 90 },
];

export const studentProgress = {
  coursesCompleted: 4,
  totalCourses: 6,
  averageScore: 85,
  hoursSpent: 12,
};
```

**Différences clés vs prompt original** :
- Ajouter des commentaires de section pour organiser
- Format multi-lignes pour lisibilité

---

### Prompt 3.2.2 — Composants Dashboard

```
Créer dans src/components/dashboard/ :

1. WelcomeCard.tsx (< 50 lignes)
   - Props: { userName: string }
   - "Bonjour, {prénom} 👋"

2. StatsCards.tsx (< 80 lignes)
   - 4 cards : Cours terminés, Progression, Score, Heures
   - Grid 2x2 ou 4 colonnes

3. RecentCourses.tsx (< 100 lignes)
   - Liste des 3 cours avec Progress bar
   - Installer : npx shadcn@latest add progress
```

### Prompt Optimal 3.2.2

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer dans src/components/dashboard/ :

1. WelcomeCard.tsx (< 50 lignes)
   - Props interface : { userName: string }
   - Card avec gradient : className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
   - Contenu : <h1>Bonjour, {userName} 👋</h1>

2. StatsCards.tsx (< 80 lignes)
   - Props interface avec type explicite :
     interface StatsCardsProps {
       stats: {
         coursesCompleted: number;
         totalCourses: number;
         averageScore: number;
         hoursSpent: number;
       };
     }
   - 4 cards avec icônes lucide-react : BookOpen, Target, Trophy, Clock
   - Grid responsive : className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"

3. RecentCourses.tsx (< 100 lignes)
   - Prérequis : npx shadcn@latest add progress -y
   - Props interface :
     interface Course { id: string; title: string; teacher: string; progress: number; }
     interface RecentCoursesProps { courses: Course[]; }
   - Progress bar shadcn pour chaque cours

4. index.ts (barrel export) :
   export { WelcomeCard } from './WelcomeCard';
   export { StatsCards } from './StatsCards';
   export { RecentCourses } from './RecentCourses';
```

**Différences clés vs prompt original** :
- Interfaces typées explicitement pour chaque composant
- Mentionner les icônes lucide-react
- Préciser les classes Tailwind pour le gradient et la grid
- Inclure le barrel export

---

### Prompt 3.2.3 — Assembler Dashboard

```
Modifier `src/app/(dashboard)/student/page.tsx` :

import { currentUser, courses, studentProgress } from '@/data/mockData';
import { WelcomeCard, StatsCards, RecentCourses } from '@/components/dashboard';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeCard userName={currentUser.name.split(' ')[0]} />
      <StatsCards stats={studentProgress} />
      <RecentCourses courses={courses} />
    </div>
  );
}
```

### Prompt Optimal 3.2.3

> **Itérations réelles** : 2
> **Problèmes rencontrés** : TypeScript strict rejette `split()[0]` (peut être undefined)

```
Modifier `src/app/(dashboard)/student/page.tsx` :

import { currentUser, courses, studentProgress } from '@/data/mockData';
import { WelcomeCard, StatsCards, RecentCourses } from '@/components/dashboard';

export default function StudentDashboardPage() {
  // TypeScript strict (noUncheckedIndexedAccess) : split()[0] peut être undefined
  const firstName = currentUser.name.split(' ')[0] ?? currentUser.name;
  
  return (
    <div className="space-y-6">
      <WelcomeCard userName={firstName} />
      <StatsCards stats={studentProgress} />
      <RecentCourses courses={courses} />
    </div>
  );
}
```

**Différences clés vs prompt original** :
- Ajouter fallback `?? currentUser.name` pour noUncheckedIndexedAccess
- Extraire firstName dans une variable pour clarté
- Ce pattern doit être réutilisé partout où on accède à un index de tableau

---

## 📋 Étape 3.3-3.4 — Dashboards Teacher et Admin

### Prompt 3.3.1 — mockData Teacher

```
Ajouter dans mockData.ts :
- teacherUser, teacherStats, teacherClasses
```

### Prompt Optimal 3.3.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Ajouter dans mockData.ts après la section Student :

// -----------------------------------------------------
// DONNÉES MOCK - Teacher
// -----------------------------------------------------

export const teacherUser = {
  id: '2',
  name: 'Marie Dupont',
  email: 'marie.dupont@example.com',
  role: 'teacher' as const,
  subject: 'Mathématiques',
};

export const teacherStats = {
  totalStudents: 87,
  totalClasses: 4,
  coursesCreated: 12,
  averageClassScore: 78,
};

export const teacherClasses = [
  { id: '1', name: '3ème A', students: 24, averageScore: 82 },
  { id: '2', name: '3ème B', students: 22, averageScore: 75 },
  { id: '3', name: '4ème A', students: 26, averageScore: 79 },
  { id: '4', name: '4ème C', students: 15, averageScore: 76 },
];

Puis modifier teacher/page.tsx avec :
- Import des données teacher
- WelcomeCard avec gradient vert (from-green-500 to-teal-600)
- StatsCards inline (pas le composant student)
- Liste des classes avec scores
- Pattern firstName avec ?? fallback
```

**Différences clés vs prompt original** :
- Donner la structure complète des données
- Mentionner le gradient vert pour différencier de student
- Rappeler le pattern firstName

---

### Prompt 3.4.1 — mockData Admin

```
Ajouter : adminStats (totalUsers, totalClasses, etc.)
Modifier admin/page.tsx pour afficher les stats.
```

### Prompt Optimal 3.4.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Ajouter dans mockData.ts après la section Teacher :

// -----------------------------------------------------
// DONNÉES MOCK - Admin
// -----------------------------------------------------

export const adminStats = {
  totalUsers: 312,
  totalStudents: 280,
  totalTeachers: 28,
  totalAdmins: 4,
  totalClasses: 12,
  totalCourses: 45,
  activeSessionsToday: 156,
  averagePlatformScore: 76,
};

Puis modifier admin/page.tsx avec :
- Import adminStats depuis @/data/mockData
- WelcomeCard avec gradient violet (from-purple-500 to-indigo-600)
- Titre "Administration 🛡️" (pas de prénom)
- 2 grilles de stats :
  - Grid 4 cols : Utilisateurs, Élèves, Professeurs, Admins
  - Grid 2 cols : Sessions actives, Score plateforme
- Icônes lucide-react : Users, GraduationCap, UserCheck, ShieldCheck, Activity, BookOpen
```

**Différences clés vs prompt original** :
- Donner la structure complète des données admin
- Mentionner le gradient violet
- Préciser les 2 grilles différentes
- Lister les icônes nécessaires

---

## 📊 Validation Finale Phase 3

```
Checklist :
1. /login → 3 boutons de connexion rapide (couleurs distinctes)
2. /student → Dashboard avec données mock (gradient bleu)
3. /teacher → Dashboard avec données mock (gradient vert)
4. /admin → Dashboard avec stats (gradient violet)
5. Toutes les données viennent de mockData.ts
6. Barrel exports : auth/index.ts, dashboard/index.ts
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 3.1 | 23.12.2025 | 15min | 1 | Prompt OK, ajouter shadcn Label + couleurs |
| 3.2 | 23.12.2025 | 20min | 2 | TypeScript strict: split()[0] → fallback ?? |
| 3.3 | 23.12.2025 | 10min | 1 | Prompt OK |
| 3.4 | 23.12.2025 | 15min | 1 | Prompt OK |
| Audit | 23.12.2025 | 10min | 1 | Fix hydratation Header.tsx |

---

## 🐛 Bugs corrigés Phase 3

### Bug : Hydratation mismatch (Header.tsx)

**Symptôme** : Erreur console "A tree hydrated but some attributes didn't match"

**Cause** : Radix UI DropdownMenu génère des IDs dynamiques différents SSR/client

**Solution** : Utiliser `useSyncExternalStore` pour détecter le client

```typescript
const emptySubscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,  // client
    () => false  // server
  );
```

**Note** : useState + useEffect interdit par ESLint (set-state-in-effect)

---

*Dernière mise à jour : 23.12.2025*

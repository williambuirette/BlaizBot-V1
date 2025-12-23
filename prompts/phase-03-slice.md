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

---

## 📋 Étape 3.3-3.4 — Dashboards Teacher et Admin

### Prompt 3.3.1 — mockData Teacher

```
Ajouter dans mockData.ts :
- teacherUser, teacherStats, teacherClasses
```

### Prompt 3.4.1 — mockData Admin

```
Ajouter : adminStats (totalUsers, totalClasses, etc.)
Modifier admin/page.tsx pour afficher les stats.
```

---

## 📊 Validation Finale Phase 3

```
Checklist :
1. /login → 3 boutons de connexion rapide
2. /student → Dashboard avec données mock
3. /teacher → Dashboard avec données mock
4. /admin → Dashboard avec stats
5. Toutes les données viennent de mockData.ts
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 3.1 | | | | |
| 3.2 | | | | |
| 3.3 | | | | |
| 3.4 | | | | |

---

*Dernière mise à jour : 2025-01-13*

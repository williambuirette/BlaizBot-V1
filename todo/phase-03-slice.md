# 🧪 Phase 3 — Vertical Slice (Démo Mock)

> **Objectif** : Montrer quelque chose SANS vraie DB  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 3-4h  
> **Prérequis** : Phase 2 terminée

📁 **Fichiers liés** :
- [phase-03-slice-suite.md](phase-03-slice-suite.md) — Étapes 3.3→3.4
- [phase-03-code.md](phase-03-code.md) — Code source & templates

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
POURQUOI cette phase ?
→ On valide l'UX et le flux AVANT d'investir dans la DB
→ Si quelque chose ne "vibe" pas, on le voit MAINTENANT
→ Les mocks permettent de tester rapidement

RÈGLES :
1. Toutes les données viennent de mockData.ts
2. Aucun appel API réel
3. Focus sur l'expérience utilisateur
4. Chaque composant < 100 lignes
```

---

## 📋 Étape 3.1 — Page login mockée

### 🎯 Objectif
Créer une page de login qui permet de tester les 3 rôles (student, teacher, admin) sans authentification réelle. C'est un mock pour le développement.

### 📝 Comment
Page avec un formulaire décoratif + 3 boutons de connexion rapide. Chaque bouton stocke le rôle dans localStorage et redirige vers le dashboard approprié.

### 🔧 Par quel moyen
1. Route group `(auth)` pour les pages publiques
2. Composant `LoginForm` avec les boutons mock
3. `useRouter()` pour la redirection

---

### 3.1.1 — Créer la page login

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.1.1 | Page login | `src/app/(auth)/login/page.tsx` | Page créée |

💡 **INSTRUCTION** :
- Créer le dossier `(auth)` dans `src/app/`
- Les parenthèses = route group (pas d'impact URL)
- URL finale : `/login`
- Cette page n'a PAS le layout dashboard

---

### 3.1.2 — Créer le formulaire

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.1.2 | LoginForm | `src/components/auth/LoginForm.tsx` | Composant créé |

💡 **INSTRUCTION** :
- Créer `src/components/auth/`
- Utiliser `Input` de shadcn pour email/password
- Formulaire décoratif (pas de validation pour l'instant)

---

### 3.1.3 — Ajouter boutons mock

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.1.3 | Boutons mock | 3 boutons "Élève/Prof/Admin" | Visibles |

💡 **INSTRUCTION** :
- Sous le formulaire, section "Connexion rapide (dev)"
- 3 boutons avec variantes de couleur
- Voir **Section 1** de [phase-03-code.md](phase-03-code.md#1-boutons-login-mock)

---

### 3.1.4 — Stocker le rôle

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.1.4 | State | Clic → localStorage | Rôle stocké |

💡 **INSTRUCTION** :
```typescript
const loginAs = (role: 'student' | 'teacher' | 'admin') => {
  localStorage.setItem('mockRole', role);
  router.push(`/${role}`);
};
```

---

### 3.1.5 — Redirection

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.1.5 | Redirect | `router.push()` | Navigation OK |

💡 **INSTRUCTION** :
- `import { useRouter } from 'next/navigation'`
- Redirect immédiat après stockage
- Tester : /login → clic "Élève" → /student

---

### 3.1.6 — Style Card

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.1.6 | Style | Card centré + logo | UI propre |

💡 **INSTRUCTION** :
- Utiliser `Card` de shadcn
- Centrer : `flex items-center justify-center min-h-screen`
- Logo BlaizBot en haut
- Voir **Section 2** de [phase-03-code.md](phase-03-code.md#2-layout-page-login)

---

## 📋 Étape 3.2 — Dashboard élève mock

### 🎯 Objectif
Rendre le dashboard élève vivant avec des données mockées. Valider que le layout et les composants fonctionnent avant d'intégrer la vraie DB.

### 📝 Comment
Créer un fichier de données mock, puis 3 composants : WelcomeCard, StatsCards, RecentCourses. Les assembler dans la page dashboard.

### 🔧 Par quel moyen
1. `mockData.ts` avec user, cours, progression
2. Composants dans `src/components/dashboard/`
3. Import dans `student/page.tsx`

---

### 3.2.1 — Créer mockData.ts

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.2.1 | Mock data | `src/data/mockData.ts` | Fichier créé |

💡 **INSTRUCTION** :
- Créer `src/data/`
- Exporter des constantes typées
- Voir **Section 3** de [phase-03-code.md](phase-03-code.md#3-mockdatats-complet)

---

### 3.2.2 — User mock

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.2.2 | User mock | Objet `currentUser` | Exporté |

💡 **INSTRUCTION** :
```typescript
export const currentUser = {
  id: '1',
  name: 'Lucas Martin',
  email: 'lucas@example.com',
  role: 'student' as const,
  class: '3ème A',
};
```

---

### 3.2.3 — Courses mock

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.2.3 | Courses mock | Array `courses[]` | 3 cours |

💡 **INSTRUCTION** : 3 cours minimum avec id, title, progress, teacher

---

### 3.2.4 — Progress mock

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.2.4 | Progress mock | Objet `studentProgress` | Stats |

💡 **INSTRUCTION** : coursesCompleted, totalCourses, averageScore, hoursSpent

---

### 3.2.5 — WelcomeCard

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.2.5 | Welcome | `src/components/dashboard/WelcomeCard.tsx` | < 50 lignes |

💡 **INSTRUCTION** :
- Créer `src/components/dashboard/`
- Props : `userName: string`
- Message "Bonjour, {prénom} 👋"
- Voir **Section 4** de [phase-03-code.md](phase-03-code.md#4-welcomecardtsx)

---

### 3.2.6 — StatsCards

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.2.6 | Stats | `src/components/dashboard/StatsCards.tsx` | < 80 lignes |

💡 **INSTRUCTION** :
- 4 cards en grid (2x2 ou 4 colonnes)
- Utiliser `Card` de shadcn
- Icônes Lucide pour chaque stat
- Voir **Section 5** de [phase-03-code.md](phase-03-code.md#5-statscardstsx)

---

### 3.2.7 — RecentCourses

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.2.7 | Recent | `src/components/dashboard/RecentCourses.tsx` | < 100 lignes |

💡 **INSTRUCTION** :
- Liste des 3 cours avec barre de progression
- Utiliser `Progress` de shadcn
- Lien vers `/student/courses/[id]`
- Voir **Section 6** de [phase-03-code.md](phase-03-code.md#6-recentcoursestsx)

---

### 3.2.8 — Assembler le dashboard

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.2.8 | Assembler | `src/app/(dashboard)/student/page.tsx` | Complet |

💡 **INSTRUCTION** :
```typescript
import { currentUser, courses, studentProgress } from '@/data/mockData';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentCourses } from '@/components/dashboard/RecentCourses';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <WelcomeCard userName={currentUser.name} />
      <StatsCards stats={studentProgress} />
      <RecentCourses courses={courses} />
    </div>
  );
}
```

---

## ➡️ Suite

Étapes 3.1→3.2 terminées → [phase-03-slice-suite.md](phase-03-slice-suite.md) pour 3.3→3.4

---

*Dernière MAJ : 2025-01-13*

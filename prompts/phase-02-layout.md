# Phase 2 - Layout & Navigation

> **Objectif** : Naviguer partout (pages vides mais fonctionnelles)  
> **Fichiers TODO** : `phase-02-layout.md`, `phase-02-layout-suite.md`  
> **Fichiers code** : `phase-02-code.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 2.1 — Créer Sidebar component

### Prompt 2.1.1 — Types et Structure

```
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript, shadcn/ui).
Créer le fichier `src/components/layout/Sidebar.tsx` avec :

1. Types en haut :
   - SidebarProps : { role: 'admin' | 'teacher' | 'student' }
   - NavItem : { label, href, icon }

2. Données de navigation par rôle (3 arrays différents)

3. Structure HTML :
   <aside className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col">
     <div className="p-4 border-b border-slate-700">Logo</div>
     <nav className="flex-1 p-4">Liens</nav>
     <div className="p-4 border-t border-slate-700">Footer</div>
   </aside>

Fichier < 200 lignes. Utiliser 'use client' car usePathname.
Consulter phase-02-code.md section 1-2 pour le template.
```

### Prompt Optimal 2.1.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun (le template phase-02-code.md était complet)

```
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript, shadcn/ui).
Créer le fichier `src/components/layout/Sidebar.tsx` avec :

1. 'use client' en première ligne (car usePathname)

2. Types en haut :
   - SidebarProps : { role: Role } → importer Role depuis '@/types' (ADMIN | TEACHER | STUDENT en majuscules)
   - NavItem : { label: string, href: string, icon: React.ReactNode }

3. Données de navigation par rôle :
   - adminNavItems, teacherNavItems, studentNavItems (voir phase-02-code.md section 9)
   - navItemsByRole: Record<Role, NavItem[]> pour le mapping

4. Structure HTML exacte :
   <aside className="w-64 h-screen bg-slate-900 text-white fixed left-0 top-0 flex flex-col">
     <div className="p-4 border-b border-slate-700">Logo BlaizBot</div>
     <nav className="flex-1 p-4"><ul>...</ul></nav>
     <div className="p-4 border-t border-slate-700">Footer version</div>
   </aside>

5. Icônes : importer depuis lucide-react avec size={20}

Fichier < 200 lignes.
```

**Différences clés vs prompt original** :
- Préciser que Role vient de `@/types` et est en MAJUSCULES
- Mentionner `navItemsByRole: Record<Role, NavItem[]>` pour le mapping
- Référencer explicitement la section 9 de phase-02-code.md pour les navItems

### Prompt 2.1.2 — SidebarItem

```
Créer `src/components/layout/SidebarItem.tsx` :

Props :
- href: string
- label: string  
- icon: LucideIcon
- isActive: boolean

Structure :
- Link de next/link
- Icône 20x20 + label
- Styles actif : bg-slate-800 text-white
- Styles normal : text-slate-400 hover:text-white

< 50 lignes. Importer les icônes depuis lucide-react.
```

### Prompt Optimal 2.1.2

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer `src/components/layout/SidebarItem.tsx` :

1. 'use client' en première ligne
2. Importer : Link (next/link), cn (@/lib/utils), LucideIcon (lucide-react)

3. Interface SidebarItemProps :
   - href: string
   - label: string  
   - icon: LucideIcon (type, pas instance)
   - isActive?: boolean (optionnel avec défaut false)

4. Destructurer icon as Icon pour l'utiliser comme composant : <Icon size={20} />

5. Structure :
   <li>
     <Link href={href} className={cn(styles...)}>
       <Icon size={20} />
       <span>{label}</span>
     </Link>
   </li>

6. Utiliser cn() pour les classes conditionnelles actif/normal

< 50 lignes.
```

**Différences clés vs prompt original** :
- Préciser que `icon` est un type `LucideIcon`, pas une instance
- Mentionner le pattern `icon: Icon` pour destructurer et utiliser comme composant
- Indiquer que `isActive` doit être optionnel avec défaut `false`

---

## 📋 Étape 2.2 — Créer Header component

### Prompt 2.2.1 — Header Structure

```
Créer `src/components/layout/Header.tsx` avec :

1. 'use client' en première ligne
2. Layout flex avec 3 zones :
   - Gauche : titre de page
   - Centre : barre de recherche (Input de shadcn)
   - Droite : Avatar + DropdownMenu

3. Classes Tailwind :
   h-16 bg-white border-b flex items-center justify-between px-6

4. DropdownMenu avec :
   - Mon profil
   - Paramètres
   - Déconnexion

< 150 lignes. Utiliser composants shadcn existants.
```

### Prompt Optimal 2.2.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer `src/components/layout/Header.tsx` avec :

1. 'use client' en première ligne

2. Imports shadcn :
   - Input depuis @/components/ui/input
   - DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger depuis @/components/ui/dropdown-menu
   - Avatar, AvatarFallback, AvatarImage depuis @/components/ui/avatar

3. Imports lucide : Search, User, Settings, LogOut

4. Structure flex 3 zones :
   <header className="h-16 bg-white border-b flex items-center justify-between px-6">
     {/* Gauche */} <h1>Dashboard</h1>
     {/* Centre */} <div className="relative max-w-md flex-1 mx-8">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
       <Input className="pl-10" />
     </div>
     {/* Droite */} <DropdownMenu>...</DropdownMenu>
   </header>

5. DropdownMenu items avec icônes :
   - Mon profil (User icon)
   - Paramètres (Settings icon)
   - Separator
   - Déconnexion (LogOut icon, className="text-red-500")

< 150 lignes.
```

**Différences clés vs prompt original** :
- Lister explicitement tous les imports shadcn nécessaires
- Préciser le pattern pour la barre de recherche avec icône positionnée en absolute
- Mentionner les icônes lucide pour chaque item du dropdown

---

## 📋 Étape 2.3 — Créer layout dashboard

### Prompt 2.3.1 — Layout Dashboard

```
Créer `src/app/(dashboard)/layout.tsx` :

1. Server Component (pas de 'use client')
2. Import Sidebar et Header
3. Structure :
   <div className="min-h-screen bg-gray-50">
     <Sidebar role="student" />
     <div className="ml-64">
       <Header />
       <main className="p-6">{children}</main>
     </div>
   </div>

Note : ml-64 compense la sidebar fixed.
Les parenthèses (dashboard) = route group.
```

### Prompt Optimal 2.3.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer `src/app/(dashboard)/layout.tsx` :

1. PAS de 'use client' (Server Component)

2. Imports :
   - Sidebar depuis @/components/layout/Sidebar
   - Header depuis @/components/layout/Header

3. Props typées :
   export default function DashboardLayout({
     children,
   }: {
     children: React.ReactNode;
   })

4. Structure exacte :
   <div className="min-h-screen bg-gray-50">
     <Sidebar role="STUDENT" />  ← MAJUSCULES car type Role
     <div className="ml-64">     ← Compense w-64 de la sidebar fixed
       <Header />
       <main className="p-6">{children}</main>
     </div>
   </div>

Note : Le dossier (dashboard) avec parenthèses = route group (pas d'impact sur l'URL).
```

**Différences clés vs prompt original** :
- Préciser que role doit être en MAJUSCULES ("STUDENT" pas "student") car type Role
- Montrer le typage explicite des props children
- Expliquer pourquoi ml-64 (compense la sidebar fixed de w-64)

---

## 📋 Étapes 2.4-2.6 — Pages vides

### Prompt 2.4.1 — Pages Admin

```
Créer les pages admin (chacune < 20 lignes) :
- src/app/(dashboard)/admin/page.tsx → "Dashboard Admin"
- src/app/(dashboard)/admin/users/page.tsx → "Gestion utilisateurs"
- src/app/(dashboard)/admin/classes/page.tsx → "Gestion classes"
- src/app/(dashboard)/admin/subjects/page.tsx → "Gestion matières"
```

### Prompt Optimal 2.4.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer les pages admin (chacune < 20 lignes, Server Components) :
- src/app/(dashboard)/admin/page.tsx → "Dashboard Admin"
- src/app/(dashboard)/admin/users/page.tsx → "Gestion utilisateurs"
- src/app/(dashboard)/admin/classes/page.tsx → "Gestion classes"
- src/app/(dashboard)/admin/subjects/page.tsx → "Gestion matières"

Structure de chaque page :
- PAS de 'use client' (Server Component par défaut)
- export default function XxxPage()
- <div> avec <h1 className="text-2xl font-bold mb-6"> + <p className="text-muted-foreground">
- Utiliser &apos; pour les apostrophes dans JSX (ESLint)
```

**Différences clés vs prompt original** :
- Préciser que ce sont des Server Components (pas de 'use client')
- Donner la structure exacte du composant
- Mentionner `&apos;` pour les apostrophes (règle ESLint react/no-unescaped-entities)

### Prompt 2.5.1 — Pages Teacher

```
Créer les pages teacher :
- src/app/(dashboard)/teacher/page.tsx → "Dashboard Professeur"
- src/app/(dashboard)/teacher/courses/page.tsx → "Mes Cours"
- src/app/(dashboard)/teacher/classes/page.tsx → "Mes Classes"
- src/app/(dashboard)/teacher/messages/page.tsx → "Messagerie"
```

### Prompt Optimal 2.5.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer les pages teacher (même structure que admin) :
- src/app/(dashboard)/teacher/page.tsx → "Dashboard Professeur"
- src/app/(dashboard)/teacher/courses/page.tsx → "Mes Cours"
- src/app/(dashboard)/teacher/classes/page.tsx → "Mes Classes"
- src/app/(dashboard)/teacher/messages/page.tsx → "Messagerie"

Réutiliser le pattern 2.4.1 (Server Component, h1 + p).
```

**Différences clés vs prompt original** :
- Référencer le pattern 2.4.1 pour cohérence
- Moins de détails car pattern déjà établi

### Prompt 2.6.1 — Pages Student

```
Créer les pages student :
- src/app/(dashboard)/student/page.tsx → "Dashboard Élève"
- src/app/(dashboard)/student/courses/page.tsx → "Mes Cours"
- src/app/(dashboard)/student/ai/page.tsx → "Assistant IA"
- src/app/(dashboard)/student/messages/page.tsx → "Messagerie"
```

### Prompt Optimal 2.6.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Créer les pages student (même structure que admin/teacher) :
- src/app/(dashboard)/student/page.tsx → "Dashboard Élève"
- src/app/(dashboard)/student/courses/page.tsx → "Mes Cours"
- src/app/(dashboard)/student/ai/page.tsx → "Assistant IA"
- src/app/(dashboard)/student/messages/page.tsx → "Messagerie"

Réutiliser le pattern 2.4.1 (Server Component, h1 + p).
```

**Différences clés vs prompt original** :
- Référencer le pattern établi
- Les 3 groupes de pages suivent la même structure

---

## 📊 Validation Finale Phase 2

```
Checklist :
1. npm run lint → 0 erreur
2. npm run build → OK
3. Navigation fonctionnelle entre toutes les pages
4. Sidebar + Header visibles sur chaque page dashboard
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 2.1 | 23-12-2025 | ~15min | 1 | Prompt OK |
| 2.2 | 23-12-2025 | ~10min | 1 | Prompt OK |
| 2.3 | 23-12-2025 | ~5min | 1 | Prompt OK |
| 2.4-2.6 | 23-12-2025 | ~15min | 1 | Pages simples, pattern réutilisable |
| **Audit** | 23-12-2025 | ~10min | 1 | Corrections post-validation |

---

## 🔍 Audit Post-Phase 2 (23-12-2025)

### Problèmes identifiés

| # | Problème | Impact |
|---|----------|--------|
| 1 | Role hardcodé "STUDENT" dans layout.tsx | Sidebar identique partout |
| 2 | URLs sidebar ≠ pages créées | Navigation 404 |
| 3 | SidebarItem.tsx non utilisé | Code mort |

### Corrections appliquées

**1. Layout dynamique** (`src/app/(dashboard)/layout.tsx`)
```typescript
'use client';
import { usePathname } from 'next/navigation';

function getRoleFromPathname(pathname: string): Role {
  if (pathname.startsWith('/admin')) return 'ADMIN';
  if (pathname.startsWith('/teacher')) return 'TEACHER';
  return 'STUDENT';
}
```

**2. URLs Sidebar corrigées** (`src/components/layout/Sidebar.tsx`)
- `/student/assistant` → `/student/ai`
- Supprimé : `/student/revisions`, `/student/calendar`, `/admin/settings`

**3. Code mort supprimé**
- `SidebarItem.tsx` supprimé (non utilisé)

### Leçons apprises

> **Prompt optimal pour éviter ces problèmes** :
> - Toujours vérifier que les URLs dans les navItems correspondent aux pages créées
> - Rendre le role dynamique dès le départ (basé sur route ou session)
> - Ne pas créer de composants "au cas où" → YAGNI

---

*Dernière mise à jour : 23-12-2025*

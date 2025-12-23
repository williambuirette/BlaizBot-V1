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

### Prompt 2.5.1 — Pages Teacher

```
Créer les pages teacher :
- src/app/(dashboard)/teacher/page.tsx → "Dashboard Professeur"
- src/app/(dashboard)/teacher/courses/page.tsx → "Mes Cours"
- src/app/(dashboard)/teacher/classes/page.tsx → "Mes Classes"
- src/app/(dashboard)/teacher/messages/page.tsx → "Messagerie"
```

### Prompt 2.6.1 — Pages Student

```
Créer les pages student :
- src/app/(dashboard)/student/page.tsx → "Dashboard Élève"
- src/app/(dashboard)/student/courses/page.tsx → "Mes Cours"
- src/app/(dashboard)/student/ai/page.tsx → "Assistant IA"
- src/app/(dashboard)/student/messages/page.tsx → "Messagerie"
```

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
| 2.1 | | | | |
| 2.2 | | | | |
| 2.3 | | | | |
| 2.4-2.6 | | | | |

---

*Dernière mise à jour : 2025-01-13*

# 📄 Code & Templates — Phase 2

> Ce fichier contient le code source et templates pour la Phase 2.
> **Utilisé par** : [phase-02-layout.md](phase-02-layout.md) et [phase-02-layout-suite.md](phase-02-layout-suite.md)

---

## 1. Types Sidebar

```typescript
import { Role } from '@/types';

interface SidebarProps {
  role: Role;
  collapsed?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}
```

---

## 2. SidebarItem.tsx (complet)

```typescript
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export function SidebarItem({ label, href, icon, isActive }: SidebarItemProps) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
          'hover:bg-slate-800',
          isActive && 'bg-slate-800 text-blue-400'
        )}
      >
        {icon}
        <span>{label}</span>
      </Link>
    </li>
  );
}
```

---

## 3. Icônes Lucide à importer

```typescript
import {
  Home,           // Dashboard (tous)
  BookOpen,       // Cours
  Users,          // Élèves/Classes
  MessageSquare,  // Messages
  Calendar,       // Agenda
  Settings,       // Paramètres
  User,           // Profil
  Brain,          // Assistant IA (student)
  GraduationCap,  // Révisions (student)
  BarChart,       // Stats (admin)
  School,         // Classes
  BookMarked,     // Matières
} from 'lucide-react';
```

---

## 4. Header - Zone recherche

```typescript
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

<div className="relative max-w-md flex-1">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input
    placeholder="Rechercher..."
    className="pl-10"
  />
</div>
```

---

## 5. Header - Dropdown profil

```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src="/avatar.png" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Profil</DropdownMenuItem>
    <DropdownMenuItem>Paramètres</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-red-500">Déconnexion</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 6. Layout Dashboard (complet)

```typescript
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar fixe à gauche */}
      <Sidebar role="student" />
      
      {/* Zone principale décalée */}
      <div className="ml-64">
        {/* Header sticky */}
        <Header />
        
        {/* Contenu des pages */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 7. Template page vide (réutilisable)

```typescript
export default function PageName() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Titre de la page</h1>
      <p className="text-muted-foreground mt-2">
        Description ou contenu à venir...
      </p>
    </div>
  );
}
```

---

## 8. Liste des pages à créer

### Admin (5 pages)
| URL | Fichier | Titre |
|:----|:--------|:------|
| /admin | `admin/page.tsx` | Dashboard Administrateur |
| /admin/users | `admin/users/page.tsx` | Gestion des utilisateurs |
| /admin/classes | `admin/classes/page.tsx` | Gestion des classes |
| /admin/subjects | `admin/subjects/page.tsx` | Gestion des matières |
| /admin/settings | `admin/settings/page.tsx` | Paramètres |

### Teacher (5 pages)
| URL | Fichier | Titre |
|:----|:--------|:------|
| /teacher | `teacher/page.tsx` | Dashboard Professeur |
| /teacher/classes | `teacher/classes/page.tsx` | Mes classes |
| /teacher/students | `teacher/students/page.tsx` | Mes élèves |
| /teacher/courses | `teacher/courses/page.tsx` | Mes cours |
| /teacher/messages | `teacher/messages/page.tsx` | Messages |

### Student (7 pages)
| URL | Fichier | Titre |
|:----|:--------|:------|
| /student | `student/page.tsx` | Mon Dashboard |
| /student/courses | `student/courses/page.tsx` | Mes cours |
| /student/revisions | `student/revisions/page.tsx` | Mes révisions |
| /student/assistant | `student/assistant/page.tsx` | Assistant IA |
| /student/calendar | `student/calendar/page.tsx` | Mon agenda |
| /student/messages | `student/messages/page.tsx` | Mes messages |
| /student/profile | `student/profile/page.tsx` | Mon profil |

---

## 9. Configuration navItems par rôle

```typescript
const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <Home /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users /> },
  { label: 'Classes', href: '/admin/classes', icon: <School /> },
  { label: 'Matières', href: '/admin/subjects', icon: <BookMarked /> },
  { label: 'Paramètres', href: '/admin/settings', icon: <Settings /> },
];

const teacherNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/teacher', icon: <Home /> },
  { label: 'Mes classes', href: '/teacher/classes', icon: <School /> },
  { label: 'Mes élèves', href: '/teacher/students', icon: <Users /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen /> },
  { label: 'Messages', href: '/teacher/messages', icon: <MessageSquare /> },
];

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/student', icon: <Home /> },
  { label: 'Mes cours', href: '/student/courses', icon: <BookOpen /> },
  { label: 'Révisions', href: '/student/revisions', icon: <GraduationCap /> },
  { label: 'Assistant IA', href: '/student/assistant', icon: <Brain /> },
  { label: 'Agenda', href: '/student/calendar', icon: <Calendar /> },
  { label: 'Messages', href: '/student/messages', icon: <MessageSquare /> },
];
```

---

*Dernière MAJ : 2025-12-22*

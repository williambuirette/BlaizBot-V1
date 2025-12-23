# 06 - Composants UI

> **Objectif** : Inventaire des composants réutilisables basé sur le wireframe
> **Source** : `blaizbot-wireframe/style.css` + modules JS

---

## 🎨 Design System

### Couleurs

```typescript
const colors = {
  primary: '#3498db',      // Bleu principal (boutons, liens)
  primaryDark: '#2980b9',  // Bleu hover
  success: '#2ecc71',      // Vert (validation, succès)
  warning: '#f39c12',      // Orange (alertes)
  danger: '#e74c3c',       // Rouge (erreurs, suppression)
  dark: '#2c3e50',         // Texte principal
  gray: '#95a5a6',         // Texte secondaire
  light: '#ecf0f1',        // Fond clair
  white: '#ffffff',
  background: '#f1f2f6',   // Fond messages bot
}
```

### Typographie

```typescript
const typography = {
  fontFamily: "'Segoe UI', Tahoma, sans-serif",
  sizes: {
    xs: '0.75rem',   // 12px
    sm: '0.85rem',   // 13.6px
    base: '0.9rem',  // 14.4px
    md: '1rem',      // 16px
    lg: '1.1rem',    // 17.6px
    xl: '1.2rem',    // 19.2px
    xxl: '1.5rem',   // 24px
  }
}
```

---

## 🔲 Composants Atomiques

### Button

| Variante | Usage | Classe Tailwind |
| :--- | :--- | :--- |
| `primary` | Action principale | `bg-primary text-white hover:bg-primary-dark` |
| `secondary` | Action secondaire | `bg-gray-200 text-dark hover:bg-gray-300` |
| `ghost` | Navigation sidebar | `bg-transparent hover:bg-gray-100` |
| `danger` | Suppression | `bg-danger text-white hover:bg-red-600` |
| `icon` | Icône seule | `p-2 rounded-full hover:bg-gray-100` |

```tsx
// src/components/ui/button.tsx (shadcn)
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}
```

### Input

| Type | Usage |
| :--- | :--- |
| `text` | Champs texte standard |
| `email` | Email avec validation |
| `password` | Mot de passe |
| `search` | Recherche avec icône |
| `textarea` | Message long |

```tsx
// src/components/ui/input.tsx (shadcn)
interface InputProps {
  type: 'text' | 'email' | 'password' | 'search';
  placeholder?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
```

### Badge

| Variante | Usage |
| :--- | :--- |
| `default` | Information neutre |
| `success` | Statut positif |
| `warning` | Attention |
| `danger` | Erreur/Urgent |

### Avatar

| Size | Pixels | Usage |
| :--- | :--- | :--- |
| `xs` | 24px | Liste dense |
| `sm` | 32px | Navigation |
| `md` | 40px | Chat messages |
| `lg` | 64px | Profil |
| `xl` | 96px | Page profil |

---

## 🧩 Composants Moléculaires

### Card

```tsx
// src/components/ui/card.tsx (shadcn)
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}
```

### Modal (Dialog)

```tsx
// src/components/ui/dialog.tsx (shadcn)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: ReactNode;
  footer?: ReactNode;
}
```

### Dropdown (Select)

```tsx
interface SelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

### Tabs

```tsx
interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}
```

---

## 🏗️ Composants Organismes

### Sidebar

```tsx
// src/components/layout/sidebar.tsx
interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  };
  navigation: NavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
}
```

### Header

```tsx
// src/components/layout/header.tsx
interface HeaderProps {
  title: string;
  breadcrumb?: string[];
  actions?: ReactNode;
}
```

### ChatMessage

```tsx
// src/components/features/chat/chat-message.tsx
interface ChatMessageProps {
  type: 'bot' | 'user' | 'system' | 'file';
  content: string;
  timestamp?: Date;
  avatar?: {
    initial: string;
    color: string;
  };
  actions?: {
    canCopy?: boolean;
    canRegenerate?: boolean;
  };
}
```

### ChatInput

```tsx
// src/components/features/chat/chat-input.tsx
interface ChatInputProps {
  placeholder: string;
  onSend: (message: string) => void;
  onAttach?: () => void;
  disabled?: boolean;
  attachments?: File[];
}
```

### KnowledgeTree

```tsx
// src/components/features/knowledge/knowledge-tree.tsx
interface KnowledgeTreeProps {
  subjects: Subject[];
  onSelectTheme: (subjectId: string, themeId: string) => void;
  onAddSubject?: () => void;
  onAddTheme?: (subjectId: string) => void;
  editable?: boolean;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  themes: Theme[];
}

interface Theme {
  id: string;
  name: string;
  documents: Document[];
}
```

### CalendarView

```tsx
// src/components/features/calendar/calendar-view.tsx
interface CalendarViewProps {
  events: CalendarEvent[];
  view: 'day' | 'week' | 'month';
  onDateChange: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onCreateEvent?: () => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'course' | 'exam' | 'assignment' | 'meeting';
  color?: string;
}
```

### DataTable

```tsx
// src/components/features/admin/data-table.tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  actions?: {
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
  };
}
```

---

## 📱 Composants Responsive

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px',
}
```

### Layout Mobile

- Sidebar devient un drawer (hamburger menu)
- Header simplifié
- Workspace en plein écran
- Bottom navigation pour les actions principales

---

## 🎯 Composants par Rôle

### Élève

| Composant | Fichier |
| :--- | :--- |
| `AssistantWorkspace` | `src/components/features/assistant/workspace.tsx` |
| `LabProject` | `src/components/features/lab/project.tsx` |
| `ProgressCard` | `src/components/features/student/progress-card.tsx` |
| `RevisionCard` | `src/components/features/student/revision-card.tsx` |

### Professeur

| Composant | Fichier |
| :--- | :--- |
| `ClassOverview` | `src/components/features/teacher/class-overview.tsx` |
| `StudentProgress` | `src/components/features/teacher/student-progress.tsx` |
| `ContentCreator` | `src/components/features/teacher/content-creator.tsx` |
| `EvaluationForm` | `src/components/features/teacher/evaluation-form.tsx` |

### Admin

| Composant | Fichier |
| :--- | :--- |
| `StatsCard` | `src/components/features/admin/stats-card.tsx` |
| `UserTable` | `src/components/features/admin/user-table.tsx` |
| `SystemConfig` | `src/components/features/admin/system-config.tsx` |
| `LicenseManager` | `src/components/features/admin/license-manager.tsx` |

---

## 📦 shadcn/ui Components à Installer

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add table
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add calendar
npx shadcn@latest add scroll-area
npx shadcn@latest add toast
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add skeleton
```

---

## ✅ Checklist

- [ ] Design tokens définis dans `tailwind.config.ts`
- [ ] Composants shadcn installés
- [ ] Composants métier créés
- [ ] Responsive testé sur mobile/tablet/desktop
- [ ] Dark mode supporté (optionnel Phase 4)

# 🗺️ Mapping Wireframe → Composants Next.js

> **Objectif** : Correspondance exacte entre le wireframe HTML et les composants à créer
> **Source** : `blaizbot-wireframe/` → **Cible** : `BlaizBot-V1/src/`

---

## 📊 Vue d'Ensemble

| Fichier Wireframe | Route Next.js | Composants à créer |
|:------------------|:--------------|:-------------------|
| `index.html` | `/login` | LoginForm |
| `student.html` | `/student/*` | StudentDashboard, CourseCard, etc. |
| `teacher.html` | `/teacher/*` | TeacherDashboard, LessonTable, etc. |
| `admin.html` | `/admin/*` | AdminDashboard, UsersTable, etc. |

---

## 🔐 LOGIN (`index.html` → `src/app/(auth)/login/`)

### Mapping Éléments

| Élément Wireframe | Composant Next.js | Fichier |
|:------------------|:------------------|:--------|
| `#login-form` | `<LoginForm />` | `components/features/auth/LoginForm.tsx` |
| `input[type="email"]` | shadcn `<Input />` | - |
| `input[type="password"]` | shadcn `<Input />` | - |
| `button.btn-primary` | shadcn `<Button />` | - |
| Message d'erreur | shadcn `<Alert />` | - |

### Code Wireframe → Next.js

```html
<!-- Wireframe (index.html) -->
<form id="login-form">
  <input type="email" placeholder="Email">
  <input type="password" placeholder="Mot de passe">
  <button type="submit">Se connecter</button>
</form>
```

```tsx
// Next.js (LoginForm.tsx)
<form onSubmit={handleSubmit}>
  <Input type="email" placeholder="Email" {...register('email')} />
  <Input type="password" placeholder="Mot de passe" {...register('password')} />
  <Button type="submit">Se connecter</Button>
</form>
```

---

## 👨‍🎓 ÉLÈVE (`student.html` → `src/app/(dashboard)/student/`)

### Structure Navigation

| ID Wireframe | Route Next.js | Page |
|:-------------|:--------------|:-----|
| `#nav-dashboard` | `/student` | `page.tsx` |
| `#nav-courses` | `/student/courses` | `courses/page.tsx` |
| `#nav-exercises` | `/student/exercises` | `exercises/page.tsx` |
| `#nav-ai` | `/student/ai` | `ai/page.tsx` |
| `#nav-revisions` | `/student/revisions` | `revisions/page.tsx` |
| `#nav-messages` | `/student/messages` | `messages/page.tsx` |
| `#nav-agenda` | `/student/agenda` | `agenda/page.tsx` |

### Composants Dashboard Élève

| Section Wireframe | Composant | Props |
|:------------------|:----------|:------|
| `.card-progress` | `<ProgressCard />` | `progress: number` |
| `.card-average` | `<AverageCard />` | `average: number` |
| `.card-todos` | `<TodosCard />` | `todos: Todo[]` |
| `.grades-table` | `<GradesTable />` | `grades: Grade[]` |
| `.course-card` | `<CourseCard />` | `course: Course` |

### Mapping Section IA (`#section-chatbot`)

| Élément Wireframe | Composant | Fichier |
|:------------------|:----------|:--------|
| `.chat-messages` | `<ChatMessages />` | `features/ai/ChatMessages.tsx` |
| `.chat-input` | `<ChatInput />` | `features/ai/ChatInput.tsx` |
| `.mode-selector` | `<ModeSelector />` | `features/ai/ModeSelector.tsx` |
| `.course-context` | `<CourseContext />` | `features/ai/CourseContext.tsx` |

---

## 👨‍🏫 PROFESSEUR (`teacher.html` → `src/app/(dashboard)/teacher/`)

### Structure Navigation

| ID Wireframe | Route Next.js | Page |
|:-------------|:--------------|:-----|
| `#nav-dashboard` | `/teacher` | `page.tsx` |
| `#nav-classes` | `/teacher/classes` | `classes/page.tsx` |
| `#nav-classes-detail` | `/teacher/classes/[id]` | `classes/[id]/page.tsx` |
| `#nav-courses` | `/teacher/courses` | `courses/page.tsx` |
| `#nav-messages` | `/teacher/messages` | `messages/page.tsx` |
| `#nav-agenda` | `/teacher/agenda` | `agenda/page.tsx` |

### Composants Dashboard Prof

| Section Wireframe | Composant | Props |
|:------------------|:----------|:------|
| `.stats-cards` | `<TeacherStatsCards />` | `stats: TeacherStats` |
| `.classes-grid` | `<ClassesGrid />` | `classes: Class[]` |
| `.class-card` | `<ClassCard />` | `class: Class` |
| `.students-table` | `<StudentsTable />` | `students: Student[]` |
| `.course-form` | `<CourseFormModal />` | `onSubmit, course?` |

### Mapping Création Cours

| Élément Wireframe | Composant | Notes |
|:------------------|:----------|:------|
| `#course-title` | `<Input />` | Titre du cours |
| `#course-subject` | `<Select />` | Liste matières |
| `#course-content` | `<Textarea />` ou Editor | Contenu markdown |
| `#add-chapter` | `<Button />` | Ajouter chapitre |
| `.chapters-list` | `<ChaptersList />` | Drag & drop order |

---

## 👔 ADMIN (`admin.html` → `src/app/(dashboard)/admin/`)

### Structure Navigation

| ID Wireframe | Route Next.js | Page |
|:-------------|:--------------|:-----|
| `#nav-dashboard` | `/admin` | `page.tsx` |
| `#nav-users` | `/admin/users` | `users/page.tsx` |
| `#nav-classes` | `/admin/classes` | `classes/page.tsx` |
| `#nav-subjects` | `/admin/subjects` | `subjects/page.tsx` |
| `#nav-settings` | `/admin/settings` | `settings/page.tsx` |

### Composants Dashboard Admin

| Section Wireframe | Composant | Props |
|:------------------|:----------|:------|
| `.kpi-cards` | `<AdminKPICards />` | `stats: AdminStats` |
| `.users-table` | `<UsersTable />` | `users: User[], onEdit, onDelete` |
| `.user-form-modal` | `<UserFormModal />` | `user?, onSubmit` |
| `.classes-table` | `<ClassesTable />` | `classes: Class[]` |
| `.subjects-table` | `<SubjectsTable />` | `subjects: Subject[]` |

### Mapping CRUD Users

| Action Wireframe | Composant/Action | API |
|:-----------------|:-----------------|:----|
| `#btn-add-user` | `<Button onClick={openModal}>` | - |
| `#user-form` | `<UserFormModal />` | `POST /api/admin/users` |
| `.btn-edit` | `onClick={editUser}` | `PUT /api/admin/users/[id]` |
| `.btn-delete` | `onClick={deleteUser}` | `DELETE /api/admin/users/[id]` |

---

## 🎨 COMPOSANTS LAYOUT PARTAGÉS

| Élément Wireframe | Composant | Fichier |
|:------------------|:----------|:--------|
| `.sidebar` | `<Sidebar />` | `components/layout/Sidebar.tsx` |
| `.header` | `<Header />` | `components/layout/Header.tsx` |
| `.nav-item` | `<NavItem />` | `components/layout/NavItem.tsx` |
| `.user-menu` | `<UserMenu />` | `components/layout/UserMenu.tsx` |
| `.breadcrumb` | `<Breadcrumb />` | `components/layout/Breadcrumb.tsx` |

---

## 🔧 COMPOSANTS UI SHADCN REQUIS

Installer via `npx shadcn@latest add [component]` :

| Composant | Usage principal |
|:----------|:----------------|
| `button` | Actions, soumissions |
| `input` | Formulaires |
| `card` | Conteneurs, KPIs |
| `table` | Listes CRUD |
| `dialog` | Modales |
| `select` | Dropdowns |
| `textarea` | Contenu long |
| `badge` | Tags, statuts |
| `avatar` | Photos profil |
| `toast` | Notifications |
| `alert` | Messages erreur |
| `tabs` | Navigation secondaire |
| `progress` | Barres progression |
| `skeleton` | Loading states |

---

## 📁 Structure Fichiers Recommandée

```
src/components/
├── ui/                     # shadcn (auto-généré)
├── layout/
│   ├── Sidebar.tsx         # Navigation principale
│   ├── Header.tsx          # Barre supérieure
│   ├── NavItem.tsx         # Item navigation
│   └── UserMenu.tsx        # Menu utilisateur
└── features/
    ├── auth/
    │   └── LoginForm.tsx
    ├── admin/
    │   ├── AdminKPICards.tsx
    │   ├── UsersTable.tsx
    │   ├── UserFormModal.tsx
    │   ├── ClassesTable.tsx
    │   └── SubjectsTable.tsx
    ├── teacher/
    │   ├── TeacherStatsCards.tsx
    │   ├── ClassesGrid.tsx
    │   ├── ClassCard.tsx
    │   ├── CoursesTable.tsx
    │   └── CourseFormModal.tsx
    ├── student/
    │   ├── ProgressCard.tsx
    │   ├── CourseCard.tsx
    │   ├── ChapterViewer.tsx
    │   └── RevisionCard.tsx
    └── ai/
        ├── ChatMessages.tsx
        ├── ChatInput.tsx
        ├── ModeSelector.tsx
        └── QuizPlayer.tsx
```

---

## 🔗 Référence Rapide

Pour chaque section du wireframe, l'IA doit :

1. **Ouvrir** le fichier HTML correspondant dans `blaizbot-wireframe/`
2. **Identifier** la section avec son ID (`#section-xxx`)
3. **Consulter** ce mapping pour connaître le composant cible
4. **Créer** le composant dans le bon dossier

---

*Dernière mise à jour : 22.12.2025*

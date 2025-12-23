# 🗂️ Structure Cible du Projet

> **Où créer chaque fichier** : Consulter ce document avant de coder.

---

## 📁 Arborescence Complète

```
BlaizBot-V1/
├── .env                          # Variables d'environnement (JAMAIS commit)
├── .env.example                  # Template des variables
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── components.json               # Config shadcn/ui
│
├── prisma/
│   ├── schema.prisma             # Modèle de données
│   └── seed.ts                   # Données initiales
│
├── public/
│   └── images/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Layout racine
│   │   ├── page.tsx              # Page d'accueil (redirect login)
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/               # Routes publiques
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/          # Routes protégées
│   │   │   ├── layout.tsx        # Layout avec Sidebar
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx      # Dashboard Admin
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── classes/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── subjects/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── teacher/
│   │   │   │   ├── page.tsx      # Dashboard Prof
│   │   │   │   ├── classes/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── lessons/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── messages/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── agenda/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── student/
│   │   │       ├── page.tsx      # Dashboard Élève
│   │   │       ├── courses/
│   │   │       │   ├── page.tsx
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx
│   │   │       ├── revisions/
│   │   │       │   └── page.tsx
│   │   │       ├── ai/
│   │   │       │   └── page.tsx  # Chat IA
│   │   │       ├── messages/
│   │   │       │   └── page.tsx
│   │   │       ├── agenda/
│   │   │       │   └── page.tsx
│   │   │       └── profile/
│   │   │           └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       │
│   │       ├── admin/
│   │       │   ├── stats/
│   │       │   │   └── route.ts
│   │       │   ├── users/
│   │       │   │   ├── route.ts
│   │       │   │   └── [id]/
│   │       │   │       └── route.ts
│   │       │   ├── classes/
│   │       │   │   └── ...
│   │       │   └── subjects/
│   │       │       └── ...
│   │       │
│   │       ├── teacher/
│   │       │   ├── stats/
│   │       │   ├── classes/
│   │       │   ├── lessons/
│   │       │   ├── documents/
│   │       │   └── messages/
│   │       │
│   │       ├── student/
│   │       │   ├── stats/
│   │       │   ├── courses/
│   │       │   ├── progress/
│   │       │   ├── revisions/
│   │       │   └── messages/
│   │       │
│   │       └── ai/
│   │           ├── chat/
│   │           │   └── route.ts
│   │           ├── quiz/
│   │           │   └── route.ts
│   │           └── revision/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui (généré)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/               # Composants de structure
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── NavItem.tsx
│   │   │   └── UserMenu.tsx
│   │   │
│   │   └── features/             # Composants métier
│   │       ├── admin/
│   │       │   ├── UsersTable.tsx
│   │       │   ├── UserFormModal.tsx
│   │       │   ├── ClassesTable.tsx
│   │       │   └── ...
│   │       │
│   │       ├── teacher/
│   │       │   ├── LessonsTable.tsx
│   │       │   ├── LessonFormModal.tsx
│   │       │   ├── DocumentUploader.tsx
│   │       │   └── ...
│   │       │
│   │       ├── student/
│   │       │   ├── CourseCard.tsx
│   │       │   ├── ProgressBar.tsx
│   │       │   ├── RevisionCard.tsx
│   │       │   └── ...
│   │       │
│   │       ├── ai/
│   │       │   ├── ChatContainer.tsx
│   │       │   ├── ChatMessageList.tsx
│   │       │   ├── ChatMessage.tsx
│   │       │   ├── ChatInput.tsx
│   │       │   └── QuizViewer.tsx
│   │       │
│   │       └── shared/           # Composants réutilisables
│   │           ├── StatsCard.tsx
│   │           ├── DataTable.tsx
│   │           ├── FormModal.tsx
│   │           ├── AgendaCalendar.tsx
│   │           ├── ConversationList.tsx
│   │           └── MessageThread.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts             # Client Prisma singleton
│   │   ├── auth.ts               # Config NextAuth
│   │   ├── utils.ts              # Helpers (cn, etc.)
│   │   │
│   │   ├── validations/          # Schémas Zod
│   │   │   ├── user.ts
│   │   │   ├── class.ts
│   │   │   ├── lesson.ts
│   │   │   └── ...
│   │   │
│   │   └── ai/                   # Logique IA
│   │       ├── openai.ts         # Client OpenAI
│   │       ├── chat.ts           # Streaming chat
│   │       ├── prompts.ts        # System prompts
│   │       ├── embeddings.ts     # Génération embeddings
│   │       ├── rag.ts            # Recherche similaire
│   │       ├── quiz.ts           # Génération quiz
│   │       └── revision.ts       # Génération fiches
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useToast.ts
│   │   └── ...
│   │
│   ├── types/                    # Types globaux
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── database.ts
│   │
│   └── data/                     # Mock data (Phase 3)
│       └── mock.ts
│
├── docs/                         # Documentation
│   └── ...
│
└── todo/                         # Ce dossier
    └── ...
```

---

## 📏 Limites de taille par type

| Type de fichier | Max lignes | Exemple |
|:----------------|:-----------|:--------|
| Page (`page.tsx`) | 100 | Orchestrateur, imports composants |
| Composant feature | 250 | Table, Form, Modal |
| Composant UI | 150 | Button, Card, Input |
| API route | 150 | CRUD simple |
| Lib function | 100 | Helper, util |
| Types | 100 | Interfaces, types |

---

## 🎯 Conventions de nommage

| Type | Convention | Exemple |
|:-----|:-----------|:--------|
| Composant | PascalCase | `UserFormModal.tsx` |
| Page | lowercase | `page.tsx` |
| Hook | camelCase + use | `useAuth.ts` |
| Lib | camelCase | `prisma.ts` |
| Type | PascalCase | `User`, `ApiResponse` |
| Dossier route | lowercase | `admin/`, `users/` |

---

*Consulter ce fichier AVANT de créer un nouveau fichier.*

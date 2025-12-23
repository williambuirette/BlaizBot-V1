# 🗄️ Modèle de Données - BlaizBot V1

> **Document** : 04/10 - Schéma de base de données
> **Statut** : 🟡 En cours
> **ORM** : Prisma (PostgreSQL)

---

## 📊 Diagramme Entités-Relations

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      User       │       │     Subject     │       │      Class      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ email           │       │ name            │       │ name            │
│ passwordHash    │       │ createdAt       │       │ level           │
│ role            │───┐   │ updatedAt       │       │ createdAt       │
│ firstName       │   │   └────────┬────────┘       └────────┬────────┘
│ lastName        │   │            │                         │
│ createdAt       │   │            │                         │
└────────┬────────┘   │   ┌────────┴─────────────────────────┴────────┐
         │            │   │                                            │
         │            └───┤              TeacherProfile                │
         │                ├────────────────────────────────────────────┤
         ▼                │ id                                         │
┌─────────────────┐       │ userId ──────────────────────────────────► │
│  StudentProfile │       │ subjects[] ◄─────────────────────────────  │
├─────────────────┤       │ classes[]  ◄─────────────────────────────  │
│ id              │       └────────────────────────────────────────────┘
│ userId ─────────┤
│ classId ────────┼───────────────────────────────────────────────────►│
│ parentEmail     │
│ subjects[]      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Course      │       │   Assignment    │       │    Exercise     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │◄──────│ courseId        │       │ id              │
│ title           │       │ targetType      │       │ title           │
│ description     │       │ targetId        │       │ type            │
│ subjectId ──────┼──►    │ dueDate         │       │ content (JSON)  │
│ teacherId ──────┼──►    │ status          │       │ courseId ───────┼──►
│ parentFolderId  │       └─────────────────┘       │ createdAt       │
│ aiConfig (JSON) │                                 └─────────────────┘
│ content         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   CourseFile    │       │     Grade       │       │   Progression   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │       │ id              │
│ courseId ───────┼──►    │ studentId ──────┼──►    │ studentId ──────┼──►
│ filename        │       │ exerciseId ─────┼──►    │ courseId ───────┼──►
│ fileType        │       │ score           │       │ percentage      │
│ url             │       │ aiComment       │       │ lastActivity    │
│ isLocked        │       │ createdAt       │       │ updatedAt       │
└─────────────────┘       └─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   LabProject    │       │   LabSource     │       │  Conversation   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │◄──────│ projectId       │       │ id              │
│ studentId ──────┼──►    │ type            │       │ type            │
│ title           │       │ filename        │       │ subjectId       │
│ createdAt       │       │ url             │       │ topicName       │
└─────────────────┘       │ content         │       │ participants[]  │
                          └─────────────────┘       └────────┬────────┘
                                                             │
┌─────────────────┐       ┌─────────────────┐                ▼
│  KnowledgeBase  │       │  CalendarEvent  │       ┌─────────────────┐
├─────────────────┤       ├─────────────────┤       │     Message     │
│ id              │       │ id              │       ├─────────────────┤
│ ownerId ────────┼──►    │ ownerId ────────┼──►    │ id              │
│ ownerType       │       │ ownerType       │       │ conversationId ─┼──►
│ subjectId       │       │ title           │       │ senderId ───────┼──►
│ topic           │       │ startDate       │       │ content         │
│ documents[]     │       │ endDate         │       │ createdAt       │
│ type (teacher/  │       │ isTeacherEvent  │       └─────────────────┘
│       student)  │       │ description     │
└─────────────────┘       └─────────────────┘

┌─────────────────┐       ┌─────────────────┐
│   AISettings    │       │    AIChat       │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ provider        │       │ userId ─────────┼──►
│ apiKey (encrypt)│       │ contextType     │
│ model           │       │ contextId       │
│ endpoint        │       │ messages (JSON) │
│ restrictionLevel│       │ createdAt       │
│ updatedAt       │       └─────────────────┘
└─────────────────┘
```

---

## 📝 Schéma Prisma Complet

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTHENTIFICATION & UTILISATEURS
// ============================================

enum Role {
  ADMIN
  TEACHER
  STUDENT
  PARENT
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          Role
  firstName     String
  lastName      String
  phone         String?
  address       String?
  city          String?
  postalCode    String?
  isActive      Boolean   @default(true)
  lastLogin     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations selon le rôle
  teacherProfile  TeacherProfile?
  studentProfile  StudentProfile?
  
  // Relations communes
  sentMessages    Message[]       @relation("SentMessages")
  calendarEvents  CalendarEvent[]
  aiChats         AIChat[]
}

model TeacherProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Relations many-to-many
  subjects  Subject[]  @relation("TeacherSubjects")
  classes   Class[]    @relation("TeacherClasses")
  
  // Contenus créés
  courses   Course[]
}

model StudentProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  classId     String
  class       Class    @relation(fields: [classId], references: [id])
  
  parentEmail String?
  
  // Relations
  subjects      Subject[]     @relation("StudentSubjects")
  grades        Grade[]
  progressions  Progression[]
  labProjects   LabProject[]
  knowledgeBases KnowledgeBase[] @relation("StudentKnowledge")
}

// ============================================
// ORGANISATION SCOLAIRE
// ============================================

model Subject {
  id        String   @id @default(cuid())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  teachers  TeacherProfile[] @relation("TeacherSubjects")
  students  StudentProfile[] @relation("StudentSubjects")
  courses   Course[]
  conversations Conversation[]
  knowledgeBases KnowledgeBase[]
}

model Class {
  id        String   @id @default(cuid())
  name      String   @unique  // ex: "6ème A"
  level     String            // ex: "6ème"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  teachers  TeacherProfile[] @relation("TeacherClasses")
  students  StudentProfile[]
  assignments Assignment[]   @relation("ClassAssignments")
}

// ============================================
// CONTENUS PÉDAGOGIQUES
// ============================================

model Course {
  id            String   @id @default(cuid())
  title         String
  description   String?
  content       String?  @db.Text  // Contenu markdown/HTML
  
  subjectId     String
  subject       Subject  @relation(fields: [subjectId], references: [id])
  
  teacherId     String
  teacher       TeacherProfile @relation(fields: [teacherId], references: [id])
  
  parentFolderId String?
  parentFolder   Course?  @relation("CourseHierarchy", fields: [parentFolderId], references: [id])
  children       Course[] @relation("CourseHierarchy")
  
  isFolder      Boolean  @default(false)
  
  // Configuration IA
  aiObjective   String?  @db.Text
  aiExerciseTypes String[] // ["quiz", "application", "case_study", etc.]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  files         CourseFile[]
  exercises     Exercise[]
  assignments   Assignment[]
  progressions  Progression[]
}

model CourseFile {
  id        String   @id @default(cuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  filename  String
  fileType  String   // "pdf", "video", "link", etc.
  url       String
  isLocked  Boolean  @default(false)  // true = imposé par prof
  
  // Pour le RAG
  embeddings Float[]? @db.DoublePrecision  // Vecteurs pour recherche
  
  createdAt DateTime @default(now())
}

model Exercise {
  id        String   @id @default(cuid())
  title     String
  type      String   // "quiz", "open", "multiple_choice", etc.
  content   Json     // Structure flexible pour les questions
  
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  grades    Grade[]
}

// ============================================
// ATTRIBUTIONS & PROGRESSION
// ============================================

enum AssignmentTargetType {
  CLASS
  STUDENT
}

enum AssignmentStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

model Assignment {
  id          String   @id @default(cuid())
  
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  
  targetType  AssignmentTargetType
  
  // Cible (soit une classe, soit un élève)
  classId     String?
  class       Class?   @relation("ClassAssignments", fields: [classId], references: [id])
  
  studentId   String?
  
  dueDate     DateTime?
  status      AssignmentStatus @default(ACTIVE)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Grade {
  id          String   @id @default(cuid())
  
  studentId   String
  student     StudentProfile @relation(fields: [studentId], references: [id])
  
  exerciseId  String
  exercise    Exercise @relation(fields: [exerciseId], references: [id])
  
  score       Float
  maxScore    Float    @default(20)
  aiComment   String?  @db.Text
  
  createdAt   DateTime @default(now())
}

model Progression {
  id          String   @id @default(cuid())
  
  studentId   String
  student     StudentProfile @relation(fields: [studentId], references: [id])
  
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  
  percentage  Float    @default(0)
  lastActivity DateTime @default(now())
  
  updatedAt   DateTime @updatedAt

  @@unique([studentId, courseId])
}

// ============================================
// BLAIZ'BOT LAB (Projets personnels)
// ============================================

enum LabSourceType {
  FILE
  LINK
  YOUTUBE
  TEXT
}

model LabProject {
  id        String   @id @default(cuid())
  title     String
  
  studentId String
  student   StudentProfile @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  sources   LabSource[]
}

model LabSource {
  id          String   @id @default(cuid())
  
  projectId   String
  project     LabProject @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  type        LabSourceType
  filename    String?
  url         String?
  content     String?  @db.Text
  
  // Pour le RAG
  embeddings  Float[]? @db.DoublePrecision
  
  createdAt   DateTime @default(now())
}

// ============================================
// BASE DE CONNAISSANCES
// ============================================

enum KnowledgeOwnerType {
  TEACHER
  STUDENT
}

model KnowledgeBase {
  id          String   @id @default(cuid())
  
  ownerType   KnowledgeOwnerType
  
  // Propriétaire (soit prof via subject, soit élève)
  subjectId   String?
  subject     Subject? @relation(fields: [subjectId], references: [id])
  
  studentId   String?
  student     StudentProfile? @relation("StudentKnowledge", fields: [studentId], references: [id])
  
  topic       String
  documents   Json     // Array de {filename, url, type}
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// ============================================
// MESSAGERIE
// ============================================

enum ConversationType {
  CLASS_GENERAL
  CLASS_TOPIC
  PRIVATE
}

model Conversation {
  id          String   @id @default(cuid())
  type        ConversationType
  
  subjectId   String?
  subject     Subject? @relation(fields: [subjectId], references: [id])
  
  topicName   String?  // ex: "Les Fractions"
  
  // Participants (stocké comme array d'IDs pour flexibilité)
  participantIds String[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  messages    Message[]
}

model Message {
  id              String   @id @default(cuid())
  
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  senderId        String
  sender          User     @relation("SentMessages", fields: [senderId], references: [id])
  
  content         String   @db.Text
  attachments     Json?    // Array de {filename, url}
  
  createdAt       DateTime @default(now())
}

// ============================================
// CALENDRIER
// ============================================

model CalendarEvent {
  id              String   @id @default(cuid())
  
  ownerId         String
  owner           User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  
  title           String
  description     String?  @db.Text
  
  startDate       DateTime
  endDate         DateTime
  
  isTeacherEvent  Boolean  @default(false)  // true = événement imposé par prof
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// ============================================
// CONFIGURATION IA
// ============================================

enum AIProvider {
  OPENAI
  GOOGLE
  ANTHROPIC
  MISTRAL
  CUSTOM
}

enum AIRestrictionLevel {
  STRICT
  BALANCED
  CREATIVE
}

model AISettings {
  id                String   @id @default(cuid())
  
  provider          AIProvider @default(OPENAI)
  apiKey            String   // Chiffré en BDD
  model             String   @default("gpt-4o")
  endpoint          String?  // Pour CUSTOM
  
  restrictionLevel  AIRestrictionLevel @default(BALANCED)
  enablePdfAnalysis Boolean  @default(true)
  allowTeacherPrompts Boolean @default(true)
  maintenanceMode   Boolean  @default(false)
  
  platformName      String   @default("Blaiz'bot")
  defaultLanguage   String   @default("fr")
  
  updatedAt         DateTime @updatedAt
}

model AIChat {
  id          String   @id @default(cuid())
  
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  contextType String   // "course", "lab", "assistant"
  contextId   String?  // ID du cours ou projet
  
  messages    Json     // Array de {role, content, timestamp}
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🔗 Relations Clés

### User → Profils
- Un `User` a **un seul profil** selon son rôle (`TeacherProfile` OU `StudentProfile`)
- Le profil contient les relations spécifiques au rôle

### Cours & Contenus
- `Course` peut être un **dossier** (`isFolder: true`) ou un **document**
- Hiérarchie parent-enfant via `parentFolderId`
- `CourseFile` = fichiers attachés (PDF, vidéos)
- `Exercise` = exercices générés ou créés

### Attributions
- `Assignment` lie un `Course` à une cible (`Class` OU `StudentProfile`)
- Permet de suivre les échéances et statuts

### IA & RAG
- `CourseFile.embeddings` et `LabSource.embeddings` stockent les vecteurs pour la recherche sémantique
- `AIChat` conserve l'historique des conversations

---

## ✅ Validation

Avant de passer au document suivant :
- [ ] Le modèle couvre-t-il tous les besoins du wireframe ?
- [ ] Les relations sont-elles correctes ?
- [ ] Manque-t-il des entités ?

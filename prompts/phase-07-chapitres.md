# Phase 7.8 - Gestion des Chapitres & Organisation des Cours

> **Objectif** : Structure hiérarchique 5 niveaux + Assignations + Base de connaissances  
> **Durée estimée** : 8-10h  
> **Pré-requis** : Phase 7.1-7.7 terminées, Phase 7.9 terminée

---

## 🎯 Architecture Cible

### Hiérarchie 5 Niveaux

```
Matière (Subject)          ← Existant
  └── Cours (Course)       ← Existant
       └── Chapitre (Chapter)     ← NOUVEAU
            └── Section (Section)  ← NOUVEAU
                 └── Élément (content dans Section)
```

### Types de Sections

| Type | Icône | Description |
|:-----|:------|:------------|
| `LESSON` | 📖 | Contenu texte/HTML (TipTap) |
| `EXERCISE` | ✏️ | Exercice avec correction |
| `QUIZ` | ❓ | QCM auto-corrigé |
| `VIDEO` | 🎬 | Vidéo intégrée (YouTube/upload) |

### Système d'Assignation

| Cible | Description |
|:------|:------------|
| `CLASS` | Toute la classe |
| `TEAM` | Groupe d'élèves (équipe) |
| `STUDENT` | Un élève individuel |

### Base de Connaissances

| Type | Icône | Description |
|:-----|:------|:------------|
| `LINK` | 🔗 | Lien externe |
| `YOUTUBE` | 📺 | Vidéo YouTube |
| `PDF` | 📄 | Fichier PDF uploadé |
| `IMAGE` | 🖼️ | Image uploadée |

---

## 📋 Ordre de Développement

| Bloc | Tâches | Description |
|:-----|:-------|:------------|
| **1. PRISMA** | 7.8.1 | Migration base de données |
| **2. API CRUD** | 7.8.2 → 7.8.6 | Chapitres, Sections, Ressources, Équipes, Assignations |
| **3. UI Structure** | 7.8.7 → 7.8.8 | Onglets Structure et Ressources |
| **4. UI Exercices** | 7.8.9 | Onglet Exercices |
| **5. UI Assignations** | 7.8.10 | Onglet Assignations |
| **6. INTÉGRATION** | 7.8.11 | Page cours complète |

---

## 📋 Bloc 1 : PRISMA MIGRATION

### Prompt 7.8.1 — Migration Prisma (Chapitres, Sections, Ressources, Équipes, Assignations)

```
Modifier `prisma/schema.prisma` :

// ============================================
// ENUMS
// ============================================

enum SectionType {
  LESSON     // Contenu texte
  EXERCISE   // Exercice avec correction
  QUIZ       // QCM auto-corrigé
  VIDEO      // Vidéo intégrée
}

enum ResourceType {
  LINK       // Lien externe
  YOUTUBE    // Vidéo YouTube
  PDF        // Fichier PDF
  IMAGE      // Image
}

enum AssignmentTarget {
  CLASS      // Toute la classe
  TEAM       // Groupe d'élèves
  STUDENT    // Un élève
}

enum ProgressStatus {
  NOT_STARTED  // Pas commencé
  IN_PROGRESS  // En cours
  COMPLETED    // Terminé
  GRADED       // Noté
}

// ============================================
// CHAPITRES & SECTIONS
// ============================================

model Chapter {
  id          String    @id @default(cuid())
  courseId    String
  course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  title       String
  description String?
  order       Int       @default(0)
  
  sections    Section[]
  assignments Assignment[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([courseId])
  @@index([order])
}

model Section {
  id          String      @id @default(cuid())
  chapterId   String
  chapter     Chapter     @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  title       String
  type        SectionType @default(LESSON)
  content     String?     @db.Text  // HTML pour LESSON, JSON pour QUIZ/EXERCISE
  order       Int         @default(0)
  duration    Int?        // Minutes estimées
  
  assignments Assignment[]
  progress    StudentProgress[]
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([chapterId])
  @@index([order])
}

// ============================================
// BASE DE CONNAISSANCES
// ============================================

model Resource {
  id          String       @id @default(cuid())
  courseId    String
  course      Course       @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  title       String
  description String?
  type        ResourceType
  url         String?      // Pour LINK, YOUTUBE
  fileUrl     String?      // Pour PDF, IMAGE (upload)
  order       Int          @default(0)
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  @@index([courseId])
  @@index([type])
}

// ============================================
// ÉQUIPES (Groupes d'élèves)
// ============================================

model Team {
  id          String       @id @default(cuid())
  name        String
  classId     String
  class       Class        @relation(fields: [classId], references: [id], onDelete: Cascade)
  
  members     TeamMember[]
  assignments Assignment[]
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  
  @@index([classId])
}

model TeamMember {
  id        String   @id @default(cuid())
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  studentId String
  student   User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([teamId, studentId])
}

// ============================================
// ASSIGNATIONS
// ============================================

model Assignment {
  id          String           @id @default(cuid())
  
  // Qui assigne
  teacherId   String
  teacher     User             @relation("TeacherAssignments", fields: [teacherId], references: [id])
  
  // Quoi assigner (un seul parmi les 3)
  courseId    String?
  course      Course?          @relation(fields: [courseId], references: [id], onDelete: Cascade)
  chapterId   String?
  chapter     Chapter?         @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  sectionId   String?
  section     Section?         @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  
  // À qui assigner
  targetType  AssignmentTarget
  classId     String?
  class       Class?           @relation(fields: [classId], references: [id], onDelete: Cascade)
  teamId      String?
  team        Team?            @relation(fields: [teamId], references: [id], onDelete: Cascade)
  studentId   String?
  student     User?            @relation("StudentAssignments", fields: [studentId], references: [id])
  
  // Détails
  title       String
  instructions String?         @db.Text
  dueDate     DateTime?
  
  // Suivi
  progress    StudentProgress[]
  
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  @@index([teacherId])
  @@index([courseId])
  @@index([chapterId])
  @@index([sectionId])
  @@index([classId])
  @@index([teamId])
  @@index([studentId])
}

// ============================================
// PROGRESSION ÉLÈVE
// ============================================

model StudentProgress {
  id           String         @id @default(cuid())
  
  assignmentId String
  assignment   Assignment     @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  studentId    String
  student      User           @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  // Optionnel : lien direct vers la section
  sectionId    String?
  section      Section?       @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  
  status       ProgressStatus @default(NOT_STARTED)
  score        Float?         // Note sur 100
  timeSpent    Int?           // Minutes passées
  completedAt  DateTime?
  
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  
  @@unique([assignmentId, studentId])
  @@index([studentId])
  @@index([sectionId])
}

// ============================================
// RELATIONS À AJOUTER
// ============================================

// Dans model Course (ajouter) :
//   chapters    Chapter[]
//   resources   Resource[]
//   assignments Assignment[]

// Dans model Class (ajouter) :
//   teams       Team[]
//   assignments Assignment[]

// Dans model User (ajouter) :
//   teamMemberships TeamMember[]
//   teacherAssignmentsCreated Assignment[] @relation("TeacherAssignments")
//   studentAssignmentsReceived Assignment[] @relation("StudentAssignments")
//   progress StudentProgress[]

Puis exécuter :
npx prisma db push
npx prisma generate
```

**Validation** :
- [ ] Prisma Studio montre les nouvelles tables
- [ ] `npx prisma generate` sans erreur
- [ ] Relations bi-directionnelles OK

---

## 📋 Bloc 2 : API CRUD

### Prompt 7.8.2 — API Chapitres

```
Créer `src/app/api/teacher/courses/[id]/chapters/route.ts` :

GET : Liste les chapitres d'un cours (triés par order)
- Vérifier que le prof est propriétaire du cours
- Include sections (count ou liste)

POST : Créer un chapitre
- Body : { title, description? }
- Calcul auto de order (max + 1)
- courseId depuis les params

---

Créer `src/app/api/teacher/chapters/[id]/route.ts` :

GET : Détails d'un chapitre avec sections
PUT : Modifier (title, description, order)
DELETE : Supprimer (cascade sections)

Sécurité : Vérifier que chapter.course.teacherId === session.user.id
```

### Prompt 7.8.3 — API Sections

```
Créer `src/app/api/teacher/chapters/[id]/sections/route.ts` :

GET : Liste les sections d'un chapitre (triées par order)
- Include type, duration, hasContent (boolean)

POST : Créer une section
- Body : { title, type, content?, duration? }
- Calcul auto de order

---

Créer `src/app/api/teacher/sections/[id]/route.ts` :

GET : Détails d'une section (content complet)
PUT : Modifier (title, type, content, order, duration)
DELETE : Supprimer

Sécurité : Vérifier via chapter.course.teacherId
```

### Prompt 7.8.4 — API Ressources

```
Créer `src/app/api/teacher/courses/[id]/resources/route.ts` :

GET : Liste les ressources d'un cours
- Filtrage optionnel par type (?type=YOUTUBE)

POST : Créer une ressource
- Body : { title, description?, type, url?, fileUrl? }
- Validation : LINK/YOUTUBE → url requis, PDF/IMAGE → fileUrl requis

---

Créer `src/app/api/teacher/resources/[id]/route.ts` :

GET : Détails
PUT : Modifier
DELETE : Supprimer

Sécurité : Vérifier via course.teacherId
```

### Prompt 7.8.5 — API Équipes

```
Créer `src/app/api/teacher/classes/[id]/teams/route.ts` :

GET : Liste les équipes d'une classe
- Include members count, members (id, firstName, lastName)

POST : Créer une équipe
- Body : { name, memberIds: string[] }

---

Créer `src/app/api/teacher/teams/[id]/route.ts` :

GET : Détails avec membres
PUT : Modifier (name, memberIds)
DELETE : Supprimer

---

Créer `src/app/api/teacher/teams/[id]/members/route.ts` :

POST : Ajouter un membre { studentId }
DELETE : Retirer un membre { studentId }

Sécurité : Vérifier via TeacherAssignment sur la classe
```

### Prompt 7.8.6 — API Assignations

```
Créer `src/app/api/teacher/assignments/route.ts` :

GET : Liste mes assignations
- Filtrage : ?courseId=, ?classId=, ?status=
- Include : course/chapter/section info, target info, progress stats

POST : Créer une assignation
- Body : {
    title,
    instructions?,
    courseId? | chapterId? | sectionId?,  // Un seul
    targetType,
    classId? | teamId? | studentId?,       // Selon targetType
    dueDate?
  }
- Créer automatiquement les StudentProgress pour chaque élève concerné

---

Créer `src/app/api/teacher/assignments/[id]/route.ts` :

GET : Détails avec progression de chaque élève
PUT : Modifier (title, instructions, dueDate)
DELETE : Supprimer (cascade progress)

---

Créer `src/app/api/teacher/assignments/[id]/progress/route.ts` :

GET : Liste des progressions élèves
PUT : Mettre à jour une progression { studentId, status, score? }
```

---

## 📋 Bloc 3 : UI STRUCTURE

### Prompt 7.8.7 — UI Onglet Structure (Chapitres + Sections)

```
Créer `src/components/features/courses/ChaptersManager.tsx` :

Props : { courseId: string }

LAYOUT :
┌─────────────────────────────────────────────────────────┐
│ 📚 Structure du cours              [+ Nouveau chapitre] │
├─────────────────────────────────────────────────────────┤
│ ▼ Chapitre 1 : Introduction                    [≡] [✎] [🗑] │
│   ├── 📖 Section 1.1 : Présentation           [≡] [✎] [🗑] │
│   ├── 🎬 Section 1.2 : Vidéo explicative      [≡] [✎] [🗑] │
│   └── [+ Ajouter une section]                           │
│                                                         │
│ ▼ Chapitre 2 : Concepts de base               [≡] [✎] [🗑] │
│   ├── 📖 Section 2.1 : Définitions            [≡] [✎] [🗑] │
│   ├── ✏️ Section 2.2 : Exercice 1             [≡] [✎] [🗑] │
│   ├── ❓ Section 2.3 : Quiz                   [≡] [✎] [🗑] │
│   └── [+ Ajouter une section]                           │
│                                                         │
│ [+ Ajouter un chapitre]                                 │
└─────────────────────────────────────────────────────────┘

FONCTIONNALITÉS :
1. Collapsible pour chaque chapitre
2. Drag & drop pour réordonner (optionnel, sinon boutons ↑↓)
3. Icônes par type de section
4. Dialog pour créer/éditer chapitre
5. Dialog pour créer/éditer section

COMPOSANTS ENFANTS :
- ChapterItem.tsx
- SectionItem.tsx
- ChapterFormDialog.tsx
- SectionFormDialog.tsx
```

### Prompt 7.8.8 — UI Onglet Ressources

```
Créer `src/components/features/courses/ResourcesManager.tsx` :

Props : { courseId: string }

LAYOUT :
┌─────────────────────────────────────────────────────────┐
│ 📂 Base de connaissances            [+ Ajouter ressource] │
├─────────────────────────────────────────────────────────┤
│ 🔗 Liens externes (3)                                   │
│   ├── Article Wikipedia - Théorie          [✎] [🗑]     │
│   ├── Documentation officielle             [✎] [🗑]     │
│   └── Blog expert                          [✎] [🗑]     │
│                                                         │
│ 📺 Vidéos YouTube (2)                                   │
│   ├── Tutoriel complet (15min)             [✎] [🗑]     │
│   └── Démonstration pratique (8min)        [✎] [🗑]     │
│                                                         │
│ 📄 Documents PDF (1)                                    │
│   └── Fiche récapitulative                 [✎] [🗑]     │
└─────────────────────────────────────────────────────────┘

FONCTIONNALITÉS :
1. Groupement par type (Collapsible)
2. Preview YouTube inline (thumbnail + durée)
3. Preview PDF (lien téléchargement)
4. Dialog pour créer/éditer ressource
5. Upload fichiers pour PDF/IMAGE

COMPOSANTS ENFANTS :
- ResourceItem.tsx
- ResourceFormDialog.tsx (avec switch type)
- YouTubePreview.tsx
```

---

## 📋 Bloc 4 : UI EXERCICES

### Prompt 7.8.9 — UI Onglet Exercices

```
Créer `src/components/features/courses/ExercisesManager.tsx` :

Props : { courseId: string }

Affiche toutes les sections de type EXERCISE et QUIZ du cours.

LAYOUT :
┌─────────────────────────────────────────────────────────┐
│ ✏️ Exercices & Quiz                                     │
├─────────────────────────────────────────────────────────┤
│ Chapitre 1 : Introduction                               │
│   (aucun exercice)                                      │
│                                                         │
│ Chapitre 2 : Concepts de base                           │
│   ├── ✏️ Exercice 2.2 : Exercice pratique    [👁] [✎]  │
│   │      └── Assigné à : 3A (classe) - 15/20 complétés │
│   └── ❓ Quiz 2.3 : QCM Validation           [👁] [✎]  │
│          └── Assigné à : Groupe Alpha - 5/8 complétés  │
│                                                         │
│ Chapitre 3 : Avancé                                     │
│   └── ✏️ Exercice 3.1 : Projet final         [👁] [✎]  │
│          └── Non assigné                               │
└─────────────────────────────────────────────────────────┘

FONCTIONNALITÉS :
1. Groupé par chapitre
2. Affiche statut d'assignation
3. Progress bar si assigné
4. Bouton voir détails → ouvre SectionEditorDialog
5. Bouton assigner → ouvre AssignDialog
```

---

## 📋 Bloc 5 : UI ASSIGNATIONS

### Prompt 7.8.10 — UI Onglet Assignations

```
Créer `src/components/features/courses/AssignmentsManager.tsx` :

Props : { courseId: string }

LAYOUT :
┌─────────────────────────────────────────────────────────┐
│ 📋 Assignations                     [+ Nouvelle assignation] │
├─────────────────────────────────────────────────────────┤
│ Filtres : [Toutes ▾] [Toutes les classes ▾] [Tous statuts ▾] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📖 Chapitre 1 : Introduction                        │ │
│ │ 👥 Classe 3A │ 📅 15 jan 2025 │ ██████░░ 75%       │ │
│ │ [Voir progression] [Modifier] [Supprimer]           │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✏️ Section : Exercice 2.2                           │ │
│ │ 👤 Marie Dupont │ 📅 20 jan 2025 │ ✅ Terminé      │ │
│ │ [Voir détails] [Noter]                              │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

---

Créer `src/components/features/courses/AssignDialog.tsx` :

ÉTAPES (Stepper) :
1. QUOI assigner ?
   - [ ] Tout le cours
   - [ ] Un chapitre (select)
   - [ ] Une section spécifique (select chapitre → select section)

2. À QUI assigner ?
   - [ ] Une classe entière (select classe)
   - [ ] Un groupe/équipe (select classe → select équipe)
   - [ ] Un élève (select classe → select élève)

3. DÉTAILS
   - Titre (auto-généré modifiable)
   - Instructions (textarea)
   - Date limite (date picker)

4. CONFIRMATION
   - Récapitulatif
   - Nombre d'élèves concernés
   - Bouton "Assigner"

---

Créer `src/components/features/courses/ProgressSheet.tsx` :

Props : { assignmentId: string }

LAYOUT (Sheet/Drawer) :
┌─────────────────────────────────────────────────────────┐
│ 📊 Progression : Exercice 2.2                    [×]   │
├─────────────────────────────────────────────────────────┤
│ Global : ██████████░░░░ 15/20 (75%)                    │
├─────────────────────────────────────────────────────────┤
│ Élève              │ Statut      │ Score │ Actions     │
│ ───────────────────┼─────────────┼───────┼───────────  │
│ Marie Dupont       │ ✅ Terminé  │ 18/20 │ [👁]        │
│ Jean Martin        │ 🔄 En cours │   -   │ [👁]        │
│ Pierre Durand      │ ⬜ Pas commencé│ -   │ [Relancer]  │
└─────────────────────────────────────────────────────────┘

FONCTIONNALITÉS :
1. DataTable triable
2. Filtres par statut
3. Actions : voir travail, noter, relancer
```

---

## 📋 Bloc 6 : INTÉGRATION

### Prompt 7.8.11 — Page Cours avec Onglets

```
Modifier `src/app/(dashboard)/teacher/courses/[id]/page.tsx` :

Ajouter système d'onglets (Tabs de shadcn/ui) :

LAYOUT :
┌─────────────────────────────────────────────────────────┐
│ ← Retour │ Mathématiques 3A                    [Publier] │
├─────────────────────────────────────────────────────────┤
│ [Informations] [Structure] [Ressources] [Exercices] [Assignations] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  (Contenu de l'onglet actif)                           │
│                                                         │
└─────────────────────────────────────────────────────────┘

ONGLETS :
1. Informations → CourseInfoForm (existant, title/description/subject)
2. Structure → ChaptersManager
3. Ressources → ResourcesManager
4. Exercices → ExercisesManager
5. Assignations → AssignmentsManager

URL avec tab : /teacher/courses/[id]?tab=structure
```

---

## ✅ Checklist Validation Finale 7.8

```
PRISMA :
- [ ] Tables Chapter, Section, Resource créées
- [ ] Tables Team, TeamMember créées
- [ ] Tables Assignment, StudentProgress créées
- [ ] Relations bi-directionnelles OK
- [ ] Seed avec données de test

API :
- [ ] CRUD Chapters fonctionne
- [ ] CRUD Sections fonctionne
- [ ] CRUD Resources fonctionne
- [ ] CRUD Teams fonctionne
- [ ] CRUD Assignments fonctionne
- [ ] Sécurité : prof ne voit que ses cours

UI :
- [ ] Onglet Structure : chapitres collapsibles, sections listées
- [ ] Onglet Ressources : groupées par type, preview YouTube
- [ ] Onglet Exercices : liste avec statut assignation
- [ ] Onglet Assignations : liste + dialog création
- [ ] AssignDialog : wizard 4 étapes
- [ ] ProgressSheet : progression détaillée

INTÉGRATION :
- [ ] Page cours avec 5 onglets fonctionnels
- [ ] Navigation par URL (?tab=)
- [ ] Pas de régression sur pages existantes
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 7.8.1 | - | - | - | - |
| 7.8.2 | - | - | - | - |
| 7.8.3 | - | - | - | - |
| 7.8.4 | 29/12 | 3h | 8 | Upload fichiers ressources - voir 7.10 |
| 7.8.5 | - | - | - | - |
| 7.8.6 | - | - | - | - |
| 7.8.7 | - | - | - | - |
| 7.8.8 | - | - | - | - |
| 7.8.9 | - | - | - | - |
| 7.8.10 | - | - | - | - |
| 7.8.11 | - | - | - | - |

### Leçon apprise 7.8.4 — Upload fichiers Windows

> ⚠️ **CRITIQUE** : react-dropzone + Windows + fichiers Office = problèmes MIME

**Problème** : Windows rapporte des MIME types incorrects/inconsistants pour :
- `.pptx` → parfois `application/octet-stream` au lieu de `application/vnd.openxmlformats-officedocument.presentationml.presentation`
- `.docx` → variable selon le navigateur
- La File System Access API aggrave le problème

**Solution validée** :
```typescript
// ❌ NE PAS FAIRE (sera rejeté avant validator sur Windows)
const { getRootProps, getInputProps } = useDropzone({
  accept: { 'application/vnd.ms-powerpoint': ['.ppt', '.pptx'] },
  validator: customValidator, // N'est jamais appelé
});

// ✅ FAIRE
const { getRootProps, getInputProps } = useDropzone({
  useFsAccessApi: false, // Désactive File System Access API
  onDrop: (acceptedFiles) => {
    const ext = '.' + file.name.toLowerCase().split('.').pop();
    const allowed = extensionConfig[selectedType];
    if (!allowed.includes(ext)) {
      setError(`Extension non supportée: ${ext}`);
      return;
    }
    // Fichier valide
  }
});

// Filtre dialogue fichiers via HTML natif
const inputProps = {
  ...getInputProps(),
  accept: extensionConfig[selectedType].join(',')
};
<input {...inputProps} />
```

---

## 📂 Fichiers à Créer

### API Routes
- `src/app/api/teacher/courses/[id]/chapters/route.ts`
- `src/app/api/teacher/chapters/[id]/route.ts`
- `src/app/api/teacher/chapters/[id]/sections/route.ts`
- `src/app/api/teacher/sections/[id]/route.ts`
- `src/app/api/teacher/courses/[id]/resources/route.ts`
- `src/app/api/teacher/resources/[id]/route.ts`
- `src/app/api/teacher/classes/[id]/teams/route.ts`
- `src/app/api/teacher/teams/[id]/route.ts`
- `src/app/api/teacher/teams/[id]/members/route.ts`
- `src/app/api/teacher/assignments/route.ts`
- `src/app/api/teacher/assignments/[id]/route.ts`
- `src/app/api/teacher/assignments/[id]/progress/route.ts`

### Composants Features
- `src/components/features/courses/ChaptersManager.tsx`
- `src/components/features/courses/ChapterItem.tsx`
- `src/components/features/courses/SectionItem.tsx`
- `src/components/features/courses/ChapterFormDialog.tsx`
- `src/components/features/courses/SectionFormDialog.tsx`
- `src/components/features/courses/ResourcesManager.tsx`
- `src/components/features/courses/ResourceItem.tsx`
- `src/components/features/courses/ResourceFormDialog.tsx`
- `src/components/features/courses/YouTubePreview.tsx`
- `src/components/features/courses/ExercisesManager.tsx`
- `src/components/features/courses/AssignmentsManager.tsx`
- `src/components/features/courses/AssignDialog.tsx`
- `src/components/features/courses/ProgressSheet.tsx`

### Pages (modifications)
- `src/app/(dashboard)/teacher/courses/[id]/page.tsx` (ajouter onglets)

---

*Dernière mise à jour : 2025-12-29*

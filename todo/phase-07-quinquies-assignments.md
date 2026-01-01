# Phase 7 Quinquies — Système d'Assignations & Calendrier ⬜

> **Objectif** : Créer un système complet d'assignation de cours/exercices avec calendrier et gestion des deadlines  
> **Durée estimée** : ~10-12h  
> **Prompts** : [prompts/phase-07-quinquies-assignments.md](../prompts/phase-07-quinquies-assignments.md)  
> **Statut** : ⬜ En attente

---

## 📋 Contexte

### Besoin métier
Le professeur doit pouvoir :
- Assigner des cours/sections à des élèves ou classes entières
- Définir des deadlines et suivre leur respect
- Visualiser toutes les assignations dans un calendrier
- Avoir une vue liste structurée (par date > classe > élève)
- Créer des assignations récurrentes (ex: quiz hebdomadaire)
- Modifier/supprimer des assignations à tout moment

### Vue hybride proposée
1. **Calendrier mensuel** : Vue d'ensemble avec badges/icônes
2. **Liste structurée** : Groupée par date → classe → élève (plus lisible)
3. **Filtres** : Classes, Élèves, Type, Priorité

---

## 🎯 Tâches

### AS1 — Modèle de Données (45min) ⬜

**Fichier** : `prisma/schema.prisma`

**Modèles à ajouter** :

```prisma
model Assignment {
  id          String   @id @default(cuid())
  courseId    String
  sectionId   String?  // Si assignation d'une section spécifique
  
  // Cible
  classId     String?  // Si assigné à toute une classe
  studentId   String?  // Si assigné à un élève spécifique
  
  // Timing
  assignedAt  DateTime @default(now())
  startDate   DateTime?
  dueDate     DateTime
  
  // Métadonnées
  title       String   // Ex: "Chapitre 3 - Les fractions"
  description String?  @db.Text
  type        AssignmentType // COURSE, SECTION, QUIZ, EXERCISE
  priority    Priority @default(MEDIUM)
  
  // Récurrence
  isRecurring Boolean  @default(false)
  recurrenceRule String? // Règle RRULE (iCalendar format)
  parentId    String?  // Si c'est une occurrence d'assignation récurrente
  
  // Relations
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  section     Section? @relation(fields: [sectionId], references: [id])
  class       Class?   @relation(fields: [classId], references: [id])
  student     StudentProfile? @relation(fields: [studentId], references: [id])
  teacher     TeacherProfile  @relation(fields: [teacherId], references: [id])
  teacherId   String
  parent      Assignment? @relation("Recurrence", fields: [parentId], references: [id])
  children    Assignment[] @relation("Recurrence")
  
  // Suivi
  submissions StudentSubmission[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([courseId])
  @@index([classId])
  @@index([studentId])
  @@index([dueDate])
  @@index([teacherId])
}

enum AssignmentType {
  COURSE      // Tout le cours
  SECTION     // Une section spécifique
  QUIZ        // Quiz
  EXERCISE    // Exercice
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

model StudentSubmission {
  id           String   @id @default(cuid())
  assignmentId String
  studentId    String
  
  submittedAt  DateTime?
  completedAt  DateTime?
  status       SubmissionStatus @default(NOT_STARTED)
  progress     Int      @default(0) // 0-100%
  
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student      StudentProfile @relation(fields: [studentId], references: [id])
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([assignmentId, studentId])
  @@index([studentId])
  @@index([status])
}

enum SubmissionStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  LATE
}
```

**Critères** :
- [ ] Modèles ajoutés dans schema.prisma
- [ ] Migration Prisma créée
- [ ] Seed data pour tests (5-10 assignations)
- [ ] Relations correctes (PascalCase)

---

### AS2 — API Routes (1h30) ⬜

**Fichiers** :
- `src/app/api/teacher/assignments/route.ts` (GET/POST)
- `src/app/api/teacher/assignments/[id]/route.ts` (GET/PUT/DELETE)
- `src/app/api/teacher/assignments/calendar/route.ts` (Vue calendrier)
- `src/app/api/teacher/assignments/list/route.ts` (Vue liste structurée)

**Specs GET /api/teacher/assignments** :
```typescript
// Query params : ?classId=xxx&studentId=xxx&type=QUIZ&startDate=...&endDate=...
// Response :
{
  success: true,
  data: {
    assignments: Assignment[],
    total: number
  }
}
```

**Specs POST /api/teacher/assignments** :
```typescript
// Body :
{
  courseId: string;
  sectionId?: string;
  classId?: string;    // Si assigné à classe entière
  studentIds?: string[]; // Si assigné à élèves spécifiques
  dueDate: string;
  startDate?: string;
  title: string;
  description?: string;
  type: AssignmentType;
  priority: Priority;
  isRecurring?: boolean;
  recurrenceRule?: string; // Ex: "FREQ=WEEKLY;COUNT=10"
}

// Logique :
// 1. Si classId → récupérer tous les élèves de la classe
// 2. Si studentIds → utiliser cette liste
// 3. Créer une Assignment
// 4. Créer StudentSubmission pour chaque élève
// 5. Si isRecurring → créer les occurrences futures
```

**Specs GET /api/teacher/assignments/list** :
```typescript
// Query : ?startDate=...&endDate=...&classId=...
// Response :
{
  success: true,
  data: {
    groupedByDate: {
      [date: string]: {
        byClass: {
          [classId: string]: {
            className: string;
            byStudent: {
              [studentId: string]: {
                studentName: string;
                assignments: Assignment[];
              }
            }
          }
        }
      }
    }
  }
}
```

**Critères** :
- [ ] 4 routes créées
- [ ] Validation des inputs (Zod)
- [ ] Ownership vérifiée (TeacherProfile)
- [ ] Création auto des StudentSubmission
- [ ] Gestion récurrence (génération occurrences)

---

### AS3 — Page Layout (1h) ⬜

**Fichier** : `src/app/(dashboard)/teacher/assignments/page.tsx`

**Structure** :
```tsx
<div className="flex flex-col gap-6 p-6">
  {/* Header */}
  <div className="flex justify-between items-center">
    <h1>Assignations & Calendrier</h1>
    <div className="flex gap-2">
      <Button onClick={() => setView('calendar')}>
        <Calendar /> Calendrier
      </Button>
      <Button onClick={() => setView('list')}>
        <List /> Liste
      </Button>
      <NewAssignmentModal />
    </div>
  </div>

  {/* Filtres + Contenu */}
  <div className="grid grid-cols-[300px_1fr] gap-6">
    {/* Sidebar filtres */}
    <AssignmentFilters 
      filters={filters}
      onFiltersChange={setFilters}
    />

    {/* Vue principale */}
    {view === 'calendar' ? (
      <AssignmentsCalendar assignments={filteredAssignments} />
    ) : (
      <AssignmentsList assignments={filteredAssignments} />
    )}
  </div>
</div>
```

**Critères** :
- [ ] Header avec boutons vue + nouvelle assignation
- [ ] Toggle calendrier/liste
- [ ] Grid 2 colonnes (filtres + contenu)
- [ ] États React pour view et filtres

---

### AS4 — Composant Filtres (45min) ⬜

**Fichier** : `src/components/features/teacher/AssignmentFilters.tsx`

**Props** :
```typescript
interface AssignmentFiltersProps {
  filters: AssignmentFilters;
  onFiltersChange: (filters: AssignmentFilters) => void;
}

interface AssignmentFilters {
  classIds: string[];
  studentIds: string[];
  types: AssignmentType[];
  priorities: Priority[];
  dateRange?: { start: Date; end: Date };
  status?: SubmissionStatus[];
}
```

**Sections** :
1. **Classes** : Checkboxes (fetch depuis API)
2. **Élèves** : Searchable multi-select
3. **Type** : Checkboxes (COURSE, SECTION, QUIZ, EXERCISE)
4. **Priorité** : Checkboxes (LOW, MEDIUM, HIGH)
5. **Statut** : Checkboxes (NOT_STARTED, IN_PROGRESS, COMPLETED, LATE)
6. **Période** : DatePicker range

**Critères** :
- [ ] Tous les filtres implémentés
- [ ] État local + callback parent
- [ ] Bouton "Réinitialiser"
- [ ] Loading state pendant fetch classes

---

### AS5 — Calendrier (2h) ⬜

**Fichier** : `src/components/features/teacher/AssignmentsCalendar.tsx`

**Librairie** : `react-big-calendar` ([doc](https://jquense.github.io/react-big-calendar/))

**Installation** :
```bash
npm install react-big-calendar date-fns
```

**Props** :
```typescript
interface AssignmentsCalendarProps {
  assignments: Assignment[];
  onSelectDate: (date: Date) => void;
  onSelectAssignment: (assignment: Assignment) => void;
}
```

**Features** :
- Vue mois par défaut
- Chaque assignation = événement avec :
  - Couleur selon priorité (rouge/orange/vert)
  - Icône selon type (📚/📝/🎯/✍️)
  - Titre tronqué
- Clic sur événement → ouvre modal détail
- Clic sur date → filtre la liste structurée

**Critères** :
- [ ] Calendrier fonctionnel
- [ ] Événements affichés correctement
- [ ] Couleurs par priorité
- [ ] Icônes par type
- [ ] Interactivité (clic date/événement)

---

### AS6 — Liste Structurée (1h30) ⬜

**Fichier** : `src/components/features/teacher/AssignmentsList.tsx`

**Structure** :
```tsx
{Object.entries(groupedByDate).map(([date, dateData]) => (
  <div key={date}>
    <h2>{formatDate(date)}</h2>
    
    {Object.entries(dateData.byClass).map(([classId, classData]) => (
      <Card key={classId}>
        <CardHeader>
          <h3>{classData.className}</h3>
        </CardHeader>
        
        {Object.entries(classData.byStudent).map(([studentId, studentData]) => (
          <div key={studentId} className="ml-4">
            <p className="font-medium">{studentData.studentName}</p>
            
            {studentData.assignments.map(assignment => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment}
              />
            ))}
          </div>
        ))}
      </Card>
    ))}
  </div>
))}
```

**Critères** :
- [ ] Groupement par date
- [ ] Groupement par classe
- [ ] Groupement par élève
- [ ] AssignmentCard pour chaque assignation
- [ ] Scroll virtualisé si > 100 items

---

### AS7 — Carte Assignation (30min) ⬜

**Fichier** : `src/components/features/teacher/AssignmentCard.tsx`

**Props** :
```typescript
interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: () => void;
  onDelete: () => void;
}
```

**Affichage** :
- Badge type avec icône
- Titre assignation
- Badge priorité (couleur)
- Date limite avec badge si proche
- Progress bar (X/Y élèves ont rendu)
- Actions : Modifier, Supprimer, Voir détails

**Critères** :
- [ ] Design cohérent avec le reste
- [ ] Badges et icônes corrects
- [ ] Actions fonctionnelles
- [ ] Hover state

---

### AS8 — Modal Nouvelle Assignation (2h) ⬜

**Fichier** : `src/components/features/teacher/NewAssignmentModal.tsx`

**Formulaire (étapes)** :

**Étape 1 : Quoi assigner ?**
- Select cours (searchable)
- Type : Radio (COURSE / SECTION / QUIZ / EXERCISE)
- Si SECTION → Select section du cours

**Étape 2 : À qui ?**
- Radio : Classe entière / Élèves spécifiques
- Si classe → Select classe
- Si élèves → Multi-select avec search

**Étape 3 : Quand ?**
- Date de début (optionnel)
- Date limite (requis)
- Priorité : Select (LOW/MEDIUM/HIGH)

**Étape 4 : Récurrence (optionnel)**
- Checkbox "Assignation récurrente"
- Si oui :
  - Fréquence : Quotidienne / Hebdomadaire / Mensuelle
  - Répéter tous les X [jours/semaines/mois]
  - Fin : Après X occurrences OU À une date

**Étape 5 : Description**
- Textarea optionnel

**Critères** :
- [ ] Formulaire multi-étapes
- [ ] Validation Zod
- [ ] Récurrence optionnelle
- [ ] Preview avant création
- [ ] Loading state pendant création

---

### AS9 — Gestion Récurrence (1h30) ⬜

**Fichier** : `src/lib/recurrence.ts`

**Utiliser** : `rrule` library ([doc](https://github.com/jakubroztocil/rrule))

**Installation** :
```bash
npm install rrule
```

**Fonction principale** :
```typescript
import { RRule } from 'rrule';

interface RecurrenceOptions {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  count?: number;
  until?: Date;
  startDate: Date;
}

export function generateRecurringDates(options: RecurrenceOptions): Date[] {
  const rule = new RRule({
    freq: RRule[options.freq],
    interval: options.interval,
    count: options.count,
    until: options.until,
    dtstart: options.startDate,
  });

  return rule.all();
}
```

**Logique API** :
```typescript
// Lors de la création d'assignation récurrente
if (isRecurring && recurrenceRule) {
  const dates = generateRecurringDates({...});
  
  // Créer l'assignation parent
  const parent = await prisma.assignment.create({
    data: {
      isRecurring: true,
      recurrenceRule,
      // ...autres champs
    }
  });
  
  // Créer les occurrences
  const occurrences = dates.slice(1).map(date => ({
    parentId: parent.id,
    dueDate: date,
    // ...copier les autres champs du parent
  }));
  
  await prisma.assignment.createMany({ data: occurrences });
}
```

**Critères** :
- [ ] Librairie rrule installée
- [ ] Fonction generateRecurringDates
- [ ] Création occurrences dans API
- [ ] Suppression parent = suppression occurrences
- [ ] Modification parent = mise à jour occurrences

---

### AS10 — Modal Modification (1h) ⬜

**Fichier** : `src/components/features/teacher/EditAssignmentModal.tsx`

**Specs** :
- Même formulaire que NewAssignmentModal
- Pré-rempli avec les données existantes
- Si assignation récurrente → option "Modifier toutes les occurrences" vs "Modifier uniquement celle-ci"

**API PUT /api/teacher/assignments/[id]** :
```typescript
// Si modif d'occurrence seule → update cette occurrence uniquement
// Si modif parent → update parent + recalculer occurrences
```

**Critères** :
- [ ] Formulaire pré-rempli
- [ ] Option modif unique vs série
- [ ] Validation identique
- [ ] Success toast après modif

---

### AS11 — Badge Notifications Deadline (30min) ⬜

**Fichier** : `src/components/features/teacher/DeadlineBadge.tsx`

**Logique** :
```typescript
function getDeadlineStatus(dueDate: Date) {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);

  if (hours < 0) return { label: 'Dépassé', color: 'red' };
  if (hours < 24) return { label: '< 24h', color: 'red' };
  if (hours < 72) return { label: '< 3 jours', color: 'orange' };
  return { label: formatDate(dueDate), color: 'gray' };
}
```

**Critères** :
- [ ] Badge rouge si dépassé ou < 24h
- [ ] Badge orange si < 3 jours
- [ ] Badge gris sinon
- [ ] Icône ⚠️ si critique

---

### AS12 — Statistiques Assignations (45min) ⬜

**Fichier** : `src/components/features/teacher/AssignmentStats.tsx`

**Affichage (cards)** :
1. **Total assignations actives**
2. **En retard** (deadline dépassée + pas completé)
3. **À venir** (deadline < 7 jours)
4. **Taux de complétion moyen** (% élèves ayant rendu)

**Critères** :
- [ ] 4 cards stats
- [ ] Fetch depuis API
- [ ] Icônes et couleurs
- [ ] Cliquable → filtre la vue

---

### AS13 — Intégration Navigation (15min) ⬜

**Fichiers à modifier** :
- `src/components/layout/Sidebar.tsx` → Ajouter lien "Assignations"
- `src/components/features/teacher/CoursesTable.tsx` → Ajouter action "Assigner ce cours"

**Critères** :
- [ ] Lien dans sidebar avec icône Calendar
- [ ] Action dans dropdown menu cours
- [ ] Redirection vers modal avec courseId pré-rempli

---

### AS14 — Vue Élève (Assignations Reçues) (1h) ⬜

**Fichier** : `src/app/(dashboard)/student/assignments/page.tsx`

**Vue élève** :
- Liste des assignations reçues
- Tri par deadline croissante
- Badge statut (À faire / En cours / Terminé / En retard)
- Bouton "Voir le cours" → redirection vers course
- Marquer comme complété

**API** : `GET /api/student/assignments`

**Critères** :
- [ ] Page élève créée
- [ ] Liste assignations reçues
- [ ] Tri par deadline
- [ ] Bouton complétion
- [ ] Redirect vers cours

---

### 🔄 CAL — Amélioration du Calendrier (01/01/2026) 🔴

**Problèmes identifiés** :
1. Affichage des plages (`startDate` → `dueDate`) surcharge le calendrier
2. Tous les événements affichés même sans filtre → confusion
3. Click cellule vide ne fait rien
4. Vue Semaine ne fonctionne pas
5. Vue Agenda ne fonctionne pas
6. Navigation (Aujourd'hui/Précédent/Suivant) inactive
7. Design basique, peu agréable
8. Pas de tooltip au survol

---

#### CAL-1 — Afficher uniquement les deadlines (pas les plages) (15min) ⬜

**Problème** : `start = startDate` et `end = dueDate` → barre longue qui surcharge
**Solution** : `start = dueDate` et `end = dueDate` → pastille unique

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`

**Modification** :
```tsx
// Ligne 75-79 - AVANT
start: new Date(assignment.startDate || assignment.dueDate),
end: new Date(assignment.dueDate),

// APRÈS
start: new Date(assignment.dueDate),
end: new Date(assignment.dueDate),
```

**Critères** :
- [ ] Événements affichés comme points/pastilles
- [ ] Calendrier épuré et lisible

---

#### CAL-2 — Masquer événements si filtres vides (30min) ⬜

**Problème** : Calendrier surchargé si aucun filtre actif
**Solution** : `events = []` si aucun filtre

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`

**Modifications** :
1. Ajouter prop `filters` dans AssignmentsCalendarProps
2. Calculer `hasActiveFilters` via useMemo
3. Retourner `events = []` si pas de filtres
4. Afficher message centré "Sélectionnez au moins un filtre"

**Code** :
```tsx
const hasActiveFilters = useMemo(() => {
  return filters.subjectIds.length > 0 || 
         filters.courseIds.length > 0 ||
         filters.classIds.length > 0 ||
         filters.priorities.length > 0 ||
         filters.dateRange !== null;
}, [filters]);

const events = useMemo(() => {
  if (!hasActiveFilters) return [];
  return assignments.map(/* ... */);
}, [assignments, hasActiveFilters]);
```

**Critères** :
- [ ] Calendrier vide si aucun filtre
- [ ] Message explicatif affiché
- [ ] Force utilisateur à filtrer

---

#### CAL-3 — Click cellule vide → redirection Liste avec date (20min) ⬜

**Problème** : Click cellule ne fait rien si filtres vides
**Solution** : Rediriger vers vue Liste avec cette date

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`

**Modification** :
```tsx
const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
  if (!hasActiveFilters) {
    // Rediriger vers Liste avec ce jour
    onSelectDate(slotInfo.start);
  } else {
    onSelectDate(slotInfo.start);
  }
}, [hasActiveFilters, onSelectDate]);
```

**Critères** :
- [ ] Click cellule → basculer vue Liste
- [ ] Date appliquée dans filtres
- [ ] Calendrier = outil de navigation

---

#### CAL-4 — Fixer vue Semaine (30min) ⬜

**Problème** : `Views.WEEK` ne s'affiche pas
**Solution** : Ajouter state `currentDate` et `currentView`

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`

**Modifications** :
```tsx
const [currentDate, setCurrentDate] = useState(new Date());
const [currentView, setCurrentView] = useState<View>(Views.MONTH);

<Calendar
  date={currentDate}
  view={currentView}
  onNavigate={(date) => setCurrentDate(date)}
  onView={(view) => setCurrentView(view)}
  // ... reste
/>
```

**Critères** :
- [ ] Vue Semaine fonctionne
- [ ] Changement vue via toolbar

---

#### CAL-5 — Fixer vue Agenda (15min) ⬜

**Problème** : `Views.AGENDA` ne fonctionne pas
**Solution** : Ajouter prop `agendaLength`

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`

**Modification** :
```tsx
<Calendar
  views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
  agendaLength={30}
  // ...
/>
```

**Critères** :
- [ ] Vue Agenda affiche 30 jours
- [ ] Liste chronologique des événements

---

#### CAL-6 — Fixer navigation (Aujourd'hui/Précédent/Suivant) (15min) ⬜

**Problème** : Boutons toolbar inactifs
**Solution** : Utiliser prop `date` + `onNavigate` (cf. CAL-4)

**Critères** :
- [ ] Bouton "Aujourd'hui" fonctionne
- [ ] Flèches Précédent/Suivant fonctionnent
- [ ] Navigation selon vue (mois/semaine/jour)

---

#### CAL-7 — Améliorer UX/UI calendrier (45min) ⬜

**Améliorations** :
1. Indicateur "Aucun filtre" centré si `events = []`
2. Pastilles deadline (dot au lieu de barre)
3. Couleurs améliorées (dégradés pour priorités)
4. Légende interactive (click → filtrer par priorité)
5. Mode compact (réduire hauteur cellules)

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`

**Code message vide** :
```tsx
{events.length === 0 && (
  <div className="flex h-[600px] items-center justify-center text-muted-foreground">
    <div className="text-center">
      <Calendar className="mx-auto h-12 w-12 opacity-20" />
      <p className="mt-4">Sélectionnez au moins un filtre pour afficher le calendrier</p>
    </div>
  </div>
)}
```

**Critères** :
- [ ] Message vide élégant
- [ ] Couleurs cohérentes
- [ ] Espacement aéré
- [ ] Design professionnel

---

#### CAL-8 — Ajouter tooltip survol événement (30min) ⬜

**Solution** : Utiliser `components.event` personnalisé avec Tooltip shadcn

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`

**Code** :
```tsx
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const CustomEvent = ({ event }: { event: CalendarEvent }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-xs truncate">{event.title}</div>
      </TooltipTrigger>
      <TooltipContent>
        <p><strong>{event.resource.title}</strong></p>
        <p>Cours: {event.resource.Course.title}</p>
        <p>Deadline: {format(new Date(event.resource.dueDate), 'dd/MM/yyyy')}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

<Calendar
  components={{ event: CustomEvent }}
  // ...
/>
```

**Critères** :
- [ ] Tooltip au survol
- [ ] Infos : titre, cours, deadline
- [ ] Pas besoin de cliquer

---

### 🎨 CAL-COLOR — Gestion Couleurs Classes (3h30) ⬜

**Contexte** :
- Chaque classe doit avoir une couleur unique pour être facilement identifiable
- Les couleurs s'affichent sur les cartes d'assignation et dans le calendrier
- L'admin gère les couleurs depuis l'interface admin
- Si aucune couleur définie, une couleur est attribuée automatiquement

**Avantages** :
- Identification visuelle rapide des classes
- Calendrier plus lisible avec code couleur
- Personnalisation par établissement

---

#### CAL-COLOR-1 — Ajouter champ `color` dans modèle Class (30min) ⬜

**Fichier** : `prisma/schema.prisma`

**Modification modèle Class** :
```prisma
model Class {
  id        String   @id @default(cuid())
  name      String
  level     String?
  color     String?  @default("#3b82f6")  // Bleu par défaut
  // ... reste inchangé
}
```

**Migration** :
```bash
npx prisma db push
```

**Critères** :
- [ ] Champ `color` ajouté
- [ ] Valeur par défaut `#3b82f6` (bleu)
- [ ] Migration appliquée

---

#### CAL-COLOR-2 — Interface admin pour gérer couleurs (1h) ⬜

**Fichier** : `src/app/(dashboard)/admin/classes/page.tsx`

**Modifications** :
1. Ajouter colonne "Couleur" dans le tableau des classes
2. Afficher badge coloré avec la couleur de la classe
3. Dans la modale d'édition, ajouter un color picker

**Color Picker** : Utiliser `<input type="color" />` natif HTML5

**Code modale** :
```tsx
<div className="space-y-2">
  <Label htmlFor="color">Couleur de la classe</Label>
  <div className="flex items-center gap-3">
    <input
      type="color"
      id="color"
      value={formData.color || '#3b82f6'}
      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
      className="h-10 w-20 rounded border cursor-pointer"
    />
    <div 
      className="h-10 flex-1 rounded border flex items-center px-3"
      style={{ backgroundColor: formData.color || '#3b82f6' }}
    >
      <span className="text-white font-medium drop-shadow-md">
        Aperçu : {formData.name || 'Classe'}
      </span>
    </div>
  </div>
  <p className="text-xs text-muted-foreground">
    Cette couleur sera utilisée dans le calendrier et les cartes d'assignation
  </p>
</div>
```

**Tableau des classes** :
```tsx
<td>
  <div className="flex items-center gap-2">
    <div 
      className="h-6 w-6 rounded-full border-2 border-white shadow"
      style={{ backgroundColor: classItem.color || '#3b82f6' }}
    />
    <code className="text-xs">{classItem.color || '#3b82f6'}</code>
  </div>
</td>
```

**Critères** :
- [ ] Colonne couleur dans tableau
- [ ] Color picker dans modale
- [ ] Aperçu temps réel
- [ ] API PUT `/api/admin/classes/[id]` supporte `color`

---

#### CAL-COLOR-3 — Seed couleurs par défaut (30min) ⬜

**Fichier** : `prisma/seed.ts`

**Palette couleurs** :
```typescript
const CLASS_COLORS = {
  '6ème A': '#3b82f6',  // Bleu
  '6ème B': '#8b5cf6',  // Violet
  '5ème A': '#ec4899',  // Rose
  '5ème B': '#f59e0b',  // Orange
  '4ème A': '#10b981',  // Vert
  '4ème B': '#06b6d4',  // Cyan
  '3ème A': '#ef4444',  // Rouge
  '3ème B': '#6366f1',  // Indigo
};
```

**Modification seed** :
```typescript
const class6A = await prisma.class.create({
  data: {
    id: crypto.randomUUID(),
    name: '6ème A',
    level: '6ème',
    color: CLASS_COLORS['6ème A'],
    updatedAt: new Date(),
  },
});
```

**Critères** :
- [ ] Palette de 8 couleurs distinctes
- [ ] Toutes les classes test ont une couleur
- [ ] Seed réussi sans erreur

---

#### CAL-COLOR-4 — Couleur classe sur cartes assignations (45min) ⬜

**Fichier** : `src/components/features/assignments/AssignmentCard.tsx`

**Modifications** :
1. Récupérer `Class.color` dans les données
2. Afficher une bordure colorée sur la carte
3. Badge classe avec fond coloré

**Code** :
```tsx
// En-tête de la carte (ligne ~140)
<Card 
  className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
  style={{
    borderLeft: assignment.Class?.color 
      ? `4px solid ${assignment.Class.color}` 
      : undefined
  }}
  onClick={handleCardClick}
>
```

**Badge classe** :
```tsx
{assignment.Class && (
  <span 
    className="flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-medium"
    style={{ backgroundColor: assignment.Class.color || '#3b82f6' }}
  >
    <Users className="h-3 w-3" />
    {assignment.Class.name}
  </span>
)}
```

**Critères** :
- [ ] Bordure gauche colorée
- [ ] Badge classe avec fond couleur classe
- [ ] Texte blanc sur badge coloré
- [ ] Fallback bleu si pas de couleur

---

#### CAL-COLOR-5 — Couleur classe sur événements calendrier (45min) ⬜

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`

**Modifications** :
1. Modifier `eventStyleGetter` pour utiliser couleur classe en priorité
2. Fallback sur couleur priorité si pas de classe
3. Garder couleur priorité si assignation individuelle (élève)

**Code ligne ~107** :
```typescript
const eventStyleGetter = useCallback((event: CalendarEvent) => {
  const assignment = event.resource;
  
  // Si assignation de classe, utiliser couleur classe
  if (assignment.Class?.color) {
    return {
      className: 'text-white rounded-full px-2 py-0.5 text-xs font-medium shadow-sm',
      style: {
        backgroundColor: assignment.Class.color,
        border: 'none',
        minHeight: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };
  }
  
  // Sinon, utiliser couleur priorité (assignations individuelles)
  const priority = assignment.priority;
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
  
  return {
    className: `${colors.bg} ${colors.text} rounded-full px-2 py-0.5 text-xs font-medium shadow-sm`,
    style: {
      border: 'none',
      minHeight: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };
}, []);
```

**Légende mise à jour** :
```tsx
{/* Légende dynamique basée sur classes visibles */}
<div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
  {Array.from(new Set(assignments.map(a => a.Class).filter(Boolean)))
    .map((classItem) => (
      <div key={classItem!.id} className="flex items-center gap-2">
        <div 
          className="h-3 w-3 rounded-full" 
          style={{ backgroundColor: classItem!.color || '#3b82f6' }}
        />
        <span>{classItem!.name}</span>
      </div>
    ))}
  <div className="w-px h-4 bg-border" />
  <div className="flex items-center gap-2">
    <div className="h-3 w-3 rounded bg-red-500" />
    <span>Haute priorité (individuel)</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="h-3 w-3 rounded bg-orange-500" />
    <span>Moyenne priorité</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="h-3 w-3 rounded bg-green-500" />
    <span>Basse priorité</span>
  </div>
</div>
```

**Critères** :
- [ ] Événements classe = couleur classe
- [ ] Événements individuels = couleur priorité
- [ ] Légende dynamique avec classes visibles
- [ ] Séparation visuelle légende classe vs priorité

---

## 📁 Fichiers créés/modifiés (récap)

| Action | Fichier | Statut |
|:-------|:--------|:-------|
| Modifier | `prisma/schema.prisma` (Assignment, StudentSubmission, Class.color) | ⬜ |
| Créer | `src/app/api/teacher/assignments/route.ts` | ⬜ |
| Créer | `src/app/api/teacher/assignments/[id]/route.ts` | ⬜ |
| Créer | `src/app/api/teacher/assignments/calendar/route.ts` | ⬜ |
| Créer | `src/app/api/teacher/assignments/list/route.ts` | ⬜ |
| Créer | `src/app/api/student/assignments/route.ts` | ⬜ |
| Créer | `src/app/(dashboard)/teacher/assignments/page.tsx` | ⬜ |
| Créer | `src/app/(dashboard)/student/assignments/page.tsx` | ⬜ |
| Créer | `src/components/features/teacher/AssignmentFilters.tsx` | ⬜ |
| Créer | `src/components/features/teacher/AssignmentsCalendar.tsx` | ⬜ |
| Créer | `src/components/features/teacher/AssignmentsList.tsx` | ⬜ |
| Créer | `src/components/features/teacher/AssignmentCard.tsx` | ⬜ |
| Créer | `src/components/features/teacher/NewAssignmentModal.tsx` | ⬜ |
| Créer | `src/components/features/teacher/EditAssignmentModal.tsx` | ⬜ |
| Créer | `src/components/features/teacher/DeadlineBadge.tsx` | ⬜ |
| Créer | `src/components/features/teacher/AssignmentStats.tsx` | ⬜ |
| Créer | `src/lib/recurrence.ts` | ⬜ |
| Modifier | `src/components/layout/Sidebar.tsx` | ⬜ |
| Modifier | `src/components/features/teacher/CoursesTable.tsx` | ⬜ |
| Modifier | `src/app/(dashboard)/admin/classes/page.tsx` (color picker) | ⬜ |
| Modifier | `src/app/api/admin/classes/[id]/route.ts` (support color) | ⬜ |
| Modifier | `prisma/seed.ts` (couleurs classes) | ⬜ |
| Modifier | `src/components/features/assignments/AssignmentCard.tsx` (bordure colorée) | ⬜ |
| Modifier | `src/components/features/assignments/AssignmentsCalendar.tsx` (événements colorés) | ⬜ |

---

## 🐛 Points d'Attention

1. **PascalCase Prisma** : Relations = `TeacherProfile`, `StudentProfile`, `Course`, etc.
2. **Récurrence** : Bien tester la génération d'occurrences multiples
3. **Performance** : Si > 1000 assignations, paginer la vue liste
4. **Timezone** : Utiliser UTC en BDD, afficher en local pour l'utilisateur

---

## 📦 Dépendances NPM

```bash
npm install react-big-calendar date-fns rrule
npm install -D @types/react-big-calendar
```

---

## 🔗 Références

- **Wireframe** : Inspiration Google Calendar + Todoist
- **RRULE** : [iCalendar spec](https://icalendar.org/iCalendar-RFC-5545/3-8-5-3-recurrence-rule.html)
- **React Big Calendar** : [Docs](https://jquense.github.io/react-big-calendar/)

---

## ✅ Critères de Succès

- [ ] Assignation d'un cours à une classe entière
- [ ] Assignation d'une section à un élève spécifique
- [ ] Assignation récurrente (quiz hebdo 10 semaines)
- [ ] Vue calendrier avec événements colorés
- [ ] Vue liste groupée (date > classe > élève)
- [ ] Modification d'une assignation existante
- [ ] Suppression avec confirmation
- [ ] Filtrage multi-critères (classe, type, priorité)
- [ ] Vue élève de ses assignations reçues

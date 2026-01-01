# Prompts Phase 7 Quinquies — Système d'Assignations & Calendrier

> **Index** : [todo/phase-07-quinquies-assignments.md](../todo/phase-07-quinquies-assignments.md)  
> **Objectif** : Créer un système complet d'assignation de cours/exercices avec calendrier et gestion des deadlines

---

## 🎯 Contexte Global

**Besoin** : Le professeur doit pouvoir assigner des cours/sections à des élèves ou classes avec deadlines.

**Vue hybride** :
1. **Calendrier mensuel** : Vue d'ensemble avec badges/icônes
2. **Liste structurée** : Groupée par date → classe → élève (plus lisible)

**Fonctionnalités** :
- Assignations uniques ou récurrentes
- Modifiable à tout moment
- Filtres multi-critères

---

## AS1 — Modèle de Données

### Prompt AS1

```
Ajoute les modèles Assignment et StudentSubmission dans `prisma/schema.prisma`.

**Contexte** :
- Un professeur assigne un cours/section à une classe ou des élèves
- L'assignation a une deadline
- Les assignations peuvent être récurrentes (ex: quiz hebdo)
- On suit la progression de chaque élève

**Modèles à ajouter** :

model Assignment {
  id          String   @id @default(cuid())
  courseId    String
  sectionId   String?
  
  classId     String?
  studentId   String?
  
  assignedAt  DateTime @default(now())
  startDate   DateTime?
  dueDate     DateTime
  
  title       String
  description String?  @db.Text
  type        AssignmentType
  priority    Priority @default(MEDIUM)
  
  isRecurring    Boolean  @default(false)
  recurrenceRule String?
  parentId       String?
  
  teacherId   String
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations (⚠️ PascalCase obligatoire)
  Course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  Section     Section? @relation(fields: [sectionId], references: [id])
  Class       Class?   @relation(fields: [classId], references: [id])
  Student     StudentProfile? @relation(fields: [studentId], references: [id])
  TeacherProfile TeacherProfile @relation(fields: [teacherId], references: [id])
  Parent      Assignment? @relation("Recurrence", fields: [parentId], references: [id])
  Children    Assignment[] @relation("Recurrence")
  Submissions StudentSubmission[]
  
  @@index([courseId])
  @@index([classId])
  @@index([studentId])
  @@index([dueDate])
  @@index([teacherId])
}

enum AssignmentType {
  COURSE
  SECTION
  QUIZ
  EXERCISE
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
  progress     Int      @default(0)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relations
  Assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  Student      StudentProfile @relation(fields: [studentId], references: [id])
  
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

**Actions** :
1. Ajouter ces modèles dans schema.prisma
2. Ajouter les relations inverses dans Course, Section, Class, StudentProfile, TeacherProfile
3. Exécuter `npx prisma db push`
4. Ajouter seed data (5-10 assignations de test)

⚠️ RAPPEL PASCALCASE : Toutes les relations Prisma utilisent PascalCase !
```

---

## AS2 — API Routes

### Prompt AS2.1 — Route principale (GET/POST)

```
Crée `src/app/api/teacher/assignments/route.ts`.

**GET /api/teacher/assignments** :
- Query params : classId, studentId, type, priority, startDate, endDate
- Filtrer les assignations du prof connecté
- Include : Course, Section, Class, Student, Submissions

**POST /api/teacher/assignments** :
- Body :
{
  courseId: string;
  sectionId?: string;
  classId?: string;       // Si classe entière
  studentIds?: string[];  // Si élèves spécifiques
  dueDate: string;
  startDate?: string;
  title: string;
  description?: string;
  type: "COURSE" | "SECTION" | "QUIZ" | "EXERCISE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  isRecurring?: boolean;
  recurrenceRule?: string;
}

**Logique POST** :
1. Vérifier ownership du cours (TeacherProfile)
2. Créer l'Assignment
3. Si classId → récupérer tous les StudentProfile de la classe
4. Si studentIds → utiliser cette liste
5. Créer StudentSubmission pour chaque élève
6. Si isRecurring → générer les occurrences (voir AS9)

**Validation Zod** :
```typescript
const createAssignmentSchema = z.object({
  courseId: z.string().cuid(),
  sectionId: z.string().cuid().optional(),
  classId: z.string().cuid().optional(),
  studentIds: z.array(z.string().cuid()).optional(),
  dueDate: z.string().datetime(),
  startDate: z.string().datetime().optional(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  type: z.enum(["COURSE", "SECTION", "QUIZ", "EXERCISE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
});
```

⚠️ RAPPEL : Relations Prisma = PascalCase (TeacherProfile, Course, Class, etc.)
```

### Prompt AS2.2 — Route [id] (GET/PUT/DELETE)

```
Crée `src/app/api/teacher/assignments/[id]/route.ts`.

**GET** : Détail d'une assignation avec toutes les soumissions
**PUT** : Modifier une assignation (titre, deadline, priorité, etc.)
**DELETE** : Supprimer une assignation (cascade sur submissions)

**Pour PUT** :
- Si c'est une occurrence récurrente, option "updateAll" pour modifier toutes les occurrences
- Si parent modifié → propager aux children

**Ownership** :
Vérifier que l'assignation appartient au prof connecté :
Assignment.TeacherProfile.userId === session.user.id
```

### Prompt AS2.3 — Vue liste structurée

```
Crée `src/app/api/teacher/assignments/list/route.ts`.

**GET /api/teacher/assignments/list** :
- Query : startDate, endDate, classId
- Retourne les assignations groupées par date > classe > élève

**Response structure** :
{
  success: true,
  data: {
    groupedByDate: {
      "2026-01-15": {
        byClass: {
          "class-id-1": {
            className: "5ème B",
            byStudent: {
              "student-id-1": {
                studentName: "Jean Dupont",
                assignments: [Assignment, Assignment]
              },
              "student-id-2": {...}
            }
          }
        }
      }
    }
  }
}

**Logique** :
1. Fetch assignations dans la période
2. Group by dueDate (format YYYY-MM-DD)
3. Pour chaque date, group by classId
4. Pour chaque classe, group by studentId
5. Inclure les submissions pour chaque assignation
```

---

## AS3 — Page Layout

### Prompt AS3

```
Crée `src/app/(dashboard)/teacher/assignments/page.tsx`.

**Structure** :
1. Header avec titre + boutons (toggle vue + nouvelle assignation)
2. Grid 2 colonnes : Filtres (300px) + Contenu principal

**État React** :
- view: 'calendar' | 'list'
- filters: AssignmentFilters
- assignments: Assignment[]
- loading: boolean

**Layout** :
<div className="flex flex-col gap-6 p-6">
  {/* Header */}
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-2xl font-bold">Assignations & Calendrier</h1>
      <p className="text-muted-foreground">Gérez les devoirs et deadlines</p>
    </div>
    <div className="flex gap-2">
      <Button variant={view === 'calendar' ? 'default' : 'outline'}>
        <Calendar className="mr-2 h-4 w-4" /> Calendrier
      </Button>
      <Button variant={view === 'list' ? 'default' : 'outline'}>
        <List className="mr-2 h-4 w-4" /> Liste
      </Button>
      <NewAssignmentModal />
    </div>
  </div>

  {/* Stats rapides */}
  <AssignmentStats />

  {/* Filtres + Contenu */}
  <div className="grid grid-cols-[300px_1fr] gap-6">
    <AssignmentFilters filters={filters} onFiltersChange={setFilters} />
    
    {view === 'calendar' ? (
      <AssignmentsCalendar assignments={filtered} />
    ) : (
      <AssignmentsList assignments={filtered} />
    )}
  </div>
</div>

**Fetch** : useEffect avec SWR ou fetch manuel au mount + sur changement filtres
```

---

## AS4 — Composant Filtres

### Prompt AS4

```
Crée `src/components/features/teacher/AssignmentFilters.tsx`.

**Interface** :
interface AssignmentFilters {
  classIds: string[];
  studentIds: string[];
  types: AssignmentType[];
  priorities: Priority[];
  statuses: SubmissionStatus[];
  dateRange?: { start: Date; end: Date };
}

**Props** :
interface AssignmentFiltersProps {
  filters: AssignmentFilters;
  onFiltersChange: (filters: AssignmentFilters) => void;
}

**Sections** :
1. **Classes** : Fetch depuis /api/teacher/classes, afficher checkboxes
2. **Élèves** : Combobox searchable (multi-select)
3. **Type** : Checkboxes (📚 Cours, 📝 Section, 🎯 Quiz, ✍️ Exercice)
4. **Priorité** : Checkboxes avec couleurs (🔴 Haute, 🟠 Moyenne, 🟢 Basse)
5. **Statut** : Checkboxes (Non commencé, En cours, Terminé, En retard)
6. **Période** : DatePicker range (facultatif)

**Footer** : Bouton "Réinitialiser les filtres"

**Composants shadcn** : Checkbox, Label, Button, Popover (pour date range)
```

---

## AS5 — Calendrier

### Prompt AS5

```
Crée `src/components/features/teacher/AssignmentsCalendar.tsx`.

**Installation préalable** :
npm install react-big-calendar date-fns
npm install -D @types/react-big-calendar

**Props** :
interface AssignmentsCalendarProps {
  assignments: Assignment[];
  onSelectDate: (date: Date) => void;
  onSelectAssignment: (assignment: Assignment) => void;
}

**Configuration react-big-calendar** :
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'fr': fr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

**Mapping assignments → events** :
const events = assignments.map(a => ({
  id: a.id,
  title: a.title,
  start: new Date(a.dueDate),
  end: new Date(a.dueDate),
  resource: a, // Pour accéder aux données complètes
}));

**Style par priorité** :
const eventStyleGetter = (event) => ({
  style: {
    backgroundColor: 
      event.resource.priority === 'HIGH' ? '#ef4444' :
      event.resource.priority === 'MEDIUM' ? '#f97316' : '#22c55e',
    borderRadius: '4px',
  }
});

**Icône par type** (dans le titre) :
const getTypeIcon = (type) => ({
  COURSE: '📚',
  SECTION: '📝',
  QUIZ: '🎯',
  EXERCISE: '✍️',
}[type]);
```

---

## AS6 — Liste Structurée

### Prompt AS6

```
Crée `src/components/features/teacher/AssignmentsList.tsx`.

**Props** :
interface AssignmentsListProps {
  groupedData: GroupedAssignments; // Retour de /api/teacher/assignments/list
  onEditAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
}

**Structure JSX** :
{Object.entries(groupedData.groupedByDate)
  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
  .map(([date, dateData]) => (
    <div key={date} className="space-y-4">
      {/* En-tête date */}
      <div className="flex items-center gap-2 sticky top-0 bg-background py-2">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
        </h2>
        <Badge variant="outline">{countAssignments(dateData)} assignations</Badge>
      </div>

      {/* Par classe */}
      {Object.entries(dateData.byClass).map(([classId, classData]) => (
        <Card key={classId} className="ml-4">
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              {classData.className}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Par élève */}
            {Object.entries(classData.byStudent).map(([studentId, studentData]) => (
              <div key={studentId} className="ml-4 border-l-2 pl-4">
                <p className="font-medium text-sm mb-2">
                  {studentData.studentName}
                </p>
                <div className="space-y-2">
                  {studentData.assignments.map(assignment => (
                    <AssignmentCard 
                      key={assignment.id}
                      assignment={assignment}
                      compact
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  ))}

**Empty state** : Si aucune assignation dans la période sélectionnée
```

---

## AS7 — Carte Assignation

### Prompt AS7

```
Crée `src/components/features/teacher/AssignmentCard.tsx`.

**Props** :
interface AssignmentCardProps {
  assignment: Assignment & { Submissions?: StudentSubmission[] };
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

**Structure** :
<div className={cn(
  "flex items-center justify-between p-3 rounded-lg border",
  compact ? "bg-muted/50" : "bg-card"
)}>
  <div className="flex items-center gap-3">
    {/* Icône type */}
    <span className="text-lg">{getTypeIcon(assignment.type)}</span>
    
    {/* Infos */}
    <div>
      <p className="font-medium">{assignment.title}</p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <DeadlineBadge dueDate={assignment.dueDate} />
        <span>•</span>
        <span>{assignment.Course?.title}</span>
      </div>
    </div>
  </div>

  <div className="flex items-center gap-2">
    {/* Badge priorité */}
    <Badge variant={getPriorityVariant(assignment.priority)}>
      {assignment.priority}
    </Badge>
    
    {/* Progress (si submissions) */}
    {assignment.Submissions && (
      <ProgressBadge 
        completed={assignment.Submissions.filter(s => s.status === 'COMPLETED').length}
        total={assignment.Submissions.length}
      />
    )}
    
    {/* Actions */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" /> Modifier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash className="mr-2 h-4 w-4" /> Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>

**Helper** :
const getPriorityVariant = (priority: Priority) => ({
  HIGH: 'destructive',
  MEDIUM: 'warning', // Tu peux créer cette variante ou utiliser 'default'
  LOW: 'secondary',
}[priority]);
```

---

## AS8 — Modal Nouvelle Assignation

### Prompt AS8

```
Crée `src/components/features/teacher/NewAssignmentModal.tsx`.

**Structure** : Formulaire multi-étapes dans un Dialog

**Étapes** :

**Étape 1 : Quoi assigner ?**
- Select cours (fetch /api/teacher/courses)
- Radio type : COURSE / SECTION / QUIZ / EXERCISE
- Si SECTION → Select section du cours (fetch dynamique)

**Étape 2 : À qui ?**
- Radio : "Classe entière" / "Élèves spécifiques"
- Si classe → Select classe (fetch /api/teacher/classes)
- Si élèves → Combobox multi-select avec recherche

**Étape 3 : Quand ?**
- DatePicker "Date de début" (optionnel)
- DatePicker "Date limite" (requis)
- Select priorité (LOW/MEDIUM/HIGH)

**Étape 4 : Récurrence (optionnel)**
- Checkbox "Assignation récurrente"
- Si coché :
  - Select fréquence : Quotidienne / Hebdomadaire / Mensuelle
  - Input "Répéter tous les X [unité]"
  - Radio fin : "Après X occurrences" / "Jusqu'au [date]"

**Étape 5 : Finaliser**
- Input titre (pré-rempli depuis cours/section)
- Textarea description (optionnel)
- Récap visuel de l'assignation
- Bouton "Créer l'assignation"

**État formulaire** :
const [step, setStep] = useState(1);
const [formData, setFormData] = useState<CreateAssignmentForm>({
  courseId: '',
  sectionId: undefined,
  type: 'COURSE',
  targetType: 'class',
  classId: undefined,
  studentIds: [],
  startDate: undefined,
  dueDate: new Date(),
  priority: 'MEDIUM',
  isRecurring: false,
  recurrenceFreq: 'WEEKLY',
  recurrenceInterval: 1,
  recurrenceEnd: 'count',
  recurrenceCount: 4,
  recurrenceUntil: undefined,
  title: '',
  description: '',
});

**Navigation** :
- Boutons "Précédent" / "Suivant"
- Indicateur d'étape (1/5, 2/5, etc.)
- Validation à chaque étape avant de passer à la suivante
```

---

## AS9 — Gestion Récurrence

### Prompt AS9

```
Crée `src/lib/recurrence.ts`.

**Installation** :
npm install rrule

**Fonctions** :

import { RRule, Frequency } from 'rrule';

interface RecurrenceOptions {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  interval: number;
  count?: number;
  until?: Date;
  startDate: Date;
}

// Convertir options en règle RRULE
export function createRecurrenceRule(options: RecurrenceOptions): string {
  const rule = new RRule({
    freq: Frequency[options.freq],
    interval: options.interval,
    count: options.count,
    until: options.until,
    dtstart: options.startDate,
  });
  return rule.toString();
}

// Générer les dates d'occurrences
export function generateOccurrences(
  ruleString: string,
  baseDate: Date
): Date[] {
  const rule = RRule.fromString(ruleString);
  return rule.all();
}

// Obtenir la prochaine occurrence
export function getNextOccurrence(ruleString: string): Date | null {
  const rule = RRule.fromString(ruleString);
  return rule.after(new Date());
}

// Parser une règle en options lisibles
export function parseRecurrenceRule(ruleString: string): {
  freq: string;
  interval: number;
  count?: number;
  until?: Date;
} {
  const rule = RRule.fromString(ruleString);
  return {
    freq: Frequency[rule.options.freq],
    interval: rule.options.interval || 1,
    count: rule.options.count,
    until: rule.options.until,
  };
}

**Usage dans API POST** :
if (isRecurring && recurrenceRule) {
  const dates = generateOccurrences(recurrenceRule, new Date(dueDate));
  
  // Première date = assignation parent
  // Autres dates = occurrences enfants
  for (let i = 1; i < dates.length; i++) {
    await prisma.assignment.create({
      data: {
        ...parentData,
        parentId: parent.id,
        dueDate: dates[i],
      }
    });
    // + créer les StudentSubmission pour chaque occurrence
  }
}
```

---

## AS10 — Modal Modification

### Prompt AS10

```
Crée `src/components/features/teacher/EditAssignmentModal.tsx`.

**Props** :
interface EditAssignmentModalProps {
  assignment: Assignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

**Structure** :
- Même formulaire que NewAssignmentModal
- Pré-rempli avec les valeurs existantes
- Si assignation récurrente :
  - Radio : "Modifier uniquement cette occurrence" / "Modifier toute la série"
  - Si série : warning "Cela affectera X occurrences futures"

**API PUT** :
- updateSingle: true → modifier seulement cette occurrence
- updateSingle: false → modifier parent + régénérer occurrences

**Validation** :
- Empêcher de modifier une assignation passée (deadline < now)
- Warning si élèves ont déjà soumis
```

---

## AS11 — Badge Deadline

### Prompt AS11

```
Crée `src/components/features/teacher/DeadlineBadge.tsx`.

**Props** :
interface DeadlineBadgeProps {
  dueDate: Date | string;
  showIcon?: boolean;
}

**Logique** :
function getDeadlineStatus(dueDate: Date) {
  const now = new Date();
  const diff = new Date(dueDate).getTime() - now.getTime();
  const hours = diff / (1000 * 60 * 60);
  const days = hours / 24;

  if (hours < 0) {
    return { 
      label: 'Dépassé', 
      variant: 'destructive' as const,
      icon: AlertCircle 
    };
  }
  if (hours < 24) {
    return { 
      label: `${Math.ceil(hours)}h`, 
      variant: 'destructive' as const,
      icon: Clock 
    };
  }
  if (days < 3) {
    return { 
      label: `${Math.ceil(days)}j`, 
      variant: 'warning' as const,
      icon: Clock 
    };
  }
  return { 
    label: format(new Date(dueDate), 'd MMM', { locale: fr }), 
    variant: 'secondary' as const,
    icon: Calendar 
  };
}

**Rendu** :
const status = getDeadlineStatus(dueDate);
const Icon = status.icon;

<Badge variant={status.variant} className="gap-1">
  {showIcon && <Icon className="h-3 w-3" />}
  {status.label}
</Badge>
```

---

## AS12 — Statistiques

### Prompt AS12

```
Crée `src/components/features/teacher/AssignmentStats.tsx`.

**Fetch** : /api/teacher/assignments/stats (à créer)

**API GET /api/teacher/assignments/stats** :
{
  total: number;        // Total assignations actives
  overdue: number;      // Deadline dépassée + pas complété
  upcoming: number;     // Deadline dans les 7 prochains jours
  completionRate: number; // % moyen de complétion
}

**Cards** :
<div className="grid grid-cols-4 gap-4">
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Total actives
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{stats.total}</p>
    </CardContent>
  </Card>

  <Card className="border-red-200">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-red-600">
        En retard
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
    </CardContent>
  </Card>

  <Card className="border-orange-200">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-orange-600">
        À venir (7j)
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold text-orange-600">{stats.upcoming}</p>
    </CardContent>
  </Card>

  <Card className="border-green-200">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-green-600">
        Taux complétion
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold text-green-600">{stats.completionRate}%</p>
    </CardContent>
  </Card>
</div>
```

---

## AS13 — Intégration Navigation

### Prompt AS13

```
Ajoute le lien "Assignations" dans la sidebar et l'action dans CoursesTable.

**1. Sidebar** (`src/components/layout/Sidebar.tsx`) :

Ajouter dans les liens teacher :
{
  href: '/teacher/assignments',
  label: 'Assignations',
  icon: CalendarCheck, // ou Calendar
}

**2. CoursesTable** (`src/components/features/teacher/CoursesTable.tsx`) :

Ajouter dans le DropdownMenuContent :
<DropdownMenuItem asChild>
  <Link href={`/teacher/assignments?courseId=${course.id}`}>
    <CalendarPlus className="mr-2 h-4 w-4" />
    Assigner ce cours
  </Link>
</DropdownMenuItem>

**Import** : import { CalendarPlus } from 'lucide-react';

Cela pré-remplira le courseId dans la modal de création.
```

---

## AS14 — Vue Élève

### Prompt AS14

```
Crée `src/app/(dashboard)/student/assignments/page.tsx` et l'API associée.

**API GET /api/student/assignments** :
- Récupérer toutes les StudentSubmission de l'élève connecté
- Include Assignment avec Course et Section
- Trier par dueDate croissante

**Page** :
<div className="p-6 space-y-6">
  <h1 className="text-2xl font-bold">Mes devoirs</h1>

  {/* Filtres simples */}
  <div className="flex gap-2">
    <Button variant={filter === 'todo' ? 'default' : 'outline'}>
      À faire ({todoCount})
    </Button>
    <Button variant={filter === 'done' ? 'default' : 'outline'}>
      Terminés ({doneCount})
    </Button>
    <Button variant={filter === 'late' ? 'default' : 'outline'}>
      En retard ({lateCount})
    </Button>
  </div>

  {/* Liste */}
  <div className="space-y-4">
    {submissions.map(sub => (
      <Card key={sub.id}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-2xl">{getTypeIcon(sub.Assignment.type)}</span>
            <div>
              <p className="font-medium">{sub.Assignment.title}</p>
              <p className="text-sm text-muted-foreground">
                {sub.Assignment.Course.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <DeadlineBadge dueDate={sub.Assignment.dueDate} showIcon />
            
            <Badge variant={getStatusVariant(sub.status)}>
              {getStatusLabel(sub.status)}
            </Badge>
            
            <Button asChild>
              <Link href={`/student/courses/${sub.Assignment.courseId}`}>
                Voir le cours
              </Link>
            </Button>
            
            {sub.status !== 'COMPLETED' && (
              <Button variant="outline" onClick={() => markComplete(sub.id)}>
                <Check className="mr-2 h-4 w-4" />
                Marquer terminé
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</div>

**API PUT /api/student/assignments/[id]/complete** :
- Mettre à jour status = COMPLETED
- Mettre completedAt = now()
- Si dueDate < now → status = LATE
```

---

## 📝 Prompts Optimaux (à compléter après implémentation)

> Cette section sera mise à jour avec les retours d'expérience réels.

### Leçons Attendues

| Problème potentiel | Solution anticipée |
|:-------------------|:-------------------|
| PascalCase Prisma | Toujours utiliser `TeacherProfile`, `Course`, `Class`, etc. |
| Récurrence complexe | Tester avec rrule playground avant implémentation |
| Performance liste | Paginer si > 100 assignations |
| Timezone | Stocker en UTC, afficher en local |

---

## 🔗 Références

| Ressource | Lien |
|:----------|:-----|
| TODO | [todo/phase-07-quater-assignments.md](../todo/phase-07-quater-assignments.md) |
| react-big-calendar | [Docs](https://jquense.github.io/react-big-calendar/) |
| rrule | [GitHub](https://github.com/jakubroztocil/rrule) |
| date-fns | [Docs](https://date-fns.org/) |

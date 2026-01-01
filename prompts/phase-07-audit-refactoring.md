# Prompts — Phase 7 Audit & Refactoring 🔧

> **TODO associé** : [todo/phase-07-audit-refactoring.md](../todo/phase-07-audit-refactoring.md)  
> **Objectif** : Corriger les blockers TypeScript et anti-patterns React  
> **Durée estimée** : ~3-4h

---

## 🔴 BLOCKERS TYPESCRIPT

### Prompt AUD-TS1 — Corriger `Class.color` manquant

```
Dans `src/components/features/assignments/AssignmentCard.tsx`, le type de `Class` ne contient pas la propriété `color`.

1. Trouve l'interface qui définit `AssignmentWithDetails` ou le type utilisé pour `assignment`
2. Ajoute `color?: string` dans le type de `Class`
3. Vérifie que l'API renvoie bien `color` dans le select Prisma

Le code utilise `assignment.Class?.color` aux lignes 193, 194, 229.

Fichiers potentiels :
- src/components/features/assignments/types.ts
- src/types/assignment.ts
- Le fichier lui-même (interface locale)

Valide avec : `npx tsc --noEmit 2>&1 | grep AssignmentCard`
```

---

### Prompt AUD-TS2 — Corriger type `CustomToolbar`

```
Dans `src/components/features/assignments/AssignmentsCalendar.tsx`, le composant `CustomToolbar` a un type incompatible.

Problèmes :
1. Ligne 270 : `CustomToolbar` utilise `ToolbarProps` au lieu de `ToolbarProps<CalendarEvent, object>`
2. Ligne 114 : `messages.total` retourne une fonction au lieu d'un string

Corrections :
1. Changer la signature de CustomToolbar :
   ```tsx
   function CustomToolbar({ label, onNavigate, onView, view }: ToolbarProps<CalendarEvent, object>) {
   ```

2. Pour messages.total, soit :
   - Supprimer la propriété `total` si non utilisée
   - Ou caster : `total: ((n: number) => `${n} assignation(s)`) as unknown as string`

Valide avec : `npx tsc --noEmit 2>&1 | grep AssignmentsCalendar`
```

---

### Prompt AUD-TS3 — Corriger `hours` undefined

```
Dans `src/components/features/assignments/NewAssignmentModal.tsx` ligne 114, `hours` peut être undefined.

Code actuel :
```tsx
finalDueDate.setHours(hours, minutes, 0, 0);
```

Correction avec fallback :
```tsx
finalDueDate.setHours(hours ?? 23, minutes ?? 59, 0, 0);
```

Contexte : `hours` et `minutes` viennent probablement d'un parsing de date qui peut échouer.

Valide avec : `npx tsc --noEmit 2>&1 | grep NewAssignmentModal`
```

---

### Prompt AUD-TS4 — Corriger prop `levels` manquante

```
Dans `src/components/features/teacher/ClassesList.tsx` ligne 70, la prop `levels` est manquante pour `ClassFilterBar`.

L'interface `ClassFilterBarProps` requiert `levels: string[]`.

Solution A (rapide) :
```tsx
<ClassFilterBar
  subjects={subjects}
  levels={[]}  // Ajouter cette ligne
  classes={classes}
  filters={filters}
  onFiltersChange={setFilters}
  resultCount={filteredClasses.length}
  totalCount={classes.length}
/>
```

Solution B (correcte) :
```tsx
// En haut du composant, extraire les niveaux uniques
const levels = useMemo(() => 
  [...new Set(classes.map(c => c.level).filter(Boolean))],
  [classes]
);

// Puis passer
<ClassFilterBar levels={levels} ... />
```

Valide avec : `npx tsc --noEmit 2>&1 | grep ClassesList`
```

---

## 🔴 ANTI-PATTERNS REACT

### Prompt AUD-RH1 — Composant créé pendant render (AssignmentsManager)

```
Dans `src/components/features/courses/AssignmentsManager.tsx` ligne 284, un composant est créé pendant le render.

Code problématique :
```tsx
function AssignmentCard({ assignment, ... }) {
  const ContentIcon = getContentIcon(assignment);  // ❌ Recréé à chaque render
  return <ContentIcon className="h-5 w-5" />;
}
```

Solution : Créer un composant externe stable

```tsx
// En dehors de AssignmentCard
interface ContentTypeIconProps {
  type: string;
  className?: string;
}

function ContentTypeIcon({ type, className }: ContentTypeIconProps) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    lesson: BookOpen,
    exercise: FileText,
    quiz: ClipboardCheck,
    video: Video,
  };
  const Icon = icons[type] || FileText;
  return <Icon className={className} />;
}

// Dans AssignmentCard
function AssignmentCard({ assignment, ... }) {
  const iconType = getContentIconType(assignment);  // Retourne string, pas composant
  return <ContentTypeIcon type={iconType} className="h-5 w-5" />;
}

// Modifier getContentIcon pour retourner un string
function getContentIconType(assignment: Assignment): string {
  if (assignment.section?.type === 'LESSON') return 'lesson';
  if (assignment.section?.type === 'EXERCISE') return 'exercise';
  // etc.
  return 'lesson';
}
```

Valide avec : `npm run lint 2>&1 | grep -i "static-components"`
```

---

### Prompt AUD-RH2 — Composant créé pendant render (ClassStudentsList)

```
Dans `src/components/features/teacher/ClassStudentsList.tsx` ligne 115, `SortableHeader` est déclaré dans le composant.

Code problématique :
```tsx
export function ClassStudentsList(...) {
  const SortableHeader = ({ sortKey, children }) => ( ... );  // ❌
}
```

Solution : Extraire en composant externe avec props pour le callback

```tsx
// En dehors du composant ClassStudentsList (même fichier ou séparé)
interface SortableHeaderProps {
  sortKey: SortKey;
  children: React.ReactNode;
  onSort: (key: SortKey) => void;
}

function SortableHeader({ sortKey, children, onSort }: SortableHeaderProps) {
  return (
    <TableHead>
      <Button 
        variant="ghost" 
        onClick={() => onSort(sortKey)} 
        className="h-auto p-0 hover:bg-transparent"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );
}

// Dans ClassStudentsList, utiliser :
<SortableHeader sortKey="name" onSort={handleSort}>Nom</SortableHeader>
<SortableHeader sortKey="aiAverage" onSort={handleSort}>Score IA</SortableHeader>
```

Valide avec : `npm run lint 2>&1 | grep ClassStudentsList`
```

---

### Prompt AUD-RH3 — setState dans useEffect (ProgressSheet)

```
Dans `src/components/features/courses/ProgressSheet.tsx` ligne 127, setState est appelé dans useEffect.

Code problématique :
```tsx
useEffect(() => {
  if (open) {
    fetchProgress();  // ❌ Contient des setState
  }
}, [open, fetchProgress]);
```

Solution avec flag de chargement :
```tsx
const [hasLoaded, setHasLoaded] = useState(false);

useEffect(() => {
  if (open && !hasLoaded) {
    setHasLoaded(true);
    fetchProgress();
  }
  if (!open) {
    setHasLoaded(false);  // Reset quand fermé
  }
}, [open, hasLoaded, fetchProgress]);
```

OU Solution avec SWR (meilleure) :
```tsx
import useSWR from 'swr';

const { data: progress, isLoading, mutate } = useSWR(
  open ? `/api/teacher/assignments/${assignment.id}/progress` : null,
  (url) => fetch(url).then(r => r.json())
);
```

Valide avec : `npm run lint 2>&1 | grep ProgressSheet`
```

---

### Prompt AUD-RH4 — setState dans useEffect (ProfileModal)

```
Dans `src/components/features/user/ProfileModal.tsx` lignes 61 et 73, plusieurs setState dans useEffect.

Code problématique :
```tsx
useEffect(() => {
  if (profile) {
    setFirstName(profile.firstName);  // ❌
    setLastName(profile.lastName);    // ❌
  }
}, [profile]);
```

Solution 1 : Key sur le Dialog pour reset automatique
```tsx
<Dialog key={profile?.id ?? 'new'} open={open} onOpenChange={setOpen}>
```

Solution 2 : Initialiser les états avec les valeurs du profil
```tsx
const [firstName, setFirstName] = useState(profile?.firstName ?? '');
// Les états se réinitialisent quand le composant est remonté

// Ajouter key sur Dialog
<Dialog key={profile?.id}>
```

Solution 3 : Utiliser useReducer
```tsx
interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  // ...
}

const [form, dispatch] = useReducer(formReducer, {
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  // ...
});
```

Valide avec : `npm run lint 2>&1 | grep ProfileModal`
```

---

### Prompt AUD-RH5 — setState dans useEffect (useAssignDialogState)

```
Dans `src/components/features/courses/assign-dialog/useAssignDialogState.ts` ligne 69.

Code problématique :
```tsx
useEffect(() => {
  if (!open) reset();  // ❌
}, [open]);
```

Solution : Exposer reset et l'appeler depuis le parent sur onOpenChange

```tsx
// Dans useAssignDialogState.ts
// Supprimer le useEffect et exposer reset
export function useAssignDialogState(...) {
  // ...
  const reset = useCallback(() => {
    setStep(1);
    setSelectedContent(null);
    // ...
  }, []);
  
  // NE PAS FAIRE : useEffect(() => { if (!open) reset(); }, [open]);
  
  return { ..., reset };
}

// Dans le composant parent (index.tsx)
const dialogState = useAssignDialogState(...);

<Dialog 
  open={open} 
  onOpenChange={(isOpen) => {
    if (!isOpen) {
      dialogState.reset();  // ✅ Reset explicite
    }
    setOpen(isOpen);
  }}
>
```

Valide avec : `npm run lint 2>&1 | grep useAssignDialogState`
```

---

## 🟡 NETTOYAGE

### Prompt AUD-CLEAN1 — Supprimer imports inutilisés

```
Exécuter ESLint avec --fix pour corriger automatiquement les imports inutilisés :

```bash
npm run lint -- --fix
```

Si ça ne suffit pas, vérifier manuellement les fichiers avec :
```bash
npm run lint 2>&1 | grep "no-unused-vars"
```

Fichiers typiques :
- AssignmentsCalendar.tsx : useState, ASSIGNMENT_TYPE_ICONS
- AssignmentsManager.tsx : Pencil
- useDashboardFilters.ts : DashboardPeriod, AlertLevel
- ClassesList.tsx : extractLevelsFromClasses
- CoursesTable.tsx : onEdit

Pour chaque fichier, supprimer les imports non utilisés.
```

---

### Prompt AUD-CLEAN2 — Corriger dépendances useEffect

```
Plusieurs useEffect ont des dépendances manquantes :

1. `AssignmentFiltersBar.tsx` (L127, L166)
   - Ajouter `filters` aux dépendances OU
   - Restructurer avec useCallback

2. `ResourceFormDialog.tsx` (L147)
   - Ajouter `extensionConfig` et `isValidExtension` aux dépendances

3. `StudentAssignmentsList.tsx` (L51)
   - Ajouter `fetchAssignments` aux dépendances

Pattern correct :
```tsx
// Si la fonction change à chaque render
const fetchData = useCallback(() => {
  // ...
}, [dep1, dep2]);

useEffect(() => {
  fetchData();
}, [fetchData]);  // ✅ fetchData est stable
```
```

---

### Prompt AUD-CLEAN3 — Remplacer img par next/image

```
Dans `src/components/features/courses/ResourcesManager.tsx` ligne 426 :

```tsx
// AVANT
<img src={preview} alt="Preview" className="..." />

// APRÈS
import Image from 'next/image';

<Image 
  src={preview} 
  alt="Preview" 
  width={200} 
  height={150}
  className="..."
  unoptimized  // Si preview est un data URL ou URL externe
/>
```

Note : Si preview est un data URL (base64), ajouter `unoptimized={true}`.
Si c'est une URL externe, configurer `next.config.ts` :

```ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.example.com' },
    ],
  },
};
```
```

---

## 📊 Validation Finale

### Prompt de vérification complète

```
Exécuter la vérification complète :

```bash
# 1. Vérifier TypeScript
npx tsc --noEmit
# Attendu : 0 erreur

# 2. Vérifier ESLint  
npm run lint
# Attendu : 0 erreur (warnings OK)

# 3. Vérifier Build
npm run build
# Attendu : SUCCESS

# Si tout passe :
echo "✅ Audit Phase 7 validé - Prêt pour Phase 8"
```
```

---

## 📝 Prompts Optimaux (À compléter après exécution)

### Prompt Optimal AUD-TS1
> **Itérations réelles** : _  
> **Problèmes rencontrés** : _

```
[À compléter après exécution]
```

---

*Créé le : 2026-01-02*

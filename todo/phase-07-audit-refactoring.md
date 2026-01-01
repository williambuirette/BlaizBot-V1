# Phase 7 Audit — Corrections TypeScript & Refactoring 🔧

> **Objectif** : Corriger les blockers TypeScript et les anti-patterns React identifiés lors de l'audit  
> **Durée estimée** : ~3-4h  
> **Prompts** : [prompts/phase-07-audit-refactoring.md](../prompts/phase-07-audit-refactoring.md)  
> **Statut** : 🔴 BLOCKER — Build cassé

---

## 📋 Contexte Audit

### Résumé
- **13 erreurs ESLint** (dont 5 erreurs bloquantes React Hooks)
- **7 erreurs TypeScript** bloquantes (`npx tsc --noEmit` échoue)
- **12 fichiers > 350 lignes** (violation standards projet)
- **35 warnings** imports inutilisés

### Commandes de vérification
```bash
npm run lint          # → 13 erreurs + 35 warnings
npx tsc --noEmit      # → 7 erreurs
npm run build         # → FAIL
```

---

## 🔴 PARTIE 1 — Erreurs TypeScript (BLOCKERS)

### AUD-TS1 — Corriger `Class.color` manquant (5min) ⬜

**Fichier** : `src/components/features/assignments/AssignmentCard.tsx`  
**Lignes** : 193, 194, 229  
**Problème** : `Property 'color' does not exist on type '{ id: string; name: string; }'`

**Cause** : Le type `Class` dans l'interface ne contient pas `color`

**Solution** : Mettre à jour l'interface `AssignmentWithDetails` pour inclure `color` dans `Class`

```typescript
// AVANT
Class?: { id: string; name: string } | null;

// APRÈS
Class?: { id: string; name: string; color?: string } | null;
```

**Validation** : `npx tsc --noEmit | grep AssignmentCard` → 0 erreur

---

### AUD-TS2 — Corriger type `CustomToolbar` (10min) ⬜

**Fichier** : `src/components/features/assignments/AssignmentsCalendar.tsx`  
**Lignes** : 114, 270  
**Problème** : Type `ToolbarProps` incompatible avec `CalendarEvent`

**Cause** : `CustomToolbar` utilise `ToolbarProps<Event>` au lieu de `ToolbarProps<CalendarEvent>`

**Solution** :

```typescript
// AVANT
function CustomToolbar({ label, onNavigate, onView, view }: ToolbarProps) {

// APRÈS
function CustomToolbar({ label, onNavigate, onView, view }: ToolbarProps<CalendarEvent, object>) {
```

**Et** pour la ligne 114 (messages.total) :

```typescript
// AVANT
total: (total) => `${total} assignation(s)`

// APRÈS  
total: (total: number) => `${total} assignation(s)` as unknown as string
// OU supprimer si non utilisé
```

**Validation** : `npx tsc --noEmit | grep AssignmentsCalendar` → 0 erreur

---

### AUD-TS3 — Corriger `hours` undefined (5min) ⬜

**Fichier** : `src/components/features/assignments/NewAssignmentModal.tsx`  
**Ligne** : 114  
**Problème** : `Argument of type 'number | undefined' is not assignable to parameter of type 'number'`

**Solution** :

```typescript
// AVANT
finalDueDate.setHours(hours, minutes, 0, 0);

// APRÈS
finalDueDate.setHours(hours ?? 23, minutes ?? 59, 0, 0);
```

**Validation** : `npx tsc --noEmit | grep NewAssignmentModal` → 0 erreur

---

### AUD-TS4 — Corriger prop `levels` manquante (10min) ⬜

**Fichier** : `src/components/features/teacher/ClassesList.tsx`  
**Ligne** : 70  
**Problème** : `Property 'levels' is missing in type`

**Solution A** (rapide) : Passer un tableau vide

```typescript
<ClassFilterBar
  subjects={subjects}
  levels={[]}  // ← Ajouter
  classes={classes}
  ...
/>
```

**Solution B** (correcte) : Extraire les levels depuis les classes

```typescript
const levels = useMemo(() => 
  [...new Set(classes.map(c => c.level))].filter(Boolean),
  [classes]
);
```

**Validation** : `npx tsc --noEmit | grep ClassesList` → 0 erreur

---

## 🔴 PARTIE 2 — Anti-patterns React (BLOCKERS)

### AUD-RH1 — Composant créé pendant render (AssignmentsManager) (15min) ⬜

**Fichier** : `src/components/features/courses/AssignmentsManager.tsx`  
**Ligne** : 284  
**Problème** : `const ContentIcon = getContentIcon(assignment)` dans le render

**Solution** : Déplacer la logique hors du composant ou utiliser memo

```typescript
// AVANT (dans AssignmentCard)
function AssignmentCard({ assignment, ... }) {
  const ContentIcon = getContentIcon(assignment);  // ❌ Recréé chaque render
  return <ContentIcon className="..." />;
}

// APRÈS
function AssignmentCard({ assignment, ... }) {
  const iconName = getContentIconName(assignment);  // ✅ Retourne string/élément
  return <ContentTypeIcon type={iconName} className="..." />;
}

// OU avec composant externe
const ContentTypeIcon = ({ type, className }: { type: string; className?: string }) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    lesson: BookOpen,
    exercise: FileText,
    quiz: ClipboardCheck,
    video: Video,
  };
  const Icon = icons[type] || FileText;
  return <Icon className={className} />;
};
```

**Validation** : `npm run lint | grep AssignmentsManager` → 0 erreur static-components

---

### AUD-RH2 — Composant créé pendant render (ClassStudentsList) (15min) ⬜

**Fichier** : `src/components/features/teacher/ClassStudentsList.tsx`  
**Ligne** : 115  
**Problème** : `SortableHeader` déclaré à l'intérieur du composant

**Solution** : Extraire en composant externe

```typescript
// AVANT (dans ClassStudentsList)
export function ClassStudentsList(...) {
  const SortableHeader = ({ sortKey, children }) => ( ... );  // ❌
  return <SortableHeader ... />;
}

// APRÈS (fichier séparé ou hors du composant)
interface SortableHeaderProps {
  sortKey: SortKey;
  children: React.ReactNode;
  onSort: (key: SortKey) => void;
  className?: string;
}

function SortableHeader({ sortKey, children, onSort }: SortableHeaderProps) {
  return (
    <TableHead>
      <Button variant="ghost" onClick={() => onSort(sortKey)} className="h-auto p-0 hover:bg-transparent">
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );
}

export function ClassStudentsList(...) {
  return <SortableHeader sortKey="name" onSort={handleSort}>Nom</SortableHeader>;
}
```

**Validation** : `npm run lint | grep ClassStudentsList` → 0 erreur static-components

---

### AUD-RH3 — setState synchrone dans useEffect (ProgressSheet) (10min) ⬜

**Fichier** : `src/components/features/courses/ProgressSheet.tsx`  
**Ligne** : 127  
**Problème** : `fetchProgress()` appelé dans useEffect cause cascading renders

**Solution** : Utiliser un flag ou restructurer

```typescript
// AVANT
useEffect(() => {
  if (open) {
    fetchProgress();  // ❌ setState inside
  }
}, [open, fetchProgress]);

// APRÈS - Option A : SWR/React Query
const { data: progress, isLoading } = useSWR(
  open ? `/api/teacher/assignments/${assignment.id}/progress` : null,
  fetcher
);

// APRÈS - Option B : Flag de chargement externe
useEffect(() => {
  if (open && !hasLoaded) {
    fetchProgress();
    setHasLoaded(true);
  }
}, [open, hasLoaded, fetchProgress]);
```

**Validation** : `npm run lint | grep ProgressSheet` → 0 erreur set-state-in-effect

---

### AUD-RH4 — setState synchrone dans useEffect (ProfileModal) (10min) ⬜

**Fichier** : `src/components/features/user/ProfileModal.tsx`  
**Lignes** : 61, 73  
**Problème** : `setState` synchrone pour sync avec profil

**Solution** : Utiliser valeurs dérivées ou clé de reset

```typescript
// AVANT
useEffect(() => {
  if (profile) {
    setFirstName(profile.firstName);  // ❌
    setLastName(profile.lastName);
  }
}, [profile]);

// APRÈS - Option A : Valeurs par défaut
const [firstName, setFirstName] = useState('');
// Initialiser avec key sur Dialog
<Dialog key={profile?.id ?? 'new'}>

// APRÈS - Option B : useReducer
const initialState = useMemo(() => ({
  firstName: profile?.firstName ?? '',
  lastName: profile?.lastName ?? '',
  ...
}), [profile]);
```

**Validation** : `npm run lint | grep ProfileModal` → 0 erreur set-state-in-effect

---

### AUD-RH5 — setState synchrone dans useEffect (useAssignDialogState) (10min) ⬜

**Fichier** : `src/components/features/courses/assign-dialog/useAssignDialogState.ts`  
**Ligne** : 69  
**Problème** : Reset state dans useEffect

**Solution** : Utiliser callback externe ou reset explicite

```typescript
// AVANT
useEffect(() => {
  if (!open) reset();  // ❌
}, [open]);

// APRÈS - Exposer reset et l'appeler depuis le parent
export function useAssignDialogState(open: boolean, onReset?: () => void) {
  // ...
  return { ..., reset };
}

// Dans le parent, appeler reset sur onOpenChange
<Dialog onOpenChange={(isOpen) => {
  if (!isOpen) dialogState.reset();
  setOpen(isOpen);
}}>
```

**Validation** : `npm run lint | grep useAssignDialogState` → 0 erreur set-state-in-effect

---

## 🟠 PARTIE 3 — Fichiers > 350 lignes (À REFACTORER)

### AUD-REF1 — NewConversationDialog (517 → ~3×150) ⬜

**Fichier** : `src/components/features/messages/NewConversationDialog.tsx` (517 lignes)

**Découpage proposé** :
```
messages/
├── NewConversationDialog.tsx (~150L) ← Orchestrateur
├── RecipientSelector.tsx (~120L) ← Sélection destinataires
├── MessageComposer.tsx (~100L) ← Zone de saisie
└── ConversationPreview.tsx (~80L) ← Aperçu
```

---

### AUD-REF2 — AssignmentFiltersBar (500 → ~3×150) ⬜

**Fichier** : `src/components/features/assignments/AssignmentFiltersBar.tsx` (500 lignes)

**Découpage proposé** :
```
assignments/filters/
├── AssignmentFiltersBar.tsx (~150L) ← Orchestrateur
├── FilterSection.tsx (~100L) ← Section pliable
├── FilterBadges.tsx (~80L) ← Badges actifs
├── useAssignmentFilters.ts (~120L) ← Hook logique
└── types.ts (~50L) ← Interfaces
```

---

### AUD-REF3 — ResourcesManager (462 → ~3×150) ⬜

**Fichier** : `src/components/features/courses/ResourcesManager.tsx` (462 lignes)

**Découpage proposé** :
```
courses/
├── ResourcesManager.tsx (~150L) ← Orchestrateur
├── ResourceList.tsx (~100L) ← Liste des ressources
├── ResourceCard.tsx (~80L) ← Carte individuelle
├── ResourcePreview.tsx (~80L) ← Modal aperçu
└── useResources.ts (~100L) ← Hook logique
```

---

### AUD-REF4 — AssignmentCard (460 → ~3×150) ⬜

**Fichier** : `src/components/features/assignments/AssignmentCard.tsx` (460 lignes)

**Découpage proposé** :
```
assignments/
├── AssignmentCard.tsx (~150L) ← Structure principale
├── AssignmentCardHeader.tsx (~80L) ← Titre + Actions
├── AssignmentCardContent.tsx (~100L) ← Contenu détaillé
├── AssignmentCardFooter.tsx (~80L) ← Stats + Dates
└── ExamGradePopover.tsx (~80L) ← Popover notation (si existe)
```

---

### AUD-REF5 — Autres fichiers > 350L ⬜

| Fichier | Lignes | Priorité |
|---------|--------|----------|
| ChaptersManager.tsx | 444 | 🟠 Moyen |
| MessageThread.tsx | 411 | 🟠 Moyen |
| NewAssignmentModal.tsx | 405 | 🟡 Bas (déjà refactoré) |
| ResourceFormDialog.tsx | 403 | 🟠 Moyen |
| ExerciseEditorInline.tsx | 370 | 🟡 Bas |
| ExercisesManager.tsx | 362 | 🟡 Bas |
| ExerciseEditor.tsx | 362 | 🟡 Bas |
| AssignmentsManager.tsx | 361 | 🟡 Bas |

---

## 🟡 PARTIE 4 — Warnings (Nettoyage)

### AUD-CLEAN1 — Supprimer imports inutilisés (15min) ⬜

```bash
# Fichiers concernés
npm run lint 2>&1 | grep "no-unused-vars" | wc -l
# → 35 occurrences
```

**Action** : Exécuter ESLint fix ou supprimer manuellement

```bash
npm run lint -- --fix
```

---

### AUD-CLEAN2 — Corriger dépendances useEffect (10min) ⬜

**Fichiers** :
- `AssignmentFiltersBar.tsx` (L127, L166)
- `ResourceFormDialog.tsx` (L147)
- `StudentAssignmentsList.tsx` (L51)

**Action** : Ajouter dépendances manquantes ou wrapper avec useCallback

---

### AUD-CLEAN3 — Remplacer `<img>` par `next/image` (5min) ⬜

**Fichier** : `src/components/features/courses/ResourcesManager.tsx` (L426)

```typescript
// AVANT
<img src={preview} alt="Preview" />

// APRÈS
import Image from 'next/image';
<Image src={preview} alt="Preview" width={200} height={150} />
```

---

## 📊 Validation Finale

### Checklist avant GO

- [ ] `npx tsc --noEmit` → 0 erreur
- [ ] `npm run lint` → 0 erreur (warnings OK)
- [ ] `npm run build` → SUCCESS
- [ ] Aucun fichier > 400 lignes (tolérance +50)

### Commandes

```bash
# Vérification complète
npm run lint && npx tsc --noEmit && npm run build
```

---

## 📝 Ordre d'exécution recommandé

1. **AUD-TS1 à AUD-TS4** — Débloquer le build TypeScript
2. **AUD-RH1 à AUD-RH5** — Corriger anti-patterns React
3. **AUD-CLEAN1** — Nettoyer imports
4. **AUD-REF1 à AUD-REF5** — Refactoring fichiers longs (optionnel, peut être fait plus tard)

---

*Créé le : 2026-01-02*  
*Auteur : Audit automatique*

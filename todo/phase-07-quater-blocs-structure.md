# Phase 7 Quater — Blocs Dépliables Structure Cours ✅ TERMINÉ

> **Objectif** : Remplacer les modales d'édition de sections par des cartes accordéon dépliables  
> **Durée estimée** : ~4h | **Durée réelle** : ~6h (nombreux bugs PascalCase Prisma)  
> **Prompts** : [prompts/phase-07-quater-blocs-structure.md](../prompts/phase-07-quater-blocs-structure.md)  
> **Statut** : ✅ Terminé le 2025-12-31

---

## 📋 Contexte

### Problème actuel
1. Les modales sont trop petites pour éditer du contenu
2. Les modales ne rechargent pas le contenu sauvegardé
3. Perte de contexte lors de l'ouverture/fermeture

### Solution proposée
Système de **"Blocs Dépliables"** :
- Chaque section = carte accordéon
- Clic → la carte s'ouvre avec l'éditeur inline
- Contenu chargé à l'ouverture
- Sauvegarde sans fermer la vue principale

---

## 🎯 Tâches

### BL1 — Composant SectionCard (45min) ✅

**Fichier** : `src/components/features/teacher/SectionCard.tsx`

**Specs** :
- Wrapper accordéon autour de chaque section
- État ouvert/fermé avec isExpanded
- Header : icône type + titre + badge + chevron
- Body : slot pour l'éditeur inline
- Animations smooth (Collapsible shadcn/ui)

**Critères** :
- [x] Composant avec props section, onUpdate, onDelete
- [x] État local isExpanded
- [x] Header cliquable pour toggle
- [x] Slot children pour contenu inline

---

### BL2 — Éditeurs Inline (1h) ✅

**Fichiers** :
- `src/components/features/teacher/inline-editors/LessonEditorInline.tsx`
- `src/components/features/teacher/inline-editors/QuizEditorInline.tsx`
- `src/components/features/teacher/inline-editors/ExerciseEditorInline.tsx`
- `src/components/features/teacher/inline-editors/VideoEditorInline.tsx`

**Specs** :
- Copier la logique des éditeurs existants
- Supprimer le wrapper Dialog
- Exposer le contenu directement
- Props : initialData, onSave, onCancel

**Critères** :
- [x] 4 éditeurs inline créés
- [x] Pas de Dialog/modal
- [x] Logique métier préservée

---

### BL3 — Formulaire Section Inline (30min) ✅

**Fichier** : `src/components/features/teacher/SectionFormInline.tsx` → `SectionFormDialog.tsx`

**Specs** :
- Remplacer SectionFormDialog
- Formulaire inline pour créer une nouvelle section
- Champs : titre, type, ordre

**Critères** :
- [x] Formulaire inline fonctionnel
- [x] Validation des champs
- [x] onSubmit et onCancel

---

### BL4 — Chargement Contenu Existant (30min) ✅

**Specs** :
- Fetch le contenu complet quand la carte s'ouvre
- API GET /api/teacher/sections/[id]/content
- Afficher loading pendant le fetch
- Cacher si contenu vide (mode création)

**Critères** :
- [x] API endpoint créé
- [x] Fetch déclenché à l'ouverture
- [x] Loading state
- [x] Gestion erreur

---

### BL5 — Boutons Save/Cancel (20min) ✅

**Specs** :
- Footer dans chaque carte ouverte
- Bouton "Enregistrer" (primary)
- Bouton "Annuler" (secondary)
- Save déclenche l'API puis ferme la carte
- Cancel réinitialise et ferme

**Critères** :
- [x] Footer avec boutons
- [x] Save appelle onSave prop
- [x] Cancel reset le form

---

### BL6 — Animations & Transitions (20min) ✅

**Specs** :
- Utiliser Collapsible de shadcn/ui
- Transition height smooth
- Rotation chevron à l'ouverture
- Focus trap dans la carte ouverte

**Critères** :
- [x] Animation fluide
- [x] Chevron animé
- [x] Pas de flash/saut

---

### BL7 — Intégration ChaptersManager (30min) ✅

**Fichier** : `src/components/features/teacher/ChaptersManager.tsx`

**Specs** :
- Remplacer SectionItem par SectionCard
- Supprimer les états *EditorOpen
- Mettre à jour les handlers
- Garder la logique de réordonnancement

**Critères** :
- [x] SectionItem remplacé par SectionCard
- [x] États modales supprimés
- [x] Fonctionnel bout en bout

---

### BL8 — Tests & Validation (15min) ✅

**Tests** :
- [x] Ouvrir/fermer une section
- [x] Éditer et sauvegarder une leçon
- [x] Créer un nouveau quiz inline
- [x] Annuler une modification
- [x] Vérifier le contenu rechargé correctement
- [x] Pas de régression sur drag & drop chapitres

**Bugs corrigés** :
- Fix PascalCase : `Chapter` au lieu de `chapter` dans les requêtes Prisma
- Fix PascalCase : `Course` au lieu de `course` 
- Fix transform : `Section` → `sections` pour le retour API
- Fix statistiques : `_count` mapping correct

---

### BL9 — Fichiers Base de Connaissance par Section (45min) ✅

**Contexte** : Chaque section peut avoir des fichiers associés (PDF, docs, etc.) que l'élève verra directement dans le cours.

**Fichiers** :
- `src/components/features/teacher/SectionFilesUploader.tsx`
- `src/app/api/teacher/sections/[id]/files/route.ts`
- `src/app/api/teacher/sections/[id]/files/[fileId]/route.ts`

**Specs** :
- Zone d'upload dans chaque éditeur inline
- Liste des fichiers attachés avec preview/download
- Stockage dans `/public/uploads/sections/[sectionId]/`
- Suppression individuelle des fichiers

**Critères** :
- [x] Upload multi-fichiers fonctionnel
- [x] Liste des fichiers avec icônes par type
- [x] Bouton supprimer par fichier
- [x] Fichiers persistés en BDD (SectionFile model)

**Bugs corrigés** :
- Fix GET files : `TeacherProfile` au lieu de `teacher` pour vérification ownership
- Fix POST files : `TeacherProfile` au lieu de `teacher`
- Fix DELETE files : `TeacherProfile` au lieu de `teacher`

---

### BL10 — Instructions IA par Section (30min) ⬜ REPORTÉ

**Contexte** : Le prof peut donner des instructions spécifiques à l'IA pour chaque section (contexte, comportement attendu).

**Fichier** : Intégré dans les éditeurs inline

**Specs** :
- Textarea "Instructions IA" dans chaque éditeur
- Placeholder : "Donnez du contexte à l'IA pour cette section..."
- Sauvegardé avec le contenu de la section
- Utilisé par le chatbot élève quand il consulte cette section

**Critères** :
- [ ] Champ aiInstructions dans le modèle Section
- [ ] Textarea dans chaque éditeur inline
- [ ] Sauvegarde avec le reste du contenu

**Note** : Reporté à une phase ultérieure (IA)

---

### Impact sur l'interface Élève

**Suppression** : Onglet "Base de connaissance" séparé → tout est intégré dans les sections

**Nouvelle UX élève** :
- Ouvre un cours → voit le texte de la leçon
- Sous le texte → liste des fichiers associés (téléchargeables)
- Chat IA → utilise automatiquement les fichiers + instructions de la section active

---

### BL11 — Simplification Menu Cours Professeur (20min) ✅

**Contexte** : Simplifier le menu d'actions sur la page "Mes Cours" pour n'avoir que 2 options claires.

**Modifications réalisées** :
1. ~~Renommer "Structure" → "Cours"~~ → Menu simplifié
2. **Menu réduit à 2 options** :
   - "Modifier le cours" → `/teacher/courses/[id]` (page cartes environnements)
   - "Supprimer" → Confirmation + suppression

**Fichiers modifiés** :
- `src/components/features/teacher/CoursesTable.tsx` — Menu dropdown simplifié
- **Supprimé** : `src/app/(dashboard)/teacher/courses/[id]/edit/` — Page obsolète

**Critères** :
- [x] Menu réduit à 2 options
- [x] "Modifier le cours" pointe vers la bonne page
- [x] Page `/edit` supprimée
- [x] Pas de liens morts

---

### BL12 — Nettoyage Page Détail Cours (15min) ✅

**Contexte** : Supprimer les éléments redondants de la page de détail d'un cours (`/teacher/courses/[id]`).

**Modifications réalisées** :
1. **Supprimé** : Bloc "Actions rapides" dans l'onglet Informations
   - Redondant avec les onglets déjà disponibles
   - Contenait des liens vers des pages supprimées
2. **Supprimé** : Bouton "Modifier infos" dans le header
   - Pointait vers `/teacher/courses/[id]/edit` (supprimé)

**Fichier modifié** :
- `src/app/(dashboard)/teacher/courses/[id]/page.tsx`

**Critères** :
- [x] Bloc "Actions rapides" supprimé
- [x] Bouton "Modifier infos" supprimé
- [x] Page plus épurée et cohérente
- [x] Pas de liens morts

---

## 📁 Fichiers créés/modifiés (récap)

| Action | Fichier | Statut |
|:-------|:--------|:-------|
| Créer | `src/components/features/teacher/SectionCard.tsx` | ✅ |
| Créer | `src/components/features/teacher/inline-editors/LessonEditorInline.tsx` | ✅ |
| Créer | `src/components/features/teacher/inline-editors/QuizEditorInline.tsx` | ✅ |
| Créer | `src/components/features/teacher/inline-editors/ExerciseEditorInline.tsx` | ✅ |
| Créer | `src/components/features/teacher/inline-editors/VideoEditorInline.tsx` | ✅ |
| Créer | `src/components/features/teacher/inline-editors/index.ts` | ✅ |
| Créer | `src/components/features/teacher/SectionFormDialog.tsx` | ✅ |
| Créer | `src/app/api/teacher/sections/[id]/content/route.ts` | ✅ |
| Créer | `src/components/features/teacher/SectionFilesUploader.tsx` | ✅ |
| Créer | `src/app/api/teacher/sections/[id]/files/route.ts` | ✅ |
| Créer | `src/app/api/teacher/sections/[id]/files/[fileId]/route.ts` | ✅ |
| Modifier | `prisma/schema.prisma` (SectionFile model) | ✅ |
| Modifier | `src/components/features/teacher/ChaptersManager.tsx` | ✅ |
| Modifier | `src/components/features/teacher/CoursesTable.tsx` | ✅ |
| Modifier | `src/app/(dashboard)/teacher/courses/[id]/page.tsx` | ✅ |
| Supprimer | `src/app/(dashboard)/teacher/courses/[id]/edit/` | ✅ |

---

## 🐛 Bugs corrigés (PascalCase Prisma)

**Pattern récurrent** : Toutes les relations Prisma utilisent **PascalCase** :

| Erreur | Correction |
|:-------|:-----------|
| `teacher: { userId }` | `TeacherProfile: { userId }` |
| `chapter: { Course: {...} }` | `Chapter: { Course: {...} }` |
| `course: { TeacherProfile }` | `Course: { TeacherProfile }` |
| `section: { Chapter }` | `Section: { Chapter }` |

**Fichiers impactés** :
- `api/teacher/chapters/[id]/sections/route.ts` (POST)
- `api/teacher/sections/[id]/route.ts` (GET, PUT, DELETE)
- `api/teacher/sections/[id]/files/route.ts` (GET, POST)
- `api/teacher/sections/[id]/files/[fileId]/route.ts` (DELETE)
| Supprimer | `src/components/features/teacher/SectionFormDialog.tsx` (optionnel) |

---

## 🔗 Références

- **Wireframe** : `teacher.html` + `teacher.js` section Structure
- **Composant actuel** : `SectionItem.tsx`
- **UI** : `@/components/ui/collapsible`

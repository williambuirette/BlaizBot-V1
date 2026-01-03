# Prompts Refactorisation — Fichiers > 350 lignes

> **Objectif** : Instructions IA pour découper les fichiers volumineux  
> **Règle** : Fichier < 350 lignes, sous-composants < 150 lignes  
> **Principe** : Ne pas changer le comportement, uniquement la structure

---

## 🎯 Règles générales

```
CONTRAINTES :
1. Fichier principal < 350 lignes après refactorisation
2. Sous-composants extraits < 150 lignes chacun
3. Types partagés dans fichier séparé si > 30 lignes
4. Hooks custom extraits si > 40 lignes de logique
5. Pas de changement de comportement visible
6. Tests/Lint doivent passer après chaque étape

CONVENTION DE NOMMAGE :
- Sous-composant : PascalCase, préfixe du parent
  Ex: VideoEditorInline → VideoUploadZone, VideoPreview
- Hook : use + NomDuComposant + Action
  Ex: useCardEditor, useVideoUpload
- Utils : kebab-case
  Ex: video-helpers.ts, assignment-utils.ts
```

---

## R.1 — Dédupliquer inline-editors

### Prompt R.1

```markdown
## Contexte
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript).
Les fichiers dans `student/revisions/inline-editors/` sont des copies de `courses/inline-editors/`.

## Ta mission
Créer un dossier partagé et supprimer les doublons.

### Étapes

1. **Créer le dossier partagé**
   ```
   src/components/shared/inline-editors/
   ├── LessonEditorInline.tsx (copier de courses/)
   ├── VideoEditorInline.tsx (copier de courses/)
   ├── QuizEditorInline.tsx (copier de courses/)
   ├── ExerciseEditorInline.tsx (copier de courses/)
   ├── NoteEditorInline.tsx (copier de student/revisions/)
   └── index.ts
   ```

2. **Mettre à jour les imports dans courses/**
   Fichier : `src/components/features/courses/SectionCard.tsx`
   ```ts
   // Avant
   import { LessonEditorInline } from './inline-editors/LessonEditorInline';
   // Après  
   import { LessonEditorInline } from '@/components/shared/inline-editors';
   ```

3. **Mettre à jour les imports dans student/revisions/**
   Fichier : `src/components/features/student/revisions/StudentCardExpanded.tsx`
   ```ts
   // Avant
   import { LessonEditorInline } from './inline-editors';
   // Après
   import { LessonEditorInline, NoteEditorInline } from '@/components/shared/inline-editors';
   ```

4. **Supprimer les doublons**
   - Supprimer `src/components/features/courses/inline-editors/`
   - Supprimer `src/components/features/student/revisions/inline-editors/`

5. **Mettre à jour les index.ts**
   - `courses/index.ts` : retirer les exports inline-editors
   - `student/revisions/index.ts` : retirer les exports inline-editors

### Validation
- [ ] `npm run lint` passe
- [ ] Les pages cours professeur fonctionnent
- [ ] Les pages révisions élève fonctionnent
```

---

## R.2 — VideoEditorInline (520 → ~300)

### Prompt R.2

```markdown
## Contexte
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript).
Le fichier `VideoEditorInline.tsx` fait 520 lignes, objectif < 350.

## Ta mission
Extraire des sous-composants sans changer le comportement.

### Analyse du fichier
Le fichier contient :
- Interface VideoItem (~15 lignes)
- Interface VideoContent (~10 lignes)
- Fonctions utilitaires (~40 lignes) : extractYouTubeId, detectPlatform, generateId, migrateContent
- Composant principal (~455 lignes)

### Plan de découpage

1. **Créer `video-editor-types.ts`** (~30 lignes)
   ```ts
   export interface VideoItem {
     id: string;
     url: string;
     platform: 'youtube' | 'vimeo' | 'uploaded' | 'other';
     videoId?: string;
     title?: string;
     filename?: string;
     mimeType?: string;
   }

   export interface VideoContent {
     videos?: VideoItem[];
     description?: string;
     url?: string;
     platform?: 'youtube' | 'vimeo' | 'uploaded' | 'other';
     videoId?: string;
   }
   ```

2. **Créer `video-editor-utils.ts`** (~50 lignes)
   ```ts
   export function extractYouTubeId(url: string): string | null { ... }
   export function detectPlatform(url: string): VideoItem['platform'] { ... }
   export function generateVideoId(): string { ... }
   export function migrateContent(content: VideoContent | null): VideoItem[] { ... }
   ```

3. **Créer `VideoUploadZone.tsx`** (~80 lignes)
   Extraire le JSX du Tab upload avec :
   - Zone drag & drop
   - Input file hidden
   - Progress bar
   - Messages d'erreur

4. **Créer `VideoUrlInput.tsx`** (~70 lignes)
   Extraire le JSX du Tab URL avec :
   - Input URL
   - Input titre
   - Validation visuelle
   - Bouton ajouter

5. **Créer `VideoListItem.tsx`** (~70 lignes)
   Extraire le JSX d'un item vidéo avec :
   - Miniature/preview
   - Input titre éditable
   - Badge plateforme
   - Bouton supprimer

6. **Créer `VideoPreview.tsx`** (~60 lignes)
   Extraire le JSX de prévisualisation avec :
   - iframe YouTube
   - video HTML5 pour uploaded
   - Placeholder pour autres

### Structure finale
```
shared/inline-editors/
├── video-editor/
│   ├── VideoEditorInline.tsx (~220 lignes)
│   ├── VideoUploadZone.tsx (~80 lignes)
│   ├── VideoUrlInput.tsx (~70 lignes)
│   ├── VideoListItem.tsx (~70 lignes)
│   ├── VideoPreview.tsx (~60 lignes)
│   ├── video-editor-types.ts (~30 lignes)
│   ├── video-editor-utils.ts (~50 lignes)
│   └── index.ts
├── LessonEditorInline.tsx
├── ...
└── index.ts
```

### Validation
- [ ] VideoEditorInline.tsx < 250 lignes
- [ ] Chaque sous-composant < 100 lignes
- [ ] Comportement identique (test manuel)
- [ ] `npm run lint` passe
```

---

## R.3 — NewConversationDialog (517 → ~280)

### Prompt R.3

```markdown
## Contexte
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript).
Le fichier `NewConversationDialog.tsx` fait 517 lignes, objectif < 350.

## Ta mission
Extraire des sous-composants pour le dialogue de création de conversation.

### Plan de découpage

1. **Créer `RecipientSelector.tsx`** (~120 lignes)
   - Liste des destinataires possibles
   - Recherche/filtrage
   - Sélection multiple si groupe
   - Affichage avatar + nom

2. **Créer `ConversationTypeSelector.tsx`** (~70 lignes)
   - Radio buttons : Direct / Groupe / Classe
   - Descriptions de chaque type
   - Icônes associées

3. **Créer `MessageComposer.tsx`** (~90 lignes)
   - Textarea message initial
   - Upload fichier optionnel
   - Preview fichier
   - Bouton envoyer

### Structure finale
```
messages/
├── NewConversationDialog.tsx (~240 lignes)
├── RecipientSelector.tsx (~120 lignes)
├── ConversationTypeSelector.tsx (~70 lignes)
├── MessageComposer.tsx (~90 lignes)
└── index.ts
```

### Validation
- [ ] Dialogue principal < 280 lignes
- [ ] Création conversation fonctionne
- [ ] `npm run lint` passe
```

---

## R.4 — AssignmentFiltersBar (500 → ~250)

### Prompt R.4

```markdown
## Contexte
Tu travailles sur BlaizBot-V1 (Next.js 15, TypeScript).
Le fichier `AssignmentFiltersBar.tsx` fait 500 lignes, objectif < 350.

## Ta mission
Extraire chaque filtre en composant séparé.

### Plan de découpage

1. **Créer `filters/FilterDateRange.tsx`** (~80 lignes)
   - DatePicker début/fin
   - Presets (Cette semaine, Ce mois, etc.)

2. **Créer `filters/FilterSubject.tsx`** (~70 lignes)
   - Select avec options matières
   - Multi-select si besoin

3. **Créer `filters/FilterStatus.tsx`** (~70 lignes)
   - Checkboxes : À faire, En cours, Terminé, En retard

4. **Créer `filters/FilterClass.tsx`** (~70 lignes)
   - Select classe (côté prof uniquement)

5. **Créer `filters/FilterSearch.tsx`** (~50 lignes)
   - Input recherche texte
   - Debounce

### Structure finale
```
assignments/
├── AssignmentFiltersBar.tsx (~200 lignes)
├── filters/
│   ├── FilterDateRange.tsx
│   ├── FilterSubject.tsx
│   ├── FilterStatus.tsx
│   ├── FilterClass.tsx
│   ├── FilterSearch.tsx
│   └── index.ts
└── index.ts
```

### Validation
- [ ] Barre de filtres < 250 lignes
- [ ] Tous les filtres fonctionnent
- [ ] `npm run lint` passe
```

---

## R.5 — ResourcesManager (487 → ~280)

### Prompt R.5

```markdown
## Contexte
Le fichier `ResourcesManager.tsx` fait 487 lignes, objectif < 350.

## Plan de découpage

1. **Créer `ResourcesList.tsx`** (~100 lignes)
   - Grille de ressources
   - États vide/chargement
   - Pagination si > 20

2. **Créer `ResourceItem.tsx`** (~90 lignes)
   - Card avec icône type
   - Titre + description
   - Actions (éditer, supprimer, télécharger)
   - Badge type (PDF, Vidéo, etc.)

3. **Créer `ResourceUploadZone.tsx`** (~80 lignes)
   - Zone drag & drop
   - Types acceptés
   - Progress upload

### Validation
- [ ] Manager < 280 lignes
- [ ] Upload/CRUD ressources OK
- [ ] `npm run lint` passe
```

---

## R.6 — StudentCardExpanded (462 → ~300)

### Prompt R.6

```markdown
## Contexte
Le fichier `StudentCardExpanded.tsx` fait 462 lignes, objectif < 350.

## Plan de découpage

1. **Créer `CardExpandedHeader.tsx`** (~90 lignes)
   - Icône type + titre éditable
   - Badge type + badge contenu
   - Boutons actions (edit, delete)
   - Chevron expand

2. **Créer `CardExpandedContent.tsx`** (~80 lignes)
   - Barre modifications non sauvegardées
   - Switch éditeur selon type
   - Section fichiers

3. **Créer `hooks/useCardEditor.ts`** (~70 lignes)
   - États : content, files, saving, hasChanges
   - fetchContent, handleSave, handleCancel
   - saveCardTitle

### Validation
- [ ] Composant principal < 300 lignes
- [ ] Édition inline fonctionne
- [ ] `npm run lint` passe
```

---

## R.7 — Fichiers 400-450 lignes

### Prompt R.7.1 — AssignmentCard (460 → ~300)

```markdown
Extraire :
- `AssignmentCardHeader.tsx` (~80 lignes) : Titre, matière, deadline
- `AssignmentProgress.tsx` (~70 lignes) : Barre progression, pourcentage
- `AssignmentStatusBadge.tsx` (~40 lignes) : Badge coloré selon statut
```

### Prompt R.7.2 — ChaptersManager (444 → ~280)

```markdown
Extraire :
- `ChapterAccordion.tsx` (~100 lignes) : Header chapitre + collapse
- `SectionItem.tsx` (~80 lignes) : Item section draggable
```

### Prompt R.7.3 — MessageThread (411 → ~280)

```markdown
Extraire :
- `MessageBubble.tsx` (~80 lignes) : Bulle message + avatar
- `MessageInput.tsx` (~70 lignes) : Textarea + upload + send
```

### Prompt R.7.4 — QuizViewer (409 → ~280)

```markdown
Extraire :
- `QuizQuestion.tsx` (~100 lignes) : Question + options
- `QuizResults.tsx` (~80 lignes) : Résumé score + corrections
```

### Prompt R.7.5 — NewAssignmentModal (407 → ~280)

```markdown
Extraire :
- `AssignmentFormStep1.tsx` (~80 lignes) : Infos de base
- `AssignmentFormStep2.tsx` (~80 lignes) : Destinataires
- `AssignmentFormStep3.tsx` (~80 lignes) : Paramètres avancés
```

---

## R.8 — Fichiers 350-400 lignes

### Prompt R.8.1 — stats-service.ts (405 → 3×~130)

```markdown
Découper par domaine :
- `student-stats.ts` (~130 lignes) : Stats élève
- `teacher-stats.ts` (~130 lignes) : Stats professeur
- `course-stats.ts` (~130 lignes) : Stats cours
- `index.ts` : Re-export tout
```

### Prompt R.8.2 — Composants 350-400

Pour chaque fichier :
```markdown
1. Identifier le bloc JSX le plus volumineux (>100 lignes)
2. L'extraire en sous-composant
3. Passer les props nécessaires
4. Vérifier que le parent < 350 lignes
```

---

## ✅ Template de validation

Après chaque refactorisation :

```bash
# 1. Vérifier le nombre de lignes
Get-Content <fichier> | Measure-Object -Line

# 2. Lint
npm run lint

# 3. Build (optionnel mais recommandé)
npm run build

# 4. Test manuel
# Ouvrir la page concernée et vérifier le comportement
```

---

*Dernière MAJ : 2026-01-03*

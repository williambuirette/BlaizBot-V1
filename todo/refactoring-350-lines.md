# 🔧 Refactorisation — Fichiers > 350 lignes

> **Objectif** : Ramener tous les fichiers sous 350 lignes  
> **Statut** : ⬜ À FAIRE  
> **Fichiers concernés** : 19  
> **Estimé** : 4-6h

---

## 📊 Inventaire des fichiers à refactoriser

| # | Lignes | Fichier | Priorité | Stratégie |
|:--|:-------|:--------|:---------|:----------|
| 1 | **520** | `courses/inline-editors/VideoEditorInline.tsx` | 🔴 HAUTE | Extraire sous-composants |
| 2 | **520** | `student/revisions/inline-editors/VideoEditorInline.tsx` | 🔴 HAUTE | Supprimer (dupliquer) |
| 3 | **517** | `messages/NewConversationDialog.tsx` | 🔴 HAUTE | Extraire formulaires |
| 4 | **500** | `assignments/AssignmentFiltersBar.tsx` | 🔴 HAUTE | Extraire filtres individuels |
| 5 | **487** | `courses/ResourcesManager.tsx` | 🔴 HAUTE | Extraire ResourceList + ResourceItem |
| 6 | **462** | `student/revisions/StudentCardExpanded.tsx` | 🟠 MOYENNE | Extraire CardHeader + CardActions |
| 7 | **460** | `assignments/AssignmentCard.tsx` | 🟠 MOYENNE | Extraire StatusBadge + ProgressBar |
| 8 | **444** | `courses/ChaptersManager.tsx` | 🟠 MOYENNE | Extraire ChapterItem + SectionsList |
| 9 | **411** | `shared/MessageThread.tsx` | 🟠 MOYENNE | Extraire MessageBubble + InputArea |
| 10 | **409** | `student/viewers/QuizViewer.tsx` | 🟠 MOYENNE | Extraire QuestionCard + ResultSummary |
| 11 | **407** | `assignments/NewAssignmentModal.tsx` | 🟠 MOYENNE | Extraire FormSteps |
| 12 | **405** | `lib/stats-service.ts` | 🟡 BASSE | Découper par domaine |
| 13 | **403** | `courses/ResourceFormDialog.tsx` | 🟡 BASSE | Extraire TypeSelector |
| 14 | **387** | `student/StudentCoursesFiltersMulti.tsx` | 🟡 BASSE | Extraire FilterChip |
| 15 | **376** | `courses/AssignmentsManager.tsx` | 🟡 BASSE | Extraire AssignmentRow |
| 16 | **370** | `student/revisions/inline-editors/ExerciseEditorInline.tsx` | 🟡 BASSE | Supprimer (dupliquer) |
| 17 | **370** | `courses/inline-editors/ExerciseEditorInline.tsx` | 🟡 BASSE | Extraire ExerciseItem |
| 18 | **362** | `courses/ExercisesManager.tsx` | 🟡 BASSE | Extraire ExerciseRow |
| 19 | **362** | `courses/ExerciseEditor.tsx` | 🟡 BASSE | Extraire QuestionForm |

---

## 🎯 Plan de refactorisation

### Phase R.1 — Dédupliquer (gain rapide)

Les fichiers student/revisions/inline-editors/* sont des copies de courses/inline-editors/*.
**Solution** : Créer un dossier partagé `components/shared/inline-editors/` et importer.

| Tâche | Action |
|:------|:-------|
| R.1.1 | Créer `src/components/shared/inline-editors/` |
| R.1.2 | Déplacer les 4 éditeurs de `courses/` vers `shared/` |
| R.1.3 | Supprimer le dossier `student/revisions/inline-editors/` |
| R.1.4 | Mettre à jour les imports dans `StudentCardExpanded.tsx` |
| R.1.5 | Mettre à jour les imports dans `SectionCard.tsx` |

**Gain** : -5 fichiers (4 doublons + NoteEditorInline unique à student)

---

### Phase R.2 — VideoEditorInline (520 → ~300)

**Découpage** :
```
VideoEditorInline.tsx (300 lignes)
├── components/
│   ├── VideoUploadZone.tsx (~80 lignes)
│   ├── VideoUrlInput.tsx (~60 lignes)
│   ├── VideoPreview.tsx (~50 lignes)
│   └── VideoListItem.tsx (~70 lignes)
└── utils/
    └── video-helpers.ts (~40 lignes)
```

---

### Phase R.3 — NewConversationDialog (517 → ~280)

**Découpage** :
```
NewConversationDialog.tsx (280 lignes)
├── RecipientSelector.tsx (~100 lignes)
├── MessageComposer.tsx (~80 lignes)
└── ConversationTypeSelector.tsx (~60 lignes)
```

---

### Phase R.4 — AssignmentFiltersBar (500 → ~250)

**Découpage** :
```
AssignmentFiltersBar.tsx (250 lignes)
├── FilterDateRange.tsx (~80 lignes)
├── FilterSubject.tsx (~60 lignes)
├── FilterStatus.tsx (~60 lignes)
└── FilterClass.tsx (~60 lignes)
```

---

### Phase R.5 — ResourcesManager (487 → ~280)

**Découpage** :
```
ResourcesManager.tsx (280 lignes)
├── ResourcesList.tsx (~100 lignes)
├── ResourceItem.tsx (~80 lignes)
└── ResourceUploadZone.tsx (~60 lignes)
```

---

### Phase R.6 — StudentCardExpanded (462 → ~300)

**Découpage** :
```
StudentCardExpanded.tsx (300 lignes)
├── CardExpandedHeader.tsx (~80 lignes)
├── CardExpandedActions.tsx (~60 lignes)
└── hooks/useCardEditor.ts (~60 lignes)
```

---

### Phase R.7 — Fichiers 400-450 lignes

| Fichier | Extraction |
|:--------|:-----------|
| AssignmentCard.tsx | → AssignmentCardHeader + AssignmentProgress |
| ChaptersManager.tsx | → ChapterAccordion + SectionItem |
| MessageThread.tsx | → MessageBubble + MessageInput |
| QuizViewer.tsx | → QuizQuestion + QuizResults |
| NewAssignmentModal.tsx | → AssignmentFormStep1/2/3 |

---

### Phase R.8 — Fichiers 350-400 lignes

| Fichier | Extraction |
|:--------|:-----------|
| stats-service.ts | → student-stats.ts + teacher-stats.ts + course-stats.ts |
| ResourceFormDialog.tsx | → ResourceTypeSelector + ResourceMetaForm |
| StudentCoursesFiltersMulti.tsx | → CourseFilterChip + FilterGroup |
| AssignmentsManager.tsx | → AssignmentTableRow |
| ExerciseEditorInline.tsx | → ExerciseItemEditor |
| ExercisesManager.tsx | → ExerciseListItem |
| ExerciseEditor.tsx | → QuestionEditor |

---

## ✅ Checklist de validation

Pour chaque fichier refactorisé :
- [ ] Fichier principal < 350 lignes
- [ ] Sous-composants < 150 lignes
- [ ] Tests existants passent (`npm run lint`)
- [ ] Fonctionnalité inchangée (test manuel)
- [ ] Imports mis à jour partout
- [ ] Index.ts mis à jour si nécessaire

---

## 📋 Ordre d'exécution recommandé

```
1. R.1 — Dédupliquer inline-editors (~30 min)
2. R.2 — VideoEditorInline (~45 min)
3. R.3 — NewConversationDialog (~30 min)
4. R.4 — AssignmentFiltersBar (~30 min)
5. R.5 — ResourcesManager (~30 min)
6. R.6 — StudentCardExpanded (~30 min)
7. R.7 — Fichiers 400-450 (~1h30)
8. R.8 — Fichiers 350-400 (~1h30)
```

**Total estimé : 5-6h**

---

## 🔄 Navigation

← [phase-08-student-v2.md](phase-08-student-v2.md) | [INDEX.md](INDEX.md) →

---

*Dernière MAJ : 2026-01-03*

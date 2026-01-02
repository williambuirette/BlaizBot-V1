# Phase 8.4.7-13 — Pages & Composants Révisions Élève

*Créé le : 2026-01-02*

---

## 🎯 Objectif

Créer l'interface utilisateur pour les révisions élève.

---

## 📋 Prompt 8.4.7 — Page Liste Révisions

```markdown
## Contexte
BlaizBot-V1 : Next.js 15, TypeScript, shadcn/ui.
Les APIs /api/student/supplements existent.

## Ta mission
Créer la page principale "Mes Révisions".

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Mes Révisions                          [+ Nouveau]      │
├─────────────────────────────────────────────────────────────┤
│  [Onglet: Tous] [Liés aux cours] [Mes cours perso]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔗 LIÉS À MES COURS                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📖 Mathématiques Avancées (M. Dupont)               │   │
│  │    📝 3 notes · 📄 2 fichiers · ❓ 1 quiz perso     │   │
│  │    Score auto-éval : 78%                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📓 MES COURS PERSONNELS                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 Prépa Concours 2026                  [Éditer]    │   │
│  │    5 chapitres · 12 cartes                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📊 MES STATS PERSO                                         │
│  │  Quiz complétés : 15    Score moyen : 82%           │   │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers à créer

```
src/app/(dashboard)/student/revisions/
└── page.tsx              (~80 lignes - orchestrateur)

src/components/features/student/revisions/
├── RevisionsHeader.tsx   (~50 lignes)
├── RevisionsFilters.tsx  (~60 lignes)
├── SupplementsList.tsx   (~100 lignes)
├── SupplementCard.tsx    (~80 lignes)
├── RevisionStats.tsx     (~60 lignes)
└── index.ts
```

### Page orchestrateur
```tsx
// src/app/(dashboard)/student/revisions/page.tsx
import { RevisionsHeader, RevisionsFilters, SupplementsList, RevisionStats } from '@/components/features/student/revisions';

export default async function RevisionsPage() {
  // Fetch côté serveur
  return (
    <div className="space-y-6">
      <RevisionsHeader />
      <RevisionsFilters />
      <SupplementsList />
      <RevisionStats />
    </div>
  );
}
```

### SupplementCard props
```typescript
interface SupplementCardProps {
  supplement: {
    id: string;
    title: string;
    description?: string;
    course?: { title: string; teacher: { firstName: string; lastName: string } };
    _count: { chapters: number; };
    cardCount: number;
    quizCount: number;
    avgScore?: number;
  };
}
```

## Contraintes
- Fichiers < 350 lignes
- Utiliser shadcn/ui (Card, Badge, Tabs)
- Icônes Lucide (Book, FileText, Brain, Plus)
```

---

## 📋 Prompt 8.4.8 — Page Détail Supplément

```markdown
## Contexte
Suite de 8.4.7. La liste existe.

## Ta mission
Créer la page détail d'un supplément avec gestion chapitres/cartes.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Retour    📝 Prépa Concours 2026           [Paramètres]  │
├─────────────────────────────────────────────────────────────┤
│  [Chapitres] [Stats]                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📚 CHAPITRES                              [+ Chapitre]     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ▼ Chapitre 1 - Algèbre                    [⋮]       │   │
│  │   ├── 📝 Formules importantes                       │   │
│  │   ├── 📄 Résumé cours                               │   │
│  │   └── ❓ Quiz auto-éval                             │   │
│  │                                    [+ Carte]        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ▶ Chapitre 2 - Géométrie                  [⋮]       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers

```
src/app/(dashboard)/student/revisions/[id]/
└── page.tsx              (~80 lignes)

src/components/features/student/revisions/
├── SupplementHeader.tsx      (~60 lignes)
├── StudentChapterManager.tsx (~150 lignes)
├── StudentChapterItem.tsx    (~100 lignes)
├── StudentCardItem.tsx       (~80 lignes)
└── StudentCardEditor.tsx     (~200 lignes) - Modal édition
```

### StudentChapterManager
- Accordion pour chapitres
- Drag & drop pour réordonner (optionnel v1)
- Actions: Éditer, Supprimer, Ajouter carte

### StudentCardItem
- Affiche icône selon cardType
- Actions: Voir, Éditer, Supprimer
- Badge si quiz avec score
```

---

## 📋 Prompt 8.4.9 — Page Création Supplément

```markdown
## Contexte
Suite de 8.4.8.

## Ta mission
Créer la page de création d'un nouveau supplément.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Retour    Nouveau supplément                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 Informations                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Titre *                                             │   │
│  │ [______________________________________]            │   │
│  │                                                     │   │
│  │ Description                                         │   │
│  │ [______________________________________]            │   │
│  │                                                     │   │
│  │ Lier à un cours (optionnel)                         │   │
│  │ [▼ Sélectionner un cours________________]           │   │
│  │    ○ Aucun (cours personnel)                        │   │
│  │    ○ Mathématiques Avancées                         │   │
│  │    ○ Physique Quantique                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                              [Annuler]  [Créer supplément]  │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers

```
src/app/(dashboard)/student/revisions/create/
└── page.tsx              (~60 lignes)

src/components/features/student/revisions/
└── CreateSupplementForm.tsx  (~150 lignes)
```

### Comportement
- Liste des cours = cours auxquels l'élève est inscrit
- Après création → redirect vers /student/revisions/[newId]
- Validation: titre obligatoire (min 3 caractères)
```

---

## 📋 Prompt 8.4.10-12 — Composants Cartes

```markdown
## Contexte
Suite création supplément.

## Ta mission
Créer les composants d'édition de cartes.

### StudentCardEditor (Modal)

Types de cartes avec interfaces adaptées :

**NOTE** : Éditeur Markdown simple
**SUMMARY** : Éditeur Markdown + titre structuré
**QUIZ** : Interface création questions
**EXERCISE** : Zone de consigne + zone de réponse
**FLASHCARD** : Recto (question) / Verso (réponse)

### Fichiers

```
src/components/features/student/revisions/
├── StudentCardEditor.tsx       (~200 lignes) - Modal principale
├── editors/
│   ├── NoteEditor.tsx          (~80 lignes)
│   ├── QuizEditor.tsx          (~150 lignes)
│   ├── FlashcardEditor.tsx     (~100 lignes)
│   └── index.ts
└── StudentFileUploader.tsx     (~100 lignes)
```

### StudentCardEditor structure
```tsx
function StudentCardEditor({ card, chapterId, onSave, onClose }) {
  const [cardType, setCardType] = useState(card?.cardType || 'NOTE');
  
  return (
    <Dialog>
      <DialogContent>
        <Tabs value={cardType}>
          <TabsList>
            <TabsTrigger value="NOTE">Note</TabsTrigger>
            <TabsTrigger value="QUIZ">Quiz</TabsTrigger>
            <TabsTrigger value="FLASHCARD">Flashcard</TabsTrigger>
          </TabsList>
          <TabsContent value="NOTE"><NoteEditor /></TabsContent>
          <TabsContent value="QUIZ"><QuizEditor /></TabsContent>
          <TabsContent value="FLASHCARD"><FlashcardEditor /></TabsContent>
        </Tabs>
        <StudentFileUploader cardId={card?.id} />
      </DialogContent>
    </Dialog>
  );
}
```
```

---

## 📋 Prompt 8.4.13 — Onglet "Mes notes" dans cours

```markdown
## Contexte
Page détail cours élève existante : /student/courses/[id]

## Ta mission
Ajouter un onglet "Mes notes" qui affiche le supplément lié à ce cours.

### Modification

Dans `src/app/(dashboard)/student/courses/[id]/page.tsx` :
- Ajouter onglet "Mes notes" après "Ressources"
- Si supplément existe pour ce cours → afficher les cartes
- Sinon → bouton "Créer mes notes pour ce cours"

### Layout onglet

```
┌─────────────────────────────────────────────────────────────┐
│  [Contenu] [Ressources] [Mes notes]                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📌 Mes notes pour ce cours                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 Formule importante à retenir                     │   │
│  │ 📄 resume-chapitre-3.pdf                            │   │
│  │ ❓ Quiz perso (Score: 85%)                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Ajouter une note]  [Voir tout →]                        │
└─────────────────────────────────────────────────────────────┘
```

### API à appeler
GET /api/student/supplements?courseId={courseId}
- Retourne le supplément lié (s'il existe)

### Comportement
- "Créer mes notes" → POST /api/student/supplements { courseId }
- "Voir tout" → /student/revisions/[supplementId]
```

---

## ✅ Checklist — COMPLÉTÉ LE 2026-01-03

- [x] 8.4.7 Page /student/revisions créée ✅
- [x] 8.4.7 RevisionsHeader, Filters (RevisionsTabs) ✅
- [x] 8.4.7 SupplementCard avec badges cours ✅
- [x] 8.4.8 Page /student/revisions/[id] ✅
- [x] 8.4.8 StudentChapterManager ✅
- [x] 8.4.8 StudentChapterItem, StudentCardItem ✅
- [x] 8.4.9 CreateSupplementDialog (modale création) ✅
- [x] 8.4.10 SupplementCard avec stats (chap, cartes) ✅
- [x] 8.4.11 StudentChapterManager inline editing ✅
- [x] 8.4.12 StudentCardItem avec éditeur inline ✅
- [x] 8.4.12 5 types : NOTE, LESSON, VIDEO, EXERCISE, QUIZ ✅
- [x] 8.4.12 Icônes colorées identiques au professeur ✅
- [x] 8.4.13 Section "Mes suppléments" dans cours détail ✅
- [x] 8.4.13 Accordéon déroulant avec cartes ✅
- [x] 8.4.13 Modal visualisation des cartes ✅

### Fonctionnalités bonus implémentées
- [x] Attribution multi-cours (many-to-many) avec checkboxes ✅
- [x] CourseAttributionDialog pour modifier l'attribution ✅
- [x] Badges de cours sur les SupplementCard ✅
- [x] API /api/student/courses/[id]/supplements ✅

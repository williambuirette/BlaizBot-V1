# Prompts Phase 8 — Blocs Dépliables Structure Cours

> **Index** : [todo/phase-08-blocs-structure.md](../todo/phase-08-blocs-structure.md)  
> **Objectif** : Transformer les modales d'édition en cartes accordéon dépliables

---

## 🎯 Contexte Global

**Problème** : Les modales actuelles sont trop petites et ne rechargent pas le contenu existant.

**Solution** : Système de blocs dépliables où chaque section est une carte accordéon avec l'éditeur inline.

**Composants existants à consulter** :
- `src/components/features/teacher/ChaptersManager.tsx` — Gestionnaire principal
- `src/components/features/teacher/SectionItem.tsx` — Affichage section actuel
- `src/components/features/teacher/LessonEditor.tsx` — Éditeur leçon (Dialog)
- `@/components/ui/collapsible` — Composant accordéon shadcn/ui

---

## BL1 — Composant SectionCard

### Prompt BL1

```
Crée le composant `src/components/features/teacher/SectionCard.tsx`.

**Contexte** :
- Remplace SectionItem.tsx par une carte accordéon dépliable
- Utilise Collapsible de @/components/ui/collapsible
- Une seule section peut être ouverte à la fois (optionnel, gérer via parent)

**Props** :
interface SectionCardProps {
  section: Section;
  chapterId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (data: Partial<Section>) => Promise<void>;
  onDelete: () => void;
  children?: React.ReactNode; // Slot pour éditeur inline
}

**Structure** :
1. **Header** (toujours visible, cliquable) :
   - Icône type (BookOpen, Video, HelpCircle, FileText)
   - Titre section
   - Badge type avec couleur (leçon=bleu, quiz=orange, vidéo=violet, exercice=vert)
   - Chevron animé (rotation 180° quand ouvert)
   - Bouton supprimer (apparaît au hover)

2. **Body** (CollapsibleContent) :
   - Affiché uniquement si isExpanded=true
   - Contient les children (éditeur inline)
   - Padding et bordure pour délimiter

**Styling** :
- Utilise les classes existantes (Card, CardHeader de shadcn/ui)
- Transition smooth sur l'ouverture/fermeture
- Hover state sur le header
- Focus visible pour accessibilité

**Import depuis SectionItem.tsx** :
- getSectionIcon() — icône par type
- getSectionBadgeColor() — couleur badge par type

**Fichiers de référence** :
- Lire SectionItem.tsx pour la logique existante
- Lire @/components/ui/collapsible pour l'API Collapsible
```

---

## BL2 — Éditeurs Inline

### Prompt BL2.1 — LessonEditorInline

```
Crée `src/components/features/teacher/inline-editors/LessonEditorInline.tsx`.

**Contexte** :
- Basé sur LessonEditor.tsx mais SANS Dialog
- Même logique TipTap RichEditor
- Rendu inline dans la carte SectionCard

**Props** :
interface LessonEditorInlineProps {
  sectionId: string;
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
  onCancel: () => void;
}

**Structure** :
1. État local `content` initialisé avec initialContent
2. RichEditor (TipTap) pour édition
3. Footer avec boutons :
   - "Enregistrer" (primary) → appelle onSave(content)
   - "Annuler" (outline) → appelle onCancel

**Différences avec LessonEditor.tsx** :
- PAS de Dialog, DialogTrigger, DialogContent
- PAS de DialogHeader, DialogTitle
- Le composant EST le contenu directement
- Même RichEditor, même gestion d'état

**Fichier de référence** :
- Copier la logique de LessonEditor.tsx (lignes 50-80 environ)
- Adapter les imports
```

### Prompt BL2.2 — QuizEditorInline

```
Crée `src/components/features/teacher/inline-editors/QuizEditorInline.tsx`.

**Contexte** :
- Basé sur QuizEditor.tsx mais SANS Dialog
- Gestion des questions/réponses
- Rendu inline dans la carte SectionCard

**Props** :
interface QuizEditorInlineProps {
  sectionId: string;
  initialQuestions?: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => Promise<void>;
  onCancel: () => void;
}

**Type QuizQuestion** :
interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

**Structure** :
1. Liste des questions avec bouton "Ajouter question"
2. Chaque question : input question + options + sélection bonne réponse
3. Footer avec Enregistrer/Annuler

**Fichier de référence** :
- Copier la logique de QuizEditor.tsx
- Supprimer le wrapper Dialog
```

### Prompt BL2.3 — VideoEditorInline

```
Crée `src/components/features/teacher/inline-editors/VideoEditorInline.tsx`.

**Props** :
interface VideoEditorInlineProps {
  sectionId: string;
  initialUrl?: string;
  onSave: (url: string) => Promise<void>;
  onCancel: () => void;
}

**Structure** :
1. Input URL vidéo (YouTube, Vimeo)
2. Preview embed si URL valide
3. Footer Enregistrer/Annuler
```

### Prompt BL2.4 — ExerciseEditorInline

```
Crée `src/components/features/teacher/inline-editors/ExerciseEditorInline.tsx`.

**Props** :
interface ExerciseEditorInlineProps {
  sectionId: string;
  initialExercise?: ExerciseData;
  onSave: (exercise: ExerciseData) => Promise<void>;
  onCancel: () => void;
}

**Structure** :
1. Titre de l'exercice
2. Instructions (Textarea ou RichEditor)
3. Type d'exercice (QCM, texte libre, code)
4. Footer Enregistrer/Annuler
```

### Prompt BL2.5 — Index exports

```
Crée `src/components/features/teacher/inline-editors/index.ts`.

Export tous les éditeurs inline :
- LessonEditorInline
- QuizEditorInline
- VideoEditorInline
- ExerciseEditorInline
```

---

## BL3 — Formulaire Section Inline

### Prompt BL3

```
Crée `src/components/features/teacher/SectionFormInline.tsx`.

**Contexte** :
- Remplace SectionFormDialog pour créer une nouvelle section
- Formulaire inline qui s'affiche sous le chapitre
- Disparaît après création ou annulation

**Props** :
interface SectionFormInlineProps {
  chapterId: string;
  onSubmit: (data: { title: string; type: SectionType; order: number }) => Promise<void>;
  onCancel: () => void;
  nextOrder: number; // Ordre de la prochaine section
}

**Structure** :
1. Input titre (required)
2. Select type (LESSON, VIDEO, QUIZ, EXERCISE)
3. Footer :
   - "Créer" (primary) → appelle onSubmit
   - "Annuler" (outline) → appelle onCancel

**Validation** :
- Titre requis, min 3 caractères
- Type requis
```

---

## BL4 — Chargement Contenu Existant

### Prompt BL4

```
Crée l'API et la logique de chargement du contenu section.

**1. API Route** : `src/app/api/teacher/sections/[id]/content/route.ts`

GET /api/teacher/sections/[id]/content
- Vérifie que l'utilisateur est prof
- Récupère la section avec son contenu (lesson, quiz, video, exercise)
- Retourne le contenu selon le type

Response :
{
  success: true,
  data: {
    type: "LESSON" | "VIDEO" | "QUIZ" | "EXERCISE",
    content: { ... } // Dépend du type
  }
}

**2. Hook ou fonction** dans SectionCard :
- Appelé quand isExpanded passe à true
- Affiche skeleton/loader pendant le fetch
- Passe les données à l'éditeur inline

**Référence** :
- Voir les API existantes dans /api/teacher/courses/
- Utiliser prisma pour les requêtes
```

---

## BL5 — Boutons Save/Cancel

### Prompt BL5

```
Ajoute les boutons Save/Cancel dans les éditeurs inline.

**Pattern commun pour tous les éditeurs** :

<div className="flex justify-end gap-2 mt-4 pt-4 border-t">
  <Button variant="outline" onClick={onCancel}>
    Annuler
  </Button>
  <Button onClick={handleSave} disabled={isSaving}>
    {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
    Enregistrer
  </Button>
</div>

**États** :
- isSaving: boolean — pendant l'appel API
- isModified: boolean — optionnel, pour désactiver Enregistrer si rien n'a changé

**Comportement** :
- Enregistrer : appelle onSave, ferme la carte si succès
- Annuler : reset le formulaire, ferme la carte
```

---

## BL6 — Animations & Transitions

### Prompt BL6

```
Améliore les animations de SectionCard.

**Chevron** :
<ChevronDown 
  className={cn(
    "h-4 w-4 transition-transform duration-200",
    isExpanded && "rotate-180"
  )} 
/>

**Collapsible** :
Utilise les classes CSS pour animation height :
- Collapsible de shadcn/ui gère déjà l'animation
- S'assurer que CollapsibleContent a overflow-hidden

**Optionnel** :
- Framer Motion pour animations plus fluides
- Focus automatique sur le premier input à l'ouverture
```

---

## BL7 — Intégration ChaptersManager

### Prompt BL7

```
Intègre SectionCard dans ChaptersManager.tsx.

**Modifications** :

1. **Supprimer les états de modales** :
   - quizEditorOpen, lessonEditorOpen, etc.
   - setQuizEditorOpen, setLessonEditorOpen, etc.

2. **Ajouter état des sections ouvertes** :
   const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

3. **Remplacer SectionItem par SectionCard** :
   {chapter.sections.map((section) => (
     <SectionCard
       key={section.id}
       section={section}
       chapterId={chapter.id}
       isExpanded={expandedSectionId === section.id}
       onToggle={() => setExpandedSectionId(
         expandedSectionId === section.id ? null : section.id
       )}
       onUpdate={(data) => handleUpdateSection(section.id, data)}
       onDelete={() => handleDeleteSection(section.id)}
     >
       {/* Éditeur inline selon le type */}
       {section.type === 'LESSON' && (
         <LessonEditorInline ... />
       )}
       {section.type === 'QUIZ' && (
         <QuizEditorInline ... />
       )}
       ...
     </SectionCard>
   ))}

4. **Garder** :
   - Logique de réordonnancement drag & drop
   - handleCreateSection, handleUpdateSection, handleDeleteSection
   - Gestion des chapitres (inchangée)

**Fichier de référence** :
- ChaptersManager.tsx actuel (~450 lignes)
- Identifier les parties à modifier vs garder
```

---

## BL8 — Tests & Validation

### Prompt BL8

```
Liste des tests manuels à effectuer :

**Fonctionnels** :
1. [ ] Cliquer sur une section → la carte s'ouvre
2. [ ] Cliquer à nouveau → la carte se ferme
3. [ ] Ouvrir section A, puis B → A se ferme, B s'ouvre
4. [ ] Éditer une leçon → le TipTap fonctionne
5. [ ] Sauvegarder → contenu persisté en BDD
6. [ ] Rouvrir la section → contenu rechargé correctement
7. [ ] Annuler une modification → contenu revient à l'original
8. [ ] Créer une nouvelle section → formulaire inline s'affiche

**Non-régression** :
9. [ ] Drag & drop des chapitres fonctionne encore
10. [ ] Suppression de section fonctionne
11. [ ] Badge de type affiché correctement
12. [ ] Icônes par type correctes

**UI/UX** :
13. [ ] Animation d'ouverture fluide
14. [ ] Chevron tourne à l'ouverture
15. [ ] Pas de flash ou saut de contenu
16. [ ] Boutons Save/Cancel alignés correctement

**Commandes** :
npm run lint
npm run build
```

---

## BL9 — Fichiers Base de Connaissance par Section

### Prompt BL9

```
Ajoute l'upload de fichiers (base de connaissance) dans chaque section.

**Contexte** :
- Chaque section peut avoir des fichiers associés (PDF, docs, images)
- L'élève verra ces fichiers directement dans le cours
- Remplace l'onglet "Base de connaissance" séparé

**1. Modèle Prisma** — Ajouter dans schema.prisma :

model SectionFile {
  id        String   @id @default(cuid())
  sectionId String
  section   Section  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  filename  String
  originalName String
  mimeType  String
  size      Int
  path      String
  createdAt DateTime @default(now())
}

// Ajouter dans Section :
model Section {
  // ... existant
  files     SectionFile[]
}

**2. Composant** : `src/components/features/teacher/SectionFilesUploader.tsx`

Props :
interface SectionFilesUploaderProps {
  sectionId: string;
  files: SectionFile[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (fileId: string) => Promise<void>;
}

Structure :
- Zone drag & drop ou bouton "Ajouter des fichiers"
- Liste des fichiers existants avec :
  - Icône par type (PDF, Word, Image, etc.)
  - Nom du fichier
  - Taille
  - Bouton télécharger
  - Bouton supprimer
- Progress bar pendant l'upload

**3. API** : `src/app/api/teacher/sections/[id]/files/route.ts`

POST — Upload fichier(s)
- Stocke dans `/public/uploads/sections/[sectionId]/`
- Crée entrée SectionFile en BDD
- Retourne { success: true, data: SectionFile }

GET — Liste les fichiers de la section
- Retourne { success: true, data: SectionFile[] }

DELETE — Supprime un fichier
- Supprime le fichier physique
- Supprime l'entrée BDD

**4. Intégration dans les éditeurs inline** :
- Ajouter <SectionFilesUploader /> dans chaque éditeur
- Sous le contenu principal, avant les boutons Save/Cancel
```

---

## BL10 — Instructions IA par Section

### Prompt BL10

```
Ajoute un champ "Instructions IA" dans chaque section.

**Contexte** :
- Le prof peut donner des instructions spécifiques à l'IA pour chaque section
- Ces instructions seront utilisées par le chatbot quand l'élève consulte cette section
- Permet de personnaliser le comportement de l'IA par contexte

**1. Modèle Prisma** — Ajouter dans Section :

model Section {
  // ... existant
  aiInstructions String? @db.Text  // Instructions pour l'IA
}

**2. Composant dans les éditeurs inline** :

Ajouter dans chaque éditeur (LessonEditorInline, etc.) :

<div className="space-y-2 mt-4 pt-4 border-t">
  <Label htmlFor="aiInstructions">Instructions pour l'IA (optionnel)</Label>
  <Textarea
    id="aiInstructions"
    value={aiInstructions}
    onChange={(e) => setAiInstructions(e.target.value)}
    placeholder="Donnez du contexte à l'IA pour cette section...
Exemple : Cette leçon porte sur les fractions. L'IA doit utiliser des exemples concrets (pizza, gâteau) et encourager l'élève."
    rows={3}
  />
  <p className="text-xs text-muted-foreground">
    Ces instructions seront utilisées par l'assistant IA quand l'élève consulte cette section.
  </p>
</div>

**3. Sauvegarde** :
- Inclure aiInstructions dans le payload de sauvegarde
- API PUT /api/teacher/sections/[id] doit accepter ce champ

**4. Utilisation côté élève** :
- Quand l'élève ouvre une section, le chatbot reçoit les aiInstructions
- Le prompt système inclut : "Contexte de la section : {aiInstructions}"
- Si pas d'instructions, comportement par défaut
```

---

## Impact Interface Élève

### Prompt Impact Élève

```
Supprime l'onglet "Base de connaissance" séparé et intègre tout dans les sections.

**Modifications côté élève** :

1. **Supprimer** : Onglet/page "Base de connaissance" dans la sidebar élève

2. **Modifier la vue section élève** :
   - Afficher le contenu de la leçon
   - En dessous : "Ressources associées" avec la liste des fichiers
   - Chaque fichier cliquable pour télécharger/ouvrir

3. **Modifier le chatbot élève** :
   - Quand l'élève est sur une section, envoyer au contexte :
     - Le contenu de la section
     - Les fichiers attachés (noms + métadonnées)
     - Les instructions IA du prof
   - L'IA peut ainsi répondre en tenant compte du contexte spécifique

**Avantages** :
- UX simplifiée : tout est au même endroit
- Contexte IA précis par section
- Moins de navigation pour l'élève
```

---

## BL11 — Simplification Onglets Professeur

### Prompt BL11

```
Simplifie la navigation des onglets dans la page cours professeur.

**Contexte** :
Puisque tout est maintenant intégré dans les sections (fichiers, exercices, assignations),
plusieurs onglets deviennent redondants et peuvent être supprimés.

**Modifications** :

1. **Renommer** : Onglet "Structure" → "Cours"
   - Plus intuitif pour le professeur
   - C'est là qu'il construit son cours

2. **Supprimer** : Onglet "Ressources"
   - Raison : Les fichiers sont maintenant attachés à chaque section (BL9)
   - L'upload se fait dans l'éditeur inline de chaque section

3. **Supprimer** : Onglet "Exercices"
   - Raison : Les exercices sont un type de section (EXERCISE)
   - Création via "Ajouter une section" > Type "Exercice"

4. **Supprimer** : Onglet "Assignations"
   - Raison : L'assignation se fait depuis la section concernée
   - Ou depuis un bouton dans l'en-tête du cours

**Fichier principal** : `src/app/(dashboard)/teacher/courses/[id]/page.tsx`

**Structure actuelle** (probable) :
<Tabs>
  <Tab value="overview">Vue d'ensemble</Tab>
  <Tab value="structure">Structure</Tab>        ← Renommer "Cours"
  <Tab value="resources">Ressources</Tab>       ← Supprimer
  <Tab value="exercises">Exercices</Tab>        ← Supprimer
  <Tab value="assignments">Assignations</Tab>   ← Supprimer
  <Tab value="students">Étudiants</Tab>
</Tabs>

**Structure cible** :
<Tabs>
  <Tab value="overview">Vue d'ensemble</Tab>
  <Tab value="course">Cours</Tab>               ← Renommé
  <Tab value="students">Étudiants</Tab>
</Tabs>

**Vérifications** :
- [ ] Pas de liens morts vers les onglets supprimés
- [ ] Suppression des composants/pages associés non utilisés
- [ ] Mise à jour de la navigation si nécessaire
```

---

## 📝 Prompts Optimaux (RETOUR D'EXPÉRIENCE)

> Cette section documente les prompts optimaux basés sur l'expérience réelle d'implémentation.

### Prompt Optimal BL1-BL7 — SectionCard & Éditeurs

> **Itérations réelles** : 3-4
> **Problèmes rencontrés** : Types mal définis, structure props incorrecte

```
Crée SectionCard.tsx en suivant EXACTEMENT cette structure :

1. Importer Collapsible, CollapsibleTrigger, CollapsibleContent de @/components/ui/collapsible
2. Props typées avec interface exportée (pas de any)
3. Utiliser Section type depuis @/types ou @prisma/client
4. Icônes depuis lucide-react : BookOpen, Video, HelpCircle, FileText, ChevronDown, Trash2
5. Animation chevron via cn() : `transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`

IMPORTANT : Les handlers onUpdate, onDelete doivent être async et gérés par le parent.
```

**Différences clés vs prompt original** :
- Préciser les imports exacts (chemins)
- Spécifier que les types viennent de Prisma
- Mentionner que les handlers sont async

---

### Prompt Optimal BL8-BL9 — APIs Sections/Files (⚠️ CRITIQUE)

> **Itérations réelles** : 5+
> **Problèmes rencontrés** : PascalCase Prisma, ownership verification

```
⚠️ RÈGLE PRISMA PASCALCASE : Toutes les relations Prisma utilisent PascalCase !

Pour vérifier l'ownership d'une section, utiliser EXACTEMENT :
Section: {
  Chapter: {
    Course: {
      TeacherProfile: {
        userId: session.user.id
      }
    }
  }
}

❌ INTERDIT : teacher, chapter, course, section (camelCase)
✅ OBLIGATOIRE : TeacherProfile, Chapter, Course, Section (PascalCase)

Le modèle Prisma définit les relations avec @relation("NomRelation").
Les noms de relations dans les include/where DOIVENT correspondre.
```

**Différences clés vs prompt original** :
- **TOUJOURS mentionner PascalCase** dans les prompts Prisma
- Donner l'exemple complet de nested include
- Rappeler que c'est une source d'erreur récurrente

---

### Prompt Optimal BL11 — Simplification Menu

> **Itérations réelles** : 2
> **Problèmes rencontrés** : Liens vers pages supprimées

```
Simplifier le menu CoursesTable.tsx :

1. Garder UNIQUEMENT 2 options :
   - "Modifier le cours" → Link vers /teacher/courses/${course.id}
   - "Supprimer" → AlertDialog avec confirmation

2. SUPPRIMER les options :
   - "Modifier infos" (ancienne page /edit)
   - "Éditeur avancé" / "Structure"

3. SUPPRIMER la page obsolète :
   - rm -rf src/app/(dashboard)/teacher/courses/[id]/edit/

4. Vérifier qu'aucun autre fichier ne référence /edit
```

**Différences clés vs prompt original** :
- Lister explicitement ce qui doit être supprimé
- Préciser la commande de suppression
- Demander la vérification des liens morts

---

### Prompt Optimal BL12 — Nettoyage Page Détail Cours

> **Itérations réelles** : 2
> **Problèmes rencontrés** : Bouton orphelin pointant vers page supprimée

```
Nettoyer la page cours professeur `/teacher/courses/[id]/page.tsx` :

1. SUPPRIMER le bloc "Actions rapides" dans l'onglet Informations :
   - C'est une Card avec des boutons redondants
   - Les mêmes actions sont déjà dans les onglets

2. SUPPRIMER le bouton "Modifier infos" dans le header :
   - Ce bouton pointe vers /edit qui n'existe plus
   - Utiliser les onglets Informations/Contenu à la place

3. GARDER :
   - Les onglets (Informations, Contenu)
   - Le header avec titre et badge statut
   - Les icônes BookOpen et FolderTree dans les TabsTrigger

4. Vérifier les imports après suppression (retirer les inutilisés)
```

**Différences clés vs prompt original** :
- Identifier précisément les éléments à supprimer
- Mentionner les liens morts potentiels
- Lister ce qui doit être conservé

---

### Leçons Apprises (Phase BL)

| Problème | Cause | Solution |
|:---------|:------|:---------|
| 500 sur API sections | `chapter` au lieu de `Chapter` | Toujours PascalCase pour relations Prisma |
| 500 sur API files | `teacher` au lieu de `TeacherProfile` | Le nom de relation exact est `TeacherProfile` |
| Section non affichée après création | Retour API `Section` au lieu de `sections` | Transform le retour pour matcher le state |
| Stats _count undefined | `_count.sections` vs `_count.Section` | Vérifier le nom exact dans le select Prisma |

---

## 🔗 Références

| Ressource | Chemin |
|:----------|:-------|
| TODO principal | [todo/phase-08-blocs-structure.md](../todo/phase-08-blocs-structure.md) |
| SectionItem actuel | `src/components/features/teacher/SectionItem.tsx` |
| ChaptersManager | `src/components/features/teacher/ChaptersManager.tsx` |
| LessonEditor | `src/components/features/teacher/LessonEditor.tsx` |
| Collapsible UI | `@/components/ui/collapsible` |
| Wireframe | `blaizbot-wireframe/teacher.html` |
| Upload existant | `src/app/api/teacher/messages/upload/route.ts` (réutiliser pattern) |

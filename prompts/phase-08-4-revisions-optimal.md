# Phase 8.4 — Prompts Optimaux (Mes Révisions)

*Documenté le : 2026-01-03*

---

## 🎯 Résumé des Réalisations

### Fonctionnalités Mes Révisions
- ✅ CRUD complet suppléments (création, édition, suppression)
- ✅ 5 types de cartes : NOTE, LESSON, VIDEO, EXERCISE, QUIZ
- ✅ Attribution multi-cours (many-to-many avec checkboxes)
- ✅ Interface miroir du professeur (inline editing, icônes colorées)
- ✅ Intégration sur page cours (accordéon + modal visualisation)

---

## 📝 Prompt Optimal — Schema Many-to-Many

> **Itérations réelles** : 2 (migration + ajustement)
> **Problème rencontré** : Perte de données avec `db push --accept-data-loss`

```markdown
## Contexte
Je veux permettre à l'élève d'attribuer un supplément à PLUSIEURS cours.
Actuellement : `courseId: String?` (1-to-many)
Cible : Many-to-many via table de jonction

## Ta mission
1. Créer le modèle `StudentSupplementCourse` :
   - id, supplementId, courseId, createdAt
   - @@unique([supplementId, courseId])

2. Modifier `StudentSupplement` :
   - Supprimer `courseId String?`
   - Supprimer `Course Course? @relation`
   - Ajouter `Courses StudentSupplementCourse[]`

3. Ajouter relation côté `Course` :
   - `StudentSupplements StudentSupplementCourse[]`

## IMPORTANT
- Faire `prisma db push --accept-data-loss` (on accepte de perdre les liens existants)
- Régénérer le client avec `prisma generate`
```

**Différences clés vs prompt original** :
- Spécifier exactement la structure de la table de jonction
- Mentionner la contrainte `@@unique`
- Prévenir de la perte de données

---

## 📝 Prompt Optimal — APIs Many-to-Many

> **Itérations réelles** : 1
> **Problème rencontré** : Aucun

```markdown
## Contexte
Le schema Prisma a une relation many-to-many via `StudentSupplementCourse`.
APIs à mettre à jour : GET/POST /api/student/supplements, GET/PUT /api/student/supplements/[id]

## Ta mission
1. **GET /api/student/supplements** :
   - Include `Courses: { include: { Course: { select: {...} } } }`
   - Retourner `courseIds: string[]` ET `courses: [{id, title, teacher}]`
   - Garder `courseId` et `course` pour backward compat (premier élément)

2. **POST /api/student/supplements** :
   - Accepter `courseIds: string[]` OU `courseId: string` (compat)
   - Créer les entrées dans `StudentSupplementCourse` via `Courses: { create: [...] }`

3. **PUT /api/student/supplements/[id]** :
   - Utiliser une transaction pour :
     a) Supprimer tous les liens existants
     b) Créer les nouveaux liens
   - Pattern : `$transaction([deleteMany, ...createMany])`

## Format réponse
{
  id, title, description,
  courseIds: string[],       // Nouveau
  courses: [{id, title}],    // Nouveau
  courseId: string | null,   // Compat
  course: {...} | null,      // Compat
  chapterCount, cardCount
}
```

---

## 📝 Prompt Optimal — Dialog Multi-Select

> **Itérations réelles** : 2 (d'abord Select, puis Checkbox)
> **Problème rencontré** : Double toggle avec onClick parent + onCheckedChange

```markdown
## Contexte
Je veux un dialog pour attribuer un supplément à PLUSIEURS cours.
L'utilisateur doit pouvoir cocher/décocher plusieurs cours avec des checkboxes.

## Ta mission
Créer `CourseAttributionDialog.tsx` avec :

### Props
- open, onOpenChange
- supplementId, supplementTitle
- currentCourseIds: string[] (cours déjà sélectionnés)

### State
- courses: Course[] (chargés depuis API)
- selectedCourseIds: string[] (initialisé avec currentCourseIds)

### UI
- ScrollArea avec liste des cours
- Chaque cours = div cliquable avec Checkbox
- Checkbox checked = selectedCourseIds.includes(courseId)

### IMPORTANT - Fix double toggle
```tsx
<div onClick={() => handleToggle(id)}>
  <Checkbox
    onClick={(e) => e.stopPropagation()} // CRUCIAL !
    onCheckedChange={() => handleToggle(id)}
  />
</div>
```
Sans `stopPropagation`, le click sur la checkbox trigger les deux handlers.

### Save
- PUT /api/student/supplements/[id] avec { courseIds: selectedCourseIds }
- router.refresh() après succès
```

**Différences clés** :
- Spécifier `stopPropagation` dès le départ
- Utiliser `currentCourseIds: string[]` (pas `currentCourseId: string`)

---

## 📝 Prompt Optimal — Accordéon Suppléments dans Cours

> **Itérations réelles** : 3 (Link → Chevron → Accordéon)
> **Problème rencontré** : Utilisateur voulait dérouler, pas rediriger

```markdown
## Contexte
Sur la page détail cours (`/student/courses/[id]`), je veux afficher
les suppléments de l'élève liés à ce cours.

## Ce que l'utilisateur veut
- Section "Mes suppléments" sous le contenu du cours
- Clic sur un supplément → déroule ses cartes (PAS de redirection)
- Clic sur une carte → ouvre un modal de visualisation
- Style identique aux chapitres au-dessus (accordéon)

## Ta mission
1. **Créer API** `GET /api/student/courses/[id]/supplements` :
   - Retourne suppléments avec `chapters[].cards[]`
   - Include title, cardType, content pour chaque carte

2. **Ajouter state** dans la page :
   ```tsx
   const [supplements, setSupplements] = useState<LinkedSupplement[]>([]);
   const [selectedCard, setSelectedCard] = useState<SupplementCard | null>(null);
   const [cardModalOpen, setCardModalOpen] = useState(false);
   ```

3. **Utiliser Accordion** (pas Link) :
   ```tsx
   <Accordion type="single" collapsible>
     {supplements.map(supp => (
       <AccordionItem key={supp.id} value={supp.id}>
         <AccordionTrigger>
           {/* Numéro + Icône + Titre + Badge cartes */}
         </AccordionTrigger>
         <AccordionContent>
           {/* Bouton "Modifier ce supplément →" */}
           {/* Liste des cartes cliquables */}
           {supp.chapters.map(ch => ch.cards.map(card => (
             <div onClick={() => { setSelectedCard(card); setCardModalOpen(true); }}>
               {/* Icône + Titre + Badge type + ChevronRight */}
             </div>
           )))}
         </AccordionContent>
       </AccordionItem>
     ))}
   </Accordion>
   ```

4. **Ajouter Dialog** pour visualiser la carte :
   - Afficher titre, type badge, contenu HTML
```

**Leçon apprise** :
- Toujours clarifier "clic = navigation ou déroulement ?"
- Accordéon pour dérouler, Link pour naviguer

---

## 📊 Statistiques Finales

| Métrique | Valeur |
|:---------|:-------|
| Fichiers créés | ~25 |
| APIs créées | 8 |
| Composants | 12 |
| Itérations totales | ~15 |
| Temps estimé | ~6h |

---

*Dernière MAJ : 2026-01-03*

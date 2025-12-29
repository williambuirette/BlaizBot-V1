# 👨‍🏫 Phase 7 — Interface Professeur (Partie 2)

> **Suite de** : [phase-07-teacher.md](phase-07-teacher.md) (étapes 7.1→7.3)
> **Ce fichier** : Étapes 7.4→7.9 (CRUD Cours, Éditeur Riche, Génération IA, Fiche Élève, Messagerie)
> **Code** : [phase-07-code.md](phase-07-code.md)
> **Statut** : 🟡 EN COURS

---

## 📊 Récapitulatif

| Étape | Description | Statut |
|:------|:------------|:-------|
| 7.4 | CRUD Cours | ✅ |
| 7.5 | Éditeur de Cours Avancé (TipTap) | ✅ |
| 7.6 | Génération IA de Cours | ✅ |
| 7.6-fix | Synchronisation RichEditor | ✅ |
| 7.7 | Fiche Élève (modale détails) | ✅ |
| O1-O2 | Refactoring CourseForm | ✅ |
| 7.8 | Chapitres (optionnel) | ⬜ |
| 7.9 | Messagerie UI (optionnel) | ⬜ |

---

## 🔧 Optimisation O1-O2 — Refactoring CourseForm ✅ TERMINÉ

> **Date** : 29/12/2025

### 🎯 Objectif
Réduire la duplication et respecter la limite de 350 lignes par fichier.

### ❌ Avant (Problème)
| Fichier | Lignes | Problème |
|:--------|:-------|:---------|
| `teacher/courses/new/page.tsx` | 451 | 🚨 > 350 |
| `teacher/courses/[id]/edit/page.tsx` | 449 | 🚨 > 350 |
| **Duplication** | ~90% | Code quasi-identique |

### ✅ Après (Solution)
| Fichier | Lignes | Rôle |
|:--------|:-------|:-----|
| `new/page.tsx` | 8 | Import CourseForm |
| `edit/page.tsx` | 12 | Import CourseEditClient |
| `CourseForm.tsx` | 197 | Composant UI principal |
| `CourseFormTabs.tsx` | 303 | Sous-composants (5 onglets) |
| `CourseEditClient.tsx` | 104 | Client wrapper pour edit (fetch data) |
| `useCourseForm.ts` | 272 | Hook logique métier |

### 📦 Fichiers créés/modifiés

```
src/hooks/teacher/useCourseForm.ts              ✅ NEW
src/components/features/teacher/CourseForm.tsx  ✅ REFACTORED
src/components/features/teacher/CourseFormTabs.tsx  ✅ NEW
src/components/features/teacher/CourseEditClient.tsx  ✅ NEW
src/app/(dashboard)/teacher/courses/new/page.tsx  ✅ SIMPLIFIED
src/app/(dashboard)/teacher/courses/[id]/edit/page.tsx  ✅ SIMPLIFIED
```

### 🎉 Résultat
- ✅ Tous les fichiers < 350 lignes
- ✅ Duplication éliminée (DRY)
- ✅ Logique extraite dans hook réutilisable
- ✅ Build + Lint passent

---

## 📋 Étape 7.4 — CRUD Cours ✅ TERMINÉ

### 🎯 Objectif
Le professeur peut créer, modifier et supprimer ses cours.

### 📝 Comment
1. API CRUD filtrée par teacherId
2. Table des cours avec actions
3. Modal formulaire pour create/edit
4. Validation que le prof est assigné à la classe cible

### 🔧 Par quel moyen
- API : `/api/teacher/courses`
- Validation : Zod + check TeacherAssignment
- UI : Table + Modal (pattern admin)

---

### Tâche 7.4.1 — API GET/POST /api/teacher/courses

| Critère | Attendu |
| :--- | :--- |
| GET | Liste cours du prof (teacherId = session.user.id) |
| POST | Créer cours (vérifier assignment) |
| Include | Subject, chapters count |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/teacher/courses/route.ts
2. GET:
   const courses = await prisma.course.findMany({
     where: { teacherId: session.user.id },
     include: {
       subject: true,
       chapters: { select: { id: true } }, // pour count
     },
     orderBy: { createdAt: 'desc' },
   });
   
3. POST avec validation:
   const schema = z.object({
     title: z.string().min(3),
     description: z.string().optional(),
     subjectId: z.string().cuid(),
   });
   
   // Vérifier que le prof enseigne cette matière
   const assignment = await prisma.teacherAssignment.findFirst({
     where: { userId: session.user.id, subjectId: data.subjectId },
   });
   if (!assignment) return 403;
   
   // Créer le cours
   prisma.course.create({
     data: { ...data, teacherId: session.user.id },
   });
```

---

### Tâche 7.4.2 — API PUT/DELETE /api/teacher/courses/[id]

| Critère | Attendu |
| :--- | :--- |
| Auth | Vérifier course.teacherId === session.user.id |
| PUT | Modifier titre, description |
| DELETE | Supprimer cours (cascade chapters) |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/teacher/courses/[id]/route.ts
2. VÉRIFICATION ownership:
   const course = await prisma.course.findUnique({ where: { id: params.id } });
   if (course?.teacherId !== session.user.id) return 403;
   
3. PUT: Update title, description
4. DELETE: prisma.course.delete({ where: { id } })
   // Les chapters sont supprimés en cascade (onDelete: Cascade)
```

---

### Tâche 7.4.3 — Créer CoursesTable

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/teacher/CoursesTable.tsx` |
| Colonnes | Titre, Matière (badge), Chapitres, Actions |
| Actions | Voir, Modifier, Supprimer |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/teacher/CoursesTable.tsx
2. PROPS: { courses, onEdit, onDelete, onView }
3. COLONNES:
   - Titre (lien vers détail)
   - Matière (badge coloré)
   - Chapitres (count)
   - Créé le (date formatée)
   - Actions (dropdown)
4. CODE: Voir [phase-07-code.md](phase-07-code.md) section 3
```

---

### Tâche 7.4.4 — Créer CourseFormModal

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/teacher/CourseFormModal.tsx` |
| Champs | Titre, Description, Matière (select) |
| Mode | Create / Edit |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/teacher/CourseFormModal.tsx
2. PROPS: { open, onClose, course?, subjects, onSuccess }
3. CHAMPS:
   - titre (Input required)
   - description (Textarea optional)
   - subjectId (Select parmi les matières du prof)
4. VALIDATION Zod
5. SUBMIT: POST ou PUT selon mode
```

---

### Tâche 7.4.5 — Assembler page Cours

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/teacher/courses/page.tsx` |
| Layout | Header + bouton Ajouter + Table |
| State | courses, selectedCourse, modalOpen |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/teacher/courses/page.tsx ('use client')
2. FETCH:
   - Mes cours
   - Mes matières (pour le select dans le form)
3. HANDLERS: handleAdd, handleEdit, handleDelete
4. RENDER: Table + Modal
```

---

## 📋 Étape 7.5 — Éditeur de Cours Avancé ✅ TERMINÉ

> **Nouveau** : Ajouté le 28/12/2025

### 🎯 Objectif
Permettre au professeur de créer des cours avec une mise en page riche et professionnelle.

### ✅ Réalisé

| Tâche | Fichier | Statut |
|:------|:--------|:-------|
| TipTap Editor | `components/ui/rich-editor.tsx` | ✅ |
| Toolbar formatage | `components/ui/editor-toolbar.tsx` | ✅ |
| Upload fichiers | `components/ui/file-upload.tsx` | ✅ |
| API Upload | `api/upload/route.ts` | ✅ |
| Page création | `teacher/courses/new/page.tsx` | ✅ |
| Page édition | `teacher/courses/[id]/edit/page.tsx` | ✅ |
| Prévisualisation | `components/features/courses/course-preview.tsx` | ✅ |

### 📦 Dépendances installées

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-highlight
npm install react-dropzone
npx shadcn add toggle popover separator tabs -y
```

### 🎨 Fonctionnalités éditeur

- Titres H1, H2, H3
- **Gras**, *italique*, souligné
- Listes à puces et numérotées
- Liens hypertexte
- Images inline
- Blocs de citation
- Séparateurs
- Alignement texte

### 📁 Structure pages

```
/teacher/courses/new     → Création cours (5 onglets)
/teacher/courses/[id]/edit → Édition cours existant
```

**5 onglets** : Informations | Contenu | Ressources | Paramètres | Aperçu

---

## 📋 Étape 7.6 — Génération de Cours par IA ✅ TERMINÉ

> **Nouveau** : Ajouté le 28/12/2025

### 🎯 Objectif
L'IA génère un brouillon de cours basé sur le titre, la description, les objectifs et les fichiers uploadés.

### ✅ Réalisé

| Tâche | Fichier | Statut |
|:------|:--------|:-------|
| API génération | `api/ai/generate-course/route.ts` | ✅ |
| Section IA dans page | `teacher/courses/new/page.tsx` | ✅ |
| Instructions personnalisées | Textarea dans onglet Contenu | ✅ |
| Mode démo (sans clé API) | Génère template structuré | ✅ |

### 🤖 Fonctionnement

1. Le prof remplit : Titre, Description, Objectifs, Difficulté
2. (Optionnel) Upload des fichiers de référence
3. (Optionnel) Instructions supplémentaires
4. Clic "Générer le cours" → L'IA produit du HTML structuré
5. Le contenu apparaît dans l'éditeur TipTap
6. Le prof peut modifier/corriger librement

### 🔧 Modes de fonctionnement

| Mode | Condition | Comportement |
|:-----|:----------|:-------------|
| **Démo** | Pas de `OPENAI_API_KEY` | Génère un template structuré |
| **Production** | `OPENAI_API_KEY` configurée | Appelle GPT-4o-mini |

### 💡 Extensibilité IA

L'API est conçue pour supporter facilement d'autres fournisseurs :
- OpenAI (défaut)
- Anthropic Claude
- Google Gemini
- Azure OpenAI

```typescript
// Pour changer de provider, modifier api/ai/generate-course/route.ts
// Adapter l'appel fetch selon le fournisseur choisi
```

---

## 📋 Étape 7.7 — Gestion des Chapitres

### 🎯 Objectif
Un cours peut avoir plusieurs chapitres avec contenu texte.

### 📝 Comment
1. Page détail cours avec liste chapitres
2. Possibilité d'ajouter/éditer/supprimer des chapitres
3. Éditeur de contenu simple (textarea ou rich text)

### 🔧 Par quel moyen
- Route : `/teacher/courses/[id]`
- Model : Chapter (title, content, order)
- UI : Accordion ou liste réordonnnable

---

### Tâche 7.5.1 — API Chapters

| Critère | Attendu |
| :--- | :--- |
| GET | `GET /api/teacher/courses/[id]/chapters` |
| POST | Créer chapitre |
| PUT | Modifier chapitre |
| DELETE | Supprimer chapitre |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/teacher/courses/[courseId]/chapters/route.ts
2. VÉRIFIER ownership du cours avant chaque opération
3. POST: Créer avec order = max(order) + 1
4. PUT: Modifier title et content
5. DELETE: Supprimer et réordonner si nécessaire
```

---

### Tâche 7.5.2 — UI Chapitres

| Critère | Attendu |
| :--- | :--- |
| Composant | `ChaptersList.tsx` |
| Features | Accordion expandable |
| Actions | Edit inline, Delete |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/teacher/ChaptersList.tsx
2. UTILISER Accordion de shadcn/ui
3. CHAQUE chapitre:
   - Header: titre + boutons edit/delete
   - Content: texte du chapitre (prévisualisation)
4. BOUTON "Ajouter un chapitre" en bas
```

---

## 📋 Étape 7.6-fix — Synchronisation RichEditor ✅ TERMINÉ

### 🎯 Objectif
Corriger le bug où le contenu généré par l'IA ne s'affiche pas dans l'éditeur TipTap.

### 📝 Problème
TipTap `useEditor()` n'observe pas les changements de la prop `content`. Quand `setContent(data.content)` est appelé après génération IA, l'éditeur ne se met pas à jour.

### 🔧 Solution
Ajouter un `useEffect` pour synchroniser le contenu externe :

```tsx
import { useEffect } from 'react';

// Après le useEditor()
useEffect(() => {
  if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content);
  }
}, [editor, content]);
```

### ✅ Fichier modifié
- `src/components/ui/rich-editor.tsx`

---

## 📋 Étape 7.7 — Fiche Élève (Modale Détails) ✅ TERMINÉ

### 🎯 Objectif
Le professeur peut voir les informations complètes d'un élève (téléphone, adresse, email parent) via une modale.

### 📝 Comment
1. Bouton œil sur chaque ligne d'élève (pages Mes Élèves et Détail Classe)
2. Dialog avec toutes les informations de l'élève
3. Données de seed enrichies avec contacts

### 🔧 Fichiers créés

| Fichier | Rôle |
|:--------|:-----|
| `StudentDetailsDialog.tsx` | Dialog avec infos complètes (email, tel, adresse, parent) |
| `StudentsList.tsx` | Composant client pour la liste "Mes Élèves" |
| `ClassStudentsList.tsx` | Composant client pour la liste d'une classe |

### ✅ Fichiers modifiés
- `src/app/(dashboard)/teacher/students/page.tsx` — Récupère toutes les infos (phone, address, city, postalCode)
- `src/app/(dashboard)/teacher/classes/[id]/page.tsx` — Idem + utilise ClassStudentsList
- `prisma/seed.ts` — Données de contact pour les élèves de test

---

## 📋 Étape 7.8 — Chapitres (optionnel) ⬜

### 🎯 Objectif
Gérer les chapitres d'un cours (sous-sections).

### 📝 Comment
1. API CRUD chapitres rattachés à un cours
2. UI : Liste réordonnable dans la page d'édition du cours

### 🔧 Par quel moyen
- API : `/api/teacher/courses/[id]/chapters`
- UI : Accordion ou liste réordonnnable

---

## 📋 Étape 7.9 — Messagerie Prof ↔ Élèves (optionnel) ⬜

### 🎯 Objectif
Communication simple entre professeur et élèves de ses classes.

### 📝 Comment
1. Liste des conversations (1 par élève)
2. Thread de messages
3. Envoi de nouveau message
4. Badge messages non lus

### 🔧 Par quel moyen
- Model : Message (senderId, receiverId, content, read)
- UI : Layout 2 colonnes (conversations | thread)
- Real-time : Optionnel (polling simple pour MVP)

---

### Tâche 7.9.1 — API Messages

| Critère | Attendu |
| :--- | :--- |
| GET | Conversations du prof |
| GET | Messages avec un élève spécifique |
| POST | Envoyer message |
| PUT | Marquer comme lu |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/teacher/messages/route.ts

2. GET conversations:
   // Tous les élèves avec qui le prof a échangé
   // + count messages non lus par élève
   
3. GET /api/teacher/messages/[studentId]:
   // Thread avec un élève spécifique
   const messages = await prisma.message.findMany({
     where: {
       OR: [
         { senderId: session.user.id, receiverId: studentId },
         { senderId: studentId, receiverId: session.user.id },
       ],
     },
     orderBy: { createdAt: 'asc' },
   });
   
4. POST:
   prisma.message.create({
     data: {
       content,
       senderId: session.user.id,
       receiverId: studentId,
     },
   });
```

---

### Tâche 7.9.2 — Composants Messagerie

| Critère | Attendu |
| :--- | :--- |
| ConversationList | Liste contacts avec badge non lu |
| MessageThread | Historique messages |
| MessageInput | Input + bouton envoyer |

💡 **INSTRUCTION pour l'IA** :
```
1. ConversationList.tsx:
   - Liste élèves avec qui on a conversé
   - Badge nombre messages non lus
   - onClick sélectionne la conversation
   
2. MessageThread.tsx:
   - Affiche les messages chronologiquement
   - Style différent: envoyé (droite, bleu) vs reçu (gauche, gris)
   - Auto-scroll vers le bas
   
3. MessageInput.tsx:
   - Input + bouton "Envoyer"
   - Enter pour envoyer
   - Disable pendant envoi
```

---

### Tâche 7.9.3 — Page Messagerie

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/teacher/messages/page.tsx` |
| Layout | 2 colonnes (30% conversations, 70% thread) |
| State | selectedStudent, messages |

💡 **INSTRUCTION pour l'IA** :
```
1. LAYOUT:
   <div className="grid grid-cols-[300px_1fr] h-[calc(100vh-200px)]">
     <ConversationList
       conversations={conversations}
       selected={selectedStudent}
       onSelect={setSelectedStudent}
     />
     <div className="flex flex-col">
       {selectedStudent ? (
         <>
           <MessageThread messages={messages} currentUserId={userId} />
           <MessageInput onSend={handleSend} />
         </>
       ) : (
         <EmptyState message="Sélectionnez une conversation" />
       )}
     </div>
   </div>
```

---

### 🧪 TEST CHECKPOINT 7.A — Validation CRUD Prof

> ⚠️ **OBLIGATOIRE** : Valider tous les CRUD prof

| Test | Commande | Résultat attendu |
|:-----|:---------|:-----------------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Tests fonctionnels** :
- [ ] Dashboard prof → KPIs affichés
- [ ] Mes Classes → seulement les classes assignées
- [ ] Créer un cours → apparait dans liste
- [ ] Modifier un cours → changements sauvegardés
- [ ] Supprimer un cours → disparaît
- [ ] Ajouter chapitre → apparait dans cours
- [ ] Envoyer message → visible dans thread

**Tests sécurité** :
- [ ] Prof A ne voit pas les cours de Prof B
- [ ] Impossible de modifier un cours d'un autre prof
- [ ] API retourne 403 si pas owner

---

### 🔄 REFACTOR CHECKPOINT 7.B — Vérification standards

> 📏 **Règle** : Aucun fichier > 350 lignes

```powershell
# Vérifier les fichiers trop longs
Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts | `
  ForEach-Object { $lines = (Get-Content $_).Count; if($lines -gt 350) { "$($_.Name): $lines lignes" } }
```

**Si fichiers trop longs** :
- [ ] Extraire composants messagerie → `features/messaging/`
- [ ] Extraire logique cours → `hooks/useCourses.ts`
- [ ] Table et formulaire = fichiers séparés

**Factorisation** :
- [ ] Composants réutilisables entre Admin et Teacher ?
- [ ] Hooks de CRUD partageable ?

---

### 📝 EXPOSÉ CHECKPOINT 7.C — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 7.C.1 | Incrémenter `developmentHours` (+7h) | `progress.json` |
| 7.C.2 | Ajouter résumé Phase 7 | `content/08-developpement.md` |
| 7.C.3 | Capturer interface prof | `assets/screenshots/phase-07-teacher.png` |
| 7.C.4 | Commit BlaizBot-projet | `git commit -m "docs: phase 7 teacher"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 7 — Interface Professeur (DATE)

**Durée** : 7h  
**Tâches** : X/X complétées

**Résumé** :
- Dashboard Prof avec stats classes/élèves
- Gestion cours (CRUD + chapitres)
- Suivi progression élèves
- Messagerie prof ↔ élèves

**Captures** : `phase-07-teacher.png`
```

---

## 📸 Captures requises

- [ ] Screenshot Dashboard Professeur
- [ ] Screenshot page Mes Cours (table)
- [ ] Screenshot création de cours (modal)
- [ ] Screenshot messagerie (2 colonnes)

---

## ✅ Checklist fin de phase

| Critère | Vérifié |
| :--- | :--- |
| Dashboard Prof avec 3 KPIs | ✅ |
| API /api/teacher/stats | ✅ |
| Vue "Mes Classes" avec cards | ✅ |
| Vue détail classe (élèves + bouton détails) | ✅ |
| CRUD Cours complet | ✅ |
| Éditeur TipTap + génération IA | ✅ |
| Fiche élève (modale détails) | ✅ |
| Gestion chapitres | ⬜ (optionnel) |
| Messagerie fonctionnelle | ⬜ (optionnel) |
| Filtrage par session partout | ✅ |
| Aucun fichier > 350 lignes | ✅ |
| `npm run lint` OK | ✅ |
| `npm run build` OK | ✅ |

---

## 🔄 Navigation

← [phase-07-teacher.md](phase-07-teacher.md) | [phase-08-student.md](phase-08-student.md) →

---

*Lignes : ~330 | Dernière MAJ : 2025-12-29*

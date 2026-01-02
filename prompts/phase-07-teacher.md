# Phase 7 - Interface Professeur

> **Objectif** : Le Prof peut créer et gérer ses cours  
> **Fichiers TODO** : `phase-07-teacher.md`, `phase-07-chapitres.md`  
> **Fichiers code** : `phase-07-code.md`
> **Statut** : 🟡 EN COURS (7.1-7.7 + 7.9-7.10 terminés, 7.8 en cours)

---

## 🎯 Récapitulatif des étapes

| Étape | Description | Statut |
|:------|:------------|:-------|
| 7.1 | Dashboard Professeur | ✅ |
| 7.2 | Mes Classes | ✅ |
| 7.3 | Mes Cours (CRUD) | ✅ |
| 7.4 | Messagerie (API + UI) | ✅ |
| 7.5 | Éditeur de Cours Avancé (TipTap) | ✅ |
| 7.6 | Génération IA de Cours | ✅ |
| 7.7 | Fiche Élève (modale détails) | ✅ |
| 7.8 | Chapitres & Organisation | 🟡 [phase-07-chapitres.md](phase-07-chapitres.md) |
| 7.9 | Messagerie Avancée | ✅ |
| 7.10 | Upload Fichiers Ressources | ✅ |
| 7.11 | Tableau de Bord IA (Gemini) | ✅ |
| 7.12 | Upload Vidéo & UX Sauvegarde | ✅ |

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 7.1 — Dashboard Professeur

### Prompt 7.1.1 — API Teacher Stats

```
Créer `src/app/api/teacher/stats/route.ts` :

CRITIQUE : Filtrer par session.user.id !

const session = await auth();
if (session?.user?.role !== 'TEACHER') {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

const [classesCount, coursesCount, unreadMessages] = await Promise.all([
  prisma.teacherAssignment.count({ where: { userId: session.user.id } }),
  prisma.course.count({ where: { teacherId: session.user.id } }),
  prisma.message.count({ where: { receiverId: session.user.id, read: false } }),
]);

return Response.json({ classesCount, coursesCount, unreadMessages });
```

### Prompt 7.1.2 — TeacherStatsCard

```
Créer `src/components/features/teacher/TeacherStatsCard.tsx` :

Props : { title, value, icon, href? }

Si href fourni, wrapper dans <Link>.
Pattern identique à StatsCard admin.
```

### Prompt 7.1.3 — Dashboard Teacher

```
Modifier `src/app/(dashboard)/teacher/page.tsx` :

- 3 StatsCards : Mes classes, Mes cours, Messages
- Widget "Prochains cours" (optionnel)
- Liens vers les sous-pages
```

---

## 📋 Étape 7.2 — Mes Classes

### Prompt 7.2.1 — API Teacher Classes

```
Créer `src/app/api/teacher/classes/route.ts` :

GET : Retourne les classes du prof via TeacherAssignment
Include : count des élèves (Enrollment)
Filtrage par session.user.id
```

### Prompt 7.2.2 — TeacherClassCard

```
Créer `src/components/features/teacher/TeacherClassCard.tsx` :

Props : { classData: ClassWithStudentsCount }

Afficher :
- Nom de la classe
- Niveau
- Nombre d'élèves
- Matière enseignée
- Lien "Voir la classe"
```

### Prompt 7.2.3 — Page Mes Classes

```
Créer `src/app/(dashboard)/teacher/classes/page.tsx` :

- Fetch classes du prof
- Grid de TeacherClassCard
- Vide state si aucune classe
```

---

## 📋 Étape 7.3 — Mes Cours (CRUD)

### Prompt 7.3.1 — API Teacher Courses

```
Créer `src/app/api/teacher/courses/route.ts` :

GET : Cours du prof (where: { teacherId: session.user.id })
POST : Créer un cours (teacherId auto-assigné)

Include : subject, chaptersCount
```

### Prompt 7.3.2 — API Teacher Course Item

```
Créer `src/app/api/teacher/courses/[id]/route.ts` :

GET : Un cours (vérifier teacherId = session.user.id)
PUT : Modifier
DELETE : Supprimer

SÉCURITÉ : Vérifier que le cours appartient au prof !
```

### Prompt 7.3.3 — CoursesTable

```
Créer `src/components/features/teacher/CoursesTable.tsx` :

Colonnes : Titre, Matière, Chapitres, Publié, Actions
Actions : Edit, Delete, Voir chapitres
```

### Prompt 7.3.4 — CourseFormModal

```
Créer `src/components/features/teacher/CourseFormModal.tsx` :

Champs : title, description, subjectId (select), published (switch)
Mode create / edit
```

---

## 📋 Étape 7.5 — Éditeur de Cours Avancé ✅

### Prompt 7.5.1 — RichEditor (TipTap)

```
Créer `src/components/ui/rich-editor.tsx` :

- Wrapper TipTap avec extensions : StarterKit, Link, Image, Placeholder, Underline, TextAlign, Highlight
- Props : content, onChange, placeholder, className, editable
- Option `immediatelyRender: false` pour éviter hydratation SSR
```

### Prompt 7.5.2 — EditorToolbar

```
Créer `src/components/ui/editor-toolbar.tsx` :

- Boutons : Bold, Italic, Underline, H1-H3, Lists, Quote, Link, Image
- Popover pour insertion liens et images
- Utiliser Toggle de shadcn/ui
```

### Prompt 7.5.3 — FileUpload

```
Créer `src/components/ui/file-upload.tsx` :

- Drag & drop avec react-dropzone
- Types acceptés : PDF, images
- Limite : 10 MB
- Liste des fichiers avec bouton supprimer
```

### Prompt 7.5.4 — Page Nouveau Cours

```
Créer `src/app/(dashboard)/teacher/courses/new/page.tsx` :

- 5 onglets : Informations, Contenu, Ressources, Paramètres, Aperçu
- RichEditor dans onglet Contenu
- FileUpload dans onglet Ressources
- CoursePreview dans onglet Aperçu
- Boutons : Enregistrer brouillon / Publier
```

---

## 📋 Étape 7.6 — Génération IA de Cours ✅

### Prompt 7.6.1 — API Generate Course

```
Créer `src/app/api/ai/generate-course/route.ts` :

POST avec body :
- title, description, objectives, difficulty, instructions, files

Construire un prompt système pédagogique.
Appeler OpenAI GPT-4o-mini (ou mode démo si pas de clé).
Retourner du HTML structuré pour TipTap.
```

### Prompt 7.6.2 — Section IA dans page création

```
Dans l'onglet "Contenu" de /courses/new :

- Card "Générer avec l'IA" au-dessus de l'éditeur
- Textarea pour instructions supplémentaires
- Badge indiquant le nombre de fichiers
- Bouton "Générer le cours" (désactivé si pas de titre)
- Le contenu généré remplace le contenu de l'éditeur
```

---

## 📋 Étape 7.6-fix — Synchronisation RichEditor ✅

### Prompt 7.6-fix — useEffect pour contenu externe

```
Modifier `src/components/ui/rich-editor.tsx` :

PROBLÈME : TipTap useEditor() n'observe pas les changements de la prop `content`.
Quand setContent(data.content) est appelé après génération IA, l'éditeur ne se met pas à jour.

SOLUTION : Ajouter un useEffect pour synchroniser le contenu externe.

import { useEffect } from 'react';

// Après le useEditor()
useEffect(() => {
  if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content);
  }
}, [editor, content]);
```

---

## 📋 Étape 7.7 — Fiche Élève (Modale Détails) ✅

### Prompt 7.7.1 — StudentDetailsDialog

```
Créer `src/components/features/teacher/StudentDetailsDialog.tsx` :

Props : student (id, firstName, lastName, email, phone, address, city, postalCode, parentEmail, classes[], isActive)

- Dialog avec trigger Button (icône Eye)
- Afficher : Nom, Classes (badges), Email (mailto:), Téléphone (tel:), Adresse complète, Email parent, Statut
- Icônes : User, Users, Mail, Phone, MapPin
```

### Prompt 7.7.2 — StudentsList (composant client)

```
Créer `src/components/features/teacher/StudentsList.tsx` :

- Card avec liste des élèves
- Chaque ligne : Nom, Email, Badges classes, Bouton StudentDetailsDialog
- Props : students[]
```

### Prompt 7.7.3 — ClassStudentsList

```
Créer `src/components/features/teacher/ClassStudentsList.tsx` :

- Comme StudentsList mais pour une seule classe
- Props : students[], className (string)
- Réutilise StudentDetailsDialog
```

### Prompt 7.7.4 — Mise à jour pages teacher

```
Modifier `src/app/(dashboard)/teacher/students/page.tsx` :

- Récupérer TOUTES les infos élèves (phone, address, city, postalCode, isActive)
- Include studentProfile.parentEmail
- Utiliser StudentsList au lieu du rendu inline

Modifier `src/app/(dashboard)/teacher/classes/[id]/page.tsx` :

- Idem, récupérer toutes les infos
- Utiliser ClassStudentsList
```

### Prompt 7.7.5 — Seed données contact

```
Modifier `prisma/seed.ts` :

Ajouter aux élèves :
- phone: '06 XX XX XX XX'
- address: 'XX rue/avenue...'
- city: 'Paris/Lyon/...'
- postalCode: '75XXX'
- parentEmail: 'parents.xxx@email.com'

Puis relancer : npx prisma db push --force-reset && npx prisma db seed
```

---

## 📋 Étape 7.4 — Messagerie

### Prompt 7.4.1 — API Teacher Messages

```
Créer `src/app/api/teacher/messages/route.ts` :

GET : Messages reçus par le prof, triés par date
POST : Envoyer un message (senderId = session.user.id)
PUT : Marquer comme lu
```

### Prompt 7.4.2 — MessageThread

```
Créer `src/components/features/shared/MessageThread.tsx` :

- Liste des messages avec l'autre utilisateur
- Affichage bulle style chat
- Input pour répondre

Composant réutilisable pour teacher et student.
```

---

## 📋 Étape 7.9 — Messagerie Avancée

> **Documentation complète** : [docs/11-MESSAGERIE_AVANCEE.md](../docs/11-MESSAGERIE_AVANCEE.md)
>
> **Ordre de développement** : Backend  Frontend  Intégration

---

###  BLOC 1 : BACKEND

### Prompt 7.9.1  Migration Prisma 

```
Modifier `prisma/schema.prisma` :

1. Ajouter à Conversation :
   - courseId String? + relation Course
   - classId String? + relation Class  
   - schoolYear String (ex: "2024-2025")

2. Créer modèle MessageReadStatus :
   - messageId, userId, readAt
   - @@unique([messageId, userId])

3. Créer modèle Notification :
   - userId, type (MESSAGE|ASSIGNMENT|GRADE|SYSTEM)
   - title, message, link?, read
   - createdAt

4. Ajouter relations :
   - Course.conversations
   - Class.conversations
   - User.notifications

Puis : npx prisma db push
```

### Prompt 7.9.2  API classe étudiants

```
Créer `src/app/api/teacher/classes/[id]/students/route.ts` :

GET : Retourne les élèves d'une classe
- Vérifier que le prof enseigne cette classe
- Include user (firstName, lastName, email)
```

### Prompt 7.9.3  Notifications API

```
Créer `src/app/api/notifications/route.ts` :

GET : Mes notifications (userId = session.user.id)
- Trier par createdAt DESC
- Paramètre ?unreadOnly=true

PUT : Marquer comme lu
- Body : { id } ou { markAllRead: true }
```

---

###  BLOC 2 : FRONTEND

### Prompt 7.9.4  NewConversationDialog

```
Créer `src/components/features/messages/NewConversationDialog.tsx` :

1. RadioGroup type : "individual" | "group" | "class"
2. Select classe (fetch /api/teacher/classes)
3. Checkboxes élèves (fetch /api/teacher/classes/[id]/students)
4. Select cours optionnel (fetch /api/teacher/courses)
5. Textarea message
6. Bouton Envoyer

Logique :
- Si "individual" : 1 seul élève sélectionnable
- Si "group" : multi-select + boutons "Tout sélectionner"
- Si "class" : pas de checkboxes, tous les élèves inclus
- schoolYear calculé automatiquement
```

### Prompt 7.9.5  ConversationsList amélioré

```
Modifier `src/components/features/messages/ConversationsList.tsx` :

1. Badge type :  (individuel) ou  (groupe/classe)
2. Badge cours si conversation.courseId
3. Select filtre année scolaire (défaut: année courante)
4. Badge count messages non-lus
```

### Prompt 7.9.6  MessageThread avec noms

```
Modifier `src/components/features/shared/MessageThread.tsx` :

1. Afficher senderName dans chaque bulle
2. Badge "(Prof)" si sender.role === 'TEACHER'
3. Header : afficher cours.title si courseId
4. Marquer messages comme lus à l'ouverture
```

### Prompt 7.9.7  NotificationBell

```
Créer `src/components/features/shared/NotificationBell.tsx` :

- Icône Bell de lucide-react
- Badge rouge avec count non-lus
- DropdownMenu avec 5 dernières notifications
- Bouton "Voir tout"  /notifications (ou modale)
- Click sur notif  navigation vers link
```

---

###  BLOC 3 : INTÉGRATION

### Prompt 7.9.8  Intégration Header

```
Modifier `src/components/layout/AppHeader.tsx` :

- Ajouter NotificationBell entre le titre et le UserNav
- Position : droite du header
```

### Prompt 7.9.9  Créer notifications à l'envoi

```
Modifier `src/app/api/teacher/messages/route.ts` POST :

Après création du message, créer une Notification pour chaque participant :
- type: 'MESSAGE'
- title: `Nouveau message de ${sender.firstName} ${sender.lastName}`
- message: `Dans : ${conversation.topicName || 'Conversation'}`
- link: `/teacher/messages?id=${conversationId}` (ou student/)
```

---

##  Validation Finale Phase 7

```
Checklist :
1. Dashboard affiche les stats du prof (pas des autres)
2. Liste des classes filtrée par prof
3. CRUD cours : créer, modifier, supprimer
4. Messagerie : lire et envoyer des messages
5. Aucun accès aux données d'autres profs
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 7.1 | 27/12 | 1h | 1 | Dashboard OK |
| 7.2 | 27/12 | 1h | 1 | Classes OK |
| 7.3 | 27/12 | 2h | 2 | CRUD Cours + pages manquantes |
| 7.4 | 27/12 | 30min | 1 | API Messages |
| 7.4-UI | 29/12 | 1h | 2 | UI Messagerie (ConversationsList, MessageThread, page) |
| 7.5 | 28/12 | 2h | 3 | TipTap + fix hydratation SSR |
| 7.6 | 28/12 | 1h | 1 | Génération IA + mode démo |
| 7.6-fix | 29/12 | 15min | 1 | Fix useEffect sync content RichEditor |
| 7.7 | 29/12 | 30min | 1 | Modale fiche élève + données seed |
| 7.9 | 29/12 | 2h | 2 | Messagerie Avancée (Backend + Frontend + Intégration) |
| 7.9-UI | 29/12 | 30min | 1 | Refonte UI NewConversationDialog + ConversationsList groupé |
| 7.10 | 29/12 | 3h | 8 | Upload fichiers ressources (PDF, Word, Excel, PowerPoint, Images) |

---

## 📂 Fichiers créés Phase 7

### API Routes
- `src/app/api/teacher/stats/route.ts`
- `src/app/api/teacher/classes/route.ts`
- `src/app/api/teacher/courses/route.ts`
- `src/app/api/teacher/courses/[id]/route.ts`
- `src/app/api/teacher/messages/route.ts`
- `src/app/api/teacher/messages/[conversationId]/route.ts`
- `src/app/api/teacher/students/route.ts`
- `src/app/api/teacher/subjects/route.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/ai/generate-course/route.ts`

### Pages
- `src/app/(dashboard)/teacher/page.tsx` (dashboard)
- `src/app/(dashboard)/teacher/classes/page.tsx`
- `src/app/(dashboard)/teacher/classes/[id]/page.tsx`
- `src/app/(dashboard)/teacher/courses/page.tsx`
- `src/app/(dashboard)/teacher/courses/new/page.tsx`
- `src/app/(dashboard)/teacher/courses/[id]/edit/page.tsx`
- `src/app/(dashboard)/teacher/students/page.tsx`

### Composants UI
- `src/components/ui/rich-editor.tsx`
- `src/components/ui/editor-toolbar.tsx`
- `src/components/ui/file-upload.tsx`

### Composants Features
- `src/components/features/teacher/CoursesTable.tsx`
- `src/components/features/teacher/CourseFormModal.tsx`
- `src/components/features/courses/course-preview.tsx`
- `src/components/features/teacher/StudentDetailsDialog.tsx`
- `src/components/features/teacher/StudentsList.tsx`
- `src/components/features/teacher/ClassStudentsList.tsx`
- `src/components/features/messages/ConversationsList.tsx`
- `src/components/features/messages/MessageThread.tsx`
- `src/components/features/courses/ResourceFormDialog.tsx` (modifié)
- `src/components/features/courses/ResourcesManager.tsx` (modifié)

---

## 📋 Étape 7.10 — Upload Fichiers Ressources ✅

> **Problème résolu** : Les professeurs peuvent maintenant uploader des fichiers depuis leur ordinateur au lieu de saisir des URLs externes.

### Contexte

Le système de ressources original ne supportait que des liens externes (URL). Cette étape ajoute l'upload de fichiers locaux avec gestion complète des types MIME sous Windows.

### Types de fichiers supportés

| Type | Extensions | MIME Types |
|:-----|:-----------|:-----------|
| PDF | `.pdf` | `application/pdf` |
| Document | `.doc`, `.docx` | Word documents |
| Excel | `.xls`, `.xlsx` | Spreadsheets |
| PowerPoint | `.ppt`, `.pptx`, `.ppsx` | Presentations |
| Image | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` | Images |

### Prompt 7.10.1 — Enum ResourceType étendu

```
Modifier `prisma/schema.prisma` :

enum ResourceType {
  LINK       // Lien externe
  YOUTUBE    // Vidéo YouTube
  PDF        // Fichier PDF
  DOCUMENT   // Document Word (DOC, DOCX)
  EXCEL      // Tableur Excel (XLS, XLSX)
  POWERPOINT // Présentation PowerPoint (PPT, PPTX)
  IMAGE      // Image (PNG, JPG, GIF, WEBP)
}

Puis : npx prisma db push
```

### Prompt 7.10.2 — API Upload fichiers

```
Créer `src/app/api/upload/route.ts` :

POST : Upload un fichier
- Vérifier session authentifiée
- Extraire file depuis FormData
- Générer nom unique : `${userId}/${timestamp}-${filename}`
- Sauvegarder dans `public/uploads/`
- Retourner { filename, url }

Limite : 10 MB
Dossier : public/uploads/{userId}/
```

### Prompt 7.10.3 — ResourceFormDialog avec upload

```
Modifier `src/components/features/courses/ResourceFormDialog.tsx` :

1. Ajouter types dans le select : PDF, DOCUMENT, EXCEL, POWERPOINT, IMAGE
2. Conditionner l'affichage :
   - LINK/YOUTUBE : champ URL
   - PDF/DOCUMENT/EXCEL/POWERPOINT/IMAGE : zone upload

3. Zone upload avec react-dropzone :
   - Drag & drop
   - Validation par extension (pas MIME type - Windows unreliable)
   - Affichage progression + preview
   - Stockage fileUrl au lieu de url

4. Configuration dropzone CRITIQUE pour Windows :
   - useFsAccessApi: false (désactive File System Access API)
   - Validation manuelle par extension dans onDrop
   - Pas de prop `accept` react-dropzone (MIME unreliable)
   - Attribut HTML `accept` sur input pour filtre dialogue
```

### Prompt 7.10.4 — ResourcesManager avec tous les types

```
Modifier `src/components/features/courses/ResourcesManager.tsx` :

1. Ajouter configuration pour nouveaux types :
   resourceTypeConfig = {
     PDF: { icon: FileText, label: 'Documents PDF', color: 'bg-red-100' },
     DOCUMENT: { icon: FileText, label: 'Documents Word', color: 'bg-blue-100' },
     EXCEL: { icon: Table, label: 'Tableurs Excel', color: 'bg-green-100' },
     POWERPOINT: { icon: Presentation, label: 'Présentations', color: 'bg-orange-100' },
     IMAGE: { icon: ImageIcon, label: 'Images', color: 'bg-purple-100' },
     LINK: { icon: LinkIcon, label: 'Liens externes', color: 'bg-gray-100' },
     YOUTUBE: { icon: Youtube, label: 'Vidéos YouTube', color: 'bg-red-100' },
   }

2. Ajouter dans typeOrder et expandedTypes

3. Afficher fileUrl si présent (lien de téléchargement)
```

### Prompt 7.10.5 — API Resources avec validation types

```
Modifier `src/app/api/teacher/courses/[id]/resources/route.ts` :

GET : Ajouter DOCUMENT, EXCEL, POWERPOINT, IMAGE dans validTypes
POST : Valider les nouveaux types

Validation :
- LINK, YOUTUBE → url requis
- PDF, DOCUMENT, EXCEL, POWERPOINT, IMAGE → fileUrl requis
```

### Prompt Optimal 7.10 — Leçons apprises

> **Itérations réelles** : 8 (idéal = 2)
> **Problèmes rencontrés** : MIME types Windows incorrects, File System Access API

```
Pour implémenter l'upload de fichiers Office dans react-dropzone sur Windows :

1. NE PAS utiliser la prop `accept` de react-dropzone
   - Windows rapporte des MIME types incorrects
   - react-dropzone rejette les fichiers avant le validator

2. Désactiver File System Access API :
   useFsAccessApi: false

3. Valider manuellement par extension dans onDrop :
   const ext = '.' + file.name.toLowerCase().split('.').pop();
   const allowed = extensionConfig[selectedType];
   if (!allowed.includes(ext)) { setError(...); return; }

4. Utiliser l'attribut HTML accept sur l'input (pas react-dropzone) :
   const inputProps = { ...getInputProps(), accept: '.ppt,.pptx,.ppsx' };
   <input {...inputProps} />

Cette approche :
- Filtre le dialogue de fichiers (UX)
- Valide par extension (fiable)
- Évite les bugs MIME Windows
```

---

## 🎥 Étape 7.12 — Upload Vidéo & UX Sauvegarde

### Prompt 7.12.1 — Ajouter Upload Vidéo Local

```
Modifier `src/app/api/upload/route.ts` :

1. Ajouter VIDEO_TYPES et AUDIO_TYPES :
   const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
   const AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

2. Ajouter MAX_VIDEO_SIZE = 100 * 1024 * 1024 (100 Mo)

3. Dans POST, détecter le type :
   let fileType = 'DOCUMENT';
   let mediaType: 'image' | 'video' | 'audio' | 'document' = 'document';
   
   if (IMAGE_TYPES.includes(mimeType)) { fileType = 'IMAGE'; mediaType = 'image'; }
   else if (VIDEO_TYPES.includes(mimeType)) { fileType = 'VIDEO'; mediaType = 'video'; }
   else if (AUDIO_TYPES.includes(mimeType)) { fileType = 'AUDIO'; mediaType = 'audio'; }

4. Retourner mediaType dans la réponse
```

### Prompt 7.12.2 — Onglets URL/Upload dans VideoEditorInline

```
Modifier `src/components/features/courses/inline-editors/VideoEditorInline.tsx` :

1. Importer Tabs de shadcn/ui, Progress, Upload, FileVideo, Loader2

2. Ajouter state upload :
   const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
   const [isUploading, setIsUploading] = useState(false);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [uploadError, setUploadError] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

3. Fonction handleFileUpload :
   - Vérifier type (MP4, WebM, OGG, MOV, AVI)
   - Vérifier taille (100 Mo max)
   - POST FormData vers /api/upload
   - Créer VideoItem { id, url, platform: 'uploaded', title, filename, mimeType }
   - Appeler notifyChange()

4. UI avec Tabs :
   <Tabs value={activeTab} onValueChange={setActiveTab}>
     <TabsList>
       <TabsTrigger value="url"><LinkIcon /> URL</TabsTrigger>
       <TabsTrigger value="upload"><Upload /> Upload</TabsTrigger>
     </TabsList>
     <TabsContent value="url">/* formulaire URL existant */</TabsContent>
     <TabsContent value="upload">/* zone drag & drop + input file */</TabsContent>
   </Tabs>
```

### Prompt 7.12.3 — Barre Sticky Sauvegarde

```
Modifier `src/components/features/courses/SectionCard.tsx` :

Ajouter une barre sticky dans CollapsibleContent, AVANT le loading spinner :

{hasChanges && !loading && (
  <div className="sticky top-0 z-10 -mx-4 mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between rounded-t-lg">
    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      <span className="text-sm font-medium">Modifications non enregistrées</span>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
        Annuler
      </Button>
      <Button size="sm" onClick={handleSave} disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
        {saving ? <Loader2 className="animate-spin" /> : <Save />}
        Enregistrer maintenant
      </Button>
    </div>
  </div>
)}
```

### Prompt 7.12.4 — VideoViewer pour vidéos uploadées

```
Modifier `src/components/features/student/SectionViewerModal.tsx` :

Dans VideoViewer, ajouter le cas platform='uploaded' :

{activeVideo.platform === 'uploaded' ? (
  <div className="aspect-video rounded-lg overflow-hidden bg-black">
    <video
      key={activeVideo.id}
      src={activeVideo.url}
      controls
      className="w-full h-full"
      preload="metadata"
    >
      Votre navigateur ne supporte pas la lecture vidéo.
    </video>
  </div>
) : (/* autres cas */)
```

### Prompt Optimal 7.12 — Leçons apprises

> **Itérations réelles** : 4 (idéal = 2)
> **Problèmes rencontrés** : Vidéo uploadée mais non sauvée, bouton invisible

```
Pour implémenter un éditeur avec sauvegarde explicite :

1. TOUJOURS afficher un indicateur de modifications non sauvegardées
   - Barre sticky visible en haut de la zone d'édition
   - Couleur d'alerte (amber/orange)
   - Indicateur animé (pulse)

2. Bouton "Enregistrer" TOUJOURS visible
   - Ne pas le mettre tout en bas derrière du scroll
   - Ou utiliser position: sticky

3. Workflow upload :
   - Upload fichier → URL retournée
   - notifyChange() → parent.setHasChanges(true)
   - Barre sticky apparaît
   - Utilisateur clique "Enregistrer"
   - PUT API → base de données

4. NE PAS faire de sauvegarde automatique pour les gros contenus
   - Préférer sauvegarde explicite avec feedback clair
```

---

*Dernière mise à jour : 2026-01-02*

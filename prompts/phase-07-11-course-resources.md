# Phase 7.11 — Ressources Globales du Cours

> **Objectif** : Permettre au prof d'uploader des fichiers globaux visibles par les élèves
> **Dépendances** : Upload existant (7.10), CourseFile model (Prisma)
> **Impact** : Cohérence entre interface prof et élève

---

## 📋 Contexte

### Problème identifié
- Le prof peut uploader des fichiers dans les **sections** (leçons)
- Mais il n'y a **aucun moyen** d'uploader des fichiers **globaux** au cours
- Côté élève, la section "Ressources du cours" est **toujours vide**
- **Incohérence** entre les 2 interfaces

### Solution
Ajouter un composant d'upload dans l'onglet "Informations" du cours (côté prof) qui utilise le modèle `CourseFile` existant.

---

## 🔧 Tâche 7.11.1 — API CRUD CourseFile

### Prompt

```markdown
## Contexte
Je travaille sur BlaizBot-V1, une plateforme éducative Next.js 15 + Prisma.
Le modèle CourseFile existe déjà en BDD mais n'est pas utilisé.

## Ta mission
Créer l'API CRUD pour les fichiers globaux d'un cours.

### Fichier à créer
`src/app/api/teacher/courses/[id]/files/route.ts`

### Endpoints
1. **GET** : Lister les fichiers du cours
2. **POST** : Uploader un fichier (multipart/form-data) → créer CourseFile
3. **DELETE** : Supprimer un fichier (query param ?fileId=xxx)

### Contraintes
- Vérifier que session.user possède le cours (course.teacherId)
- Réutiliser le système d'upload existant (Vercel Blob ou similar)
- Fichier < 350 lignes

### Modèle Prisma existant
```prisma
model CourseFile {
  id        String   @id @default(uuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  filename  String
  fileType  String
  url       String
  isLocked  Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

### Réponse attendue
```json
// GET
{ "success": true, "files": [...] }

// POST
{ "success": true, "file": { id, filename, fileType, url } }

// DELETE
{ "success": true }
```
```

---

## 🔧 Tâche 7.11.2 — Composant CourseResourcesUploader

### Prompt

```markdown
## Contexte
API `/api/teacher/courses/[id]/files` créée (GET/POST/DELETE).
Je dois créer le composant UI pour uploader et gérer les fichiers.

## Ta mission
Créer un composant d'upload de fichiers globaux pour un cours.

### Fichier à créer
`src/components/features/courses/CourseResourcesUploader.tsx`

### Props
```tsx
interface CourseResourcesUploaderProps {
  courseId: string;
  files: CourseFile[];
  onUpdate: () => void;
}
```

### UI attendue
```
┌─────────────────────────────────────────────────────┐
│ 📁 Ressources du cours                    [+ Ajouter] │
├─────────────────────────────────────────────────────┤
│ 📄 syllabus.pdf          [👁️ Voir] [⬇️] [🗑️]      │
│ 📄 bibliographie.docx    [👁️ Voir] [⬇️] [🗑️]      │
└─────────────────────────────────────────────────────┘

OU si vide :
┌─────────────────────────────────────────────────────┐
│ 📁 Ressources du cours                    [+ Ajouter] │
├─────────────────────────────────────────────────────┤
│      📂 Aucune ressource                            │
│      Ajoutez des documents pour vos élèves          │
└─────────────────────────────────────────────────────┘
```

### Comportements
1. Clic sur "+ Ajouter" → input file hidden ou dropzone
2. Upload → POST API → onUpdate()
3. Clic sur "🗑️" → confirmation → DELETE API → onUpdate()
4. Spinner pendant upload

### Contraintes
- Fichier < 300 lignes
- Réutiliser les composants shadcn/ui
- Toast de succès/erreur
```

---

## 🔧 Tâche 7.11.3 — Intégration Onglet Informations

### Prompt

```markdown
## Contexte
Composant CourseResourcesUploader créé.
Je dois l'intégrer dans l'onglet Informations du cours (côté prof).

## Ta mission
Remplacer l'affichage statique des fichiers par le composant interactif.

### Fichier à modifier
`src/app/(dashboard)/teacher/courses/[id]/page.tsx`

### Changements
1. Importer CourseResourcesUploader
2. Dans CourseInfoTab, remplacer la section conditionnelle "Fichiers du cours" par :

```tsx
{/* Ressources du cours - Toujours visible */}
<Card className="md:col-span-2">
  <CardContent className="pt-6">
    <CourseResourcesUploader 
      courseId={courseId} 
      files={course.files || []} 
      onUpdate={onUpdate}
    />
  </CardContent>
</Card>
```

3. S'assurer que onUpdate est bien passé en prop à CourseInfoTab

### Résultat
Le prof voit toujours la section "Ressources" même si vide, avec possibilité d'ajouter.
```

---

## ✅ Checklist

- [x] 7.11.1 API `/api/teacher/courses/[id]/files` (GET/POST/DELETE)
- [x] 7.11.2 Composant `CourseResourcesUploader.tsx`
- [x] 7.11.3 Intégration dans onglet Informations prof
- [x] 8.3.7.1 Vérifier API élève retourne les files
- [x] 8.3.7.2 Vérifier affichage côté élève
- [x] 8.3.7.3 Icônes colorées cohérentes (prof/élève)
- [x] Config Next.js : limit 100MB pour gros fichiers

---

## 🧪 Test End-to-End

1. Prof va sur `/teacher/courses/xxx?tab=informations`
2. Voit "Ressources du cours" (vide ou avec fichiers)
3. Clique "+ Ajouter" → upload un PDF
4. Fichier apparaît dans la liste
5. Élève va sur `/student/courses/xxx?tab=informations`
6. Voit le même fichier dans "Ressources du cours"
7. Peut le télécharger

---

*Créé le : 2026-01-02*
*Terminé le : 2026-01-02*

---

## 💡 Prompt Optimal (Rétro-ingénierie)

> **Itérations réelles** : 5 (idéal = 1)
> **Problèmes rencontrés** : Relation Prisma, ID manquant, limite taille Next.js, icônes grises

```markdown
## Contexte
BlaizBot-V1 : Next.js 15 + Prisma + shadcn/ui.
Le modèle CourseFile existe mais n'est pas utilisé.
Cours accessible via Course.teacherId → TeacherProfile.userId.

## Mission complète
Créer le système d'upload de ressources globales d'un cours.

## Contraintes CRITIQUES
1. **Relation Prisma** : Course n'a PAS de relation `teacher`, utiliser :
   ```ts
   const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId } });
   const course = await prisma.course.findFirst({ where: { id: courseId, teacherId: teacherProfile.id } });
   ```
2. **ID manuel** : CourseFile.id n'a pas @default, fournir `id: `file-${Date.now()}-${random}``
3. **Limite taille** : Ajouter dans next.config.ts :
   ```ts
   experimental: { serverActions: { bodySizeLimit: '100mb' } }
   ```
4. **Icônes colorées** : Créer fonction `getFileIcon(fileType)` avec couleurs :
   - pdf → red-500, word → blue-500, excel → green-500
   - powerpoint → orange-500, image → purple-500
   - video → pink-500, audio → yellow-500
5. **Cohérence** : Appliquer les mêmes icônes côté prof ET élève

## Fichiers à créer/modifier
1. `src/app/api/teacher/courses/[id]/files/route.ts` (~250 lignes)
2. `src/components/features/courses/CourseResourcesUploader.tsx` (~270 lignes)
3. Modifier `src/app/(dashboard)/teacher/courses/[id]/page.tsx` (intégration)
4. Modifier `src/app/(dashboard)/student/courses/[id]/page.tsx` (icônes)
5. `next.config.ts` (limite upload)

## Types supportés
PDF, Word, Excel, PowerPoint, Images, Vidéo, Audio, Text
```

**Différences clés vs prompt original** :
- Préciser la relation Prisma (teacherId via TeacherProfile)
- Mentionner l'ID manuel obligatoire
- Inclure la config Next.js pour les gros fichiers
- Exiger les icônes colorées dès le départ

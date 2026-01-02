# 👨‍🏫 Phase 7 — Interface Professeur (Partie 1)

> **Objectif** : Le Prof peut créer et gérer ses cours  
> **Statut** : � EN COURS  
> **Durée estimée** : 6-8h  
> **Prérequis** : Phase 6 terminée (Admin fonctionnel)
> **Suite** : [phase-07-teacher-suite.md](phase-07-teacher-suite.md)

---

## ✅ Étapes Terminées

| Étape | Description | Date |
|:------|:------------|:-----|
| 7.1 | Dashboard Professeur | ✅ |
| 7.2 | Mes Classes | ✅ |
| 7.3 | Mes Cours (CRUD) | ✅ |
| 7.4 | Messagerie (API + UI) | ✅ |
| 7.5 | Éditeur TipTap | ✅ |
| 7.6 | Génération IA | ✅ |
| 7.7 | Fiche Élève | ✅ |
| 7.9 | Messagerie Avancée | ✅ |
| 7.10 | Upload Fichiers | ✅ 29/12 |
| 7.11 | Ressources globales du cours | ✅ 02/01 |

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
RÈGLE CRITIQUE : FILTRAGE PAR SESSION
- Le prof ne voit QUE ses classes et ses cours
- TOUJOURS filtrer par session.user.id dans les API
- Ne jamais exposer les données d'autres profs

STRUCTURE FICHIERS :
src/
├── app/api/teacher/
│   ├── stats/route.ts
│   ├── classes/route.ts
│   ├── classes/[id]/route.ts
│   ├── courses/route.ts
│   ├── courses/[id]/route.ts
│   └── messages/route.ts
├── app/teacher/
│   ├── page.tsx (dashboard)
│   ├── classes/page.tsx
│   ├── classes/[id]/page.tsx
│   ├── courses/page.tsx
│   └── messages/page.tsx
└── components/features/teacher/
    ├── TeacherStatsCard.tsx
    ├── TeacherClassCard.tsx
    ├── CoursesTable.tsx
    ├── CourseFormModal.tsx
    └── ...

RÈGLE 350 LIGNES :
- Page orchestrateur < 100 lignes
- Composants individuels < 250 lignes
```

---

## 📋 Étape 7.1 — Dashboard Professeur

### 🎯 Objectif
Vue d'ensemble pour le professeur : ses classes, ses cours, ses messages non lus.

### 📝 Comment
1. Créer une API qui agrège les stats filtrées par prof
2. Réutiliser le pattern StatsCard (comme admin)
3. Ajouter un widget "Prochains cours"

### 🔧 Par quel moyen
- API : `GET /api/teacher/stats` (filtré par session.user.id)
- Prisma : Count sur TeacherAssignment, Course, Message
- Component : StatsCard + CoursesList widget

---

### Tâche 7.1.1 — Créer API /api/teacher/stats

| Critère | Attendu |
| :--- | :--- |
| Route | `GET /api/teacher/stats` |
| Auth | Vérifier role === 'TEACHER' |
| Filtrage | Par session.user.id |
| Réponse | `{ classesCount, coursesCount, unreadMessages }` |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/teacher/stats/route.ts
2. VÉRIFIER session.user.role === 'TEACHER'
3. QUERIES:
   // Mes classes (via TeacherAssignment)
   const classesCount = await prisma.teacherAssignment.count({
     where: { userId: session.user.id },
   });
   
   // Mes cours
   const coursesCount = await prisma.course.count({
     where: { teacherId: session.user.id },
   });
   
   // Messages non lus reçus
   const unreadMessages = await prisma.message.count({
     where: { receiverId: session.user.id, read: false },
   });
   
4. RETOURNER: { classesCount, coursesCount, unreadMessages }
```

---

### Tâche 7.1.2 — Créer composant TeacherStatsCard

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/teacher/TeacherStatsCard.tsx` |
| Pattern | Identique à StatsCard admin |
| Props | `title, value, icon, href?` |

💡 **INSTRUCTION pour l'IA** :
```
1. COPIER le pattern de StatsCard admin
2. AJOUTER prop `href` optionnelle pour lien cliquable
3. SI href fourni, wrapper dans <Link>
4. CODE: Voir [phase-07-code.md](phase-07-code.md) section 1
```

---

### Tâche 7.1.3 — Créer widget "Prochains cours"

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/teacher/UpcomingCourses.tsx` |
| Affichage | Liste des 3 prochains cours |
| Info | Titre, classe, date/heure |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/teacher/UpcomingCourses.tsx
2. PROPS: { courses: Course[] }
3. AFFICHER max 3 cours triés par date
4. SI aucun cours: "Aucun cours à venir"
5. FORMAT date: "Lundi 14h" ou "Demain 10h"
```

---

### Tâche 7.1.4 — Assembler Dashboard Teacher

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/teacher/page.tsx` |
| Layout | 3 stats cards + widget cours |
| Fetch | Server component avec auth() |

💡 **INSTRUCTION pour l'IA** :
```
1. MODIFIER: src/app/teacher/page.tsx (Server Component)
2. FETCH stats + prochains cours
3. LAYOUT:
   <div className="space-y-6">
     <h1>Tableau de bord</h1>
     
     <div className="grid grid-cols-3 gap-4">
       <TeacherStatsCard title="Mes classes" value={stats.classesCount} icon={GraduationCap} href="/teacher/classes" />
       <TeacherStatsCard title="Mes cours" value={stats.coursesCount} icon={FileText} href="/teacher/courses" />
       <TeacherStatsCard title="Messages" value={stats.unreadMessages} icon={Mail} href="/teacher/messages" />
     </div>
     
     <UpcomingCourses courses={upcomingCourses} />
   </div>
```

**Layout visuel** :
```
┌─────────────────┬─────────────────┬─────────────────┐
│ 🎓 Mes Classes  │ 📄 Mes Cours    │ ✉️ Messages     │
│       3         │       6         │       2         │
└─────────────────┴─────────────────┴─────────────────┘
┌─────────────────────────────────────────────────────┐
│ 📅 Prochains cours                                  │
│ • Algèbre 3ème A — Lundi 14h00                     │
│ • Géométrie 4ème B — Mardi 10h00                   │
│ • Révisions 3ème A — Mercredi 15h30               │
└─────────────────────────────────────────────────────┘
```

---

## 📋 Étape 7.2 — Vue "Mes Classes"

### 🎯 Objectif
Afficher les classes auxquelles le prof est assigné.

### 📝 Comment
1. API qui récupère les TeacherAssignments du prof
2. Cards pour chaque classe avec infos clés
3. Lien vers détail de la classe

### 🔧 Par quel moyen
- Query : TeacherAssignment → Class + Subject
- Include : Count des élèves (Enrollment)
- UI : Cards en grille

---

### Tâche 7.2.1 — Créer API /api/teacher/classes

| Critère | Attendu |
| :--- | :--- |
| Route | `GET /api/teacher/classes` |
| Filtrage | Par session.user.id |
| Include | class, subject, count élèves |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/teacher/classes/route.ts
2. QUERY:
   const assignments = await prisma.teacherAssignment.findMany({
     where: { userId: session.user.id },
     include: {
       class: {
         include: {
           enrollments: { select: { id: true } }, // pour count
         },
       },
       subject: true,
     },
   });
   
3. TRANSFORMER pour ajouter studentsCount:
   const classes = assignments.map((a) => ({
     id: a.class.id,
     className: a.class.name,
     level: a.class.level,
     subject: a.subject.name,
     subjectColor: a.subject.color,
     studentsCount: a.class.enrollments.length,
   }));
   
4. RETOURNER classes
```

---

### Tâche 7.2.2 — Créer composant TeacherClassCard

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/teacher/TeacherClassCard.tsx` |
| Props | `classData: { className, level, subject, studentsCount }` |
| UI | Card avec badge matière coloré |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/teacher/TeacherClassCard.tsx
2. AFFICHER:
   - Nom classe (ex: "3ème A")
   - Badge matière coloré (ex: "Maths" en bleu)
   - Nombre d'élèves (ex: "24 élèves")
   - Bouton "Voir la classe"
3. UTILISER Card de shadcn/ui
4. CODE: Voir [phase-07-code.md](phase-07-code.md) section 2
```

---

### Tâche 7.2.3 — Assembler page Mes Classes

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/teacher/classes/page.tsx` |
| Layout | Grille de TeacherClassCard |
| Empty | Message si aucune classe |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/teacher/classes/page.tsx
2. FETCH classes via API ou direct Prisma (Server Component)
3. AFFICHER grille:
   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
     {classes.map((c) => <TeacherClassCard key={c.id} classData={c} />)}
   </div>
4. SI vide: "Vous n'êtes assigné à aucune classe"
```

---

## 📋 Étape 7.3 — Vue Détail Classe

### 🎯 Objectif
Page détaillée d'une classe avec liste élèves et cours associés.

### 📝 Comment
1. Route dynamique `/teacher/classes/[id]`
2. Vérifier que le prof est bien assigné à cette classe
3. Afficher 2 sections : Élèves et Cours

### 🔧 Par quel moyen
- Route : `[id]/page.tsx` avec params
- Vérification : Check TeacherAssignment existe
- Tabs ou sections : Élèves | Cours

---

### Tâche 7.3.1 — Créer API /api/teacher/classes/[id]

| Critère | Attendu |
| :--- | :--- |
| Route | `GET /api/teacher/classes/[id]` |
| Auth | Vérifier prof assigné à cette classe |
| Include | Élèves (via Enrollment), Cours |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/teacher/classes/[id]/route.ts
2. VÉRIFIER assignment:
   const assignment = await prisma.teacherAssignment.findFirst({
     where: { userId: session.user.id, classId: params.id },
   });
   if (!assignment) return 403 Forbidden
   
3. FETCH class avec relations:
   const classData = await prisma.class.findUnique({
     where: { id: params.id },
     include: {
       enrollments: {
         include: { user: { select: { id, name, email } } },
       },
     },
   });
   
4. FETCH cours du prof pour cette classe:
   const courses = await prisma.course.findMany({
     where: { teacherId: session.user.id },
     // Note: filtrer par classe si relation existe
   });
```

---

### Tâche 7.3.2 — Créer composants listes

| Critère | Attendu |
| :--- | :--- |
| Fichier 1 | `ClassStudentsList.tsx` (< 100 lignes) |
| Fichier 2 | `ClassCoursesList.tsx` (< 150 lignes) |

💡 **INSTRUCTION pour l'IA** :
```
1. ClassStudentsList.tsx:
   - Table simple : Nom, Email
   - Badge si présent/absent (future feature)
   
2. ClassCoursesList.tsx:
   - Table : Titre cours, Date création
   - Actions : Voir, Modifier
```

---

### Tâche 7.3.3 — Assembler page détail classe

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/teacher/classes/[id]/page.tsx` |
| Layout | Header + 2 sections (Élèves, Cours) |
| Breadcrumb | Lien retour vers "Mes classes" |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/teacher/classes/[id]/page.tsx
2. LAYOUT:
   <div>
     <Breadcrumb: Mes classes > 3ème A />
     <h1>Classe 3ème A - Mathématiques</h1>
     
     <Tabs defaultValue="students">
       <TabsList>
         <TabsTrigger value="students">Élèves ({count})</TabsTrigger>
         <TabsTrigger value="courses">Cours ({count})</TabsTrigger>
       </TabsList>
       <TabsContent value="students">
         <ClassStudentsList students={students} />
       </TabsContent>
       <TabsContent value="courses">
         <ClassCoursesList courses={courses} />
       </TabsContent>
     </Tabs>
   </div>
```

---

## 🔄 Navigation

← [phase-06-admin-suite.md](phase-06-admin-suite.md) | [phase-07-teacher-suite.md](phase-07-teacher-suite.md) →

---

## 📋 Étape 7.11 — Ressources Globales du Cours

### 🎯 Objectif
Permettre au professeur d'uploader des fichiers globaux au niveau du cours (syllabus, bibliographie, planning) visibles par les élèves dans l'onglet "Informations".

### 📝 Contexte
- Le prof peut déjà uploader des fichiers dans les **sections** (leçons)
- Mais il n'y a pas de moyen d'uploader des fichiers **globaux** au cours
- Côté élève, la section "Ressources du cours" est toujours vide
- **Incohérence** entre les 2 interfaces à corriger

### 🔧 À implémenter

| Composant | Fichier | Action |
|:----------|:--------|:-------|
| API Upload | `api/teacher/courses/[id]/files/route.ts` | Créer |
| UI Upload | `CourseResourcesUploader.tsx` | Créer |
| Onglet Info | `teacher/courses/[id]/page.tsx` | Modifier |

---

### Tâche 7.11.1 — API CRUD CourseFile

| Critère | Attendu |
|:--------|:--------|
| Route | `GET/POST/DELETE /api/teacher/courses/[id]/files` |
| Auth | Vérifier que le prof est propriétaire du cours |
| Upload | Réutiliser le système d'upload existant (Vercel Blob) |
| Model | `CourseFile` (déjà existant en BDD) |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/teacher/courses/[id]/files/route.ts
2. GET: Lister les CourseFile du cours
3. POST: Uploader un fichier, créer CourseFile
4. DELETE: Supprimer un CourseFile par id
5. VÉRIFIER: course.teacherId === session.user.id
```

---

### Tâche 7.11.2 — Composant CourseResourcesUploader

| Critère | Attendu |
|:--------|:--------|
| Fichier | `src/components/features/courses/CourseResourcesUploader.tsx` |
| UI | Zone d'upload + liste des fichiers avec suppression |
| Pattern | Similaire à ResourcesManager mais simplifié |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/courses/CourseResourcesUploader.tsx
2. PROPS: { courseId, files, onUpdate }
3. UI:
   - Bouton "Ajouter des ressources"
   - Zone drag & drop
   - Liste des fichiers avec boutons (voir, télécharger, supprimer)
4. ACTIONS: Upload vers API, suppression avec confirmation
```

---

### Tâche 7.11.3 — Intégrer dans Onglet Informations Prof

| Critère | Attendu |
|:--------|:--------|
| Fichier | `src/app/(dashboard)/teacher/courses/[id]/page.tsx` |
| Section | Remplacer l'affichage statique par le composant interactif |
| Refresh | Callback onUpdate pour rafraîchir après upload |

💡 **INSTRUCTION pour l'IA** :
```
1. IMPORTER CourseResourcesUploader
2. REMPLACER la section "Fichiers du cours" par:
   <CourseResourcesUploader 
     courseId={courseId} 
     files={course.files || []} 
     onUpdate={fetchCourse}
   />
3. TOUJOURS afficher la section (même si vide)
```

---

*Lignes : ~420 | Dernière MAJ : 2026-01-02*

# Phase 7 - Interface Professeur

> **Objectif** : Le Prof peut créer et gérer ses cours  
> **Fichiers TODO** : `phase-07-teacher.md`, `phase-07-teacher-suite.md`  
> **Fichiers code** : `phase-07-code.md`

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

## 📊 Validation Finale Phase 7

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
| 7.1 | | | | |
| 7.2 | | | | |
| 7.3 | | | | |
| 7.4 | | | | |

---

*Dernière mise à jour : 2025-01-13*

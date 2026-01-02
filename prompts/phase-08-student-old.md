# Phase 8 - Interface Élève

> **Objectif** : L'Élève consomme le contenu pédagogique  
> **Fichiers TODO** : `phase-08-student.md`  
> **Fichiers code** : `phase-08-code.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 8.1 — Dashboard Élève

### Prompt 8.1.1 — API Student Stats

```
Créer `src/app/api/student/stats/route.ts` :

const session = await auth();
if (session?.user?.role !== 'STUDENT') {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// Trouver la classe de l'élève
const enrollment = await prisma.enrollment.findFirst({
  where: { userId: session.user.id },
});

// Compter les cours accessibles via la classe
const coursesCount = await prisma.teacherAssignment.count({
  where: { classId: enrollment?.classId },
});

// Progression moyenne (table Progress si existe)
// Quiz complétés, etc.

return Response.json({ coursesCount, progression, quizDone });
```

### Prompt 8.1.2 — Dashboard Student

```
Modifier `src/app/(dashboard)/student/page.tsx` :

- 3 KPIs : Mes cours, Progression, Quiz faits
- Widget "Prochains cours"
- Widget "Cours récents"

Réutiliser StatsCard et composants existants.
```

---

## 📋 Étape 8.2 — Mes Cours

### Prompt 8.2.1 — API Student Courses

```
Créer `src/app/api/student/courses/route.ts` :

GET :
1. Trouver l'enrollment de l'élève
2. Récupérer les TeacherAssignments de sa classe
3. Lister les cours correspondants
4. Inclure la progression de l'élève (table Progress)
```

### Prompt 8.2.2 — StudentCourseCard

```
Créer `src/components/features/student/StudentCourseCard.tsx` :

Props : { course, progress }

Afficher :
- Titre du cours
- Badge matière (couleur)
- Nom du professeur
- Barre de progression (%)
- Bouton "Voir le cours"
```

### Prompt 8.2.3 — Page Mes Cours

```
Créer `src/app/(dashboard)/student/courses/page.tsx` :

- Grid de StudentCourseCard
- Filtres : par matière, par état (tous/en cours/terminés)
- Vide state si aucun cours
```

---

## 📋 Étape 8.3 — Vue Cours Détail

### Prompt 8.3.1 — API Course Detail

```
Créer `src/app/api/student/courses/[id]/route.ts` :

GET :
1. Vérifier que l'élève a accès (via enrollment)
2. Retourner : titre, contenu, documents, progression

POST (optionnel) : Marquer la progression
```

### Prompt 8.3.2 — CourseContentViewer

```
Créer `src/components/features/student/CourseContentViewer.tsx` :

Props : { course }

- Header : titre, prof, matière
- Contenu markdown rendu (react-markdown)
- Bouton "Marquer comme terminé"

npm install react-markdown
```

### Prompt 8.3.3 — Page Cours Detail

```
Créer `src/app/(dashboard)/student/courses/[id]/page.tsx` :

- Fetch le cours par ID
- CourseContentViewer
- Documents téléchargeables (si existants)
- Bouton retour
```

---

## 📋 Étape 8.4 — Messagerie Élève

### Prompt 8.4.1 — API Student Messages

```
Créer `src/app/api/student/messages/route.ts` :

GET : Messages de l'élève (reçus et envoyés)
POST : Envoyer un message à un prof
```

### Prompt 8.4.2 — Page Messages

```
Créer `src/app/(dashboard)/student/messages/page.tsx` :

- Réutiliser MessageThread de Phase 7
- Liste des conversations
- Possibilité d'initier une conversation avec un prof
```

---

## 📊 Validation Finale Phase 8

```
Checklist :
1. Dashboard affiche les KPIs de l'élève
2. Liste des cours de sa classe
3. Détail d'un cours avec contenu
4. Progression sauvegardée
5. Messagerie avec les profs
6. Aucun accès aux données d'autres classes
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 8.1 | | | | |
| 8.2 | | | | |
| 8.3 | | | | |
| 8.4 | | | | |

---

*Dernière mise à jour : 2025-01-13*

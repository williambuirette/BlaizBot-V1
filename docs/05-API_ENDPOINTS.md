# 🔌 API Endpoints - BlaizBot V1

> **Document** : 05/10 - Spécification complète des routes API
> **Statut** : 🟡 En cours
> **Architecture** : REST API via Next.js App Router

---

## 📋 Conventions

### Format des Réponses
```typescript
// Succès
{
  "success": true,
  "data": { ... }
}

// Erreur
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token invalide ou expiré"
  }
}
```

### Authentification
- Header : `Authorization: Bearer <jwt_token>`
- Rôles vérifiés via middleware

### Pagination
```typescript
// Requête
GET /api/resource?page=1&limit=20

// Réponse
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 🔐 AUTHENTIFICATION

### `POST /api/auth/login`
Connexion utilisateur.

**Body :**
```json
{
  "email": "user@ecole.com",
  "password": "********"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@ecole.com",
      "role": "STUDENT",
      "firstName": "Lucas",
      "lastName": "PETIT"
    },
    "token": "eyJhbG..."
  }
}
```

---

### `POST /api/auth/logout`
Déconnexion (invalidation token).

---

### `GET /api/auth/me`
Profil de l'utilisateur connecté.

**Headers :** `Authorization: Bearer <token>`

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "email": "user@ecole.com",
    "role": "STUDENT",
    "firstName": "Lucas",
    "lastName": "PETIT",
    "profile": {
      "classId": "clx...",
      "className": "6ème A"
    }
  }
}
```

---

## 👨‍🎓 ÉLÈVE

### Dashboard & Progression

#### `GET /api/student/dashboard`
Données du dashboard élève.

**Réponse :**
```json
{
  "progression": {
    "percentage": 75,
    "change": "+5%"
  },
  "average": {
    "value": 15.2,
    "maxValue": 20,
    "bestSubject": "Mathématiques"
  },
  "todos": [
    { "id": "1", "title": "Maths : Exercice fractions", "dueDate": "2025-12-23" }
  ],
  "recentGrades": [
    {
      "subject": "Mathématiques",
      "evaluation": "Nombres relatifs",
      "score": 18,
      "maxScore": 20,
      "aiComment": "Maîtrisé"
    }
  ]
}
```

---

#### `GET /api/student/progression`
Progression détaillée par cours.

**Query :** `?subjectId=clx...`

---

### Cours

#### `GET /api/student/courses`
Liste des cours disponibles.

**Réponse :**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Mathématiques",
      "lastChapter": "Les fractions",
      "progress": 75
    }
  ]
}
```

---

#### `GET /api/student/courses/:id/content`
Contenu d'un cours spécifique.

---

### Exercices

#### `GET /api/student/exercises`
Liste des exercices assignés.

**Query :** `?status=pending|completed`

---

#### `GET /api/student/exercises/:id`
Détail d'un exercice.

---

#### `POST /api/student/exercises/:id/submit`
Soumettre les réponses.

**Body :**
```json
{
  "answers": [
    { "questionId": "q1", "answer": "A" },
    { "questionId": "q2", "answer": "42" }
  ]
}
```

**Réponse :**
```json
{
  "score": 18,
  "maxScore": 20,
  "aiComment": "Excellent travail ! Attention à la question 3.",
  "corrections": [...]
}
```

---

### Assistant IA

#### `GET /api/student/assistant/courses`
Cours avec environnement IA configuré par le prof.

**Réponse :**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Les Fractions",
      "subject": "Mathématiques",
      "teacher": "M. DUPONT",
      "sources": [
        { "id": "s1", "filename": "Cours_Fractions.pdf", "isLocked": true }
      ]
    }
  ]
}
```

---

#### `POST /api/student/assistant/sources`
Ajouter une source personnelle à un cours.

**Body :** `multipart/form-data` avec fichier

---

### Chat IA

#### `POST /api/ai/chat`
Envoyer un message au chatbot (streaming).

**Body :**
```json
{
  "message": "Explique-moi les fractions",
  "contextType": "course",  // "course" | "lab" | "general"
  "contextId": "clx...",    // ID du cours ou projet
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Réponse :** Server-Sent Events (streaming)

---

#### `POST /api/ai/generate/quiz`
Générer un quiz basé sur les sources.

**Body :**
```json
{
  "contextType": "course",
  "contextId": "clx...",
  "prompt": "Quiz de 5 questions sur les fractions",
  "difficulty": "medium"
}
```

**Réponse :**
```json
{
  "quiz": {
    "title": "Quiz - Les Fractions",
    "questions": [
      {
        "id": "q1",
        "type": "multiple_choice",
        "question": "Quelle est la fraction équivalente à 2/4 ?",
        "options": ["1/2", "3/4", "1/4", "2/3"],
        "correctAnswer": "1/2"
      }
    ]
  }
}
```

---

#### `POST /api/ai/generate/summary`
Générer un résumé/fiche.

---

#### `POST /api/ai/generate/flashcards`
Générer des flashcards.

---

#### `POST /api/ai/generate/mindmap`
Générer une carte mentale (structure JSON).

---

### Blaiz'bot Lab

#### `GET /api/student/lab/projects`
Liste des projets Lab de l'élève.

---

#### `POST /api/student/lab/projects`
Créer un nouveau projet.

**Body :**
```json
{
  "title": "Exposé Révolution Française"
}
```

---

#### `GET /api/student/lab/projects/:id`
Détail d'un projet avec sources.

---

#### `POST /api/student/lab/projects/:id/sources`
Ajouter une source au projet.

**Body :** `multipart/form-data` ou :
```json
{
  "type": "youtube",
  "url": "https://youtube.com/watch?v=..."
}
```

---

#### `DELETE /api/student/lab/projects/:id/sources/:sourceId`
Supprimer une source.

---

### Base de Connaissances

#### `GET /api/student/knowledge/teacher`
Ressources du professeur (lecture seule).

**Query :** `?subjectId=clx...`

---

#### `GET /api/student/knowledge/personal`
Base personnelle de l'élève.

---

#### `POST /api/student/knowledge/subjects`
Créer une matière personnelle.

---

#### `POST /api/student/knowledge/documents`
Ajouter un document.

---

### Messagerie

#### `GET /api/student/messages/conversations`
Liste des conversations.

**Réponse :**
```json
{
  "data": [
    {
      "id": "conv1",
      "type": "CLASS_GENERAL",
      "name": "Chat de Classe (Général)",
      "unreadCount": 3
    },
    {
      "id": "conv2",
      "type": "CLASS_TOPIC",
      "subject": "Mathématiques",
      "topic": "Les Fractions",
      "subConversations": [
        { "id": "sub1", "type": "group", "name": "Chat de groupe" },
        { "id": "sub2", "type": "private", "name": "M. DUPONT", "unreadCount": 1 }
      ]
    }
  ]
}
```

---

#### `GET /api/student/messages/:conversationId`
Messages d'une conversation.

**Query :** `?page=1&limit=50`

---

#### `POST /api/student/messages/:conversationId`
Envoyer un message.

**Body :**
```json
{
  "content": "Bonjour M. Dupont, j'ai une question...",
  "attachments": []
}
```

---

### Calendrier

#### `GET /api/student/calendar/events`
Événements du calendrier.

**Query :** `?month=12&year=2025`

**Réponse :**
```json
{
  "data": [
    {
      "id": "ev1",
      "title": "Contrôle Maths",
      "startDate": "2025-12-20T08:00:00Z",
      "endDate": "2025-12-20T09:00:00Z",
      "isTeacherEvent": true
    },
    {
      "id": "ev2",
      "title": "Réviser fractions",
      "startDate": "2025-12-19T14:00:00Z",
      "endDate": "2025-12-19T16:00:00Z",
      "isTeacherEvent": false
    }
  ]
}
```

---

#### `POST /api/student/calendar/events`
Créer un événement personnel.

---

#### `PUT /api/student/calendar/events/:id`
Modifier un événement.

---

#### `DELETE /api/student/calendar/events/:id`
Supprimer un événement.

---

## 👨‍🏫 PROFESSEUR

### Dashboard

#### `GET /api/teacher/dashboard/stats`
KPIs du tableau de bord.

**Query :** `?classId=clx...&studentId=clx...`

---

#### `GET /api/teacher/dashboard/alerts`
Alertes IA prioritaires.

---

#### `GET /api/teacher/dashboard/recommendations`
Recommandations pédagogiques IA.

---

### Gestion des Cours

#### `GET /api/teacher/courses/tree`
Arborescence des dossiers/cours.

---

#### `POST /api/teacher/courses/folders`
Créer un dossier.

---

#### `POST /api/teacher/courses`
Créer un cours.

---

#### `POST /api/teacher/courses/:id/files`
Upload de fichier.

---

#### `PUT /api/teacher/courses/:id/ai-config`
Configurer l'IA pour un cours.

**Body :**
```json
{
  "aiObjective": "L'IA doit aider l'élève à comprendre...",
  "aiExerciseTypes": ["quiz", "application"]
}
```

---

### Attributions

#### `GET /api/teacher/assignments`
Liste des attributions.

---

#### `POST /api/teacher/assignments`
Créer une attribution.

---

#### `PUT /api/teacher/assignments/:id`
Modifier une attribution.

---

#### `DELETE /api/teacher/assignments/:id`
Supprimer une attribution.

---

### Élèves

#### `GET /api/teacher/students`
Liste des élèves (avec filtres).

**Query :** `?classId=clx...`

---

#### `GET /api/teacher/students/:id/details`
Détails et analytics d'un élève.

---

### Messagerie & Calendrier

*(Similaire aux endpoints élève)*

---

## ⚙️ ADMIN

> **Note** : Toutes les routes admin requièrent `role === 'ADMIN'`

### Dashboard Stats

#### `GET /api/admin/stats` ✅ Implémenté
Retourne les KPIs du dashboard admin.

**Réponse :**
```typescript
{
  users: number,    // Nombre total d'utilisateurs
  classes: number,  // Nombre de classes
  subjects: number, // Nombre de matières
  courses: number   // Nombre de cours
}
```

---

### CRUD Utilisateurs (unifié)

#### `GET /api/admin/users` ✅ Implémenté
Liste tous les utilisateurs (sans passwordHash).

**Réponse :**
```typescript
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'ADMIN' | 'TEACHER' | 'STUDENT',
  createdAt: string
}[]
```

#### `POST /api/admin/users` ✅ Implémenté
Créer un utilisateur.

**Body :**
```typescript
{
  email: string,      // Required, unique
  firstName: string,  // Required
  lastName: string,   // Required
  password: string,   // Required, hashé en bcrypt
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'  // Required
}
```

#### `GET /api/admin/users/:id` ✅ Implémenté
#### `PUT /api/admin/users/:id` ✅ Implémenté
#### `DELETE /api/admin/users/:id` ✅ Implémenté

---

### CRUD Classes

#### `GET /api/admin/classes` ✅ Implémenté
Liste les classes avec nombre d'étudiants.

**Réponse :**
```typescript
{
  id: string,
  name: string,
  level: string,
  studentCount: number  // _count.students
}[]
```

#### `POST /api/admin/classes` ✅ Implémenté
**Body :** `{ name: string, level: string }`

#### `GET /api/admin/classes/:id` ✅ Implémenté
#### `PUT /api/admin/classes/:id` ✅ Implémenté
#### `DELETE /api/admin/classes/:id` ✅ Implémenté
*(Bloqué si étudiants inscrits)*

---

### CRUD Matières

#### `GET /api/admin/subjects` ✅ Implémenté
Liste les matières avec compteurs.

**Réponse :**
```typescript
{
  id: string,
  name: string,
  courseCount: number,   // _count.courses
  teacherCount: number   // _count.teachers
}[]
```

#### `POST /api/admin/subjects` ✅ Implémenté
**Body :** `{ name: string }`

#### `GET /api/admin/subjects/:id` ✅ Implémenté
#### `PUT /api/admin/subjects/:id` ✅ Implémenté
#### `DELETE /api/admin/subjects/:id` ✅ Implémenté
*(Bloqué si cours liés)*

---

### CRUD Programmes (À implémenter)

#### `GET /api/admin/programs`
#### `POST /api/admin/programs`
#### `PUT /api/admin/programs/:id`
#### `DELETE /api/admin/programs/:id`

---

### Statistiques détaillées (À implémenter)

#### `GET /api/admin/statistics`
Analytics global avec filtres.

**Query :** `?classId=...&teacherId=...&studentId=...&subjectId=...`

---

### Paramètres IA

#### `GET /api/admin/settings/ai`
Configuration IA actuelle.

---

#### `PUT /api/admin/settings/ai`
Mettre à jour la config IA.

**Body :**
```json
{
  "provider": "OPENAI",
  "apiKey": "sk-...",
  "model": "gpt-4o",
  "restrictionLevel": "BALANCED",
  "enablePdfAnalysis": true
}
```

---

#### `POST /api/admin/settings/ai/test`
Tester la connexion IA.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "model": "gpt-4o",
    "responseTime": 245
  }
}
```

---

## 📊 Récapitulatif

| Domaine | Endpoints | Méthodes |
|---------|-----------|----------|
| Auth | 3 | GET, POST |
| Élève | 25+ | GET, POST, PUT, DELETE |
| Professeur | 15+ | GET, POST, PUT, DELETE |
| Admin | 20+ | GET, POST, PUT, DELETE |
| IA | 5 | POST |
| **TOTAL** | **~70** | - |

---

## ✅ Validation

- [ ] Tous les endpoints nécessaires sont-ils couverts ?
- [ ] Les payloads sont-ils clairs ?
- [ ] Manque-t-il des fonctionnalités ?

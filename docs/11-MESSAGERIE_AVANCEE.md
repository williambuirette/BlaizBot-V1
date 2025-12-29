# 📨 Messagerie Avancée - Spécifications

> **Objectif** : Système de messagerie complet pour profs et élèves  
> **Statut** : ⬜ À implémenter  
> **Date** : 2025-12-29

---

## 🎯 Cas d'usage

| Type | Destinataires | Visibilité | Exemple |
|:-----|:--------------|:-----------|:--------|
| **Individuel** | 1 élève | Prof ↔ 1 élève | "Lucas, peux-tu me rendre ton devoir ?" |
| **Groupe** | 2-N élèves sélectionnés | Prof ↔ élèves sélectionnés | "Marie, Thomas : RDV rattrapage" |
| **Classe** | Tous les élèves d'une classe | Prof ↔ toute la classe | "Devoir pour lundi prochain" |
| **Avec contexte cours** | Tout type + référence cours | Idem | "Concernant 'Algèbre': exercices p.42" |

---

## 📐 Règles de visibilité

### Pour le Professeur
- **Message individuel** : Seul l'élève voit la conversation
- **Message groupe** : Tous les élèves sélectionnés voient tous les messages
- **Message classe** : Tous les élèves de la classe voient tous les messages

### Pour l'Élève
- **Réponse groupe/classe** : Tous les participants voient la réponse
- **Discussion privée** : L'élève crée une nouvelle conversation avec le prof uniquement
- **Bulles de chat** : Toujours afficher le nom de l'expéditeur

---

## 🏗️ Modèle de données

### Modifications Prisma

```prisma
model Conversation {
  id             String           @id @default(cuid())
  type           ConversationType // PRIVATE, GROUP, CLASS_GENERAL, CLASS_TOPIC
  
  // Participants
  participantIds String[]         // Array d'IDs utilisateurs
  
  // Contexte optionnel
  subjectId      String?          // Matière associée
  subject        Subject?         @relation(...)
  courseId       String?          // 🆕 Cours référencé
  course         Course?          @relation(...)
  classId        String?          // 🆕 Si message de classe
  class          Class?           @relation(...)
  
  // Métadonnées
  topicName      String?          // Sujet libre
  schoolYear     String           // 🆕 "2024-2025" pour historique
  
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  messages       Message[]
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(...)
  
  senderId       String
  sender         User         @relation(...)
  
  content        String       @db.Text
  attachments    Json?        // [{filename, url}]
  
  createdAt      DateTime     @default(now())
  
  // 🆕 Statut de lecture par participant
  readStatus     MessageReadStatus[]
}

// 🆕 Nouveau modèle
model MessageReadStatus {
  id        String    @id @default(cuid())
  messageId String
  message   Message   @relation(...)
  userId    String
  user      User      @relation(...)
  readAt    DateTime?
  
  @@unique([messageId, userId])
}

// 🆕 Notifications
model Notification {
  id        String           @id @default(cuid())
  userId    String
  user      User             @relation(...)
  
  type      NotificationType // MESSAGE, ASSIGNMENT, GRADE, SYSTEM
  title     String
  message   String
  link      String?          // URL vers la ressource
  
  read      Boolean          @default(false)
  
  createdAt DateTime         @default(now())
}

enum NotificationType {
  MESSAGE
  ASSIGNMENT
  GRADE
  SYSTEM
}
```

---

## 🖥️ Interface utilisateur

### Dialog "Nouvelle conversation" (Teacher)

```
┌─────────────────────────────────────────────────────┐
│  Nouvelle conversation                         [X]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Type de message :                                  │
│  ○ Individuel (1 élève)                             │
│  ○ Groupe (sélection d'élèves)                      │
│  ○ Classe entière                                   │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Classe* :  [▼ Sélectionner une classe    ]         │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Élèves : (si individuel ou groupe)                 │
│  ☑ Lucas Martin                                     │
│  ☐ Marie Dupont                                     │
│  ☑ Thomas Bernard                                   │
│  ☐ Julie Petit                                      │
│  [Tout sélectionner] [Tout désélectionner]          │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Cours concerné : (optionnel)                       │
│  [▼ Aucun cours sélectionné        ]                │
│                                                     │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Message* :                                         │
│  ┌─────────────────────────────────────────────┐    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│                              [ Envoyer ]            │
└─────────────────────────────────────────────────────┘
```

### Liste des conversations (avec badges)

```
┌──────────────────────────────────────────────────────┐
│ 🔍 Rechercher...          [▼ 2024-2025 ▼]           │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────┐ │
│ │ 👥 Classe 3ème A        [Algèbre]    il y a 2h  │ │
│ │ Rappel: Devoir pour lundi           ● 3 non lus │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ 👤 Lucas Martin         [Géométrie]  il y a 1j  │ │
│ │ Merci pour votre retour                         │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ 👥 Marie, Thomas (+1)                il y a 2j  │ │
│ │ RDV rattrapage confirmé                         │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘

Légende :
👤 = Individuel | 👥 = Groupe/Classe
[Badge] = Cours référencé
● N non lus = Messages non lus
```

### Thread de messages (bulles avec noms)

```
┌─────────────────────────────────────────────────────┐
│ ← Classe 3ème A              [Algèbre - Équations]  │
│   12 participants                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│     ┌────────────────────────────────┐              │
│     │ M. Dupont (Prof)               │              │
│     │ Rappel: devoir pour lundi !    │              │
│     │                    il y a 2h   │              │
│     └────────────────────────────────┘              │
│                                                     │
│ ┌────────────────────────────────────┐              │
│ │ Lucas Martin                       │              │
│ │ C'est bien les exercices 1-5 ?     │              │
│ │                    il y a 1h       │              │
│ └────────────────────────────────────┘              │
│                                                     │
│     ┌────────────────────────────────┐              │
│     │ M. Dupont (Prof)               │              │
│     │ Oui, exercices 1 à 5 page 42   │              │
│     │                    il y a 30m  │              │
│     └────────────────────────────────┘              │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [Écrivez votre message...            ] [Envoyer]    │
└─────────────────────────────────────────────────────┘
```

---

## 🔔 Notifications

### Types de notifications

| Type | Déclencheur | Titre | Message |
|:-----|:------------|:------|:--------|
| MESSAGE | Nouveau message | "Nouveau message de X" | "Dans : [conversation]" |
| ASSIGNMENT | Nouveau devoir | "Nouveau devoir" | "[Cours] - À rendre le [date]" |
| GRADE | Nouvelle note | "Note publiée" | "[Matière] : [note]/20" |
| SYSTEM | Admin | Variable | Variable |

### Composant NotificationBell

```tsx
// Position : Header (AppHeader.tsx)
// Affiche : Icône cloche + badge count
// Dropdown : Liste des 5 dernières notifications + "Voir tout"
```

---

## 📅 Historique par année scolaire

### Logique année scolaire

```typescript
function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  
  // Année scolaire = septembre N à août N+1
  if (month >= 9) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}
// Ex: Décembre 2025 → "2025-2026"
// Ex: Mars 2025 → "2024-2025"
```

### Filtre dans l'UI

- Select dropdown dans ConversationsList
- Options : "2024-2025", "2023-2024", etc.
- Par défaut : année en cours

---

## 📦 Plan d'implémentation

### Étape 1 : Migration Prisma (~30min)

| Tâche | Fichier | Description |
|:------|:--------|:------------|
| 1.1 | `schema.prisma` | Ajouter `courseId`, `classId`, `schoolYear` à Conversation |
| 1.2 | `schema.prisma` | Créer modèle `MessageReadStatus` |
| 1.3 | `schema.prisma` | Créer modèle `Notification` |
| 1.4 | `schema.prisma` | Ajouter relations Course ↔ Conversation, Class ↔ Conversation |
| 1.5 | Terminal | `npx prisma db push` |
| 1.6 | `seed.ts` | Ajouter conversations de test avec schoolYear |

### Étape 2 : NewConversationDialog (~1h)

| Tâche | Fichier | Description |
|:------|:--------|:------------|
| 2.1 | `NewConversationDialog.tsx` | Créer composant avec RadioGroup type |
| 2.2 | `NewConversationDialog.tsx` | Select classe + fetch élèves |
| 2.3 | `NewConversationDialog.tsx` | Checkboxes élèves avec Select All |
| 2.4 | `NewConversationDialog.tsx` | Select cours (optionnel) |
| 2.5 | `api/teacher/classes/[id]/students` | API élèves par classe |

### Étape 3 : Mise à jour ConversationsList (~30min)

| Tâche | Fichier | Description |
|:------|:--------|:------------|
| 3.1 | `ConversationsList.tsx` | Badge type (👤/👥) |
| 3.2 | `ConversationsList.tsx` | Badge cours si courseId |
| 3.3 | `ConversationsList.tsx` | Filtre année scolaire |
| 3.4 | `ConversationsList.tsx` | Badge non-lus |

### Étape 4 : Mise à jour MessageThread (~30min)

| Tâche | Fichier | Description |
|:------|:--------|:------------|
| 4.1 | `MessageThread.tsx` | Nom expéditeur dans chaque bulle |
| 4.2 | `MessageThread.tsx` | Badge "(Prof)" si TEACHER |
| 4.3 | `MessageThread.tsx` | Header avec cours référencé |
| 4.4 | `api/messages/[id]/read` | Marquer comme lu |

### Étape 5 : Notifications (~1h)

| Tâche | Fichier | Description |
|:------|:--------|:------------|
| 5.1 | `api/notifications/route.ts` | GET (mes notifs) + PUT (marquer lu) |
| 5.2 | `NotificationBell.tsx` | Composant avec dropdown |
| 5.3 | `AppHeader.tsx` | Intégrer NotificationBell |
| 5.4 | `api/teacher/messages/route.ts` | Créer notif à l'envoi de message |

### Étape 6 : API mise à jour (~30min)

| Tâche | Fichier | Description |
|:------|:--------|:------------|
| 6.1 | `api/teacher/messages/route.ts` | POST avec courseId, classId, schoolYear |
| 6.2 | `api/teacher/messages/route.ts` | GET avec filtre schoolYear |

---

## ✅ Critères d'acceptation

- [ ] Prof peut créer conversation individuelle, groupe, ou classe
- [ ] Prof peut référencer un cours dans la conversation
- [ ] Tous les participants voient tous les messages
- [ ] Bulles affichent le nom de l'expéditeur
- [ ] Filtre par année scolaire fonctionne
- [ ] Notifications créées à chaque nouveau message
- [ ] Badge non-lus affiché dans la liste
- [ ] Cloche avec count dans le header

---

*Document créé le 2025-12-29*

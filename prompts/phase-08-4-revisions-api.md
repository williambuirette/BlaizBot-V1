# Phase 8.4.3-6 — APIs Révisions Élève

*Créé le : 2026-01-02*

---

## 🎯 Objectif

Créer les APIs CRUD pour les révisions privées de l'élève.

---

## 📋 Prompt 8.4.3 — API Suppléments

```markdown
## Contexte
BlaizBot-V1 : Next.js 15, TypeScript, Prisma.
Les modèles StudentSupplement, StudentChapter, StudentCard existent.
L'élève est authentifié via `auth()` (AuthJS).

## Ta mission
Créer l'API CRUD pour les suppléments élève.

### Routes à créer

**GET /api/student/supplements**
- Retourne tous les suppléments de l'élève connecté
- Include: chapters (count), cards (count), course (si lié)
- Trier par updatedAt DESC

**POST /api/student/supplements**
- Body: { title, description?, courseId? }
- Génère ID: `supp-${Date.now()}-${random}`
- Retourne le supplément créé

**GET /api/student/supplements/[id]**
- Vérifie que le supplément appartient à l'élève
- Include: chapters avec cards, course

**PUT /api/student/supplements/[id]**
- Body: { title?, description?, courseId? }
- Vérifie ownership avant update

**DELETE /api/student/supplements/[id]**
- Vérifie ownership
- Cascade delete (chapitres, cartes, fichiers)

### Fichiers à créer

```
src/app/api/student/supplements/
├── route.ts              (~120 lignes) GET + POST
└── [id]/
    └── route.ts          (~150 lignes) GET + PUT + DELETE
```

### Helper à créer

```typescript
// src/lib/api/student-helpers.ts
export async function getStudentProfileId(userId: string): Promise<string | null>
export async function verifySupplementOwnership(supplementId: string, studentId: string): Promise<boolean>
```

## Contraintes
- Vérifier TOUJOURS que studentId correspond à l'élève connecté
- Retour format: { success: true, data } ou { success: false, error }
- Fichiers < 350 lignes
```

---

## 📋 Prompt 8.4.4 — API Chapitres

```markdown
## Contexte
Suite de 8.4.3. Le système de suppléments existe.

## Ta mission
Créer l'API pour les chapitres d'un supplément.

### Routes

**GET /api/student/supplements/[id]/chapters**
- Vérifie ownership du supplément parent
- Retourne les chapitres ordonnés par orderIndex

**POST /api/student/supplements/[id]/chapters**
- Body: { title, description? }
- orderIndex = max(orderIndex) + 1 ou 0
- ID: `sch-${Date.now()}-${random}`

**PUT /api/student/supplements/[id]/chapters/[chapterId]**
- Body: { title?, description?, orderIndex? }

**DELETE /api/student/supplements/[id]/chapters/[chapterId]**
- Cascade delete les cartes

### Fichier
```
src/app/api/student/supplements/[id]/chapters/
├── route.ts           GET + POST
└── [chapterId]/
    └── route.ts       PUT + DELETE
```
```

---

## 📋 Prompt 8.4.5 — API Cartes

```markdown
## Contexte
Suite de 8.4.4. Chapitres élève créés.

## Ta mission
Créer l'API pour les cartes de contenu.

### Routes

**POST /api/student/cards**
- Body: { chapterId, title, content, cardType }
- Vérifie que le chapitre appartient à un supplément de l'élève
- ID: `scard-${Date.now()}-${random}`

**GET /api/student/cards/[id]**
- Include: files, quiz
- Vérifie ownership (via chapter → supplement → studentId)

**PUT /api/student/cards/[id]**
- Body: { title?, content?, cardType?, orderIndex? }

**DELETE /api/student/cards/[id]**
- Cascade delete fichiers et quiz

### Types de cartes
```typescript
type StudentCardType = 'NOTE' | 'SUMMARY' | 'QUIZ' | 'EXERCISE' | 'FLASHCARD';
```

### Fichiers
```
src/app/api/student/cards/
├── route.ts           POST (création)
└── [id]/
    └── route.ts       GET + PUT + DELETE
```
```

---

## 📋 Prompt 8.4.6 — API Files Upload

```markdown
## Contexte
Suite de 8.4.5. Cartes élève créées.

## Ta mission
Créer l'API d'upload de fichiers pour les cartes élève.

### Routes

**POST /api/student/cards/[id]/files**
- FormData avec fichier
- Vérifie ownership de la carte
- Stockage: `public/uploads/student/{studentId}/{cardId}/`
- Limite: 100MB (comme prof)
- ID: `sfile-${Date.now()}-${random}`

**DELETE /api/student/cards/[id]/files/[fileId]**
- Vérifie ownership
- Supprime fichier physique + entrée DB

### Types supportés
PDF, Word, Excel, PowerPoint, Images, Vidéo, Audio, Text

### Fichier
```
src/app/api/student/cards/[id]/files/
├── route.ts           POST
└── [fileId]/
    └── route.ts       DELETE
```

### Réutiliser
- Helper `generateId()` existant
- Logique upload similaire à `/api/teacher/courses/[id]/files`
```

---

## ✅ Checklist

- [ ] 8.4.3 Helper getStudentProfileId créé
- [ ] 8.4.3 Helper verifySupplementOwnership créé
- [ ] 8.4.3 GET /api/student/supplements
- [ ] 8.4.3 POST /api/student/supplements
- [ ] 8.4.3 GET /api/student/supplements/[id]
- [ ] 8.4.3 PUT /api/student/supplements/[id]
- [ ] 8.4.3 DELETE /api/student/supplements/[id]
- [ ] 8.4.4 GET /api/student/supplements/[id]/chapters
- [ ] 8.4.4 POST /api/student/supplements/[id]/chapters
- [ ] 8.4.4 PUT /chapters/[chapterId]
- [ ] 8.4.4 DELETE /chapters/[chapterId]
- [ ] 8.4.5 POST /api/student/cards
- [ ] 8.4.5 GET /api/student/cards/[id]
- [ ] 8.4.5 PUT /api/student/cards/[id]
- [ ] 8.4.5 DELETE /api/student/cards/[id]
- [ ] 8.4.6 POST /api/student/cards/[id]/files
- [ ] 8.4.6 DELETE /api/student/cards/[id]/files/[fileId]

---

## 🧪 Tests

```bash
# Test via Thunder Client ou curl
# 1. Créer un supplément
POST /api/student/supplements
{ "title": "Mes notes de Maths" }

# 2. Créer un chapitre
POST /api/student/supplements/{id}/chapters
{ "title": "Chapitre 1 - Algèbre" }

# 3. Créer une carte
POST /api/student/cards
{ "chapterId": "...", "title": "Formules", "content": "# Important\n...", "cardType": "NOTE" }
```

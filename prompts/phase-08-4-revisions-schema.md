# Phase 8.4.1-2 — Schéma Prisma Révisions Élève

*Créé le : 2026-01-02*

---

## 🎯 Objectif

Ajouter les modèles Prisma pour le système de révisions privées de l'élève.

---

## 📋 Prompt

```markdown
## Contexte
BlaizBot-V1 : Next.js 15, TypeScript, Prisma, shadcn/ui.
L'élève peut créer ses propres notes et cours privés que le prof ne voit jamais.

## Ta mission
Ajouter au schéma Prisma les modèles pour les révisions élève :

### Modèles à créer

1. **StudentSupplement** — Conteneur principal (lié ou non à un cours prof)
   - id: String @id (format: "supp-{timestamp}-{random}")
   - studentId: String → StudentProfile
   - courseId: String? → Course (OPTIONNEL)
   - title: String
   - description: String?
   - createdAt, updatedAt

2. **StudentChapter** — Chapitre du supplément
   - id: String @id (format: "sch-{timestamp}-{random}")
   - supplementId: String → StudentSupplement
   - title: String
   - description: String?
   - orderIndex: Int
   - createdAt

3. **StudentCard** — Carte de contenu
   - id: String @id (format: "scard-{timestamp}-{random}")
   - chapterId: String → StudentChapter
   - title: String
   - content: String @db.Text (Markdown)
   - cardType: StudentCardType (enum)
   - orderIndex: Int
   - createdAt, updatedAt

4. **StudentCardType** (enum)
   - NOTE, SUMMARY, QUIZ, EXERCISE, FLASHCARD

5. **StudentFile** — Fichier attaché à une carte
   - id: String @id (format: "sfile-{timestamp}-{random}")
   - cardId: String → StudentCard
   - filename, fileType, url
   - createdAt

6. **StudentQuiz** — Quiz auto-évaluation
   - id: String @id (format: "squiz-{timestamp}-{random}")
   - cardId: String @unique → StudentCard
   - questions: Json (même format que Quiz prof)
   - aiGenerated: Boolean @default(false)
   - createdAt

7. **StudentQuizAttempt** — Tentative de quiz
   - id: String @id (format: "sqatt-{timestamp}-{random}")
   - quizId: String → StudentQuiz
   - score: Int (0-100)
   - answers: Json
   - completedAt: DateTime @default(now())

### Relations à ajouter

Dans StudentProfile :
```prisma
supplements   StudentSupplement[]
```

Dans Course (optionnel) :
```prisma
studentSupplements StudentSupplement[]
```

## Contraintes CRITIQUES

1. **Confidentialité** : Ces tables sont 100% privées à l'élève
2. **onDelete: Cascade** : Supprimer un supplément supprime tout
3. **Format ID** : Préfixe unique pour chaque table (supp-, sch-, scard-, etc.)
4. **Pas de relation prof** : Aucun lien avec TeacherProfile

## Fichier à modifier
`prisma/schema.prisma`

## Après modification
```bash
npx prisma migrate dev --name add-student-revisions
npx prisma generate
```

## Validation
- `npx prisma validate` sans erreur
- Migration appliquée
- Types générés dans node_modules/.prisma/client
```

---

## ✅ Checklist

- [ ] 8.4.1 Enum StudentCardType ajouté
- [ ] 8.4.1 Model StudentSupplement ajouté
- [ ] 8.4.1 Model StudentChapter ajouté
- [ ] 8.4.1 Model StudentCard ajouté
- [ ] 8.4.1 Model StudentFile ajouté
- [ ] 8.4.1 Model StudentQuiz ajouté
- [ ] 8.4.1 Model StudentQuizAttempt ajouté
- [ ] 8.4.1 Relation StudentProfile.supplements ajoutée
- [ ] 8.4.1 Relation Course.studentSupplements ajoutée (optionnelle)
- [ ] 8.4.2 Migration créée et appliquée
- [ ] 8.4.2 `npx prisma generate` OK

---

## 🧪 Test

```bash
npx prisma studio
# Vérifier que les nouvelles tables apparaissent
```

# Phase 8.4.14-16 — Génération IA & Stats Révisions

*Créé le : 2026-01-02*

---

## 🎯 Objectif

Permettre à l'IA de générer des quiz/exercices et afficher les stats privées de l'élève.

---

## 📋 Prompt 8.4.14 — API Génération Quiz IA

```markdown
## Contexte
BlaizBot-V1 : Next.js 15, TypeScript, Prisma, OpenAI/Claude/Gemini.
L'élève veut que l'IA génère un quiz basé sur son contenu et/ou le cours du prof.

## Ta mission
Créer l'API de génération de quiz par IA.

### Route

**POST /api/student/quiz/generate**

### Request Body
```typescript
{
  supplementId: string;        // Supplément cible
  chapterId?: string;          // Chapitre spécifique (optionnel)
  linkedCourseId?: string;     // Cours prof pour contexte (optionnel)
  instructions: string;        // "Génère 10 questions sur le chapitre 3"
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;       // 5-20
  questionType?: 'mcq' | 'truefalse' | 'mixed';  // QCM, Vrai/Faux, Mixte
}
```

### Response
```typescript
{
  success: true,
  data: {
    cardId: string;           // Carte créée avec le quiz
    quiz: {
      id: string;
      questions: QuizQuestion[];
      aiGenerated: true;
    }
  }
}
```

### Contexte IA
L'IA doit avoir accès à :
1. **StudentSupplement** + chapters + cards de l'élève
2. **Course** + chapters + sections du prof (si linkedCourseId)
3. **KnowledgeBase** documents (si disponible)

### Prompt système IA
```
Tu es un assistant pédagogique. Génère un quiz basé sur le contenu fourni.

CONTEXTE ÉLÈVE :
{supplément de l'élève avec ses notes}

CONTEXTE COURS PROF (optionnel) :
{contenu du cours officiel}

INSTRUCTIONS DE L'ÉLÈVE :
{instructions}

CONTRAINTES :
- Difficulté : {difficulty}
- Nombre de questions : {questionCount}
- Type : {questionType}
- Format de sortie : JSON avec structure QuizQuestion[]

FORMAT QuizQuestion :
{
  id: string,
  question: string,
  type: 'mcq' | 'truefalse',
  options?: string[],    // Pour QCM
  correctAnswer: string, // Index pour QCM, 'true'/'false' pour V/F
  explanation?: string
}
```

### Fichiers

```
src/app/api/student/quiz/
├── generate/
│   └── route.ts          (~200 lignes)
└── [id]/
    └── attempt/
        └── route.ts      (~100 lignes) POST tentative
```

### Intégration AI Provider
```typescript
// Utiliser le service AI existant
import { generateWithAI } from '@/lib/ai/provider';

const result = await generateWithAI({
  model: 'gpt-4o-mini', // ou claude-3-haiku
  systemPrompt: quizGeneratorPrompt,
  userPrompt: buildContextPrompt(supplement, course, instructions),
  responseFormat: 'json',
});
```
```

---

## 📋 Prompt 8.4.15 — StudentQuizViewer

```markdown
## Contexte
Suite de 8.4.14. Les quiz générés sont stockés dans StudentQuiz.

## Ta mission
Créer le composant de visualisation/passage d'un quiz élève.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ❓ Quiz : Révisions Algèbre                    [Fermer]    │
├─────────────────────────────────────────────────────────────┤
│  Question 2/10                                  ⏱️ 5:32      │
│                                                             │
│  Quelle est la formule de l'identité remarquable (a+b)² ?   │
│                                                             │
│  ○ a² + b²                                                  │
│  ○ a² + 2ab + b²                                           │
│  ○ a² - 2ab + b²                                           │
│  ○ (a+b)(a-b)                                              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [← Précédent]                              [Suivant →]     │
│                          ou                                 │
│                    [Soumettre le quiz]                      │
└─────────────────────────────────────────────────────────────┘
```

### Après soumission

```
┌─────────────────────────────────────────────────────────────┐
│  🎉 Quiz terminé !                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│        Score : 8/10 (80%)                                   │
│        ████████████░░░░░░░░                                 │
│                                                             │
│  ✅ Q1 - Correct                                            │
│  ❌ Q2 - Incorrect (Réponse : a² + 2ab + b²)                │
│  ✅ Q3 - Correct                                            │
│  ...                                                        │
│                                                             │
│  [Voir les corrections]  [Refaire le quiz]  [Fermer]        │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers

```
src/components/features/student/revisions/
├── StudentQuizViewer.tsx     (~200 lignes)
├── QuizQuestion.tsx          (~100 lignes)
├── QuizResults.tsx           (~120 lignes)
└── index.ts
```

### Props
```typescript
interface StudentQuizViewerProps {
  quiz: {
    id: string;
    questions: QuizQuestion[];
    aiGenerated: boolean;
  };
  onComplete: (score: number, answers: Answer[]) => void;
  onClose: () => void;
}
```

### Comportement
- Navigation entre questions
- Timer optionnel
- Sauvegarde réponses localement
- À la soumission → POST /api/student/quiz/[id]/attempt
- Affichage résultats avec corrections
```

---

## 📋 Prompt 8.4.16 — Stats Révisions (KPI Privés)

```markdown
## Contexte
Suite de 8.4.15. L'élève passe des quiz d'auto-évaluation.

## Ta mission
Créer les composants de statistiques privées.

### Données à afficher

```typescript
interface RevisionStats {
  totalSupplements: number;
  totalCards: number;
  totalQuizzes: number;
  quizzesCompleted: number;
  averageScore: number;
  lastActivity: Date;
  streakDays: number;        // Jours consécutifs d'activité
  timeSpent: number;         // Minutes estimées
}
```

### Layout RevisionStats

```
┌─────────────────────────────────────────────────────────────┐
│  📊 MES STATS PERSO                                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 📝 12    │  │ ❓ 8     │  │ 🎯 82%   │  │ 🔥 5     │    │
│  │ Cartes   │  │ Quiz     │  │ Score    │  │ Jours    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                             │
│  📈 Progression                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  100% ┤                                    ●        │   │
│  │   75% ┤              ●         ●                    │   │
│  │   50% ┤    ●    ●                                   │   │
│  │   25% ┤                                             │   │
│  │    0% ┼────┬────┬────┬────┬────┬────┬────┬────     │   │
│  │       Lun  Mar  Mer  Jeu  Ven  Sam  Dim             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers

```
src/app/api/student/revisions/stats/
└── route.ts              (~80 lignes)

src/components/features/student/revisions/
├── RevisionStats.tsx         (~100 lignes)
├── RevisionStatsCard.tsx     (~40 lignes)
├── RevisionProgressChart.tsx (~80 lignes) - Recharts
└── index.ts
```

### API Stats
**GET /api/student/revisions/stats**
```typescript
// Calculs
const stats = await prisma.$transaction([
  prisma.studentSupplement.count({ where: { studentId } }),
  prisma.studentCard.count({ where: { chapter: { supplement: { studentId } } } }),
  prisma.studentQuiz.count({ where: { card: { chapter: { supplement: { studentId } } } } }),
  prisma.studentQuizAttempt.aggregate({
    where: { quiz: { card: { chapter: { supplement: { studentId } } } } },
    _avg: { score: true },
    _count: true,
  }),
]);
```

### Confidentialité
⚠️ Ces stats sont 100% privées :
- Jamais visibles par le prof
- N'impactent PAS les KPI officiels du cours
- Séparées des Progress/Score du système prof
```

---

## ✅ Checklist

- [ ] 8.4.14 POST /api/student/quiz/generate
- [ ] 8.4.14 Prompt système IA pour génération quiz
- [ ] 8.4.14 POST /api/student/quiz/[id]/attempt
- [ ] 8.4.15 StudentQuizViewer composant
- [ ] 8.4.15 QuizQuestion composant
- [ ] 8.4.15 QuizResults composant
- [ ] 8.4.16 GET /api/student/revisions/stats
- [ ] 8.4.16 RevisionStats composant
- [ ] 8.4.16 RevisionProgressChart (optionnel v1)

---

## 🧪 Tests

```bash
# 1. Générer un quiz IA
POST /api/student/quiz/generate
{
  "supplementId": "supp-xxx",
  "instructions": "Génère 5 questions sur les formules algébriques",
  "difficulty": "medium",
  "questionCount": 5
}

# 2. Soumettre une tentative
POST /api/student/quiz/quiz-xxx/attempt
{
  "answers": [
    { "questionId": "q1", "answer": "1" },
    { "questionId": "q2", "answer": "true" }
  ]
}

# 3. Récupérer stats
GET /api/student/revisions/stats
```

# Phase 7ter — Évaluation Automatique IA

> **Objectif** : Système d'auto-évaluation IA pour chaque interaction élève  
> **Fichiers TODO** : [todo/phase-07ter-ai-evaluation.md](../todo/phase-07ter-ai-evaluation.md)  
> **Statut** : ⏳ EN COURS (AI1-AI7)

---

## 🎯 Récapitulatif des Tâches

| # | Tâche | Statut |
|:--|:------|:-------|
| **AI1.1** | Modèle BDD AIActivityScore | ⬜ |
| **AI1.2** | Relations User/Course/ChatSession | ⬜ |
| **AI2.1** | Service évaluation IA | ⬜ |
| **AI2.2** | Prompts templates | ⬜ |
| **AI2.3** | Agrégation scores | ⬜ |
| **AI3.1** | API /ai/evaluate | ⬜ |
| **AI3.2** | Webhook fin session | ⬜ |
| **AI4.1** | Page Liste Élèves | ⬜ |
| **AI4.2** | Page Fiche Élève | ⬜ |
| **AI4.3** | Composant AIActivitiesTab | ⬜ |
| **AI5.1** | Page Liste Classes | ⬜ |
| **AI5.2** | Page Détail Classe | ⬜ |
| **AI5.3** | Composant ClassAIStats | ⬜ |
| **AI6.1** | Page Liste Cours | ⬜ |
| **AI6.2** | Page Détail Thème | ⬜ |
| **AI7.1** | Modal résultats élève | ⬜ |
| **AI7.2** | Badge score temps réel | ⬜ |
| **AI7.3** | Intégration chat | ⬜ |

---

## 📋 Tâche AI1.1 — Modèle BDD AIActivityScore

### Prompt AI1.1

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6, Neon Postgres).

CONTEXTE :
- Système de scoring existant (StudentScore)
- Besoin de tracker les évaluations IA de chaque activité élève
- L'IA évalue selon 3 critères : Compréhension, Précision, Autonomie

TÂCHE :
Ajouter le modèle `AIActivityScore` dans `prisma/schema.prisma`.

MODÈLE EXACT :

```prisma
model AIActivityScore {
  id              String   @id @default(cuid())
  
  // Relations
  studentId       String
  student         User     @relation("StudentAIScores", fields: [studentId], references: [id], onDelete: Cascade)
  
  courseId        String
  course          Course   @relation("CourseAIScores", fields: [courseId], references: [id], onDelete: Cascade)
  
  chatSessionId   String   @unique
  chatSession     ChatSession @relation(fields: [chatSessionId], references: [id], onDelete: Cascade)
  
  // Type d'activité
  activityType    ActivityType  // QUIZ | EXERCISE | REVISION
  activityId      String?       // ID du quiz/exercice si applicable
  themeId         String?       // Thème concerné
  
  // Évaluation IA (0-100 chacun)
  comprehensionScore  Float   // Compréhension du concept
  accuracyScore       Float   // Précision des réponses
  autonomyScore       Float   // Autonomie (peu d'aide demandée)
  
  // Score final
  finalScore      Float       // Moyenne pondérée (0-100)
  
  // Métadonnées
  duration        Int         // Durée session (minutes)
  messageCount    Int         // Nombre messages échangés
  aiPromptTokens  Int         // Tokens utilisés (coût)
  
  // Feedback IA (JSON)
  strengths       String?     // Points forts ["Maîtrise fractions", ...]
  weaknesses      String?     // Points à améliorer ["Confusion exposants", ...]
  recommendation  String?     // Recommandation prof
  
  createdAt       DateTime    @default(now())
  
  @@index([studentId, courseId])
  @@index([chatSessionId])
  @@index([activityType])
}

enum ActivityType {
  QUIZ
  EXERCISE
  REVISION
}
```

RÈGLES :
- chatSessionId UNIQUE (1 session = 1 évaluation)
- Scores entre 0 et 100 (Float pour décimales)
- strengths/weaknesses/recommendation stockés en JSON string
- Indexes sur studentId+courseId (requêtes fréquentes)

NE PAS ENCORE EXÉCUTER LA MIGRATION (phase AI1.2).
```

### Validation AI1.1
- [ ] Modèle AIActivityScore ajouté
- [ ] Enum ActivityType créé
- [ ] Tous les champs présents
- [ ] Indexes corrects

---

## 📋 Tâche AI1.2 — Relations User/Course/ChatSession

### Prompt AI1.2

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6).

CONTEXTE :
- Modèle AIActivityScore créé (AI1.1)
- Besoin d'ajouter les relations inverses

TÂCHE :
Ajouter les relations dans les modèles existants.

MODIFICATIONS :

1. Dans `model User` :
```prisma
// Ajouter après les relations existantes
aiActivityScores AIActivityScore[] @relation("StudentAIScores")
```

2. Dans `model Course` :
```prisma
// Ajouter après les relations existantes
aiActivityScores AIActivityScore[] @relation("CourseAIScores")
```

3. Dans `model ChatSession` :
```prisma
// Ajouter après les relations existantes
aiScore AIActivityScore?
```

APRÈS MODIFICATIONS :
- Exécuter : `npx prisma db push --accept-data-loss`
- Vérifier : `npx prisma studio` (table AIActivityScore visible)
```

### Validation AI1.2
- [ ] Relations ajoutées dans User, Course, ChatSession
- [ ] `npx prisma db push` réussit
- [ ] Table AIActivityScore visible dans Prisma Studio
- [ ] Pas d'erreurs TypeScript

---

## 📋 Tâche AI2.1 — Service Évaluation IA

### Prompt AI2.1

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- L'IA doit évaluer automatiquement chaque session chat (quiz/exo/révision)
- 3 critères : Compréhension (0-100), Précision (0-100), Autonomie (0-100)
- Utiliser Claude 3.5 Sonnet via Anthropic API

TÂCHE :
Créer `src/lib/ai-evaluation-service.ts`.

STRUCTURE :

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './prisma';

// Types
export interface EvaluationResult {
  comprehension: number;    // 0-100
  accuracy: number;         // 0-100
  autonomy: number;         // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export enum ActivityType {
  QUIZ = 'QUIZ',
  EXERCISE = 'EXERCISE',
  REVISION = 'REVISION'
}

// Client Anthropic (singleton)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Évalue une session de quiz IA
 */
export async function evaluateQuizSession(
  chatHistory: { role: string; content: string }[],
  quizData: { title: string; questions: string[] },
  themeName: string
): Promise<EvaluationResult> {
  const prompt = buildQuizEvaluationPrompt(chatHistory, quizData, themeName);
  
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    temperature: 0.3,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });
  
  // Parser la réponse JSON
  const content = message.content[0].text;
  const result = parseEvaluationResponse(content);
  
  return result;
}

/**
 * Évalue une session d'exercice IA
 */
export async function evaluateExerciseSession(
  chatHistory: { role: string; content: string }[],
  exerciseData: { title: string; description: string }
): Promise<EvaluationResult> {
  const prompt = buildExerciseEvaluationPrompt(chatHistory, exerciseData);
  
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    temperature: 0.3,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });
  
  const content = message.content[0].text;
  return parseEvaluationResponse(content);
}

/**
 * Évalue une session de révision IA
 */
export async function evaluateRevisionSession(
  chatHistory: { role: string; content: string }[],
  themeName: string
): Promise<EvaluationResult> {
  const prompt = buildRevisionEvaluationPrompt(chatHistory, themeName);
  
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    temperature: 0.3,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });
  
  const content = message.content[0].text;
  return parseEvaluationResponse(content);
}

/**
 * Enregistre le score d'activité en BDD
 */
export async function saveActivityScore(
  studentId: string,
  courseId: string,
  chatSessionId: string,
  activityType: ActivityType,
  evaluation: EvaluationResult,
  metadata: { duration: number; messageCount: number; tokens: number }
): Promise<void> {
  const finalScore = (
    evaluation.comprehension * 0.4 +
    evaluation.accuracy * 0.4 +
    evaluation.autonomy * 0.2
  );
  
  await prisma.aIActivityScore.create({
    data: {
      studentId,
      courseId,
      chatSessionId,
      activityType,
      comprehensionScore: evaluation.comprehension,
      accuracyScore: evaluation.accuracy,
      autonomyScore: evaluation.autonomy,
      finalScore,
      duration: metadata.duration,
      messageCount: metadata.messageCount,
      aiPromptTokens: metadata.tokens,
      strengths: JSON.stringify(evaluation.strengths),
      weaknesses: JSON.stringify(evaluation.weaknesses),
      recommendation: evaluation.recommendation
    }
  });
}

/**
 * Met à jour StudentScore avec moyennes IA
 */
export async function updateStudentScoreFromAI(
  studentId: string,
  courseId: string
): Promise<void> {
  // 1. Récupérer toutes les activités IA
  const activities = await prisma.aIActivityScore.findMany({
    where: { studentId, courseId }
  });
  
  if (activities.length === 0) return;
  
  // 2. Calculer moyenne IA globale
  const avgComprehension = 
    activities.reduce((sum, a) => sum + a.comprehensionScore, 0) / activities.length;
  
  // 3. Mettre à jour StudentScore
  await prisma.studentScore.upsert({
    where: { studentId_courseId: { studentId, courseId } },
    update: {
      aiComprehension: avgComprehension,
      aiSessionCount: activities.length
    },
    create: {
      studentId,
      courseId,
      quizAvg: 0,
      exerciseAvg: 0,
      aiComprehension: avgComprehension,
      continuousScore: 0,
      quizCount: 0,
      exerciseCount: 0,
      aiSessionCount: activities.length
    }
  });
}

// Helpers
function buildQuizEvaluationPrompt(
  chatHistory: any[],
  quizData: any,
  themeName: string
): string {
  // Voir AI2.2 pour prompts détaillés
  return `...`;
}

function buildExerciseEvaluationPrompt(
  chatHistory: any[],
  exerciseData: any
): string {
  return `...`;
}

function buildRevisionEvaluationPrompt(
  chatHistory: any[],
  themeName: string
): string {
  return `...`;
}

function parseEvaluationResponse(content: string): EvaluationResult {
  // Extraire le JSON de la réponse
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid evaluation response format');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    comprehension: parsed.comprehension || 0,
    accuracy: parsed.accuracy || 0,
    autonomy: parsed.autonomy || 0,
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    recommendation: parsed.recommendation || ''
  };
}
```

RÈGLES :
- Temperature 0.3 (cohérence)
- max_tokens 1024 (suffisant pour JSON)
- Pondération finale : Compréhension 40%, Précision 40%, Autonomie 20%
- Gestion erreurs (try/catch)
- < 250 lignes

PROMPTS DÉTAILLÉS DANS AI2.2.
```

### Validation AI2.1
- [ ] Fichier créé < 250 lignes
- [ ] evaluateQuizSession() définie
- [ ] evaluateExerciseSession() définie
- [ ] evaluateRevisionSession() définie
- [ ] saveActivityScore() définie
- [ ] updateStudentScoreFromAI() définie
- [ ] npm run build OK

---

## 📋 Tâche AI2.2 — Prompts Templates

### Prompt AI2.2

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- Service ai-evaluation-service.ts créé (AI2.1)
- Besoin des prompts d'évaluation détaillés

TÂCHE :
Compléter les fonctions `buildXxxEvaluationPrompt()` dans `src/lib/ai-evaluation-service.ts`.

PROMPT QUIZ :

```typescript
function buildQuizEvaluationPrompt(
  chatHistory: { role: string; content: string }[],
  quizData: { title: string; questions: string[] },
  themeName: string
): string {
  const chatText = chatHistory
    .map(m => `${m.role === 'user' ? 'ÉLÈVE' : 'IA'}: ${m.content}`)
    .join('\n');
  
  return `Tu es un évaluateur pédagogique. Analyse cette session de quiz IA.

**CONVERSATION :**
${chatText}

**QUIZ CONCERNÉ :**
- Thème : ${themeName}
- Titre : ${quizData.title}
- Questions : ${quizData.questions.join(', ')}

**ÉVALUE SUR 3 CRITÈRES (0-100) :**

1. **Compréhension** : L'élève comprend-il les concepts ?
   - 90-100 : Maîtrise complète, reformule correctement
   - 70-89  : Bonne compréhension, quelques hésitations
   - 50-69  : Compréhension partielle, erreurs conceptuelles
   - <50    : Concepts non maîtrisés

2. **Précision** : Ses réponses sont-elles exactes ?
   - 90-100 : Réponses correctes du premier coup
   - 70-89  : Correctes après 1-2 indices
   - 50-69  : Plusieurs tentatives nécessaires
   - <50    : Réponses majoritairement fausses

3. **Autonomie** : A-t-il besoin d'aide ?
   - 90-100 : Aucune aide demandée
   - 70-89  : 1-2 questions de clarification
   - 50-69  : Demande plusieurs explications
   - <50    : Dépend fortement de l'IA

**RETOURNE JSON EXACT :**
{
  "comprehension": 85,
  "accuracy": 90,
  "autonomy": 75,
  "strengths": ["Maîtrise des fractions", "Raisonnement logique"],
  "weaknesses": ["Confusion exposants négatifs"],
  "recommendation": "Revoir les exposants avec exercices supplémentaires"
}

IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant/après.`;
}
```

PROMPT EXERCICE :

```typescript
function buildExerciseEvaluationPrompt(
  chatHistory: { role: string; content: string }[],
  exerciseData: { title: string; description: string }
): string {
  const chatText = chatHistory
    .map(m => `${m.role === 'user' ? 'ÉLÈVE' : 'IA'}: ${m.content}`)
    .join('\n');
  
  return `Analyse cette session d'exercice assisté par IA.

**CONVERSATION :**
${chatText}

**EXERCICE :**
- Titre : ${exerciseData.title}
- Description : ${exerciseData.description}

**ÉVALUE :**
1. **Compréhension** : Méthodologie de résolution
2. **Précision** : Justesse calculs/raisonnement
3. **Autonomie** : Capacité à avancer seul

**CRITÈRES SPÉCIAUX EXERCICES :**
- Pénalité si copie solution IA sans comprendre (-20 autonomie)
- Bonus si trouve erreur dans sa démarche (+10 compréhension)
- Bonus si propose méthode alternative (+15 compréhension)

Retourne JSON (même format que quiz).`;
}
```

PROMPT RÉVISION :

```typescript
function buildRevisionEvaluationPrompt(
  chatHistory: { role: string; content: string }[],
  themeName: string
): string {
  const chatText = chatHistory
    .map(m => `${m.role === 'user' ? 'ÉLÈVE' : 'IA'}: ${m.content}`)
    .join('\n');
  
  return `Évalue cette session de révision de cours.

**CONVERSATION :**
${chatText}

**THÈME RÉVISÉ :**
${themeName}

**ÉVALUE :**
1. **Compréhension** : Questions pertinentes posées ?
2. **Précision** : Reformulations correctes ?
3. **Autonomie** : Utilise-t-il des exemples personnels ?

**INDICATEURS POSITIFS :**
- Pose des questions "pourquoi/comment" (+10 compréhension)
- Fait des liens avec autres chapitres (+15 compréhension)
- Demande des exercices supplémentaires (+10 autonomie)

Retourne JSON (même format que quiz).`;
}
```

RÈGLES :
- Prompts clairs et concis
- Critères explicites (pas d'ambiguïté)
- Format JSON strict
```

### Validation AI2.2
- [ ] Prompts Quiz, Exercice, Révision complets
- [ ] Critères 0-100 explicites
- [ ] Format JSON strict demandé
- [ ] npm run build OK

---

## 📋 Tâche AI2.3 — Agrégation Scores

### Prompt AI2.3

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6).

CONTEXTE :
- Fonction updateStudentScoreFromAI() créée (AI2.1)
- Besoin de vérifier qu'elle fonctionne correctement

TÂCHE :
Vérifier et tester la fonction `updateStudentScoreFromAI()`.

LOGIQUE :
1. Récupérer toutes les AIActivityScore du student+course
2. Calculer moyenne des comprehensionScore
3. Compter le nombre d'activités
4. Upsert dans StudentScore :
   - aiComprehension = moyenne
   - aiSessionCount = nombre

VÉRIFICATION :
- Créer un script de test dans `scripts/test-ai-evaluation.ts`
- Seed 3 AIActivityScore avec scores variés (60, 75, 90)
- Vérifier que aiComprehension = (60+75+90)/3 = 75
- Vérifier que aiSessionCount = 3

Si la logique est OK, marquer cette tâche comme terminée.
```

### Validation AI2.3
- [ ] Fonction updateStudentScoreFromAI() testée
- [ ] Moyenne calculée correctement
- [ ] aiSessionCount mis à jour
- [ ] Script test réussi

---

## 📋 Tâche AI3.1 — API /ai/evaluate

### Prompt AI3.1

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- Service ai-evaluation-service.ts fonctionnel
- Besoin d'une API pour déclencher l'évaluation

TÂCHE :
Créer `src/app/api/ai/evaluate/route.ts`.

STRUCTURE :

```typescript
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import {
  evaluateQuizSession,
  evaluateExerciseSession,
  evaluateRevisionSession,
  saveActivityScore,
  updateStudentScoreFromAI,
  ActivityType
} from '@/lib/ai-evaluation-service';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { sessionId, activityType, activityId, themeId } = body;
    
    // Validation
    if (!sessionId || !activityType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // 1. Récupérer la session chat
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    
    // 2. Vérifier que la session appartient à l'utilisateur
    if (chatSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // 3. Vérifier qu'elle n'a pas déjà été évaluée
    const existing = await prisma.aIActivityScore.findUnique({
      where: { chatSessionId: sessionId }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Session already evaluated' },
        { status: 409 }
      );
    }
    
    // 4. Préparer l'historique de chat
    const chatHistory = chatSession.messages.map(m => ({
      role: m.role,
      content: m.content
    }));
    
    // 5. Évaluer selon le type d'activité
    let evaluation;
    
    switch (activityType) {
      case ActivityType.QUIZ:
        // Récupérer quiz data
        const quiz = await prisma.quiz.findUnique({
          where: { id: activityId },
          include: { theme: true }
        });
        if (!quiz) {
          return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }
        evaluation = await evaluateQuizSession(
          chatHistory,
          { title: quiz.title, questions: quiz.questions.map((q: any) => q.text) },
          quiz.theme.title
        );
        break;
        
      case ActivityType.EXERCISE:
        // Récupérer exercise data
        const exercise = await prisma.exercise.findUnique({
          where: { id: activityId }
        });
        if (!exercise) {
          return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
        }
        evaluation = await evaluateExerciseSession(
          chatHistory,
          { title: exercise.title, description: exercise.description }
        );
        break;
        
      case ActivityType.REVISION:
        // Récupérer theme data
        const theme = await prisma.theme.findUnique({
          where: { id: themeId }
        });
        if (!theme) {
          return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
        }
        evaluation = await evaluateRevisionSession(chatHistory, theme.title);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid activity type' },
          { status: 400 }
        );
    }
    
    // 6. Calculer durée et tokens
    const duration = Math.floor(
      (chatSession.updatedAt.getTime() - chatSession.createdAt.getTime()) / 60000
    ); // minutes
    
    // 7. Enregistrer le score
    await saveActivityScore(
      session.user.id,
      chatSession.courseId || '',
      sessionId,
      activityType as ActivityType,
      evaluation,
      {
        duration,
        messageCount: chatSession.messages.length,
        tokens: 0 // TODO: tracker tokens réels
      }
    );
    
    // 8. Mettre à jour StudentScore
    if (chatSession.courseId) {
      await updateStudentScoreFromAI(session.user.id, chatSession.courseId);
    }
    
    // 9. Retourner l'évaluation
    const finalScore = (
      evaluation.comprehension * 0.4 +
      evaluation.accuracy * 0.4 +
      evaluation.autonomy * 0.2
    );
    
    return NextResponse.json({
      success: true,
      data: {
        score: Math.round(finalScore),
        comprehension: evaluation.comprehension,
        accuracy: evaluation.accuracy,
        autonomy: evaluation.autonomy,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        recommendation: evaluation.recommendation
      }
    });
    
  } catch (error) {
    console.error('AI evaluation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

RÈGLES :
- Vérification auth stricte
- Pas d'évaluation en double (unique chatSessionId)
- Gestion erreurs complète (try/catch)
- Logs détaillés
- < 150 lignes
```

### Validation AI3.1
- [ ] Route POST /api/ai/evaluate créée
- [ ] Auth vérifiée
- [ ] Pas de double évaluation
- [ ] 3 types (QUIZ/EXERCISE/REVISION) gérés
- [ ] Erreurs gérées (401/403/404/409/500)
- [ ] npm run build OK

---

## 📋 Tâche AI3.2 — Webhook Fin Session

### Prompt AI3.2

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

CONTEXTE :
- API /ai/evaluate créée (AI3.1)
- Besoin de déclencher automatiquement l'évaluation quand l'élève termine

TÂCHE :
Modifier `src/app/api/chat/sessions/[id]/route.ts` (PATCH).

AJOUT :
Quand `status = 'completed'` ET que la session a un activityType, déclencher l'évaluation.

MODIFICATION DANS PATCH :

```typescript
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await req.json();
  const { status, activityType, activityId, themeId } = body;
  
  // Mettre à jour la session
  const updatedSession = await prisma.chatSession.update({
    where: { id: sessionId },
    data: {
      status,
      ...(activityType && { metadata: { activityType, activityId, themeId } })
    }
  });
  
  // Si session terminée ET activité, déclencher évaluation
  if (status === 'completed' && activityType) {
    // Appel asynchrone (ne pas bloquer la réponse)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Passer le cookie de session pour auth
        'Cookie': req.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        sessionId,
        activityType,
        activityId,
        themeId
      })
    }).catch(err => {
      console.error('Failed to trigger AI evaluation:', err);
    });
  }
  
  return NextResponse.json(updatedSession);
}
```

RÈGLES :
- Évaluation asynchrone (ne pas bloquer)
- Pas d'erreur si éval échoue (catch silencieux)
- Passer le cookie pour auth
```

### Validation AI3.2
- [ ] PATCH session déclenche évaluation si completed
- [ ] Appel asynchrone (non bloquant)
- [ ] Cookie passé pour auth
- [ ] Erreurs catchées
- [ ] npm run build OK

---

*[AI4-AI7 prompts continuent... 2500 lignes supplémentaires à suivre]*

---

## ✅ Checklist Finale Phase 7ter

### BDD
- [ ] Modèle AIActivityScore créé
- [ ] Relations User/Course/ChatSession OK
- [ ] Migration appliquée

### Service & API
- [ ] evaluateQuizSession() fonctionne
- [ ] evaluateExerciseSession() fonctionne
- [ ] evaluateRevisionSession() fonctionne
- [ ] saveActivityScore() fonctionne
- [ ] updateStudentScoreFromAI() fonctionne
- [ ] API /ai/evaluate sécurisée
- [ ] Webhook fin session OK

### UI Prof (Pages Élèves)
- [ ] StudentCard avec badge IA
- [ ] StatsCounters avec "Moy IA"
- [ ] Onglet "Activités IA" dans fiche élève
- [ ] Colonne IA dans CourseScoreRow
- [ ] Tableau historique activités
- [ ] Graphique progression

### UI Prof (Pages Classes)
- [ ] Badge IA sur TeacherClassCard
- [ ] Stats IA agrégées
- [ ] Section "Top élèves actifs IA"
- [ ] Colonne IA dans tableau élèves

### UI Prof (Pages Cours)
- [ ] Badge "Moy IA" sur carte cours
- [ ] Métriques IA dans header thème
- [ ] Score IA par quiz/exercice
- [ ] Panel "Analyse IA"
- [ ] Suggestions automatiques

### UI Élève
- [ ] Modal résultats après quiz/exo
- [ ] Badge score temps réel
- [ ] Feedback pédagogique clair

### Tests
- [ ] npm run lint OK
- [ ] npm run build OK
- [ ] Tous fichiers < 350 lignes

---

*Lignes : ~850 | Dernière MAJ : 2025-12-30*

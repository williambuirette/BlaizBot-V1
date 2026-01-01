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
| **AI5.bis.1** | Transformer en tableau | ✅ |
| **AI5.bis.2** | Liens et tri | ✅ |
| **AI5.bis.3** | Filtre et recherche | ✅ |
| **AI5.bis.4** | Actions de groupe | ✅ |
| **AI5.ter.1** | Affichage bulles chat | ✅ |
| **AI5.ter.2** | Bouton fichiers | ✅ |
| **AI5.ter.3** | API upload fichiers | ✅ |
| **AI5.ter.4.1-6** | Téléchargement fichiers | ✅ |
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

## 🎯 Amélioration Page Détail Classe (AI5.bis)

### Prompt Optimal AI5.bis.1 : Transformer la liste en tableau interactif

> **Itérations réelles** : 1 (prévu)
> **Problèmes potentiels** : Gestion de l'état client dans un composant serveur, typage des données de tri.

```
TACHE : Refactoriser le composant `ClassStudentsList.tsx` pour transformer la liste statique d'élèves en un tableau interactif et informatif.

CONTEXTE :
Le composant `ClassStudentsList` (`src/components/features/teacher/ClassStudentsList.tsx`) affiche actuellement une simple liste de `div`. Il est utilisé dans la page `(dashboard)/teacher/classes/[id]/page.tsx`.

OBJECTIFS :
1.  **Remplacer la structure `div`** par le composant `<Table>` de shadcn/ui.
2.  **Utiliser "use client"** car le tableau nécessitera des interactions (tri, filtre).
3.  **Définir les colonnes** suivantes :
    - `Nom de l'élève` : Prénom et Nom.
    - `Score IA` : Le score `aiAverage` formaté en pourcentage.
    - `Sessions IA` : Le nombre `aiSessionsCount`.
    - `Actions` : Une colonne pour les actions futures.
4.  **Rendre le tableau triable** sur chaque colonne. Utilise un état local (`useState`) pour gérer la colonne de tri et la direction.
5.  **Transformer le nom de l'élève en lien**. Ce lien doit pointer vers la page de détail de l'élève : `/teacher/students/[studentId]`. Utilise le composant `<Link>` de `next/link`.
6.  **Props** : Le composant doit continuer à accepter `students: StudentData[]` comme prop. Assure-toi que le type `StudentData` contient bien `id`, `name`, `aiAverage`, et `aiSessionsCount`.
7.  **Style** :
    - Utilise les composants de shadcn/ui : `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`.
    - Ajoute une icône de tri (par exemple, `ArrowUpDown` de `lucide-react`) dans les en-têtes de colonnes cliquables.

FICHIERS À MODIFIER :
- `src/components/features/teacher/ClassStudentsList.tsx`

VALIDATION :
- Le tableau s'affiche correctement avec les données des élèves.
- Le clic sur les en-têtes de colonnes trie les données.
- Le clic sur le nom d'un élève redirige vers sa page de profil.
- Le code est propre, typé et respecte les conventions du projet.
```

---

## 🎯 Amélioration Messagerie (AI5.ter)

### Prompt AI5.ter.1 : Affichage en bulles de chat

```
TACHE : Transformer l'affichage des messages dans la page messagerie en utilisant des bulles de chat alignées (style WhatsApp/Messenger).

CONTEXTE :
- Page : `src/app/(dashboard)/teacher/messages/page.tsx`
- Actuellement, les messages sont affichés dans une zone vide sans formatage
- Besoin d'un affichage en bulles avec alignement selon l'expéditeur

OBJECTIFS :
1. **Créer la zone de messages** :
   - Remplacer la zone vide par un `ScrollArea` de shadcn/ui
   - Afficher chaque message dans une bulle `div` avec bordures arrondies
   - Utiliser `space-y-4` pour l'espacement vertical

2. **Alignement des bulles** :
   - Messages de l'utilisateur connecté : alignés à **droite** (justify-end)
   - Messages des autres : alignés à **gauche** (justify-start)
   - Vérifier avec `msg.senderId === session?.user?.id`

3. **Style des bulles** :
   - **Messages envoyés** : fond `bg-primary`, texte `text-primary-foreground`
   - **Messages reçus** : fond `bg-muted`, texte par défaut
   - Largeur max : `max-w-[70%]`
   - Padding : `p-3`, bordures : `rounded-lg`

4. **Contenu de chaque bulle** :
   - Texte du message : `<p className="text-sm">{msg.content}</p>`
   - Heure : `<p className="text-xs opacity-70 mt-1">{formatTime(msg.createdAt)}</p>`
   - Format heure : `HH:MM` (ex: "14:30")

5. **État vide** :
   - Si aucun message : afficher "Aucun message pour le moment"
   - Centré avec `flex items-center justify-center`

FICHIERS À MODIFIER :
- `src/app/(dashboard)/teacher/messages/page.tsx`

INTERFACES :
```typescript
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
}
```

VALIDATION :
- Les bulles sont alignées correctement (droite/gauche)
- Les couleurs différencient envoyeur/destinataire
- L'heure s'affiche en format HH:MM
- Le scroll fonctionne si nombreux messages
- Responsive (mobile friendly)
```

---

### Prompt AI5.ter.2 : Bouton d'attachement de fichiers

```
TACHE : Ajouter un bouton Paperclip pour permettre la sélection et l'envoi de fichiers dans la messagerie.

CONTEXTE :
- Page : `src/app/(dashboard)/teacher/messages/page.tsx`
- Input actuel : champ texte + bouton Envoyer
- Besoin : bouton pour joindre des fichiers (PDF, docs, images)

OBJECTIFS :
1. **Ajouter un input file caché** :
   ```tsx
   <Input
     type="file"
     ref={fileInputRef}
     onChange={handleFileSelect}
     className="hidden"
     multiple
     accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
   />
   ```

2. **Créer un bouton Paperclip** :
   - Utiliser `Button` de shadcn/ui avec `variant="outline" size="icon"`
   - Icône : `<Paperclip className="h-4 w-4" />` de lucide-react
   - Clic : déclenche `fileInputRef.current?.click()`

3. **Gérer l'état des fichiers** :
   ```tsx
   const [attachments, setAttachments] = useState<File[]>([]);
   const fileInputRef = useRef<HTMLInputElement>(null);
   
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
       setAttachments(Array.from(e.target.files));
     }
   };
   ```

4. **Afficher les fichiers sélectionnés** :
   - Au-dessus de l'input, afficher la liste des fichiers
   - Format : `<div className="text-xs bg-muted px-2 py-1 rounded">{file.name}</div>`
   - Avec bouton ❌ pour retirer un fichier

5. **Layout de la barre d'input** :
   ```
   ┌─────────────────────────────────────────┐
   │ [fichiers sélectionnés]                 │
   │ [📎] [Input texte...] [Envoyer]         │
   └─────────────────────────────────────────┘
   ```

FICHIERS À MODIFIER :
- `src/app/(dashboard)/teacher/messages/page.tsx`

IMPORTS NÉCESSAIRES :
```typescript
import { Paperclip, Send, X } from "lucide-react";
import { useRef } from "react";
```

VALIDATION :
- Le bouton Paperclip est visible à gauche de l'input
- Le clic ouvre le sélecteur de fichiers
- Les formats autorisés sont bien filtrés
- Les fichiers sélectionnés s'affichent
- Possibilité de retirer un fichier avant envoi
```

---

### Prompt AI5.ter.3 : API d'upload de fichiers

```
TACHE : Créer une route API POST pour gérer l'envoi de messages avec fichiers joints.

CONTEXTE :
- Route : `src/app/api/teacher/messages/[id]/route.ts`
- Schéma Prisma : `Message` a un champ `attachments` (Json?)
- Upload : utiliser FormData pour envoyer texte + fichiers

OBJECTIFS :
1. **Créer la route POST** :
   - Paramètre : `[id]` = conversationId
   - Body : FormData avec `content` (string) et `attachments` (File[])
   - Authentification : vérifier session teacher

2. **Vérifications** :
   - L'utilisateur est bien participant de la conversation
   - Requête Prisma :
   ```typescript
   const conversation = await prisma.conversation.findUnique({
     where: { id: conversationId },
     include: { ConversationParticipant: true }
   });
   
   const isParticipant = conversation?.ConversationParticipant.some(
     (p) => p.userId === session.user.id
   );
   ```

3. **Traiter les fichiers** :
   - Récupérer : `const files = formData.getAll("attachments") as File[];`
   - Logger : `console.log(\`📎 \${files.length} fichier(s) joints\`);`
   - TODO futur : upload vers S3/Cloudinary
   - Pour l'instant : stocker les noms en JSON

4. **Créer le message** :
   ```typescript
   const message = await prisma.message.create({
     data: {
       id: randomUUID(),
       content,
       conversationId,
       senderId: session.user.id,
       attachments: files.map(f => ({ name: f.name, size: f.size }))
     },
     include: {
       User: {
         select: { id: true, firstName: true, lastName: true }
       }
     }
   });
   ```

5. **Mettre à jour la conversation** :
   ```typescript
   await prisma.conversation.update({
     where: { id: conversationId },
     data: { updatedAt: new Date() }
   });
   ```

6. **Réponse** :
   ```typescript
   return NextResponse.json({
     success: true,
     data: {
       id: message.id,
       content: message.content,
       senderId: message.senderId,
       senderName: \`\${message.User.firstName} \${message.User.lastName}\`,
       attachments: message.attachments,
       createdAt: message.createdAt
     }
   });
   ```

FICHIERS À CRÉER :
- `src/app/api/teacher/messages/[id]/route.ts`

IMPORTS :
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
```

VALIDATION :
- POST /api/teacher/messages/[conversationId] fonctionne
- Vérifie que l'utilisateur est participant
- Les fichiers sont reçus et logués
- Le message est créé avec les métadonnées fichiers
- Erreurs 401 (non auth), 403 (pas participant), 404 (conversation introuvable)
- < 120 lignes de code
```

---

### Prompt AI5.ter.4 : Téléchargement des fichiers joints

```
TACHE : Permettre aux utilisateurs de télécharger les fichiers joints en cliquant sur les pièces jointes affichées dans les bulles de message.

CONTEXTE :
- Composant : `src/components/features/shared/MessageThread.tsx`
- Les fichiers sont stockés dans `Message.attachments` (JSON : `{ name, size, type }[]`)
- Actuellement, seul l'upload est implémenté
- Besoin d'afficher et de permettre le téléchargement des fichiers

OBJECTIFS :

### 1. Affichage des pièces jointes dans les bulles

**Dans MessageThread.tsx**, modifier l'affichage des messages pour inclure les pièces jointes :

```typescript
{messages.map((msg) => {
  const isOwn = msg.senderId === currentUserId;
  const attachments = msg.attachments as { name: string; size: string; type: string }[] | null;
  
  return (
    <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[70%] rounded-lg p-3", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}>
        {msg.content && <p className="text-sm">{msg.content}</p>}
        
        {/* AJOUT : Affichage des pièces jointes */}
        {attachments && attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map((file, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 flex items-center gap-2"
                onClick={() => handleDownloadFile(msg.id, file.name)}
              >
                {getFileIcon(file.type)}
                <span className="text-xs">{file.name}</span>
                <span className="text-xs opacity-70">({formatFileSize(file.size)})</span>
              </Badge>
            ))}
          </div>
        )}
        
        <p className="text-xs opacity-70 mt-1">{formatTime(msg.createdAt)}</p>
      </div>
    </div>
  );
})}
```

### 2. Utilitaires pour icônes et formatage

Ajouter ces fonctions dans le composant :

```typescript
// Icône selon le type de fichier
const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="h-3 w-3" />;
  if (type.includes('image')) return <Image className="h-3 w-3" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-3 w-3" />;
  if (type.includes('word') || type.includes('document')) return <FileText className="h-3 w-3" />;
  if (type.includes('presentation') || type.includes('powerpoint')) return <FileText className="h-3 w-3" />;
  return <Paperclip className="h-3 w-3" />;
};

// Formater la taille du fichier
const formatFileSize = (bytes: number | string) => {
  const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (numBytes < 1024) return `${numBytes} B`;
  if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(1)} KB`;
  return `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
};
```

### 3. Gestionnaire de téléchargement

Ajouter le handler de téléchargement :

```typescript
const handleDownloadFile = async (messageId: string, filename: string) => {
  try {
    const res = await fetch(`/api/teacher/messages/${conversationId}/files/${messageId}/${encodeURIComponent(filename)}`);
    
    if (!res.ok) {
      throw new Error('Erreur lors du téléchargement');
    }
    
    // Récupérer le blob
    const blob = await res.blob();
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Nettoyer
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    alert('Impossible de télécharger le fichier');
  }
};
```

### 4. Route API de téléchargement

**Créer** : `src/app/api/teacher/messages/[id]/files/[messageId]/[filename]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string; messageId: string; filename: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { id: conversationId, messageId, filename } = await context.params;

  // Vérifier que l'utilisateur est participant
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      ConversationParticipant: {
        some: { userId: session.user.id }
      }
    }
  });

  if (!conversation) {
    return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
  }

  // Vérifier que le message existe
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      conversationId
    }
  });

  if (!message) {
    return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
  }

  try {
    // OPTION A : Fichiers stockés localement (dev)
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'messages', conversationId, messageId, filename);
    const fileBuffer = await fs.readFile(filePath);

    // Détecter le Content-Type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Erreur lecture fichier:', error);
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  }
}
```

### 5. Modifier l'upload pour sauvegarder les fichiers

**Dans** : `src/app/api/teacher/messages/[id]/route.ts` (POST)

Ajouter la sauvegarde physique des fichiers :

```typescript
// Après récupération des fichiers
const files = formData.getAll("attachments") as File[];

// Créer le dossier de stockage
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'messages', id);
await fs.mkdir(uploadDir, { recursive: true });

// Sauvegarder chaque fichier
const attachmentMeta = await Promise.all(
  files.map(async (file) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    
    return {
      name: filename,
      originalName: file.name,
      size: file.size,
      type: file.type
    };
  })
);

// Stocker les métadonnées dans la BDD
const message = await prisma.message.create({
  data: {
    // ...
    attachments: attachmentMeta
  }
});
```

IMPORTS À AJOUTER :
```typescript
import { FileText, Image, FileSpreadsheet, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import fs from 'fs/promises';
import path from 'path';
```

FICHIERS À MODIFIER :
- `src/components/features/shared/MessageThread.tsx` : Affichage + download handler
- `src/app/api/teacher/messages/[id]/route.ts` : Sauvegarde physique des fichiers

FICHIERS À CRÉER :
- `src/app/api/teacher/messages/[id]/files/[messageId]/[filename]/route.ts` : API de téléchargement

VALIDATION :
- Les pièces jointes s'affichent sous les messages avec icône appropriée
- Clic sur une pièce jointe télécharge le fichier
- Les fichiers sont sauvegardés dans `/public/uploads/messages/[conversationId]/[messageId]/`
- L'accès est sécurisé (vérification de participation)
- < 200 lignes par fichier
- `npm run build` passe sans erreur

NOTES :
- **Option A** (locale) : Simple pour le dev, ne convient pas pour Vercel en production
- **Option B** (Vercel Blob) : Recommandé pour production → voir `@vercel/blob`
- Penser à ajouter `/public/uploads/` dans `.gitignore`
```

---

### Prompts AI5.ter.4 : Téléchargement de fichiers joints (détaillé)

#### Prompt AI5.ter.4.1 : Affichage des pièces jointes

```
TACHE : Afficher les pièces jointes dans les bulles de message avec des badges cliquables.

STATUT : ✅ TERMINÉ (voir implémentation actuelle)

CONTEXTE :
- Composant : `src/components/features/shared/MessageThread.tsx`
- Les messages peuvent avoir un champ `attachments: { name, size, type }[]`
- Besoin d'afficher ces fichiers sous le contenu du message

MODIFICATIONS EFFECTUÉES :

1. **Interface Message étendue** :
```typescript
interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  createdAt: string;
  attachments?: { name: string; size: number; type: string }[] | null;
}
```

2. **Imports ajoutés** :
```typescript
import { FileText, Image, FileSpreadsheet, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
```

3. **Fonction utilitaire pour les icônes** :
```typescript
const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="h-3 w-3" />;
  if (type.includes('image')) return <Image className="h-3 w-3" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-3 w-3" />;
  if (type.includes('word') || type.includes('document')) return <FileText className="h-3 w-3" />;
  if (type.includes('presentation') || type.includes('powerpoint')) return <FileText className="h-3 w-3" />;
  return <Paperclip className="h-3 w-3" />;
};
```

4. **Affichage dans les bulles** :
```tsx
{msg.attachments && msg.attachments.length > 0 && (
  <div className="mt-2 space-y-1">
    {msg.attachments.map((file, idx) => (
      <Badge
        key={idx}
        variant="secondary"
        className="cursor-pointer hover:bg-secondary/80 flex items-center gap-2 w-fit"
        onClick={() => handleDownloadFile(msg.id, file.name)}
      >
        {getFileIcon(file.type)}
        <span className="text-xs">{file.name}</span>
        <span className="text-xs opacity-70">({formatFileSize(file.size)})</span>
      </Badge>
    ))}
  </div>
)}
```

VALIDATION :
- [x] Interface Message avec attachments
- [x] Icônes adaptées au type de fichier
- [x] Badges cliquables affichés sous le message
- [x] Taille formatée (KB/MB)
```

---

#### Prompt AI5.ter.4.2 : Gestionnaire de téléchargement

```
TACHE : Créer le handler pour télécharger un fichier quand on clique sur un badge.

STATUT : ✅ TERMINÉ (voir implémentation actuelle)

CONTEXTE :
- Composant : `src/components/features/shared/MessageThread.tsx`
- Les badges sont cliquables via `onClick={() => handleDownloadFile(msg.id, file.name)}`
- Besoin de télécharger le fichier via l'API

MODIFICATIONS EFFECTUÉES :

1. **Fonction formatFileSize** :
```typescript
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
```

2. **Handler handleDownloadFile** :
```typescript
const handleDownloadFile = async (messageId: string, filename: string) => {
  try {
    const res = await fetch(
      `${apiBaseUrl}/${conversationId}/files/${messageId}/${encodeURIComponent(filename)}`
    );

    if (!res.ok) {
      throw new Error('Erreur lors du téléchargement');
    }

    // Récupérer le blob
    const blob = await res.blob();

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Nettoyer
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    alert('Impossible de télécharger le fichier');
  }
};
```

VALIDATION :
- [x] Click sur badge appelle handleDownloadFile
- [x] Fetch vers route API correcte
- [x] Blob créé et téléchargé
- [x] Gestion d'erreur avec message utilisateur
```

---

#### Prompt AI5.ter.4.3 : Route API GET fichiers

```
TACHE : Créer la route API pour servir les fichiers téléchargés.

STATUT : ✅ TERMINÉ (structure créée, récupération physique à implémenter)

CONTEXTE :
- Route : `src/app/api/teacher/messages/[id]/files/[messageId]/[filename]/route.ts`
- Doit vérifier que l'utilisateur est participant de la conversation
- Retourne le fichier avec le bon Content-Type

MODIFICATIONS EFFECTUÉES :

**Fichier créé** : `src/app/api/teacher/messages/[id]/files/[messageId]/[filename]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string; messageId: string; filename: string }>;
  }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: conversationId, messageId, filename } = await context.params;

    // Vérifier que l'utilisateur est participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: {
          has: session.user.id,
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
    }

    // Vérifier que le message existe
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId,
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
    }

    // TODO: Implémenter la récupération réelle du fichier (voir AI5.ter.4.5)
    return NextResponse.json(
      {
        error: 'Stockage de fichiers non encore implémenté',
        info: 'Les fichiers ne sont pas encore sauvegardés physiquement.',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('❌ Erreur GET /api/teacher/messages/[id]/files:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
```

VALIDATION :
- [x] Route créée avec bonne signature
- [x] Vérification authentification
- [x] Vérification participation à la conversation
- [x] Vérification existence du message
- [ ] Récupération et envoi du fichier (voir AI5.ter.4.5)
```

---

#### Prompt AI5.ter.4.4 : Stockage physique des fichiers (POST)

```
TACHE : Modifier la route POST pour sauvegarder physiquement les fichiers uploadés.

STATUT : ⏳ À FAIRE

CONTEXTE :
- Route : `src/app/api/teacher/messages/[id]/route.ts` (handler POST)
- Actuellement, seules les métadonnées sont stockées en BDD
- Besoin de sauvegarder les fichiers dans `/public/uploads/messages/[conversationId]/[messageId]/`

OBJECTIFS :

1. **Ajouter les imports nécessaires** :
```typescript
import fs from 'fs/promises';
import path from 'path';
```

2. **Modifier la section de traitement des fichiers** :

**AVANT** (actuel) :
```typescript
// Récupérer les fichiers (si présents)
const files = formData.getAll('attachments') as File[];
console.log(`📎 ${files.length} fichier(s) joint(s)`);

// Préparer les métadonnées des fichiers
const attachmentsData = files.map((file) => ({
  name: file.name,
  size: file.size,
  type: file.type,
}));
```

**APRÈS** (à implémenter) :
```typescript
// Récupérer les fichiers (si présents)
const files = formData.getAll('attachments') as File[];
console.log(`📎 ${files.length} fichier(s) joint(s)`);

let attachmentsData = null;

if (files.length > 0) {
  // Générer un ID unique pour ce message
  const messageId = randomUUID();
  
  // Créer le dossier de stockage
  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'messages',
    conversationId,
    messageId
  );
  await fs.mkdir(uploadDir, { recursive: true });

  // Sauvegarder chaque fichier
  attachmentsData = await Promise.all(
    files.map(async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Nom de fichier sécurisé : timestamp + index + nom original
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${index}-${sanitizedName}`;
      const filepath = path.join(uploadDir, filename);
      
      await fs.writeFile(filepath, buffer);
      console.log(`✅ Fichier sauvegardé : ${filename}`);
      
      return {
        name: filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        path: `/uploads/messages/${conversationId}/${messageId}/${filename}`,
      };
    })
  );
}
```

3. **Modifier la création du message** :

**AVANT** :
```typescript
const message = await prisma.message.create({
  data: {
    id: randomUUID(),
    conversationId,
    senderId: session.user.id,
    content: content.trim(),
    attachments: attachmentsData.length > 0 ? attachmentsData : null,
  },
  // ...
});
```

**APRÈS** :
```typescript
const message = await prisma.message.create({
  data: {
    id: messageId, // Utiliser l'ID généré plus haut
    conversationId,
    senderId: session.user.id,
    content: content.trim(),
    attachments: attachmentsData,
  },
  // ...
});
```

4. **Ajouter la gestion d'erreur** :

Si l'upload échoue, nettoyer les fichiers déjà créés :

```typescript
try {
  // ... code d'upload ...
} catch (error) {
  // Nettoyer les fichiers en cas d'erreur
  if (messageId) {
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'messages',
      conversationId,
      messageId
    );
    await fs.rm(uploadDir, { recursive: true, force: true });
  }
  throw error;
}
```

FICHIER À MODIFIER :
- `src/app/api/teacher/messages/[id]/route.ts` (handler POST)

VALIDATION :
- [ ] Imports fs/promises et path ajoutés
- [ ] Dossier créé dans /public/uploads/messages/[conversationId]/[messageId]/
- [ ] Fichiers sauvegardés avec noms sécurisés
- [ ] Métadonnées incluent path relatif
- [ ] Gestion d'erreur avec cleanup
- [ ] Logs confirmant sauvegarde
- [ ] Test : upload fichier → vérifier présence physique

NOTE : Ajouter `/public/uploads/` dans `.gitignore` pour éviter de committer les fichiers uploadés.
```

---

#### Prompt AI5.ter.4.5 : Récupération physique des fichiers (GET)

```
TACHE : Compléter la route GET pour lire et servir les fichiers physiques.

STATUT : ⏳ À FAIRE (après AI5.ter.4.4)

CONTEXTE :
- Route : `src/app/api/teacher/messages/[id]/files/[messageId]/[filename]/route.ts`
- La structure de sécurité est déjà en place
- Besoin de lire le fichier et le retourner avec le bon Content-Type

OBJECTIFS :

1. **Ajouter les imports** :
```typescript
import fs from 'fs/promises';
import path from 'path';
```

2. **Remplacer le TODO** (ligne ~60) :

**AVANT** :
```typescript
// TODO: Implémenter la récupération réelle du fichier
return NextResponse.json(
  {
    error: 'Stockage de fichiers non encore implémenté',
    info: 'Les fichiers ne sont pas encore sauvegardés physiquement.',
  },
  { status: 501 }
);
```

**APRÈS** :
```typescript
try {
  // Construire le chemin du fichier
  const filePath = path.join(
    process.cwd(),
    'public',
    'uploads',
    'messages',
    conversationId,
    messageId,
    filename
  );

  // Vérifier l'existence du fichier
  try {
    await fs.access(filePath);
  } catch {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  }

  // Lire le fichier
  const fileBuffer = await fs.readFile(filePath);

  // Détecter le Content-Type selon l'extension
  const ext = path.extname(filename).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  // Récupérer le nom original depuis les métadonnées
  const attachments = message.attachments as { originalName?: string; name: string }[] | null;
  const attachment = attachments?.find((a) => a.name === filename);
  const downloadFilename = attachment?.originalName || filename;

  // Retourner le fichier
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${downloadFilename}"`,
      'Content-Length': fileBuffer.length.toString(),
    },
  });
} catch (error) {
  console.error('Erreur lecture fichier:', error);
  return NextResponse.json({ error: 'Erreur lors de la lecture du fichier' }, { status: 500 });
}
```

FICHIER À MODIFIER :
- `src/app/api/teacher/messages/[id]/files/[messageId]/[filename]/route.ts`

VALIDATION :
- [ ] Imports fs/promises et path ajoutés
- [ ] Chemin fichier construit correctement
- [ ] Vérification existence avec fs.access
- [ ] Content-Type adapté selon extension
- [ ] Nom original utilisé pour le téléchargement
- [ ] Headers corrects (Content-Disposition, Content-Length)
- [ ] Gestion d'erreur si fichier absent
- [ ] Test : clic sur badge → fichier téléchargé avec bon nom

SÉCURITÉ :
- ✅ Vérification authentification (déjà en place)
- ✅ Vérification participation (déjà en place)
- ✅ Pas de path traversal (chemin construit de manière sûre)
- ⚠️ Fichiers publics dans /public/uploads/ (accessible sans API si on connaît l'URL)
  - Pour prod : migrer vers Vercel Blob ou S3 avec URLs signées
```

---

#### Prompt AI5.ter.4.6 : Tests end-to-end

```
TACHE : Tester le workflow complet d'upload et download de fichiers.

STATUT : ⏳ À FAIRE (après AI5.ter.4.4 et AI5.ter.4.5)

CONTEXTE :
- Toutes les fonctionnalités sont implémentées
- Besoin de valider le workflow complet

SCÉNARIO DE TEST :

### Test 1 : Upload fichier unique

1. Se connecter en tant que professeur
2. Ouvrir une conversation
3. Cliquer sur le bouton Paperclip
4. Sélectionner un fichier PDF
5. Vérifier l'affichage du badge avec nom + taille
6. Envoyer le message
7. Vérifier :
   - ✅ Message apparaît dans le fil
   - ✅ Badge fichier visible sous le message
   - ✅ Icône PDF affichée
   - ✅ Taille formatée correctement
   - ✅ Fichier physique dans `/public/uploads/messages/[conversationId]/[messageId]/`

### Test 2 : Upload multi-fichiers

1. Cliquer sur Paperclip
2. Sélectionner 3 fichiers (PDF, Excel, Image)
3. Vérifier les 3 badges avant envoi
4. Supprimer le fichier Excel
5. Envoyer
6. Vérifier :
   - ✅ 2 fichiers (PDF + Image) dans le message
   - ✅ Icônes différentes pour chaque type

### Test 3 : Téléchargement

1. Cliquer sur un badge de fichier
2. Vérifier :
   - ✅ Le téléchargement démarre
   - ✅ Le nom du fichier téléchargé est correct (nom original)
   - ✅ Le fichier s'ouvre correctement
   - ✅ Aucune erreur dans la console

### Test 4 : Sécurité

1. Se connecter en tant qu'élève NON participant
2. Tenter d'accéder directement à l'URL :
   `/api/teacher/messages/[id]/files/[messageId]/[filename]`
3. Vérifier :
   - ✅ Erreur 404 ou 403 (pas participant)
4. Vérifier dans `.gitignore` :
   - ✅ `/public/uploads/` est bien ignoré

### Test 5 : Formats multiples

Tester avec :
- PDF (`.pdf`)
- Word (`.docx`)
- Excel (`.xlsx`)
- PowerPoint (`.pptx`)
- Image (`.jpg`, `.png`)

Vérifier :
- ✅ Tous les formats acceptés
- ✅ Icônes correctes
- ✅ Content-Type correct au téléchargement

### Test 6 : Gestion d'erreur

1. Upload un fichier > 10MB
2. Vérifier le comportement (limite éventuelle)
3. Upload un fichier avec caractères spéciaux dans le nom
4. Vérifier que le nom est sanitizé

CRITÈRES DE VALIDATION GLOBALE :
- [ ] Upload mono-fichier ✅
- [ ] Upload multi-fichiers ✅
- [ ] Suppression avant envoi ✅
- [ ] Téléchargement ✅
- [ ] Sécurité (non-participant bloqué) ✅
- [ ] Tous formats supportés ✅
- [ ] Noms fichiers sanitizés ✅
- [ ] `.gitignore` mis à jour ✅
- [ ] Aucune erreur console ✅
- [ ] Build passe : `npm run build` ✅
```

---

NOTES :
- **Option A** (locale) : Simple pour le dev, ne convient pas pour Vercel en production
- **Option B** (Vercel Blob) : Recommandé pour production → voir `@vercel/blob`
- Penser à ajouter `/public/uploads/` dans `.gitignore`


---

### Prompt Optimal AI5.ter.4 : Téléchargement de fichiers joints complet

> **Itérations réelles** : 12 (idéal = 3)
> **Problèmes rencontrés** : 
> - Next.js 15+ requires `await context.params` (async params)
> - Stockage physique nécessite fs/promises et création récursive de dossiers
> - Gestion d'erreur client pour distinguer 404 vs réseau
> - Noms de fichiers avec caractères spéciaux à encoder/décoder
> - Anciens fichiers (pré-implémentation) donnent 404 légitime

```
TÂCHE COMPLÈTE : Ajouter téléchargement de fichiers joints avec stockage physique complet

CONTEXTE :
- Application : BlaizBot-V1 (Next.js 16+, Prisma 6)
- Messages existants avec attachments (JSON métadonnées seulement)
- Besoin : Stockage physique + téléchargement sécurisé

ARCHITECTURE PHYSIQUE CHOISIE :
```
public/uploads/messages/[conversationId]/[messageId]/
  1767132206030-0-Plan_comptable_corrige_proposition.xlsx
  1767132239884-0-Strategie-communale-IA.pdf
```

ÉTAPES COMPLÈTES :

1. **AFFICHAGE BADGES CLIQUABLES** (MessageThread.tsx) :
   ```tsx
   // État pour téléchargement
   const handleDownloadFile = async (attachment: any) => {
     const downloadUrl = `/api/teacher/messages/${conversationId}/files/${messageId}/${encodeURIComponent(attachment.name)}`;
     console.log('📥 Tentative de téléchargement:', downloadUrl);
     
     try {
       const res = await fetch(downloadUrl);
       if (!res.ok) {
         if (res.status === 404) {
           alert("❌ Fichier introuvable (uploadé avant implémentation stockage)");
         } else {
           const errorData = await res.json();
           alert(`❌ Erreur ${res.status}: ${errorData.error}`);
         }
         return;
       }
       
       const blob = await res.blob();
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = attachment.originalName || attachment.name;
       document.body.appendChild(a);
       a.click();
       document.body.removeChild(a);
       URL.revokeObjectURL(url);
     } catch (error) {
       console.error('❌ Erreur téléchargement:', error);
       alert('❌ Erreur réseau lors du téléchargement');
     }
   };
   
   // Badge cliquable avec icône dynamique
   const getFileIcon = (fileName: string) => {
     const ext = fileName.split('.').pop()?.toLowerCase();
     if (['pdf'].includes(ext!)) return <FileText className="h-4 w-4" />;
     if (['xlsx', 'xls'].includes(ext!)) return <FileSpreadsheet className="h-4 w-4" />;
     if (['jpg', 'jpeg', 'png'].includes(ext!)) return <Image className="h-4 w-4" />;
     return <FileText className="h-4 w-4" />;
   };
   
   <Badge 
     variant="secondary" 
     className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
     onClick={() => handleDownloadFile(attachment)}
   >
     {getFileIcon(attachment.name)}
     {attachment.originalName || attachment.name}
   </Badge>
   ```

2. **ROUTE POST - STOCKAGE PHYSIQUE** (route.ts) :
   ```tsx
   import { NextRequest } from 'next/server';
   import { writeFile, mkdir } from 'fs/promises';
   import { join } from 'path';
   import crypto from 'crypto';

   export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
     const { id: conversationId } = await context.params; // ⚠️ AWAIT REQUIS Next.js 15+
     const session = await getServerSession(authOptions);
     
     // Vérifier participation
     const conversation = await prisma.conversation.findFirst({
       where: { id: conversationId, participantIds: { has: session.user.id } }
     });
     if (!conversation) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
     
     const formData = await req.formData();
     const content = formData.get("content") as string;
     const files = formData.getAll("attachments") as File[];
     
     const messageId = crypto.randomUUID();
     const attachmentMetas = [];
     
     // Stockage physique
     for (let i = 0; i < files.length; i++) {
       const file = files[i];
       const timestamp = Date.now();
       const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
       const fileName = `${timestamp}-${i}-${sanitizedName}`;
       
       const uploadDir = join(process.cwd(), 'public', 'uploads', 'messages', conversationId, messageId);
       await mkdir(uploadDir, { recursive: true });
       
       const filePath = join(uploadDir, fileName);
       const buffer = Buffer.from(await file.arrayBuffer());
       await writeFile(filePath, buffer);
       
       console.log('✅ Fichier sauvegardé :', fileName);
       
       attachmentMetas.push({
         name: fileName,
         originalName: file.name,
         size: file.size,
         type: file.type,
         path: `/uploads/messages/${conversationId}/${messageId}/${fileName}`
       });
     }
     
     // Créer message
     const message = await prisma.message.create({
       data: {
         id: messageId,
         conversationId,
         senderId: session.user.id,
         content,
         attachments: attachmentMetas.length > 0 ? attachmentMetas : null
       }
     });
     
     return NextResponse.json({ success: true, data: message });
   }
   ```

3. **ROUTE GET - TÉLÉCHARGEMENT SÉCURISÉ** (files/[messageId]/[filename]/route.ts) :
   ```tsx
   import { readFile } from 'fs/promises';
   import { join } from 'path';
   
   export async function GET(
     req: NextRequest, 
     context: { params: Promise<{ id: string; messageId: string; filename: string }> }
   ) {
     const { id: conversationId, messageId, filename } = await context.params;
     const session = await getServerSession(authOptions);
     
     // Vérifier participation
     const conversation = await prisma.conversation.findFirst({
       where: { 
         id: conversationId, 
         participantIds: { has: session.user.id }
       }
     });
     
     if (!conversation) return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
     
     // Vérifier que le message existe
     const message = await prisma.message.findFirst({
       where: { id: messageId, conversationId }
     });
     
     if (!message) return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
     
     // Lire le fichier physique
     const filePath = join(process.cwd(), 'public', 'uploads', 'messages', conversationId, messageId, decodeURIComponent(filename));
     
     try {
       const fileBuffer = await readFile(filePath);
       
       // Content-Type dynamique
       const ext = filename.split('.').pop()?.toLowerCase();
       let contentType = 'application/octet-stream';
       if (ext === 'pdf') contentType = 'application/pdf';
       else if (['xlsx', 'xls'].includes(ext!)) contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
       else if (['jpg', 'jpeg'].includes(ext!)) contentType = 'image/jpeg';
       else if (ext === 'png') contentType = 'image/png';
       
       // Nom original pour téléchargement
       const attachments = message.attachments as any[];
       const attachment = attachments?.find((att: any) => att.name === decodeURIComponent(filename));
       const originalName = attachment?.originalName || filename;
       
       return new Response(fileBuffer, {
         headers: {
           'Content-Type': contentType,
           'Content-Disposition': `attachment; filename="${originalName}"`
         }
       });
     } catch (error) {
       console.error('❌ Fichier non trouvé:', filePath);
       return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
     }
   }
   ```

4. **GESTION .GITIGNORE** :
   ```gitignore
   # Ajout à .gitignore
   /public/uploads/
   ```

5. **SYSTÈME DEBUG INTÉGRÉ** :
   - Logs serveur détaillés (✅ Fichier sauvegardé, ❌ Erreurs)
   - Logs client avec URL et statut (📥 Tentative, ❌ Erreur)
   - Messages d'erreur explicites (404 pré-implémentation vs erreur serveur)

DIFFÉRENCES CLÉS vs prompt original :
- **Next.js 15+ async params** : `await context.params` obligatoire
- **Stockage physique complet** : mkdir récursif + writeFile avec Buffer
- **Sécurité téléchargement** : Vérification participation + message exists
- **Content-Type dynamique** : Détection extension pour headers corrects
- **Nom original préservé** : Content-Disposition avec originalName
- **Debug système** : Logs détaillés côté client et serveur
- **Gestion d'erreur** : 404 pour anciens fichiers vs nouveaux

VALIDATION FINALE COMPLÈTE :
- ✅ Upload multi-fichiers avec stockage physique
- ✅ Badges cliquables avec icônes différenciées
- ✅ Téléchargement sécurisé nouveaux fichiers
- ✅ 404 attendue pour anciens fichiers (pré-implémentation)
- ✅ Debugging logs pour troubleshooting
- ✅ .gitignore mis à jour
- ✅ Noms originaux préservés
- ✅ Content-Type correct pour tous formats
```

**Différences clés vs prompts originaux** :
- Context.params async non mentionné dans prompts originaux
- Stockage physique complet avec gestion d'erreur manquait
- Debugging système pas prévu initialement  
- Distinction anciens/nouveaux fichiers non anticipée
- Gestion noms caractères spéciaux sous-estimée

**BÉNÉFICE** :
- Système complet upload→stockage→téléchargement opérationnel
- Production-ready avec debugging intégré
- Base solide pour migration future vers Vercel Blob

---

### Prompt Optimal AI5.ter (combiné) - VERSION MISE À JOUR

> **Itérations réelles** : 2 (affichage + API)
> **Problèmes rencontrés** : 
> - Alignement des bulles nécessitait `flex` sur le parent
> - FormData nécessite `NextRequest` au lieu de `Request`

```
TACHE COMPLÈTE : Implémenter un système de messagerie avec bulles de chat et support de fichiers joints.

CONTEXTE :
- Application : BlaizBot-V1 (Next.js 16, Prisma 6, shadcn/ui)
- Page : Teacher Messages (`src/app/(dashboard)/teacher/messages/page.tsx`)
- Schéma : `Conversation`, `Message` (avec `attachments: Json?`)

ÉTAPES :

1. **AFFICHAGE BULLES DE CHAT** :
   - Zone messages : `<ScrollArea>` avec `space-y-4`
   - Bulle : `<div className="flex">` avec `justify-end` ou `justify-start`
   - Style envoyé : `bg-primary text-primary-foreground max-w-[70%] rounded-lg p-3`
   - Style reçu : `bg-muted max-w-[70%] rounded-lg p-3`
   - Condition : `msg.senderId === session?.user?.id ? "justify-end" : "justify-start"`
   - Heure : `toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })`

2. **BOUTON ATTACHEMENT** :
   - Input file caché avec `ref={fileInputRef}` et `multiple`
   - Accept : `.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png`
   - Bouton : `<Button variant="outline" size="icon"><Paperclip /></Button>`
   - État : `const [attachments, setAttachments] = useState<File[]>([]);`
   - Affichage : liste des fichiers avec bouton de suppression

3. **API ROUTE POST** :
   - Route : `src/app/api/teacher/messages/[id]/route.ts`
   - Vérifier : participant de la conversation
   - FormData : `content` (string) + `attachments` (File[])
   - Créer message avec `id: randomUUID()`
   - Stocker métadonnées fichiers en JSON (nom, taille)
   - Mettre à jour `conversation.updatedAt`

4. **INTÉGRATION ENVOI** :
   ```tsx
   const handleSendMessage = async () => {
     const formData = new FormData();
     formData.append("content", message);
     formData.append("conversationId", selectedConversation.id);
     attachments.forEach((file) => {
       formData.append("attachments", file);
     });
     
     const res = await fetch(\`/api/teacher/messages/\${selectedConversation.id}\`, {
       method: "POST",
       body: formData
     });
     
     if (res.ok) {
       setMessage("");
       setAttachments([]);
       await fetchMessages(selectedConversation.id);
     }
   };
   ```

FICHIERS :
- Modifier : `src/app/(dashboard)/teacher/messages/page.tsx`
- Créer : `src/app/api/teacher/messages/[id]/route.ts`

VALIDATION COMPLÈTE :
- ✅ Bulles alignées selon l'expéditeur
- ✅ Couleurs différenciées (bleu/gris)
- ✅ Bouton Paperclip fonctionnel
- ✅ Sélection multi-fichiers
- ✅ Formats validés
- ✅ API enregistre le message avec fichiers
- ✅ Upload sécurisé (vérification participant)
- ✅ < 150 lignes par fichier
```

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

---

## Phase CP : Compteurs Performance Cours

### Prompt CP1 : Types et interfaces

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6).

CONTEXTE :
- Page Mes Cours affiche les cours du professeur
- Besoin d'ajouter des compteurs de performance bases sur les scores eleves
- Donnees a agreger : StudentScore.totalScore + AIActivityScore.finalScore

TACHE :
Creer le fichier src/types/course-stats.ts avec les types pour les stats cours.

TYPES A CREER :

export type PerformanceGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

export interface CoursePerformance {
  studentScoreAvg: number;    // Moyenne StudentScore.totalScore (0-100)
  aiScoreAvg: number;         // Moyenne AIActivityScore.finalScore (0-100)
  globalScore: number;        // Score combine : (student*0.6) + (ai*0.4)
  grade: PerformanceGrade;    // A+/A/B/C/D selon globalScore
  enrolledCount: number;      // Nombre eleves inscrits au cours
  activeCount: number;        // Nombre eleves avec au moins 1 score
}

export interface CourseWithStats {
  id: string;
  title: string;
  description: string | null;
  subject: { id: string; name: string };
  performance: CoursePerformance | null;  // null si aucun eleve
  aiComprehensionAvg: number | null;      // Colonne Score IA existante
}

export interface CoursesOverview {
  totalCourses: number;
  totalStudents: number;        // Eleves uniques tous cours confondus
  averagePerformance: number;   // Moyenne des globalScore
  coursesWithData: number;      // Cours avec au moins 1 eleve
}

// Helper function
export function calculateGrade(score: number): PerformanceGrade {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

FICHIER : src/types/course-stats.ts (~45 lignes)

VALIDATION :
- [ ] Tous les types exportes
- [ ] Helper calculateGrade fonctionnel
- [ ] < 50 lignes
```

---

### Prompt CP2 : API stats cours enrichie

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript, Prisma 6).

CONTEXTE :
- Types CoursePerformance et CoursesOverview crees (CP1)
- API existante : /api/teacher/courses retourne les cours du prof
- Besoin : Enrichir avec stats de performance agregees

TACHE :
Modifier src/app/api/teacher/courses/route.ts pour inclure les stats.

SPECIFICATIONS :
1. Periode : Annee scolaire en cours (septembre N a aout N+1)
2. Sources : StudentScore.totalScore (60%) + AIActivityScore.finalScore (40%)
3. Seuil : Minimum 1 eleve pour calculer la performance
4. Format reponse enrichi

LOGIQUE DE CALCUL :

// 1. Determiner l'annee scolaire
const now = new Date();
const currentYear = now.getFullYear();
const startOfSchoolYear = new Date(
  now.getMonth() >= 8 ? currentYear : currentYear - 1, 
  8, 1  // 1er septembre
);

// 2. Pour chaque cours, recuperer :
// - StudentScore avec totalScore
// - AIActivityScore avec finalScore
// - Compter eleves uniques

// 3. Calculer moyennes
const studentScoreAvg = studentScores.length > 0 
  ? studentScores.reduce((sum, s) => sum + s.totalScore, 0) / studentScores.length
  : 0;

const aiScoreAvg = aiScores.length > 0
  ? aiScores.reduce((sum, s) => sum + (s.finalScore || 0), 0) / aiScores.length
  : 0;

// 4. Score global pondere
const globalScore = (studentScoreAvg * 0.6) + (aiScoreAvg * 0.4);

// 5. Determiner le grade
const grade = calculateGrade(globalScore);

REPONSE ATTENDUE :

{
  success: true,
  data: {
    courses: CourseWithStats[],
    overview: CoursesOverview
  }
}

FICHIER : src/app/api/teacher/courses/route.ts (~+60 lignes)

ATTENTION :
- Ne pas casser le comportement existant
- Gerer le cas ou aucun score n'existe (performance: null)
- Utiliser les types importes de @/types/course-stats

VALIDATION :
- [ ] Annee scolaire calculee correctement
- [ ] Jointures StudentScore et AIActivityScore
- [ ] Calcul moyenne ponderee (60/40)
- [ ] Overview avec totaux
- [ ] < 350 lignes total
```

---

### Prompt CP3 : Composant Badge Performance

```
Tu travailles sur BlaizBot-V1 (Next.js 16, shadcn/ui, Tailwind).

CONTEXTE :
- Types CoursePerformance disponibles
- Besoin d'afficher la note A+/A/B/C/D avec couleur

TACHE :
Creer src/components/features/teacher/courses/CoursePerformanceBadge.tsx

COMPOSANT :

interface CoursePerformanceBadgeProps {
  performance: CoursePerformance | null;
  showScore?: boolean;  // Afficher le % a cote du grade
  size?: 'sm' | 'md';   // Taille du badge
}

COULEURS PAR GRADE :
- A+ : bg-emerald-600 text-white (vert fonce)
- A  : bg-green-500 text-white (vert)
- B  : bg-amber-500 text-white (orange)
- C  : bg-orange-500 text-white (rouge clair)
- D  : bg-red-500 text-white (rouge)
- null : bg-gray-300 text-gray-600 (gris, afficher "-")

AFFICHAGE :
- Par defaut : Badge avec grade seul (ex: "A+")
- showScore=true : Badge + score (ex: "A+ (87%)")
- size='sm' : Plus petit pour tableau
- size='md' : Taille normale

EXEMPLE RENDU :
[A+] ou [A+ 87%] ou [-]

FICHIER : src/components/features/teacher/courses/CoursePerformanceBadge.tsx (~50 lignes)

VALIDATION :
- [ ] 5 couleurs differentes selon grade
- [ ] Gestion du cas null
- [ ] Props optionnelles fonctionnelles
- [ ] < 60 lignes
```

---

### Prompt CP4 : Header Stats Vue d'ensemble

```
Tu travailles sur BlaizBot-V1 (Next.js 16, shadcn/ui, Tailwind).

CONTEXTE :
- Type CoursesOverview disponible
- Page Mes Cours affiche un tableau de cours
- Besoin d'un header avec stats globales

TACHE :
Creer src/components/features/teacher/courses/CoursesStatsHeader.tsx

COMPOSANT :

interface CoursesStatsHeaderProps {
  overview: CoursesOverview;
}

AFFICHAGE :

  Vue d'ensemble                                              
                
    15          127         73%                  
   cours         eleves        perf. moy.              
                


STRUCTURE :
- Card avec 3 stats en flex row
- Icones : BookOpen, Users, TrendingUp (lucide-react)
- Performance moyenne avec couleur selon grade

FICHIER : src/components/features/teacher/courses/CoursesStatsHeader.tsx (~60 lignes)

VALIDATION :
- [ ] 3 cartes de stats alignees
- [ ] Couleur performance selon grade
- [ ] Design coherent avec le reste
- [ ] < 70 lignes
```

---

### Prompt CP5 : Integration page Mes Cours

```
Tu travailles sur BlaizBot-V1 (Next.js 16, shadcn/ui, Tailwind).

CONTEXTE :
- Composants crees : CoursePerformanceBadge, CoursesStatsHeader
- API enrichie retourne CourseWithStats[] et CoursesOverview
- Page actuelle : tableau avec Matiere | Theme | Chapitres | Score IA | Actions

TACHE :
Modifier src/app/(dashboard)/teacher/courses/page.tsx pour :
1. Ajouter le header stats en haut
2. Supprimer la colonne "Chapitres"
3. Ajouter colonne "Eleves" avec format "X/Y"
4. Ajouter colonne "Perf. Globale" avec CoursePerformanceBadge

NOUVELLES COLONNES :
- Matiere : inchange
- Theme : inchange
- Eleves : activeCount / enrolledCount (ex: "18/25")
- Perf. Globale : CoursePerformanceBadge (grade colore)
- Score IA : inchange (garde la valeur existante aiComprehension)
- Actions : inchange

STRUCTURE PAGE :
1. <CoursesStatsHeader overview={data.overview} />
2. Barre de recherche (existante)
3. Bouton "Nouveau cours" (existant)
4. Tableau avec nouvelles colonnes

IMPORT DES COMPOSANTS :
import { CoursePerformanceBadge } from "@/components/features/teacher/courses/CoursePerformanceBadge";
import { CoursesStatsHeader } from "@/components/features/teacher/courses/CoursesStatsHeader";

FICHIER : src/app/(dashboard)/teacher/courses/page.tsx

ATTENTION :
- Adapter le fetch pour utiliser la nouvelle structure API
- Gerer le cas performance: null (afficher "-" ou badge gris)
- Garder le tri et la recherche fonctionnels

VALIDATION :
- [ ] Header stats affiche
- [ ] Colonne Chapitres supprimee
- [ ] Colonne Eleves avec format X/Y
- [ ] Colonne Perf. Globale avec badge colore
- [ ] Score IA toujours affiche
- [ ] < 350 lignes
```

---

### Prompt CP6 : Tests et validation

```
Tu travailles sur BlaizBot-V1 (Next.js 16, TypeScript).

TACHE : Verifier que tout fonctionne

TESTS MANUELS :
1. Ouvrir /teacher/courses
2. Verifier le header stats (3 cartes)
3. Verifier les colonnes du tableau
4. Verifier les badges de performance
5. Verifier le format "X/Y" pour les eleves

TESTS AUTOMATIQUES :
npm run lint
npm run build

CRITERES DE VALIDATION :
- [ ] Header affiche totaux corrects
- [ ] Badges colores selon grade
- [ ] Colonne Chapitres absente
- [ ] Format Eleves correct
- [ ] Pas d'erreur console
- [ ] Build reussit
- [ ] Fichiers < 350 lignes

SCREENSHOT ATTENDU :

 Vue d'ensemble : 15 cours  127 eleves  73% perf moyenne   

 Matiere      Theme          Eleves  Perf.    Score IA   
 SVT          Photosynthese  23/25   [A 87%]  49%        
 Maths        Equations      18/20   [B 73%]  53%        
 Maths        Fractions      15/18   [A+91%]  64%        

```

---

*Lignes : ~950 | Derniere MAJ : 2025-12-31*

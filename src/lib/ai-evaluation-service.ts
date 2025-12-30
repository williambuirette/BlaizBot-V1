import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './prisma';

// Types
export interface EvaluationResult {
  comprehension: number; // 0-100
  accuracy: number; // 0-100
  autonomy: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

export enum ActivityType {
  QUIZ = 'QUIZ',
  EXERCISE = 'EXERCISE',
  REVISION = 'REVISION',
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
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Parser la réponse JSON
  const content = message.content[0].type === 'text' ? message.content[0].text : '';
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
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0].type === 'text' ? message.content[0].text : '';
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
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0].type === 'text' ? message.content[0].text : '';
  return parseEvaluationResponse(content);
}

/**
 * Enregistre le score d'activité en BDD
 */
export async function saveActivityScore(
  studentId: string,
  courseId: string,
  aiChatId: string,
  activityType: ActivityType,
  evaluation: EvaluationResult,
  metadata: { duration: number; messageCount: number; tokens: number }
): Promise<void> {
  const finalScore =
    evaluation.comprehension * 0.4 + evaluation.accuracy * 0.4 + evaluation.autonomy * 0.2;

  await prisma.aIActivityScore.create({
    data: {
      studentId,
      courseId,
      aiChatId,
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
      recommendation: evaluation.recommendation,
    },
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
    where: { studentId, courseId },
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
      aiSessionCount: activities.length,
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
      aiSessionCount: activities.length,
    },
  });
}

// ============================================
// PROMPTS TEMPLATES
// ============================================

function buildQuizEvaluationPrompt(
  chatHistory: { role: string; content: string }[],
  quizData: { title: string; questions: string[] },
  themeName: string
): string {
  const chatText = chatHistory
    .map((m) => `${m.role === 'user' ? 'ÉLÈVE' : 'IA'}: ${m.content}`)
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

function buildExerciseEvaluationPrompt(
  chatHistory: { role: string; content: string }[],
  exerciseData: { title: string; description: string }
): string {
  const chatText = chatHistory
    .map((m) => `${m.role === 'user' ? 'ÉLÈVE' : 'IA'}: ${m.content}`)
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

Retourne JSON (même format que quiz) avec critères 0-100.

IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant/après.`;
}

function buildRevisionEvaluationPrompt(
  chatHistory: { role: string; content: string }[],
  themeName: string
): string {
  const chatText = chatHistory
    .map((m) => `${m.role === 'user' ? 'ÉLÈVE' : 'IA'}: ${m.content}`)
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
- Pose des questions de fond (pas juste "c'est quoi X ?")
- Fait des liens avec d'autres concepts
- Propose des exemples concrets

**INDICATEURS NÉGATIFS :**
- Demande résumé complet (passif)
- Ne reformule jamais avec ses mots
- Aucune question de clarification

Retourne JSON (même format que quiz) avec critères 0-100.

IMPORTANT : Retourne UNIQUEMENT le JSON, sans texte avant/après.`;
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
    recommendation: parsed.recommendation || '',
  };
}

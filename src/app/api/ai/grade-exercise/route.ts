import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Types
interface ExerciseAnswer {
  questionId: string;
  question: string;
  expectedAnswer: string;
  studentAnswer: string;
  points: number;
}

interface GradingResult {
  questionId: string;
  isCorrect: boolean;
  earnedPoints: number;
  maxPoints: number;
  feedback: string;
}

interface GradingResponse {
  results: GradingResult[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  globalFeedback: string;
}

// Client Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await req.json();
    const { answers } = body as { answers: ExerciseAnswer[] };

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: 'Réponses manquantes' },
        { status: 400 }
      );
    }

    // Construire le prompt pour l'IA
    const prompt = buildGradingPrompt(answers);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parser la réponse
    const firstContent = message.content?.[0];
    const content = firstContent && firstContent.type === 'text' ? firstContent.text : '';
    const gradingResult = parseGradingResponse(content, answers);

    return NextResponse.json(gradingResult);
  } catch (error) {
    console.error('Erreur lors de la correction IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la correction' },
      { status: 500 }
    );
  }
}

function buildGradingPrompt(answers: ExerciseAnswer[]): string {
  const questionsText = answers
    .map(
      (a, i) => `
Question ${i + 1} (${a.points} points):
- Question: ${a.question}
- Réponse attendue: ${a.expectedAnswer}
- Réponse de l'élève: ${a.studentAnswer || '(pas de réponse)'}
`
    )
    .join('\n');

  return `Tu es un professeur bienveillant qui corrige les exercices d'un élève.

EXERCICE À CORRIGER:
${questionsText}

INSTRUCTIONS:
1. Compare chaque réponse de l'élève avec la réponse attendue
2. Accepte les réponses correctes même si:
   - L'orthographe est légèrement différente
   - La formulation est différente mais le sens est correct
   - Des synonymes sont utilisés
3. Attribue les points (tout ou rien, ou points partiels si la réponse est partiellement correcte)
4. Donne un feedback constructif et encourageant pour chaque réponse

RÉPONDS EN JSON STRICT (pas de markdown, pas de \`\`\`):
{
  "results": [
    {
      "questionId": "id de la question",
      "isCorrect": true/false,
      "earnedPoints": nombre de points obtenus,
      "feedback": "Explication courte et encourageante"
    }
  ],
  "globalFeedback": "Message global d'encouragement avec conseil pour s'améliorer"
}`;
}

function parseGradingResponse(
  content: string,
  originalAnswers: ExerciseAnswer[]
): GradingResponse {
  try {
    // Nettoyer le contenu (enlever les backticks markdown si présents)
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7);
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();

    const parsed = JSON.parse(cleanContent);

    // Mapper les résultats avec les points max
    const results: GradingResult[] = originalAnswers.map((answer, index) => {
      const aiResult = parsed.results?.[index] || {};
      return {
        questionId: answer.questionId,
        isCorrect: aiResult.isCorrect ?? false,
        earnedPoints: aiResult.earnedPoints ?? 0,
        maxPoints: answer.points,
        feedback: aiResult.feedback || 'Pas de feedback disponible',
      };
    });

    const totalScore = results.reduce((sum, r) => sum + r.earnedPoints, 0);
    const maxScore = results.reduce((sum, r) => sum + r.maxPoints, 0);
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      results,
      totalScore,
      maxScore,
      percentage,
      globalFeedback: parsed.globalFeedback || 'Continue comme ça !',
    };
  } catch (error) {
    console.error('Erreur parsing réponse IA:', error, content);
    
    // Fallback: correction simple par comparaison de texte
    const results: GradingResult[] = originalAnswers.map((answer) => {
      const isCorrect = normalizeAnswer(answer.studentAnswer) === normalizeAnswer(answer.expectedAnswer);
      return {
        questionId: answer.questionId,
        isCorrect,
        earnedPoints: isCorrect ? answer.points : 0,
        maxPoints: answer.points,
        feedback: isCorrect ? 'Bonne réponse !' : 'Réponse incorrecte',
      };
    });

    const totalScore = results.reduce((sum, r) => sum + r.earnedPoints, 0);
    const maxScore = results.reduce((sum, r) => sum + r.maxPoints, 0);

    return {
      results,
      totalScore,
      maxScore,
      percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      globalFeedback: 'Correction automatique (fallback)',
    };
  }
}

function normalizeAnswer(answer: string): string {
  return (answer || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
}

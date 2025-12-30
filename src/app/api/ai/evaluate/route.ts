import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import {
  evaluateQuizSession,
  evaluateExerciseSession,
  evaluateRevisionSession,
  saveActivityScore,
  updateStudentScoreFromAI,
  ActivityType,
} from '@/lib/ai-evaluation-service';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { aiChatId, activityType, activityId, courseId } = body;

    // Validation
    if (!aiChatId || !activityType || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: aiChatId, activityType, courseId' },
        { status: 400 }
      );
    }

    // 1. Récupérer la session chat
    const aiChat = await prisma.aIChat.findUnique({
      where: { id: aiChatId },
    });

    if (!aiChat) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    // 2. Vérifier que la session appartient à l'utilisateur
    if (aiChat.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Vérifier qu'elle n'a pas déjà été évaluée
    const existing = await prisma.aIActivityScore.findUnique({
      where: { aiChatId: aiChatId },
    });

    if (existing) {
      return NextResponse.json({ error: 'Session already evaluated' }, { status: 409 });
    }

    // 4. Préparer l'historique de chat
    const messages = aiChat.messages as Array<{ role: string; content: string; timestamp: string }>;
    const chatHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 5. Évaluer selon le type d'activité
    let evaluation;

    switch (activityType) {
      case 'QUIZ':
        // Pour l'instant, utiliser des données mockées
        evaluation = await evaluateQuizSession(
          chatHistory,
          {
            title: activityId ? `Quiz ${activityId}` : 'Quiz IA',
            questions: ['Question 1', 'Question 2', 'Question 3'],
          },
          aiChat.contextType || 'Cours général'
        );
        break;

      case 'EXERCISE':
        // Récupérer exercise si possible
        if (activityId) {
          const exercise = await prisma.exercise.findUnique({
            where: { id: activityId },
          });
          if (exercise) {
            evaluation = await evaluateExerciseSession(chatHistory, {
              title: exercise.title,
              description: exercise.statement,
            });
            break;
          }
        }
        // Fallback données mockées
        evaluation = await evaluateExerciseSession(chatHistory, {
          title: 'Exercice IA',
          description: 'Exercice assisté par IA',
        });
        break;

      case 'REVISION':
        evaluation = await evaluateRevisionSession(chatHistory, aiChat.contextType || 'Cours général');
        break;

      default:
        return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
    }

    // 6. Calculer durée et tokens
    const createdAt = new Date(aiChat.createdAt);
    const updatedAt = new Date(aiChat.updatedAt);
    const duration = Math.max(1, Math.floor((updatedAt.getTime() - createdAt.getTime()) / 60000)); // minutes

    // 7. Enregistrer le score
    await saveActivityScore(
      session.user.id,
      courseId,
      aiChatId,
      activityType as ActivityType,
      evaluation,
      {
        duration,
        messageCount: messages.length,
        tokens: 0, // TODO: tracker tokens réels
      }
    );

    // 8. Mettre à jour StudentScore
    await updateStudentScoreFromAI(session.user.id, courseId);

    // 9. Retourner l'évaluation
    const finalScore =
      evaluation.comprehension * 0.4 + evaluation.accuracy * 0.4 + evaluation.autonomy * 0.2;

    return NextResponse.json({
      success: true,
      data: {
        score: Math.round(finalScore),
        comprehension: evaluation.comprehension,
        accuracy: evaluation.accuracy,
        autonomy: evaluation.autonomy,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        recommendation: evaluation.recommendation,
      },
    });
  } catch (error) {
    console.error('AI evaluation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

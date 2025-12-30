import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * PATCH /api/chat/sessions/:id
 * Met à jour le statut d'une session chat
 * Si status = 'completed' ET activityType présent → déclenche évaluation IA
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: sessionId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status, activityType, activityId, courseId } = body;

    // Vérifier que la session appartient à l'utilisateur
    const existingChat = await prisma.aIChat.findUnique({
      where: { id: sessionId },
    });

    if (!existingChat) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (existingChat.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mettre à jour la session (pour l'instant, on stocke juste dans contextType)
    const updatedSession = await prisma.aIChat.update({
      where: { id: sessionId },
      data: {
        updatedAt: new Date(),
        // Note: AIChat n'a pas de champ status, on utilise contextType pour stocker l'info
        contextType: status === 'completed' ? 'completed' : existingChat.contextType,
      },
    });

    // Si session terminée ET activityType présent, déclencher évaluation IA
    if (status === 'completed' && activityType && courseId) {
      // Appel asynchrone (ne pas bloquer la réponse)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      // Note: Dans un vrai environnement, il faudrait utiliser une queue (Redis, BullMQ)
      // Pour l'instant, on fait un fetch asynchrone
      fetch(`${baseUrl}/api/ai/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Passer le cookie pour auth
          Cookie: req.headers.get('cookie') || '',
        },
        body: JSON.stringify({
          aiChatId: sessionId,
          activityType,
          courseId,
          activityId,
        }),
      }).catch((err) => {
        console.error('❌ Failed to trigger AI evaluation:', err);
        // Ne pas bloquer la réponse, juste logger
      });

      console.log(
        `✅ Triggered AI evaluation for session ${sessionId} (${activityType})`
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

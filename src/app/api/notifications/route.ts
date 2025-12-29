import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/notifications
 * Récupère les notifications de l'utilisateur connecté
 * Query params: ?unreadOnly=true pour filtrer les non-lues
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limiter à 50 notifications
    });

    // Compter les non-lues
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Erreur API GET /api/notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PUT /api/notifications
 * Marquer une ou toutes les notifications comme lues
 * Body: { id: string } pour une seule, { markAllRead: true } pour toutes
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      // Marquer toutes les notifications comme lues
      const result = await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} notification(s) marquée(s) comme lue(s)`,
      });
    }

    if (id) {
      // Marquer une notification spécifique comme lue
      // Vérifier que la notification appartient à l'utilisateur
      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId: session.user.id,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification non trouvée' },
          { status: 404 }
        );
      }

      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Notification marquée comme lue',
      });
    }

    return NextResponse.json(
      { error: 'Paramètre manquant: id ou markAllRead' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur API PUT /api/notifications:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

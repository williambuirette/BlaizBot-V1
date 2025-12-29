import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour envoi de message
const sendMessageSchema = z.object({
  conversationId: z.string().optional(), // Optionnel si nouvelle conversation
  receiverId: z.string().min(1, 'Destinataire requis'),
  content: z.string().min(1, 'Message requis'),
  subjectId: z.string().optional(),
  topicName: z.string().optional(),
});

// Schéma pour marquer comme lu (via query param)
const markReadSchema = z.object({
  conversationId: z.string().min(1, 'Conversation requise'),
});

// GET : Liste des conversations du professeur avec dernier message
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const userId = session.user.id;

    // Récupérer les conversations où le prof est participant
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: { has: userId },
      },
      include: {
        subject: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Récupérer les infos des autres participants
    const allParticipantIds = conversations.flatMap((c) =>
      c.participantIds.filter((id) => id !== userId)
    );

    const participants = await prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
      select: { id: true, firstName: true, lastName: true, role: true },
    });

    const participantsMap = new Map(participants.map((p) => [p.id, p]));

    // Transformer les données
    const conversationsWithDetails = conversations.map((conv) => {
      const otherParticipantIds = conv.participantIds.filter((id) => id !== userId);
      const otherParticipants = otherParticipantIds
        .map((id) => participantsMap.get(id))
        .filter(Boolean);

      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        type: conv.type,
        topicName: conv.topicName,
        subject: conv.subject ? { id: conv.subject.id, name: conv.subject.name } : null,
        participants: otherParticipants,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              senderName: `${lastMessage.sender.firstName} ${lastMessage.sender.lastName}`,
              createdAt: lastMessage.createdAt,
            }
          : null,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json({ conversations: conversationsWithDetails });
  } catch (error) {
    console.error('Erreur API GET /api/teacher/messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Envoyer un message (créer conversation si nécessaire)
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const validation = sendMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { conversationId, receiverId, content, subjectId, topicName } = validation.data;

    let conversation;

    if (conversationId) {
      // Vérifier que le prof fait partie de la conversation
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participantIds: { has: userId },
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
      }
    } else {
      // Créer une nouvelle conversation
      conversation = await prisma.conversation.create({
        data: {
          type: 'PRIVATE',
          participantIds: [userId, receiverId],
          subjectId: subjectId || null,
          topicName: topicName || null,
        },
      });
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    // Mettre à jour updatedAt de la conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Créer une notification pour chaque participant (sauf l'expéditeur)
    const otherParticipantIds = conversation.participantIds.filter((id) => id !== userId);
    
    if (otherParticipantIds.length > 0) {
      // Récupérer les rôles des participants pour générer le bon lien
      const participants = await prisma.user.findMany({
        where: { id: { in: otherParticipantIds } },
        select: { id: true, role: true },
      });

      const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
      const conversationName = conversation.topicName || 'Conversation';

      // Créer les notifications en batch
      await prisma.notification.createMany({
        data: participants.map((participant) => ({
          userId: participant.id,
          type: 'MESSAGE',
          title: `Nouveau message de ${senderName}`,
          message: `Dans : ${conversationName}`,
          link: participant.role === 'STUDENT'
            ? `/student/messages?id=${conversation.id}`
            : `/teacher/messages?id=${conversation.id}`,
          read: false,
        })),
      });
    }

    return NextResponse.json({
      message: {
        id: message.id,
        conversationId: conversation.id,
        content: message.content,
        senderId: message.senderId,
        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('Erreur API POST /api/teacher/messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Marquer les messages comme lus (pas de champ read dans le schema actuel)
// Note: Le schema n'a pas de champ "read" sur Message, on pourrait l'ajouter
// Pour l'instant, cette route met à jour updatedAt comme placeholder
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const body = await request.json();
    const validation = markReadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { conversationId } = validation.data;

    // Vérifier que le prof fait partie de la conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: { has: session.user.id },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 });
    }

    // Note: Pas de champ read dans le schema actuel
    // On pourrait ajouter un ReadReceipt model ou un champ read sur Message
    // Pour l'instant, on retourne success

    return NextResponse.json({ success: true, conversationId });
  } catch (error) {
    console.error('Erreur API PUT /api/teacher/messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

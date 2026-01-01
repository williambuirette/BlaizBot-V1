import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// GET : Récupérer les messages d'une conversation
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: conversationId } = await context.params;

    // Vérifier que l'utilisateur est participant de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    }

    const isParticipant = conversation.participantIds.includes(session.user.id);

    if (!isParticipant) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Transformer les données
    const messagesFormatted = messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      senderName: `${msg.User.firstName} ${msg.User.lastName}`,
      senderRole: msg.User.role,
      createdAt: msg.createdAt,
      attachments: msg.attachments || [],
    }));

    return NextResponse.json({ messages: messagesFormatted });
  } catch (error) {
    console.error('Erreur API GET /api/teacher/messages/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Envoyer un message dans une conversation (avec fichiers optionnels)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: conversationId } = await context.params;
    const formData = await req.formData();
    const content = formData.get('content') as string;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est participant de la conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    }

    const isParticipant = conversation.participantIds.includes(session.user.id);

    if (!isParticipant) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer les fichiers (si présents)
    const files = formData.getAll('attachments') as File[];
    console.log(`📎 ${files.length} fichier(s) joint(s)`);

    // Générer un ID unique pour ce message (nécessaire pour créer le dossier avant)
    const messageId = randomUUID();

    let attachmentsData = null;

    if (files.length > 0) {
      try {
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
      } catch (error) {
        console.error('❌ Erreur sauvegarde fichiers:', error);
        // Nettoyer les fichiers en cas d'erreur
        const uploadDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          'messages',
          conversationId,
          messageId
        );
        await fs.rm(uploadDir, { recursive: true, force: true });
        throw error;
      }
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        id: messageId, // Utiliser l'ID généré plus haut
        conversationId,
        senderId: session.user.id,
        content: content.trim(),
        attachments: attachmentsData,
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Mettre à jour updatedAt de la conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Créer des notifications pour les autres participants
    const otherParticipantIds = conversation.participantIds.filter(
      (id) => id !== session.user.id
    );

    if (otherParticipantIds.length > 0) {
      const participants = await prisma.user.findMany({
        where: { id: { in: otherParticipantIds } },
        select: { id: true, role: true },
      });

      const senderName = `${message.User.firstName} ${message.User.lastName}`;
      const conversationName = conversation.topicName || 'Conversation';

      await prisma.notification.createMany({
        data: participants.map((participant) => ({
          id: randomUUID(),
          userId: participant.id,
          type: 'MESSAGE',
          title: `Nouveau message de ${senderName}`,
          message: `Dans : ${conversationName}`,
          link:
            participant.role === 'STUDENT'
              ? `/student/messages?id=${conversation.id}`
              : `/teacher/messages?id=${conversation.id}`,
          read: false,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        senderName: `${message.User.firstName} ${message.User.lastName}`,
        senderRole: message.User.role,
        attachments: message.attachments || [],
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Erreur POST /api/teacher/messages/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

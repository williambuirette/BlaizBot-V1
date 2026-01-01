import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

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

      console.log(`📥 Téléchargement fichier : ${downloadFilename}`);

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
  } catch (error) {
    console.error('❌ Erreur GET /api/teacher/messages/[id]/files:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

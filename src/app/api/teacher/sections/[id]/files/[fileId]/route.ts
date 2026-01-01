// src/app/api/teacher/sections/[id]/files/[fileId]/route.ts
// API pour supprimer un fichier de section

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Supprimer un fichier de section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: sectionId, fileId } = await params;

    // Vérifier que le fichier appartient à une section d'un cours du prof
    const file = await prisma.sectionFile.findFirst({
      where: {
        id: fileId,
        sectionId,
        Section: {
          Chapter: {
            Course: {
              TeacherProfile: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
    }

    // TODO: Supprimer le fichier du storage si hébergé (Vercel Blob, S3, etc.)

    await prisma.sectionFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE section file:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

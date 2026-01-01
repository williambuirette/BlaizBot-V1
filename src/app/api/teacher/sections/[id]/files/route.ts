// src/app/api/teacher/sections/[id]/files/route.ts
// API pour gérer les fichiers de base de connaissance d'une section

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les fichiers d'une section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: sectionId } = await params;

    // Vérifier que la section appartient à un cours du prof
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        Chapter: {
          Course: {
            TeacherProfile: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section non trouvée' }, { status: 404 });
    }

    const files = await prisma.sectionFile.findMany({
      where: { sectionId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Erreur GET section files:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Ajouter un fichier à une section
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: sectionId } = await params;

    // Vérifier que la section appartient à un cours du prof
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        Chapter: {
          Course: {
            TeacherProfile: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section non trouvée' }, { status: 404 });
    }

    const body = await request.json();
    const { filename, fileType, url, size } = body;

    if (!filename || !url) {
      return NextResponse.json(
        { error: 'Filename et URL requis' },
        { status: 400 }
      );
    }

    const file = await prisma.sectionFile.create({
      data: {
        sectionId,
        filename,
        fileType: fileType || 'application/octet-stream',
        url,
        size: size || null,
      },
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST section file:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

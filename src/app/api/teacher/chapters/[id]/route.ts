// src/app/api/teacher/chapters/[id]/route.ts
// API pour un chapitre spécifique (GET, PUT, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Vérifier que le chapitre appartient au prof
async function verifyChapterOwnership(chapterId: string, userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
  });

  if (!teacherProfile) return null;

  const chapter = await prisma.chapter.findFirst({
    where: {
      id: chapterId,
      Course: {
        teacherId: teacherProfile.id,
      },
    },
    include: {
      Course: {
        select: { id: true, title: true },
      },
      _count: {
        select: { Section: true },
      },
      Section: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          type: true,
          order: true,
          duration: true,
        },
      },
    },
  });

  return chapter;
}

// GET : Détails d'un chapitre avec sections
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: chapterId } = await context.params;
    const chapter = await verifyChapterOwnership(chapterId, userId);

    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé ou accès non autorisé' }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Erreur GET chapter:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier un chapitre
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: chapterId } = await context.params;
    const chapter = await verifyChapterOwnership(chapterId, userId);

    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, order } = body;

    // Construire les données à mettre à jour
    const updateData: {
      title?: string;
      description?: string | null;
      order?: number;
    } = {};

    if (title !== undefined) {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Le titre ne peut pas être vide' }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (order !== undefined && typeof order === 'number') {
      updateData.order = order;
    }

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: updateData,
      include: {
        _count: {
          select: { Section: true },
        },
        Section: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            type: true,
            order: true,
            duration: true,
          },
        },
      },
    });

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error('Erreur PUT chapter:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer un chapitre (cascade sections)
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: chapterId } = await context.params;
    const chapter = await verifyChapterOwnership(chapterId, userId);

    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé ou accès non autorisé' }, { status: 404 });
    }

    // Supprimer le chapitre (cascade sur sections)
    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({ success: true, message: 'Chapitre supprimé' });
  } catch (error) {
    console.error('Erreur DELETE chapter:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// src/app/api/teacher/sections/[id]/route.ts
// API pour une section spécifique (GET, PUT, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SectionType } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Vérifier que la section appartient au prof
async function verifySectionOwnership(sectionId: string, userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
  });

  if (!teacherProfile) return null;

  const section = await prisma.section.findFirst({
    where: {
      id: sectionId,
      chapter: {
        course: {
          teacherId: teacherProfile.id,
        },
      },
    },
    include: {
      chapter: {
        select: {
          id: true,
          title: true,
          course: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  return section;
}

// GET : Détails d'une section (avec contenu complet)
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

    const { id: sectionId } = await context.params;
    const section = await verifySectionOwnership(sectionId, userId);

    if (!section) {
      return NextResponse.json({ error: 'Section non trouvée ou accès non autorisé' }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Erreur GET section:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier une section
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

    const { id: sectionId } = await context.params;
    const section = await verifySectionOwnership(sectionId, userId);

    if (!section) {
      return NextResponse.json({ error: 'Section non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { title, type, content, order, duration } = body;

    // Construire les données à mettre à jour
    const updateData: {
      title?: string;
      type?: SectionType;
      content?: string | null;
      order?: number;
      duration?: number | null;
    } = {};

    if (title !== undefined) {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Le titre ne peut pas être vide' }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (type !== undefined) {
      const validTypes: SectionType[] = ['LESSON', 'EXERCISE', 'QUIZ', 'VIDEO'];
      if (validTypes.includes(type)) {
        updateData.type = type;
      }
    }

    if (content !== undefined) {
      updateData.content = content || null;
    }

    if (order !== undefined && typeof order === 'number') {
      updateData.order = order;
    }

    if (duration !== undefined) {
      updateData.duration = duration ? parseInt(duration, 10) : null;
    }

    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: updateData,
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Erreur PUT section:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer une section
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

    const { id: sectionId } = await context.params;
    const section = await verifySectionOwnership(sectionId, userId);

    if (!section) {
      return NextResponse.json({ error: 'Section non trouvée ou accès non autorisé' }, { status: 404 });
    }

    await prisma.section.delete({
      where: { id: sectionId },
    });

    return NextResponse.json({ success: true, message: 'Section supprimée' });
  } catch (error) {
    console.error('Erreur DELETE section:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

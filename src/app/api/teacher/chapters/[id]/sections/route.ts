// src/app/api/teacher/chapters/[id]/sections/route.ts
// API CRUD pour les sections d'un chapitre

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SectionType } from '@prisma/client';

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
      course: {
        teacherId: teacherProfile.id,
      },
    },
  });

  return chapter;
}

// GET : Liste les sections d'un chapitre
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

    const sections = await prisma.section.findMany({
      where: { chapterId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        type: true,
        order: true,
        duration: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Ajouter un flag hasContent pour ne pas exposer tout le contenu
    const sectionsWithMeta = sections.map((s) => ({
      ...s,
      hasContent: !!s.content && s.content.length > 0,
      // Ne pas exposer le contenu complet dans la liste
      content: undefined,
    }));

    return NextResponse.json(sectionsWithMeta);
  } catch (error) {
    console.error('Erreur GET sections:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer une section
export async function POST(request: NextRequest, context: RouteContext) {
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
    const { title, type, content, duration } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    // Valider le type
    const validTypes: SectionType[] = ['LESSON', 'EXERCISE', 'QUIZ', 'VIDEO'];
    const sectionType: SectionType = validTypes.includes(type) ? type : 'LESSON';

    // Calculer l'ordre (max + 1)
    const maxOrder = await prisma.section.aggregate({
      where: { chapterId },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? -1) + 1;

    const section = await prisma.section.create({
      data: {
        chapterId,
        title: title.trim(),
        type: sectionType,
        content: content || null,
        duration: duration ? parseInt(duration, 10) : null,
        order: newOrder,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Erreur POST section:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// src/app/api/teacher/courses/[id]/chapters/route.ts
// API CRUD pour les chapitres d'un cours

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET : Liste les chapitres d'un cours
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: courseId } = await context.params;

    // Vérifier que le prof est propriétaire du cours
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil enseignant non trouvé' }, { status: 404 });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: teacherProfile.id,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé ou accès non autorisé' }, { status: 404 });
    }

    // Récupérer les chapitres avec le count des sections
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
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
            content: true,
          },
        },
      },
    });

    // Transformer Section -> sections pour le frontend
    const chaptersWithSections = chapters.map((chapter) => ({
      ...chapter,
      sections: chapter.Section,
      Section: undefined,
    }));

    return NextResponse.json(chaptersWithSections);
  } catch (error) {
    console.error('Erreur GET chapters:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer un chapitre
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: courseId } = await context.params;
    const body = await request.json();
    const { title, description } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    // Vérifier que le prof est propriétaire du cours
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil enseignant non trouvé' }, { status: 404 });
    }

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId: teacherProfile.id,
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé ou accès non autorisé' }, { status: 404 });
    }

    // Calculer l'ordre (max + 1)
    const maxOrder = await prisma.chapter.aggregate({
      where: { courseId },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? -1) + 1;

    // Générer un ID unique
    const chapterId = `chapter-${courseId}-${Date.now()}`;

    // Créer le chapitre
    const chapter = await prisma.chapter.create({
      data: {
        id: chapterId,
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        order: newOrder,
        updatedAt: new Date(),
      },
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

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Erreur POST chapter:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

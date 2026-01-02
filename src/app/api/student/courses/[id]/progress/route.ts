import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';

interface ProgressParams {
  params: Promise<{ id: string }>;
}

const progressSchema = z.object({
  chapterId: z.string().min(1),
  completed: z.boolean(),
});

// POST : Marquer un chapitre comme terminé et mettre à jour le pourcentage
export async function POST(request: Request, { params }: ProgressParams) {
  try {
    const session = await auth();
    const { id: courseId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès réservé aux élèves' }, { status: 403 });
    }

    const body = await request.json();
    const validation = progressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { chapterId, completed } = validation.data;

    // Récupérer le StudentProfile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: 'Profil élève non trouvé' }, { status: 404 });
    }

    // Vérifier que le chapitre appartient au cours
    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, courseId },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapitre non trouvé' }, { status: 404 });
    }

    // Compter le nombre total de chapitres du cours
    const totalChapters = await prisma.chapter.count({
      where: { courseId },
    });

    // Récupérer ou créer la progression du cours
    let progression = await prisma.progression.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId,
        },
      },
    });

    // Calculer le nouveau pourcentage
    // Pour simplifier, on incrémente de 1/totalChapters si completed
    let newPercentage = progression?.percentage || 0;
    
    if (completed && totalChapters > 0) {
      // Incrémenter le pourcentage (simplifié - en production on stockerait les chapitres complétés)
      const incrementPerChapter = 100 / totalChapters;
      newPercentage = Math.min(100, newPercentage + incrementPerChapter);
    }

    // Upsert la progression
    progression = await prisma.progression.upsert({
      where: {
        studentId_courseId: {
          studentId: studentProfile.id,
          courseId,
        },
      },
      update: {
        percentage: newPercentage,
        lastActivity: new Date(),
        updatedAt: new Date(),
      },
      create: {
        id: randomUUID(),
        studentId: studentProfile.id,
        courseId,
        percentage: newPercentage,
        lastActivity: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { 
        progression,
        chapterCompleted: completed,
      },
    });
  } catch (error) {
    console.error('Erreur API POST /api/student/courses/[id]/progress:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

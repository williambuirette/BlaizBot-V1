// src/app/api/teacher/assignments/[id]/progress/route.ts
// API pour gérer la progression des élèves sur une assignation

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProgressStatus } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Vérifier que l'assignation appartient au prof
async function verifyAssignmentOwnership(assignmentId: string, userId: string) {
  const assignment = await prisma.courseAssignment.findFirst({
    where: {
      id: assignmentId,
      teacherId: userId,
    },
  });

  return assignment;
}

// GET : Liste des progressions élèves
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }
    const assignment = await verifyAssignmentOwnership(assignmentId, userId);

    if (!assignment) {
      return NextResponse.json({ error: 'Assignation non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const progressList = await prisma.studentProgress.findMany({
      where: { assignmentId },
      orderBy: [
        { status: 'asc' },
        { updatedAt: 'desc' },
      ],
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Section: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(progressList);
  } catch (error) {
    console.error('Erreur GET progress:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Mettre à jour la progression d'un élève
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: assignmentId } = await context.params;
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }
    const assignment = await verifyAssignmentOwnership(assignmentId, userId);

    if (!assignment) {
      return NextResponse.json({ error: 'Assignation non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { studentId, status, score } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId requis' }, { status: 400 });
    }

    // Trouver la progression de l'élève
    const progress = await prisma.studentProgress.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
    });

    if (!progress) {
      return NextResponse.json({ error: 'Progression non trouvée pour cet élève' }, { status: 404 });
    }

    // Construire les données à mettre à jour
    const updateData: {
      status?: ProgressStatus;
      score?: number | null;
      completedAt?: Date | null;
    } = {};

    if (status !== undefined) {
      const validStatuses: ProgressStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'GRADED'];
      if (validStatuses.includes(status)) {
        updateData.status = status;

        // Si complété ou noté, enregistrer la date
        if (status === 'COMPLETED' || status === 'GRADED') {
          updateData.completedAt = new Date();
        } else {
          updateData.completedAt = null;
        }
      }
    }

    if (score !== undefined) {
      updateData.score = score !== null ? parseFloat(score) : null;
      // Si on met une note, passer automatiquement à GRADED
      if (score !== null && !updateData.status) {
        updateData.status = 'GRADED';
        updateData.completedAt = new Date();
      }
    }

    const updatedProgress = await prisma.studentProgress.update({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        Section: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Erreur PUT progress:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

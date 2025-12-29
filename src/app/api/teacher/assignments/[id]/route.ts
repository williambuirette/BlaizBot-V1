// src/app/api/teacher/assignments/[id]/route.ts
// API pour une assignation spécifique (GET, PUT, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    include: {
      course: { select: { id: true, title: true } },
      chapter: { select: { id: true, title: true } },
      section: { select: { id: true, title: true, type: true } },
      class: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
      student: { select: { id: true, firstName: true, lastName: true } },
      progress: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return assignment;
}

// GET : Détails d'une assignation avec progression de chaque élève
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

    const { id: assignmentId } = await context.params;
    const assignment = await verifyAssignmentOwnership(assignmentId, userId);

    if (!assignment) {
      return NextResponse.json({ error: 'Assignation non trouvée ou accès non autorisé' }, { status: 404 });
    }

    // Calculer les stats
    const total = assignment.progress.length;
    const completed = assignment.progress.filter((p) => p.status === 'COMPLETED' || p.status === 'GRADED').length;
    const inProgress = assignment.progress.filter((p) => p.status === 'IN_PROGRESS').length;

    return NextResponse.json({
      ...assignment,
      stats: {
        total,
        completed,
        inProgress,
        notStarted: total - completed - inProgress,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Erreur GET assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier une assignation (titre, instructions, dueDate)
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
    const { title, instructions, dueDate } = body;

    // Construire les données à mettre à jour
    const updateData: {
      title?: string;
      instructions?: string | null;
      dueDate?: Date | null;
    } = {};

    if (title !== undefined) {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Le titre ne peut pas être vide' }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (instructions !== undefined) {
      updateData.instructions = instructions?.trim() || null;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    const updatedAssignment = await prisma.courseAssignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        course: { select: { id: true, title: true } },
        chapter: { select: { id: true, title: true } },
        section: { select: { id: true, title: true, type: true } },
        class: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { progress: true } },
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error('Erreur PUT assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer une assignation (cascade progress)
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    await prisma.courseAssignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({ success: true, message: 'Assignation supprimée' });
  } catch (error) {
    console.error('Erreur DELETE assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

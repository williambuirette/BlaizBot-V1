// src/app/api/teacher/assignments/[id]/route.ts
// API pour une assignation spécifique (GET, PUT, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AssignmentPriority } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Vérifier que l'assignation appartient au prof
async function verifyAssignmentOwnership(assignmentId: string, teacherProfileId: string) {
  const assignment = await prisma.courseAssignment.findFirst({
    where: {
      id: assignmentId,
      teacherId: teacherProfileId,
    },
    include: {
      Course: { select: { id: true, title: true } },
      Chapter: { select: { id: true, title: true } },
      Section: { select: { id: true, title: true, type: true } },
      Class: { select: { id: true, name: true } },
      Team: { select: { id: true, name: true } },
      User_CourseAssignment_studentIdToUser: { select: { id: true, firstName: true, lastName: true } },
      Parent: { select: { id: true, title: true } },
      Children: { select: { id: true, title: true, dueDate: true } },
      StudentProgress: {
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      _count: { select: { Children: true, StudentProgress: true } },
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

    // Récupérer le TeacherProfile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    const { id: assignmentId } = await context.params;
    const assignment = await verifyAssignmentOwnership(assignmentId, teacherProfile.id);

    if (!assignment) {
      return NextResponse.json({ error: 'Assignation non trouvée ou accès non autorisé' }, { status: 404 });
    }

    // Calculer les stats
    const progress = assignment.StudentProgress;
    const total = progress.length;
    const completed = progress.filter((p: { status: string }) => p.status === 'COMPLETED' || p.status === 'GRADED').length;
    const inProgress = progress.filter((p: { status: string }) => p.status === 'IN_PROGRESS').length;

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

// PUT : Modifier une assignation (titre, instructions, dueDate, priority, etc.)
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

    // Récupérer le TeacherProfile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    const { id: assignmentId } = await context.params;
    const assignment = await verifyAssignmentOwnership(assignmentId, teacherProfile.id);

    if (!assignment) {
      return NextResponse.json({ error: 'Assignation non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { title, instructions, startDate, dueDate, priority, isRecurring, recurrenceRule } = body;

    // Construire les données à mettre à jour
    const updateData: {
      title?: string;
      instructions?: string | null;
      startDate?: Date | null;
      dueDate?: Date | null;
      priority?: AssignmentPriority;
      isRecurring?: boolean;
      recurrenceRule?: string | null;
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

    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    if (priority !== undefined && ['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      updateData.priority = priority as AssignmentPriority;
    }

    if (isRecurring !== undefined) {
      updateData.isRecurring = isRecurring;
      if (!isRecurring) {
        updateData.recurrenceRule = null;
      }
    }

    if (recurrenceRule !== undefined && isRecurring) {
      updateData.recurrenceRule = recurrenceRule;
    }

    const updatedAssignment = await prisma.courseAssignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        Course: { select: { id: true, title: true } },
        Chapter: { select: { id: true, title: true } },
        Section: { select: { id: true, title: true, type: true } },
        Class: { select: { id: true, name: true } },
        Team: { select: { id: true, name: true } },
        User_CourseAssignment_studentIdToUser: { select: { id: true, firstName: true, lastName: true } },
        Parent: { select: { id: true, title: true } },
        _count: { select: { StudentProgress: true, Children: true } },
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error('Erreur PUT assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer une assignation (cascade progress + children)
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

    // Récupérer le TeacherProfile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    const { id: assignmentId } = await context.params;
    const assignment = await verifyAssignmentOwnership(assignmentId, teacherProfile.id);

    if (!assignment) {
      return NextResponse.json({ error: 'Assignation non trouvée ou accès non autorisé' }, { status: 404 });
    }

    // Si c'est une assignation parent avec des enfants, supprimer aussi les enfants
    const childCount = assignment._count?.Children ?? 0;
    if (childCount > 0) {
      await prisma.courseAssignment.deleteMany({
        where: { parentId: assignmentId },
      });
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

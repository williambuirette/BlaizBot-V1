// src/app/api/teacher/assignments/route.ts
// API pour les assignations de cours/chapitres/sections

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CourseAssignmentTarget, ProgressStatus } from '@prisma/client';

// GET : Liste mes assignations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');

    // Construire le filtre
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const whereClause: {
      teacherId: string;
      courseId?: string;
      classId?: string;
      progress?: { some: { status: ProgressStatus } };
    } = {
      teacherId: userId,
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    if (classId) {
      whereClause.classId = classId;
    }

    // Filtrer par statut de progression (au moins un élève avec ce statut)
    if (status && ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'GRADED'].includes(status)) {
      whereClause.progress = {
        some: { status: status as ProgressStatus },
      };
    }

    const assignments = await prisma.courseAssignment.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          select: { id: true, title: true },
        },
        chapter: {
          select: { id: true, title: true },
        },
        section: {
          select: { id: true, title: true, type: true },
        },
        class: {
          select: { id: true, name: true },
        },
        team: {
          select: { id: true, name: true },
        },
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { progress: true },
        },
        progress: {
          select: {
            status: true,
          },
        },
      },
    });

    // Calculer les stats de progression pour chaque assignation
    const assignmentsWithStats = assignments.map((a) => {
      const total = a.progress.length;
      const completed = a.progress.filter((p) => p.status === 'COMPLETED' || p.status === 'GRADED').length;
      const inProgress = a.progress.filter((p) => p.status === 'IN_PROGRESS').length;

      return {
        ...a,
        progress: undefined, // Ne pas exposer la liste complète
        stats: {
          total,
          completed,
          inProgress,
          notStarted: total - completed - inProgress,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    });

    return NextResponse.json(assignmentsWithStats);
  } catch (error) {
    console.error('Erreur GET assignments:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer une assignation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      instructions,
      courseId,
      chapterId,
      sectionId,
      targetType,
      classId,
      teamId,
      studentId,
      dueDate,
    } = body;

    // Validations
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    if (!targetType || !['CLASS', 'TEAM', 'STUDENT'].includes(targetType)) {
      return NextResponse.json({ error: 'Type de cible invalide' }, { status: 400 });
    }

    // Vérifier qu'au moins un contenu est assigné
    if (!courseId && !chapterId && !sectionId) {
      return NextResponse.json({ error: 'Vous devez assigner un cours, un chapitre ou une section' }, { status: 400 });
    }

    // Vérifier la cible selon le type
    if (targetType === 'CLASS' && !classId) {
      return NextResponse.json({ error: 'Classe requise pour ce type d\'assignation' }, { status: 400 });
    }
    if (targetType === 'TEAM' && !teamId) {
      return NextResponse.json({ error: 'Équipe requise pour ce type d\'assignation' }, { status: 400 });
    }
    if (targetType === 'STUDENT' && !studentId) {
      return NextResponse.json({ error: 'Élève requis pour ce type d\'assignation' }, { status: 400 });
    }

    // Vérifier l'ID utilisateur
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    // Créer l'assignation
    const assignment = await prisma.courseAssignment.create({
      data: {
        teacherId: userId,
        title: title.trim(),
        instructions: instructions?.trim() || null,
        courseId: courseId || null,
        chapterId: chapterId || null,
        sectionId: sectionId || null,
        targetType: targetType as CourseAssignmentTarget,
        classId: targetType === 'CLASS' ? classId : null,
        teamId: targetType === 'TEAM' ? teamId : null,
        studentId: targetType === 'STUDENT' ? studentId : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Créer les entrées StudentProgress pour chaque élève concerné
    let studentIds: string[] = [];

    if (targetType === 'CLASS' && classId) {
      const students = await prisma.studentProfile.findMany({
        where: { classId },
        select: { userId: true },
      });
      studentIds = students.map((s) => s.userId);
    } else if (targetType === 'TEAM' && teamId) {
      const members = await prisma.teamMember.findMany({
        where: { teamId },
        select: { studentId: true },
      });
      studentIds = members.map((m) => m.studentId);
    } else if (targetType === 'STUDENT' && studentId) {
      studentIds = [studentId];
    }

    // Créer les entrées de progression
    if (studentIds.length > 0) {
      await prisma.studentProgress.createMany({
        data: studentIds.map((sid) => ({
          assignmentId: assignment.id,
          studentId: sid,
          sectionId: sectionId || null,
          status: 'NOT_STARTED' as ProgressStatus,
        })),
        skipDuplicates: true,
      });
    }

    // Retourner l'assignation avec les stats
    const fullAssignment = await prisma.courseAssignment.findUnique({
      where: { id: assignment.id },
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

    return NextResponse.json({
      ...fullAssignment,
      stats: {
        total: studentIds.length,
        completed: 0,
        inProgress: 0,
        notStarted: studentIds.length,
        completionRate: 0,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

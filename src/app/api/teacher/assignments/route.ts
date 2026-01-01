// src/app/api/teacher/assignments/route.ts
// API pour les assignations de cours/chapitres/sections

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CourseAssignmentTarget, ProgressStatus, AssignmentPriority } from '@prisma/client';

// GET : Liste mes assignations
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const recurring = searchParams.get('recurring');

    // Construire le filtre
    const whereClause: {
      teacherId: string;
      courseId?: string;
      classId?: string;
      priority?: AssignmentPriority;
      isRecurring?: boolean;
      dueDate?: { gte?: Date; lte?: Date };
      StudentProgress?: { some: { status?: ProgressStatus; studentId?: string } };
    } = {
      teacherId: teacherProfile.id,
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    if (classId) {
      whereClause.classId = classId;
    }

    // Filtrer par élève : chercher les assignations où il a un StudentProgress
    if (studentId) {
      whereClause.StudentProgress = {
        some: { studentId },
      };
    }

    // Filtrer par priorité
    if (priority && ['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      whereClause.priority = priority as AssignmentPriority;
    }

    // Filtrer par récurrence
    if (recurring === 'true') {
      whereClause.isRecurring = true;
    } else if (recurring === 'false') {
      whereClause.isRecurring = false;
    }

    // Filtrer par plage de dates (dueDate)
    if (startDate || endDate) {
      whereClause.dueDate = {};
      if (startDate) {
        whereClause.dueDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.dueDate.lte = new Date(endDate);
      }
    }

    // Filtrer par statut de progression (au moins un élève avec ce statut)
    if (status && ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'GRADED'].includes(status)) {
      if (whereClause.StudentProgress?.some) {
        // Combiner avec le filtre studentId existant
        whereClause.StudentProgress.some.status = status as ProgressStatus;
      } else {
        whereClause.StudentProgress = {
          some: { status: status as ProgressStatus },
        };
      }
    }

    console.log('GET assignments whereClause:', JSON.stringify(whereClause, null, 2));

    const assignments = await prisma.courseAssignment.findMany({
      where: whereClause,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        Course: {
          select: { id: true, title: true },
        },
        Chapter: {
          select: { id: true, title: true },
        },
        Section: {
          select: { id: true, title: true, type: true },
        },
        Class: {
          select: { id: true, name: true, color: true },
        },
        Team: {
          select: { id: true, name: true },
        },
        User_CourseAssignment_studentIdToUser: {
          select: { id: true, firstName: true, lastName: true },
        },
        Parent: {
          select: { id: true, title: true },
        },
        _count: {
          select: { StudentProgress: true, Children: true },
        },
        StudentProgress: {
          select: {
            id: true,
            status: true,
            studentId: true,
            User: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    // Récupérer les scores des étudiants pour chaque assignation
    const studentCourseKeys = assignments
      .filter(a => a.studentId && a.courseId)
      .map(a => ({ studentId: a.studentId!, courseId: a.courseId! }));

    const studentScores = studentCourseKeys.length > 0 
      ? await prisma.studentScore.findMany({
          where: {
            OR: studentCourseKeys.map(k => ({
              studentId: k.studentId,
              courseId: k.courseId,
            })),
          },
          select: {
            studentId: true,
            courseId: true,
            continuousScore: true,
            aiComprehension: true,
            examGrade: true,
            finalScore: true,
            quizAvg: true,
            exerciseAvg: true,
          },
        })
      : [];

    // Créer une map pour accès rapide
    const scoreMap = new Map(
      studentScores.map(s => [`${s.studentId}-${s.courseId}`, s])
    );

    // Calculer les stats de progression pour chaque assignation
    const assignmentsWithStats = assignments.map((a) => {
      const total = a.StudentProgress.length;
      const completed = a.StudentProgress.filter((p) => p.status === 'COMPLETED' || p.status === 'GRADED').length;
      const inProgress = a.StudentProgress.filter((p) => p.status === 'IN_PROGRESS').length;

      // Récupérer les KPI de l'élève pour ce cours
      const scoreKey = a.studentId ? `${a.studentId}-${a.courseId}` : null;
      const studentScore = scoreKey ? scoreMap.get(scoreKey) : null;

      return {
        ...a,
        // Inclure StudentProgress pour afficher la liste des élèves
        StudentProgress: a.StudentProgress,
        stats: {
          total,
          completed,
          inProgress,
          notStarted: total - completed - inProgress,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
        // KPI de l'élève
        kpi: studentScore ? {
          continuous: Math.round(studentScore.continuousScore || 0),
          ai: Math.round(studentScore.aiComprehension || 0),
          exam: studentScore.examGrade ? Number(studentScore.examGrade.toFixed(1)) : null,
          final: studentScore.finalScore ? Number(studentScore.finalScore.toFixed(1)) : null,
        } : null,
      };
    });

    console.log('GET assignments found:', assignmentsWithStats.length, 'assignments');

    return NextResponse.json({ success: true, data: assignmentsWithStats });
  } catch (error) {
    console.error('Erreur GET assignments:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer une assignation
export async function POST(request: NextRequest) {
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
      startDate,
      dueDate,
      priority,
      isRecurring,
      recurrenceRule,
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

    // Valider la priorité
    const validPriority = priority && ['LOW', 'MEDIUM', 'HIGH'].includes(priority)
      ? (priority as AssignmentPriority)
      : 'MEDIUM';

    // Créer l'assignation
    const assignment = await prisma.courseAssignment.create({
      data: {
        id: crypto.randomUUID(),
        teacherId: teacherProfile.id,
        title: title.trim(),
        instructions: instructions?.trim() || null,
        courseId: courseId || null,
        chapterId: chapterId || null,
        sectionId: sectionId || null,
        targetType: targetType as CourseAssignmentTarget,
        classId: targetType === 'CLASS' ? classId : null,
        teamId: targetType === 'TEAM' ? teamId : null,
        studentId: targetType === 'STUDENT' ? studentId : null,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: validPriority,
        isRecurring: isRecurring || false,
        recurrenceRule: isRecurring ? recurrenceRule : null,
        updatedAt: new Date(),
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
          id: crypto.randomUUID(),
          assignmentId: assignment.id,
          studentId: sid,
          sectionId: sectionId || null,
          status: 'NOT_STARTED' as ProgressStatus,
          updatedAt: new Date(),
        })),
        skipDuplicates: true,
      });
    }

    // Retourner l'assignation avec les stats
    const fullAssignment = await prisma.courseAssignment.findUnique({
      where: { id: assignment.id },
      include: {
        Course: { select: { id: true, title: true } },
        Chapter: { select: { id: true, title: true } },
        Section: { select: { id: true, title: true, type: true } },
        Class: { select: { id: true, name: true, color: true } },
        Team: { select: { id: true, name: true } },
        User_CourseAssignment_studentIdToUser: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { StudentProgress: true, Children: true } },
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

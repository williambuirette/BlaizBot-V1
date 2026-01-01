// src/app/api/teacher/assignments/grouped/route.ts
// API pour les assignations groupées (par date > classe > élève)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AssignmentPriority } from '@prisma/client';

interface GroupedAssignment {
  id: string;
  title: string;
  instructions: string | null;
  priority: AssignmentPriority;
  isRecurring: boolean;
  courseTitle: string | null;
  chapterTitle: string | null;
  sectionTitle: string | null;
  targetType: string;
  targetLabel: string;
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
  };
}

interface DateGroup {
  date: string;
  label: string;
  assignments: GroupedAssignment[];
}

interface ClassGroup {
  classId: string;
  className: string;
  dates: DateGroup[];
}

// GET : Récupérer les assignations groupées par date > classe
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
    const groupBy = searchParams.get('groupBy') || 'date'; // 'date' | 'class' | 'course'
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const courseId = searchParams.get('courseId');
    const classId = searchParams.get('classId');
    const priority = searchParams.get('priority');

    // Construire le filtre
    const whereClause: {
      teacherId: string;
      courseId?: string;
      classId?: string;
      priority?: AssignmentPriority;
      dueDate?: { gte?: Date; lte?: Date };
    } = {
      teacherId: teacherProfile.id,
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }
    if (classId) {
      whereClause.classId = classId;
    }
    if (priority && ['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      whereClause.priority = priority as AssignmentPriority;
    }
    if (startDate || endDate) {
      whereClause.dueDate = {};
      if (startDate) {
        whereClause.dueDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.dueDate.lte = new Date(endDate);
      }
    }

    const assignments = await prisma.courseAssignment.findMany({
      where: whereClause,
      include: {
        Course: { select: { id: true, title: true } },
        Chapter: { select: { id: true, title: true } },
        Section: { select: { id: true, title: true, type: true } },
        Class: { select: { id: true, name: true } },
        Team: { select: { id: true, name: true } },
        User_CourseAssignment_studentIdToUser: { select: { id: true, firstName: true, lastName: true } },
        StudentProgress: {
          select: { status: true },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    // Transformer en GroupedAssignment avec stats
    const transformedAssignments = assignments.map((a) => {
      const total = a.StudentProgress.length;
      const completed = a.StudentProgress.filter((p) => p.status === 'COMPLETED' || p.status === 'GRADED').length;
      const inProgress = a.StudentProgress.filter((p) => p.status === 'IN_PROGRESS').length;

      let targetLabel = '';
      if (a.Class) {
        targetLabel = a.Class.name;
      } else if (a.Team) {
        targetLabel = a.Team.name;
      } else if (a.User_CourseAssignment_studentIdToUser) {
        const u = a.User_CourseAssignment_studentIdToUser;
        targetLabel = `${u.firstName} ${u.lastName}`;
      }

      return {
        id: a.id,
        title: a.title,
        instructions: a.instructions,
        priority: a.priority,
        isRecurring: a.isRecurring,
        dueDate: a.dueDate,
        startDate: a.startDate,
        courseId: a.courseId,
        courseTitle: a.Course?.title || null,
        chapterTitle: a.Chapter?.title || null,
        sectionTitle: a.Section?.title || null,
        targetType: a.targetType,
        classId: a.classId,
        className: a.Class?.name || null,
        targetLabel,
        stats: {
          total,
          completed,
          inProgress,
          notStarted: total - completed - inProgress,
          completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
      };
    });

    // Grouper selon le paramètre
    if (groupBy === 'class') {
      // Grouper par classe > date
      const classGroups: Record<string, ClassGroup> = {};

      transformedAssignments.forEach((a) => {
        const classKey = a.classId || 'no-class';
        const className = a.className || 'Individuel';

        if (!classGroups[classKey]) {
          classGroups[classKey] = {
            classId: classKey,
            className,
            dates: [],
          };
        }

        const dateKey: string = a.dueDate ? a.dueDate.toISOString().split('T')[0]! : 'no-date';
        const dateLabel = a.dueDate
          ? new Date(a.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
          : 'Sans date';

        const existingDateGroup = classGroups[classKey].dates.find((d) => d.date === dateKey);
        if (existingDateGroup) {
          existingDateGroup.assignments.push(a);
        } else {
          classGroups[classKey].dates.push({ date: dateKey, label: dateLabel, assignments: [a] });
        }
      });

      // Trier les dates dans chaque classe
      Object.values(classGroups).forEach((cg) => {
        cg.dates.sort((a, b) => a.date.localeCompare(b.date));
      });

      return NextResponse.json({
        groupBy: 'class',
        groups: Object.values(classGroups),
        total: transformedAssignments.length,
      });
    }

    // Grouper par date (défaut)
    const dateGroups: Record<string, DateGroup> = {};

    transformedAssignments.forEach((a) => {
      const dateKey: string = a.dueDate ? a.dueDate.toISOString().split('T')[0]! : 'no-date';
      const dateLabel = a.dueDate
        ? new Date(a.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
        : 'Sans date limite';

      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = {
          date: dateKey,
          label: dateLabel,
          assignments: [],
        };
      }

      dateGroups[dateKey].assignments.push(a);
    });

    // Trier les dates
    const sortedGroups = Object.values(dateGroups).sort((a, b) => {
      if (a.date === 'no-date') return 1;
      if (b.date === 'no-date') return -1;
      return a.date.localeCompare(b.date);
    });

    return NextResponse.json({
      groupBy: 'date',
      groups: sortedGroups,
      total: transformedAssignments.length,
    });
  } catch (error) {
    console.error('Erreur GET grouped assignments:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

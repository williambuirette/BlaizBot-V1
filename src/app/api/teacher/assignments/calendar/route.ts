// src/app/api/teacher/assignments/calendar/route.ts
// API pour les événements calendrier (format compatible react-big-calendar)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET : Récupérer les assignations au format événements calendrier
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
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const courseId = searchParams.get('courseId');
    const classId = searchParams.get('classId');

    // Construire le filtre de dates
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Récupérer les assignations avec dates
    const whereClause: {
      teacherId: string;
      courseId?: string;
      classId?: string;
      OR?: Array<{ dueDate?: { gte?: Date; lte?: Date }; startDate?: { gte?: Date; lte?: Date } }>;
    } = {
      teacherId: teacherProfile.id,
    };

    // Filtrer par cours ou classe si spécifié
    if (courseId) {
      whereClause.courseId = courseId;
    }
    if (classId) {
      whereClause.classId = classId;
    }

    // Filtrer les assignations qui ont une date dans la plage
    if (startDate || endDate) {
      whereClause.OR = [
        { dueDate: dateFilter },
        { startDate: dateFilter },
      ];
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
      orderBy: [{ dueDate: 'asc' }, { startDate: 'asc' }],
    });

    // Transformer en format événements calendrier
    const events = assignments.map((a) => {
      // Calculer les stats
      const total = a.StudentProgress.length;
      const completed = a.StudentProgress.filter((p) => p.status === 'COMPLETED' || p.status === 'GRADED').length;
      const inProgress = a.StudentProgress.filter((p) => p.status === 'IN_PROGRESS').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Déterminer la couleur selon la priorité
      const colorMap = {
        HIGH: '#ef4444',    // rouge
        MEDIUM: '#f59e0b',  // orange
        LOW: '#22c55e',     // vert
      };

      // Déterminer le label du target
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
        // Pour react-big-calendar : start et end
        start: a.startDate || a.dueDate || a.createdAt,
        end: a.dueDate || a.startDate || a.createdAt,
        allDay: !a.startDate || !a.dueDate || (a.startDate === a.dueDate),
        // Données supplémentaires pour l'affichage
        resource: {
          assignmentId: a.id,
          courseTitle: a.Course?.title || null,
          chapterTitle: a.Chapter?.title || null,
          sectionTitle: a.Section?.title || null,
          targetType: a.targetType,
          targetLabel,
          priority: a.priority,
          isRecurring: a.isRecurring,
          instructions: a.instructions,
          stats: {
            total,
            completed,
            inProgress,
            notStarted: total - completed - inProgress,
            completionRate,
          },
          color: colorMap[a.priority],
        },
      };
    });

    return NextResponse.json({
      events,
      total: events.length,
    });
  } catch (error) {
    console.error('Erreur GET calendar events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

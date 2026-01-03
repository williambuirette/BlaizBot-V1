// src/app/api/student/agenda/route.ts
// API GET - Fusion des assignations professeur + événements personnels

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface AgendaItem {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  type: 'assignment' | 'personal' | 'course'; // Ajout type 'course'
  source: 'teacher' | 'student';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  targetType?: string;
  course?: { 
    id: string; 
    title: string; 
    subject?: { name: string; color?: string | null } 
  };
  class?: { id: string; name: string; color?: string | null };
  color: string;
  isEditable: boolean;
}

const PRIORITY_COLORS = {
  HIGH: '#ef4444',
  MEDIUM: '#f97316',
  LOW: '#22c55e',
};

const PERSONAL_COLOR = '#10b981'; // Vert pour événements perso

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Filtres
    const typeFilter = searchParams.get('type') || 'all'; // 'all' | 'teacher' | 'personal'
    const teacherIdsParam = searchParams.get('teacherIds'); // IDs séparés par virgule
    const teacherIds = teacherIdsParam ? teacherIdsParam.split(',').filter(Boolean) : [];
    const subjectIdsParam = searchParams.get('subjectIds'); // IDs séparés par virgule
    const subjectIds = subjectIdsParam ? subjectIdsParam.split(',').filter(Boolean) : [];
    const courseId = searchParams.get('courseId');
    const statusFilter = searchParams.get('status') || 'all'; // 'all' | 'pending' | 'completed'
    
    // Filtre plage de dates
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const startDate = startDateParam ? new Date(startDateParam) : null;
    const endDate = endDateParam ? new Date(endDateParam) : null;

    // 1. Trouver le StudentProfile de l'élève (contient classId)
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { id: true, classId: true },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: 'Profil élève non trouvé' }, { status: 404 });
    }

    const items: AgendaItem[] = [];

    // 2. Récupérer les assignations du professeur (si type = all ou teacher)
    if (typeFilter === 'all' || typeFilter === 'teacher') {
      const assignmentWhere: Record<string, unknown> = {
        OR: [
          { studentId: userId },
          { classId: studentProfile.classId },
          {
            targetType: 'CLASS',
            classId: studentProfile.classId,
          },
        ],
      };

      // Filtres optionnels sur le cours/matière
      if (subjectIds.length > 0) {
        assignmentWhere.Course = { subjectId: { in: subjectIds } };
      }
      if (courseId) {
        assignmentWhere.courseId = courseId;
      }
      // Filtre par profs sélectionnés
      if (teacherIds.length > 0) {
        assignmentWhere.teacherId = { in: teacherIds };
      }
      // Filtre plage de dates
      if (startDate && endDate) {
        assignmentWhere.dueDate = {
          gte: startDate,
          lte: endDate,
        };
      }

      const assignments = await prisma.courseAssignment.findMany({
        where: assignmentWhere,
        include: {
          Course: {
            include: { Subject: true },
          },
          Class: true,
          Chapter: true,
          Section: true,
          StudentProgress: {
            where: { studentId: userId },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      for (const a of assignments) {
        const progress = a.StudentProgress[0];
        const rawStatus = progress?.status || 'NOT_STARTED';
        // Convertir en type attendu
        const status = rawStatus as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

        // Filtrer par statut si demandé
        if (statusFilter === 'pending' && status === 'COMPLETED') continue;
        if (statusFilter === 'completed' && status !== 'COMPLETED') continue;

        items.push({
          id: a.id,
          title: a.title,
          description: a.instructions,
          startDate: a.startDate?.toISOString() || a.dueDate?.toISOString() || new Date().toISOString(),
          endDate: a.dueDate?.toISOString() || new Date().toISOString(),
          type: 'assignment',
          source: 'teacher',
          priority: a.priority,
          status,
          targetType: a.targetType,
          course: a.Course
            ? {
                id: a.Course.id,
                title: a.Course.title,
                subject: a.Course.Subject
                  ? {
                      name: a.Course.Subject.name,
                      color: (a.Course.Subject as { color?: string | null }).color ?? null,
                    }
                  : undefined,
              }
            : undefined,
          class: a.Class
            ? {
                id: a.Class.id,
                name: a.Class.name,
                color: (a.Class as { color?: string | null }).color ?? null,
              }
            : undefined,
          color: a.Class?.color || PRIORITY_COLORS[a.priority] || '#3b82f6',
          isEditable: false,
        });
      }

      // 2b. Récupérer les cours sans assignation (cours publiés des profs de la classe)
      // Récupérer la classe avec ses profs
      const classWithTeachers = await prisma.class.findUnique({
        where: { id: studentProfile.classId || '' },
        include: {
          TeacherProfile: { select: { id: true } },
        },
      });

      if (classWithTeachers) {
        const classTeacherIds = classWithTeachers.TeacherProfile.map(tp => tp.id);
        
        // IDs des cours qui ont déjà une assignation (pour les exclure)
        const assignedCourseIds = assignments
          .filter(a => a.courseId)
          .map(a => a.courseId as string);

        // Cours publiés sans assignation
        const coursesWithoutAssignment = await prisma.course.findMany({
          where: {
            teacherId: { in: classTeacherIds },
            isDraft: false,
            id: { notIn: assignedCourseIds.length > 0 ? assignedCourseIds : ['__none__'] },
            ...(subjectIds.length > 0 ? { subjectId: { in: subjectIds } } : {}),
            ...(teacherIds.length > 0 ? { teacherId: { in: teacherIds } } : {}),
            ...(courseId ? { id: courseId } : {}),
          },
          include: {
            Subject: true,
            Progression: {
              where: { studentId: studentProfile.id },
            },
          },
        });

        const COURSE_COLOR = '#6366f1'; // Indigo pour les cours

        for (const course of coursesWithoutAssignment) {
          const progression = course.Progression[0];
          const progressPercent = progression?.percentage || 0;
          
          // Déterminer le statut
          let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';
          if (progressPercent >= 100) status = 'COMPLETED';
          else if (progressPercent > 0) status = 'IN_PROGRESS';

          // Filtrer par statut si demandé
          if (statusFilter === 'pending' && status === 'COMPLETED') continue;
          if (statusFilter === 'completed' && status !== 'COMPLETED') continue;

          items.push({
            id: `course-${course.id}`,
            title: course.title,
            description: course.description,
            startDate: course.createdAt.toISOString(),
            endDate: course.createdAt.toISOString(), // Pas de deadline = date création
            type: 'course',
            source: 'teacher',
            status,
            course: {
              id: course.id,
              title: course.title,
              subject: course.Subject
                ? {
                    name: course.Subject.name,
                    color: (course.Subject as { color?: string | null }).color ?? null,
                  }
                : undefined,
            },
            color: COURSE_COLOR,
            isEditable: false,
          });
        }
      }
    }

    // 3. Récupérer les événements personnels (si type = all ou personal)
    if (typeFilter === 'all' || typeFilter === 'personal') {
      const eventWhere: Record<string, unknown> = {
        ownerId: userId,
        isTeacherEvent: false,
      };
      
      // Filtre plage de dates pour événements perso
      if (startDate && endDate) {
        eventWhere.endDate = {
          gte: startDate,
          lte: endDate,
        };
      }

      const events = await prisma.calendarEvent.findMany({
        where: eventWhere,
        orderBy: { startDate: 'asc' },
      });

      for (const e of events) {
        items.push({
          id: e.id,
          title: e.title,
          description: e.description,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate.toISOString(),
          type: 'personal',
          source: 'student',
          color: PERSONAL_COLOR,
          isEditable: true,
        });
      }
    }

    // 4. Trier par date de début
    items.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // 5. Calculer les stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // En retard = assignations avec deadline passée ET non terminées
    const overdue = items.filter((i) => {
      if (i.type !== 'assignment') return false;
      if (i.status === 'COMPLETED') return false;
      const endDate = new Date(i.endDate);
      return endDate < today;
    }).length;

    // Aujourd'hui = assignations avec deadline aujourd'hui
    const todayCount = items.filter((i) => {
      if (i.type !== 'assignment') return false;
      const endDate = new Date(i.endDate);
      return endDate >= today && endDate < tomorrow;
    }).length;

    // À venir = assignations avec deadline future OU cours sans deadline (non terminés)
    const upcoming = items.filter((i) => {
      if (i.type === 'personal') return false;
      if (i.status === 'COMPLETED') return false;
      
      // Cours sans deadline = toujours "à venir"
      if (i.type === 'course') return true;
      
      // Assignations avec deadline future
      const endDate = new Date(i.endDate);
      return endDate >= tomorrow;
    }).length;

    const stats = {
      total: items.length,
      overdue,
      today: todayCount,
      upcoming,
      personal: items.filter((i) => i.type === 'personal').length,
    };

    return NextResponse.json({
      success: true,
      data: items,
      stats,
    });
  } catch (error) {
    console.error('Erreur GET /api/student/agenda:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

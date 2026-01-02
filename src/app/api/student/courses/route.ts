import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Types pour les cours de l'élève
 */
export interface StudentCourseData {
  id: string;
  title: string;
  description: string | null;
  theme: string; // Le titre du cours sert de thème
  tags: string[];
  subject: { id: string; name: string };
  teacher: { id: string; firstName: string; lastName: string };
  chaptersCount: number;
  exercisesCount: number;
  completedChapters: number;
  progressPercent: number;
  status: 'not-started' | 'in-progress' | 'completed';
  deadline: string | null;
  createdAt: string;
}

export interface StudentCoursesOverview {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
}

interface TeacherAssignmentWithRelations {
  teacher: {
    id: string;
    User: {
      firstName: string | null;
      lastName: string | null;
    };
    Subject: { id: string; name: string }[];
  };
}

interface CourseWithRelations {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  createdAt: Date;
  Subject: { id: string; name: string };
  TeacherProfile: {
    id: string;
    User: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  Chapter: { 
    id: string;
    Section: { id: string; type: string }[];
  }[];
  Progression: { percentage: number }[];
}


// GET : Liste des cours de l'élève (via sa classe)
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès réservé aux élèves' }, { status: 403 });
    }

    // Récupérer les query params pour les filtres
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');
    const status = searchParams.get('status');

    // Récupérer le StudentProfile avec sa classe et les profs de la classe
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        Class: {
          include: {
            TeacherProfile: {
              include: {
                User: true,
                Subject: true,
              }
            }
          }
        }
      }
    });

    if (!studentProfile) {
      return NextResponse.json({ error: 'Profil élève non trouvé' }, { status: 404 });
    }

    if (!studentProfile.Class) {
      return NextResponse.json({ 
        success: true,
        data: {
          courses: [],
          overview: {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            averageProgress: 0,
          },
          filters: { subjects: [], teachers: [] }
        }
      });
    }

    // Récupérer les IDs des profs de la classe
    const teacherIds = studentProfile.Class.TeacherProfile.map(
      (tp: { id: string }) => tp.id
    );

    // Récupérer les cours des profs de la classe (publiés uniquement)
    const whereClause: Record<string, unknown> = {
      teacherId: { in: teacherIds },
      isDraft: false, // Seulement les cours publiés
    };

    if (subjectId) {
      whereClause.subjectId = subjectId;
    }
    if (teacherId) {
      whereClause.teacherId = teacherId;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        Subject: true,
        TeacherProfile: {
          include: { User: true }
        },
        Chapter: {
          select: { 
            id: true,
            Section: {
              select: { id: true, type: true }
            }
          },
        },
        Progression: {
          where: { studentId: studentProfile.id },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculer la progression pour chaque cours
    let completedCourses = 0;
    let inProgressCourses = 0;
    let totalProgress = 0;

    const coursesData: StudentCourseData[] = (courses as unknown as CourseWithRelations[]).map(course => {
      const chaptersCount = course.Chapter.length;
      
      // Compter les exercices dans tous les chapitres
      const exercisesCount = course.Chapter.reduce((total, chapter) => {
        return total + chapter.Section.filter(s => s.type === 'EXERCISE').length;
      }, 0);
      
      // Récupérer le pourcentage depuis Progression
      const progressRecord = course.Progression[0];
      const progressPercent = progressRecord?.percentage ? Math.round(progressRecord.percentage) : 0;
      
      // Calculer les chapitres complétés basé sur le pourcentage
      const completedChapters = chaptersCount > 0 
        ? Math.floor((progressPercent / 100) * chaptersCount)
        : 0;

      // Déterminer le status
      let courseStatus: 'not-started' | 'in-progress' | 'completed' = 'not-started';
      if (progressPercent === 100) {
        courseStatus = 'completed';
        completedCourses++;
      } else if (progressPercent > 0) {
        courseStatus = 'in-progress';
        inProgressCourses++;
      }

      totalProgress += progressPercent;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        theme: course.title, // Le titre sert de thématique
        tags: course.tags || [],
        subject: { id: course.Subject.id, name: course.Subject.name },
        teacher: {
          id: course.TeacherProfile.id,
          firstName: course.TeacherProfile.User.firstName || '',
          lastName: course.TeacherProfile.User.lastName || '',
        },
        chaptersCount,
        exercisesCount,
        completedChapters,
        progressPercent,
        status: courseStatus,
        deadline: null, // À implémenter via Assignment si besoin
        createdAt: course.createdAt.toISOString(),
      };
    });

    // Filtrer par status si demandé
    let filteredCourses = coursesData;
    if (status && status !== 'all') {
      filteredCourses = coursesData.filter(c => c.status === status);
    }

    // Overview
    const overview: StudentCoursesOverview = {
      totalCourses: courses.length,
      completedCourses,
      inProgressCourses,
      averageProgress: courses.length > 0 
        ? Math.round(totalProgress / courses.length) 
        : 0,
    };

    // Filtres disponibles (matières et profs de la classe)
    const subjects: { id: string; name: string }[] = [];
    const teachers: { id: string; name: string }[] = [];

    studentProfile.Class.TeacherProfile.forEach((tp: TeacherAssignmentWithRelations['teacher']) => {
      // Ajouter le prof
      teachers.push({
        id: tp.id,
        name: `${tp.User.firstName || ''} ${tp.User.lastName || ''}`.trim(),
      });
      // Ajouter ses matières
      tp.Subject.forEach((s: { id: string; name: string }) => {
        if (!subjects.find(sub => sub.id === s.id)) {
          subjects.push({ id: s.id, name: s.name });
        }
      });
    });

    // Extraire les thématiques uniques (tags des cours + titres)
    const themesSet = new Set<string>();
    coursesData.forEach(course => {
      // Ajouter le titre du cours comme thème
      themesSet.add(course.title);
      // Ajouter aussi tous les tags du cours
      if (course.tags && course.tags.length > 0) {
        course.tags.forEach(tag => themesSet.add(tag));
      }
    });
    
    // Convertir en array avec id = name (pour simplifier le filtrage)
    const themes = Array.from(themesSet).map(name => ({ 
      id: name, 
      name 
    }));

    return NextResponse.json({
      success: true,
      data: {
        courses: filteredCourses,
        overview,
        filters: {
          subjects,
          teachers,
          themes,
        }
      }
    });
  } catch (error) {
    console.error('Erreur API GET /api/student/courses:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

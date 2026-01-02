import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface CourseDetailParams {
  params: Promise<{ id: string }>;
}

// GET : Détails d'un cours pour l'élève
export async function GET(request: Request, { params }: CourseDetailParams) {
  try {
    const session = await auth();
    const { id: courseId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès réservé aux élèves' }, { status: 403 });
    }

    // Récupérer le StudentProfile avec sa classe
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        Class: {
          include: {
            TeacherProfile: true
          }
        }
      }
    });

    if (!studentProfile) {
      return NextResponse.json({ error: 'Profil élève non trouvé' }, { status: 404 });
    }

    // Récupérer le cours avec ses chapitres et sections
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        Subject: true,
        TeacherProfile: {
          include: { User: true }
        },
        Chapter: {
          orderBy: { order: 'asc' },
          include: {
            Section: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                order: true,
                content: true,
                files: {
                  select: {
                    id: true,
                    filename: true,
                    fileType: true,
                    url: true,
                    size: true,
                    textContent: true, // Texte extrait pour affichage et IA
                  }
                }
              }
            }
          }
        },
        CourseFile: true,
        Progression: {
          where: { studentId: studentProfile.id }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Vérifier que l'élève a accès au cours (prof de sa classe)
    if (studentProfile.Class) {
      const teacherIds = studentProfile.Class.TeacherProfile.map(
        (tp: { id: string }) => tp.id
      );
      if (!teacherIds.includes(course.teacherId)) {
        return NextResponse.json({ error: 'Accès non autorisé à ce cours' }, { status: 403 });
      }
    }

    // Vérifier que le cours est publié
    if (course.isDraft) {
      return NextResponse.json({ error: 'Ce cours n\'est pas encore disponible' }, { status: 403 });
    }

    // Récupérer la progression (pourcentage global)
    const progressionRecord = course.Progression[0];
    const progressPercent = progressionRecord?.percentage || 0;
    
    // Calculer combien de chapitres sont "complétés" basé sur le pourcentage
    const totalChapters = course.Chapter.length;
    const completedChaptersCount = totalChapters > 0 
      ? Math.floor((progressPercent / 100) * totalChapters)
      : 0;

    // Marquer les premiers N chapitres comme complétés (approximation)
    const chaptersWithProgress = course.Chapter.map((chapter, index) => ({
      id: chapter.id,
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      isCompleted: index < completedChaptersCount,
      sections: chapter.Section.map(section => ({
        id: section.id,
        title: section.title,
        type: section.type,
        order: section.order,
        content: section.content,
        files: section.files || [],
      }))
    }));

    // Préparer la réponse
    const courseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      subject: { id: course.Subject.id, name: course.Subject.name },
      teacher: {
        id: course.TeacherProfile.id,
        firstName: course.TeacherProfile.User.firstName || '',
        lastName: course.TeacherProfile.User.lastName || '',
      },
      chapters: chaptersWithProgress,
      files: course.CourseFile.map(f => ({
        id: f.id,
        filename: f.filename,
        fileType: f.fileType,
        url: f.url,
      })),
      stats: {
        totalChapters,
        completedChapters: completedChaptersCount,
        progressPercent: Math.round(progressPercent),
      }
    };

    return NextResponse.json({
      success: true,
      data: { course: courseData }
    });
  } catch (error) {
    console.error('Erreur API GET /api/student/courses/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

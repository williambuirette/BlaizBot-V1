/**
 * API Suppléments Élève - Liste et création
 * GET  /api/student/supplements - Liste tous les suppléments de l'élève
 * POST /api/student/supplements - Créer un nouveau supplément
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStudentProfileId, generateStudentId } from '@/lib/api/student-helpers';

// ============================================================================
// GET - Liste des suppléments de l'élève
// ============================================================================
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const studentId = await getStudentProfileId(session.user.id);
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Profil élève non trouvé' },
        { status: 404 }
      );
    }

    // Paramètre optionnel pour filtrer par cours
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    const supplements = await prisma.studentSupplement.findMany({
      where: {
        studentId,
        // Filtrer par cours si demandé (via la relation many-to-many)
        ...(courseId ? { Courses: { some: { courseId } } } : {}),
      },
      include: {
        Courses: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
                TeacherProfile: {
                  select: {
                    User: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        Chapters: {
          select: {
            id: true,
            _count: {
              select: { Cards: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Enrichir avec les stats
    const enrichedSupplements = supplements.map((supp) => ({
      id: supp.id,
      title: supp.title,
      description: supp.description,
      // Retourne les cours liés (peut être vide, 1 ou plusieurs)
      courseIds: supp.Courses.map(c => c.courseId),
      courses: supp.Courses.map(c => ({
        id: c.Course.id,
        title: c.Course.title,
        teacher: c.Course.TeacherProfile?.User
          ? `${c.Course.TeacherProfile.User.firstName} ${c.Course.TeacherProfile.User.lastName}`
          : null,
      })),
      // Rétro-compatibilité: premier cours lié (ou null)
      courseId: supp.Courses[0]?.courseId || null,
      course: supp.Courses[0]
        ? {
            id: supp.Courses[0].Course.id,
            title: supp.Courses[0].Course.title,
            teacher: supp.Courses[0].Course.TeacherProfile?.User
              ? `${supp.Courses[0].Course.TeacherProfile.User.firstName} ${supp.Courses[0].Course.TeacherProfile.User.lastName}`
              : null,
          }
        : null,
      chapterCount: supp.Chapters.length,
      cardCount: supp.Chapters.reduce((acc, ch) => acc + ch._count.Cards, 0),
      createdAt: supp.createdAt,
      updatedAt: supp.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: enrichedSupplements,
    });
  } catch (error) {
    console.error('[GET /api/student/supplements] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Créer un nouveau supplément
// ============================================================================
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const studentId = await getStudentProfileId(session.user.id);
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Profil élève non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, courseId, courseIds } = body;

    // Validation
    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Le titre doit contenir au moins 3 caractères' },
        { status: 400 }
      );
    }

    // Utiliser courseIds si fourni, sinon courseId pour rétro-compatibilité
    const coursesToLink: string[] = courseIds || (courseId ? [courseId] : []);

    // Vérifier que tous les cours existent
    if (coursesToLink.length > 0) {
      const existingCourses = await prisma.course.findMany({
        where: { id: { in: coursesToLink } },
        select: { id: true },
      });
      if (existingCourses.length !== coursesToLink.length) {
        return NextResponse.json(
          { success: false, error: 'Un ou plusieurs cours non trouvés' },
          { status: 404 }
        );
      }
    }

    const supplementId = generateStudentId('supp');

    const supplement = await prisma.studentSupplement.create({
      data: {
        id: supplementId,
        studentId,
        title: title.trim(),
        description: description?.trim() || null,
        // Créer les liaisons avec les cours
        Courses: {
          create: coursesToLink.map(cId => ({ courseId: cId })),
        },
      },
      include: {
        Courses: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: supplement.id,
        title: supplement.title,
        description: supplement.description,
        courseIds: supplement.Courses.map(c => c.courseId),
        courses: supplement.Courses.map(c => ({
          id: c.Course.id,
          title: c.Course.title,
        })),
        // Rétro-compatibilité
        courseId: supplement.Courses[0]?.courseId || null,
        course: supplement.Courses[0]?.Course || null,
        chapterCount: 0,
        cardCount: 0,
        createdAt: supplement.createdAt,
        updatedAt: supplement.updatedAt,
      },
    });
  } catch (error) {
    console.error('[POST /api/student/supplements] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * API Supplément Élève - CRUD individuel
 * GET    /api/student/supplements/[id] - Détail d'un supplément
 * PUT    /api/student/supplements/[id] - Modifier un supplément
 * DELETE /api/student/supplements/[id] - Supprimer un supplément
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getStudentProfileId,
  verifySupplementOwnership,
} from '@/lib/api/student-helpers';

type RouteParams = { params: Promise<{ id: string }> };

// ============================================================================
// GET - Détail d'un supplément avec chapitres et cartes
// ============================================================================
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: supplementId } = await params;
    
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

    // Vérifier ownership
    const isOwner = await verifySupplementOwnership(supplementId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Supplément non trouvé' },
        { status: 404 }
      );
    }

    const supplement = await prisma.studentSupplement.findUnique({
      where: { id: supplementId },
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
                      select: { firstName: true, lastName: true },
                    },
                  },
                },
              },
            },
          },
        },
        Chapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            Cards: {
              orderBy: { orderIndex: 'asc' },
              include: {
                Files: {
                  select: {
                    id: true,
                    filename: true,
                    fileType: true,
                    url: true,
                  },
                },
                Quiz: {
                  select: {
                    id: true,
                    aiGenerated: true,
                    _count: { select: { Attempts: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!supplement) {
      return NextResponse.json(
        { success: false, error: 'Supplément non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: supplement.id,
        title: supplement.title,
        description: supplement.description,
        // Nouveau: plusieurs cours possibles
        courseIds: supplement.Courses.map(c => c.courseId),
        courses: supplement.Courses.map(c => ({
          id: c.Course.id,
          title: c.Course.title,
          teacher: c.Course.TeacherProfile?.User
            ? `${c.Course.TeacherProfile.User.firstName} ${c.Course.TeacherProfile.User.lastName}`
            : null,
        })),
        // Rétro-compatibilité
        courseId: supplement.Courses[0]?.courseId || null,
        course: supplement.Courses[0]
          ? {
              id: supplement.Courses[0].Course.id,
              title: supplement.Courses[0].Course.title,
              teacher: supplement.Courses[0].Course.TeacherProfile?.User
                ? `${supplement.Courses[0].Course.TeacherProfile.User.firstName} ${supplement.Courses[0].Course.TeacherProfile.User.lastName}`
                : null,
            }
          : null,
        chapters: supplement.Chapters.map((ch) => ({
          id: ch.id,
          title: ch.title,
          description: ch.description,
          orderIndex: ch.orderIndex,
          cards: ch.Cards.map((card) => ({
            id: card.id,
            title: card.title,
            content: card.content,
            cardType: card.cardType,
            orderIndex: card.orderIndex,
            files: card.Files,
            quiz: card.Quiz
              ? {
                  id: card.Quiz.id,
                  aiGenerated: card.Quiz.aiGenerated,
                  attemptCount: card.Quiz._count.Attempts,
                }
              : null,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
          })),
        })),
        createdAt: supplement.createdAt,
        updatedAt: supplement.updatedAt,
      },
    });
  } catch (error) {
    console.error('[GET /api/student/supplements/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Modifier un supplément
// ============================================================================
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id: supplementId } = await params;
    
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

    // Vérifier ownership
    const isOwner = await verifySupplementOwnership(supplementId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Supplément non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, courseId, courseIds } = body;

    // Validation
    if (title !== undefined && title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Le titre doit contenir au moins 3 caractères' },
        { status: 400 }
      );
    }

    // Déterminer les cours à lier
    // courseIds a priorité, sinon on utilise courseId pour rétro-compatibilité
    let coursesToLink: string[] | undefined;
    if (courseIds !== undefined) {
      coursesToLink = courseIds;
    } else if (courseId !== undefined) {
      // Rétro-compatibilité: courseId null = aucun cours, sinon 1 cours
      coursesToLink = courseId ? [courseId] : [];
    }

    // Si on doit mettre à jour les cours liés
    if (coursesToLink !== undefined) {
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

      // Transaction: supprimer anciennes liaisons + créer nouvelles
      await prisma.$transaction([
        // Supprimer toutes les liaisons existantes
        prisma.studentSupplementCourse.deleteMany({
          where: { supplementId },
        }),
        // Créer les nouvelles liaisons
        ...coursesToLink.map(cId => 
          prisma.studentSupplementCourse.create({
            data: { supplementId, courseId: cId },
          })
        ),
      ]);
    }

    // Mettre à jour le titre et la description si fournis
    const updated = await prisma.studentSupplement.update({
      where: { id: supplementId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
      },
      include: {
        Courses: {
          include: {
            Course: {
              select: { id: true, title: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        courseIds: updated.Courses.map(c => c.courseId),
        courses: updated.Courses.map(c => ({
          id: c.Course.id,
          title: c.Course.title,
        })),
        // Rétro-compatibilité
        courseId: updated.Courses[0]?.courseId || null,
        course: updated.Courses[0]?.Course || null,
      },
    });
  } catch (error) {
    console.error('[PUT /api/student/supplements/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Supprimer un supplément (cascade)
// ============================================================================
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: supplementId } = await params;
    
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

    // Vérifier ownership
    const isOwner = await verifySupplementOwnership(supplementId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Supplément non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer (cascade défini dans le schéma Prisma)
    await prisma.studentSupplement.delete({
      where: { id: supplementId },
    });

    return NextResponse.json({
      success: true,
      message: 'Supplément supprimé',
    });
  } catch (error) {
    console.error('[DELETE /api/student/supplements/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

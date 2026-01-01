import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour modification de cours (enrichi)
const updateCourseSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').optional(),
  description: z.string().optional().nullable(),
  subjectId: z.string().optional(),
  content: z.string().optional().nullable(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  duration: z.number().int().positive().optional().nullable(),
  objectives: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isDraft: z.boolean().optional(),
  files: z.array(z.object({
    id: z.string().optional(), // ID existant (si déjà en BDD)
    filename: z.string(),
    url: z.string(),
  })).optional(),
});

// Helper : Vérifier que le cours appartient au prof
async function verifyCourseOwnership(courseId: string, userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
  });

  if (!teacherProfile) return null;

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId: teacherProfile.id,
    },
    include: {
      Subject: true,
      Chapter: { select: { id: true } },
      CourseFile: true,
    },
    
  });

  return course;
}

// Helper : Récupérer un cours avec counts pour la page détail
async function getCourseWithCounts(courseId: string, userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
  });

  if (!teacherProfile) return null;

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId: teacherProfile.id,
    },
    include: {
      Subject: true,
      CourseFile: true,
      _count: {
        select: {
          Chapter: true,
          Resource: true,
          CourseAssignment: true,
        },
      },
    },
  });

  return course;
}

// GET : Récupérer un cours spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const course = await getCourseWithCounts(id, session.user.id);

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé ou non autorisé' }, { status: 404 });
    }

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        content: course.content,
        subjectId: course.subjectId,
        subject: course.Subject ? { id: course.Subject.id, name: course.Subject.name } : null,
        subjectName: course.Subject?.name,
        difficulty: course.difficulty,
        duration: course.duration,
        objectives: course.objectives,
        tags: course.tags,
        isDraft: course.isDraft,
        _count: {
          chapters: course._count.Chapter,
          resources: course._count.Resource,
          assignments: course._count.CourseAssignment,
        },
        files: course.CourseFile.map((f) => ({
          id: f.id,
          filename: f.filename,
          url: f.url,
          fileType: f.fileType,
        })),
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    });
  } catch (error) {
    console.error('Erreur API GET /api/teacher/courses/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier un cours
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Vérifier propriété
    const existingCourse = await verifyCourseOwnership(id, session.user.id);

    if (!existingCourse) {
      return NextResponse.json({ error: 'Cours non trouvé ou non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateCourseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      subjectId,
      content,
      difficulty,
      duration,
      objectives,
      tags,
      isDraft,
      files,
    } = validation.data;

    // Si changement de matière, vérifier qu'elle existe
    if (subjectId) {
      const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
      if (!subject) {
        return NextResponse.json({ error: 'Matière non trouvée' }, { status: 404 });
      }
    }

    // Gérer les fichiers : supprimer ceux qui ne sont plus dans la liste, ajouter les nouveaux
    if (files !== undefined) {
      // IDs des fichiers à conserver
      const keepFileIds = files.filter(f => f.id).map(f => f.id!);
      
      // Supprimer les fichiers qui ne sont plus dans la liste
      await prisma.courseFile.deleteMany({
        where: {
          courseId: id,
          id: { notIn: keepFileIds },
        },
      });
      
      // Ajouter les nouveaux fichiers (ceux sans id)
      const newFiles = files.filter(f => !f.id);
      if (newFiles.length > 0) {
        await prisma.courseFile.createMany({
          data: newFiles.map(f => ({
            id: crypto.randomUUID(),
            courseId: id,
            filename: f.filename,
            fileType: f.filename.split('.').pop() || 'unknown',
            url: f.url,
          })),
        });
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(subjectId !== undefined && { subjectId }),
        ...(content !== undefined && { content }),
        ...(difficulty !== undefined && { difficulty }),
        ...(duration !== undefined && { duration }),
        ...(objectives !== undefined && { objectives }),
        ...(tags !== undefined && { tags }),
        ...(isDraft !== undefined && { isDraft }),
      },
      include: {
        Subject: true,
        Chapter: { select: { id: true } },
        CourseFile: true,
      },
    });

    return NextResponse.json({
      course: {
        id: updatedCourse.id,
        title: updatedCourse.title,
        description: updatedCourse.description,
        content: updatedCourse.content,
        subjectId: updatedCourse.subjectId,
        subjectName: updatedCourse.Subject.name,
        difficulty: updatedCourse.difficulty,
        duration: updatedCourse.duration,
        objectives: updatedCourse.objectives,
        tags: updatedCourse.tags,
        isDraft: updatedCourse.isDraft,
        chaptersCount: updatedCourse.Chapter.length,
        files: updatedCourse.CourseFile.map((f) => ({
          id: f.id,
          filename: f.filename,
          url: f.url,
          fileType: f.fileType,
        })),
        createdAt: updatedCourse.createdAt,
        updatedAt: updatedCourse.updatedAt,
      },
    });
  } catch (error) {
    console.error('Erreur API PUT /api/teacher/courses/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer un cours
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Vérifier propriété
    const existingCourse = await verifyCourseOwnership(id, session.user.id);

    if (!existingCourse) {
      return NextResponse.json({ error: 'Cours non trouvé ou non autorisé' }, { status: 404 });
    }

    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Cours supprimé' });
  } catch (error) {
    console.error('Erreur API DELETE /api/teacher/courses/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

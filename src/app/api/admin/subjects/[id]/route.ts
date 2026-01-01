import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la mise à jour
const updateSubjectSchema = z.object({
  name: z.string().min(2, 'Nom trop court').optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/subjects/[id] - Récupérer une matière
export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: { Course: true, TeacherProfile: true },
      },
    },
  });

  if (!subject) {
    return Response.json({ error: 'Matière non trouvée' }, { status: 404 });
  }

  return Response.json({
    id: subject.id,
    name: subject.name,
    createdAt: subject.createdAt,
    courseCount: subject._count.Course,
    teacherCount: subject._count.TeacherProfile,
  });
}

// PUT /api/admin/subjects/[id] - Modifier une matière
export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateSubjectSchema.parse(body);

    // Vérifier si la matière existe
    const existingSubject = await prisma.subject.findUnique({ where: { id } });
    if (!existingSubject) {
      return Response.json({ error: 'Matière non trouvée' }, { status: 404 });
    }

    // Si changement de nom, vérifier unicité
    if (data.name && data.name !== existingSubject.name) {
      const nameTaken = await prisma.subject.findUnique({
        where: { name: data.name },
      });
      if (nameTaken) {
        return Response.json(
          { error: 'Une matière avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: data.name ? { name: data.name } : {},
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: { Course: true, TeacherProfile: true },
        },
      },
    });

    return Response.json({
      id: updatedSubject.id,
      name: updatedSubject.name,
      createdAt: updatedSubject.createdAt,
      courseCount: updatedSubject._count.Course,
      teacherCount: updatedSubject._count.TeacherProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating subject:', error);
    return Response.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subjects/[id] - Supprimer une matière
export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Vérifier si la matière existe avec ses dépendances
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: { _count: { select: { Course: true } } },
    });

    if (!subject) {
      return Response.json({ error: 'Matière non trouvée' }, { status: 404 });
    }

    // Empêcher la suppression si des cours sont liés
    if (subject._count.Course > 0) {
      return Response.json(
        { error: `Impossible de supprimer : ${subject._count.Course} cours lié(s)` },
        { status: 400 }
      );
    }

    await prisma.subject.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return Response.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

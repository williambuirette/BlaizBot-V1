import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la mise à jour
const updateClassSchema = z.object({
  name: z.string().min(2, 'Nom trop court').optional(),
  level: z.string().min(2, 'Niveau trop court').optional(),
});

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/classes/[id] - Récupérer une classe
export async function GET(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const classData = await prisma.class.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      level: true,
      createdAt: true,
      _count: {
        select: { students: true },
      },
    },
  });

  if (!classData) {
    return Response.json({ error: 'Classe non trouvée' }, { status: 404 });
  }

  return Response.json({
    id: classData.id,
    name: classData.name,
    level: classData.level,
    createdAt: classData.createdAt,
    studentCount: classData._count.students,
  });
}

// PUT /api/admin/classes/[id] - Modifier une classe
export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateClassSchema.parse(body);

    // Vérifier si la classe existe
    const existingClass = await prisma.class.findUnique({ where: { id } });
    if (!existingClass) {
      return Response.json({ error: 'Classe non trouvée' }, { status: 404 });
    }

    // Si changement de nom, vérifier unicité
    if (data.name && data.name !== existingClass.name) {
      const nameTaken = await prisma.class.findUnique({
        where: { name: data.name },
      });
      if (nameTaken) {
        return Response.json(
          { error: 'Une classe avec ce nom existe déjà' },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.level) updateData.level = data.level;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        level: true,
        createdAt: true,
        _count: {
          select: { students: true },
        },
      },
    });

    return Response.json({
      id: updatedClass.id,
      name: updatedClass.name,
      level: updatedClass.level,
      createdAt: updatedClass.createdAt,
      studentCount: updatedClass._count.students,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error updating class:', error);
    return Response.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/classes/[id] - Supprimer une classe
export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Vérifier si la classe existe
    const classData = await prisma.class.findUnique({
      where: { id },
      include: { _count: { select: { students: true } } },
    });

    if (!classData) {
      return Response.json({ error: 'Classe non trouvée' }, { status: 404 });
    }

    // Empêcher la suppression si des étudiants sont inscrits
    if (classData._count.students > 0) {
      return Response.json(
        { error: `Impossible de supprimer : ${classData._count.students} élève(s) inscrit(s)` },
        { status: 400 }
      );
    }

    await prisma.class.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return Response.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

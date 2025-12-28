import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la création d'une classe
const createClassSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  level: z.string().min(2, 'Niveau requis'),
});

// GET /api/admin/classes - Liste toutes les classes
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const classes = await prisma.class.findMany({
    select: {
      id: true,
      name: true,
      level: true,
      createdAt: true,
      _count: {
        select: { students: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Mapper pour ajouter le count d'étudiants
  const mappedClasses = classes.map((c) => ({
    id: c.id,
    name: c.name,
    level: c.level,
    createdAt: c.createdAt,
    studentCount: c._count.students,
  }));

  return Response.json(mappedClasses);
}

// POST /api/admin/classes - Créer une classe
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createClassSchema.parse(body);

    // Vérifier si le nom existe déjà
    const existingClass = await prisma.class.findUnique({
      where: { name: data.name },
    });

    if (existingClass) {
      return Response.json(
        { error: 'Une classe avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Créer la classe
    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        level: data.level,
      },
      select: {
        id: true,
        name: true,
        level: true,
        createdAt: true,
      },
    });

    return Response.json({ ...newClass, studentCount: 0 }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating class:', error);
    return Response.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

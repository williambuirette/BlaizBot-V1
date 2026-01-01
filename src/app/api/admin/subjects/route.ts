import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

// Schéma de validation pour la création d'une matière
const createSubjectSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
});

// GET /api/admin/subjects - Liste toutes les matières
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subjects = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: {
        select: { Course: true, TeacherProfile: true },
      },
    },
    orderBy: { name: 'asc' },
  });

  // Mapper pour ajouter les counts
  const mappedSubjects = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    createdAt: s.createdAt,
    courseCount: s._count.Course,
    teacherCount: s._count.TeacherProfile,
  }));

  return Response.json(mappedSubjects);
}

// POST /api/admin/subjects - Créer une matière
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSubjectSchema.parse(body);

    // Vérifier si le nom existe déjà
    const existingSubject = await prisma.subject.findUnique({
      where: { name: data.name },
    });

    if (existingSubject) {
      return Response.json(
        { error: 'Une matière avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Créer la matière
    const id = `subject-${data.name.toLowerCase().replace(/\s+/g, '-')}`;
    const now = new Date();
    
    const newSubject = await prisma.subject.create({
      data: { 
        id,
        name: data.name,
        updatedAt: now,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return Response.json(
      { ...newSubject, courseCount: 0, teacherCount: 0 },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error creating subject:', error);
    return Response.json(
      { error: 'Erreur lors de la création' },
      { status: 500 }
    );
  }
}

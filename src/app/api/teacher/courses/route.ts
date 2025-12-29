import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour création de cours (version enrichie)
const createCourseSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  subjectId: z.string().min(1, 'La matière est requise'),
  content: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  duration: z.number().int().positive().optional().nullable(),
  objectives: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isDraft: z.boolean().optional(),
  files: z.array(z.object({
    filename: z.string(),
    url: z.string(),
  })).optional(),
});

// GET : Liste des cours du professeur
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Récupérer le TeacherProfile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    // Récupérer les cours du prof avec la matière et le count des chapitres
    const courses = await prisma.course.findMany({
      where: { teacherId: teacherProfile.id },
      include: {
        subject: true,
        chapters: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transformer pour ajouter chaptersCount
    const coursesWithCount = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      subjectId: course.subjectId,
      subjectName: course.subject.name,
      chaptersCount: course.chapters.length,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json({ courses: coursesWithCount });
  } catch (error) {
    console.error('Erreur API GET /api/teacher/courses:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer un nouveau cours
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Récupérer le TeacherProfile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const validation = createCourseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, subjectId, content, difficulty, duration, objectives, tags, isDraft, files } = validation.data;

    // Vérifier que la matière existe
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Matière non trouvée' }, { status: 404 });
    }

    // Créer le cours avec tous les champs
    const course = await prisma.course.create({
      data: {
        title,
        description,
        subjectId,
        teacherId: teacherProfile.id,
        content: content || null,
        difficulty: difficulty || 'MEDIUM',
        duration: duration || null,
        objectives: objectives || [],
        tags: tags || [],
        isDraft: isDraft ?? true,
        // Créer les fichiers associés si fournis
        files: files && files.length > 0 ? {
          create: files.map((f) => ({
            filename: f.filename,
            fileType: f.filename.split('.').pop() || 'unknown',
            url: f.url,
          })),
        } : undefined,
      },
      include: {
        subject: true,
        files: true,
      },
    });

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        subjectId: course.subjectId,
        subjectName: course.subject.name,
        chaptersCount: 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur API POST /api/teacher/courses:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

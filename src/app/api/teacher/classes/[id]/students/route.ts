import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/teacher/classes/[id]/students
 * Retourne les élèves d'une classe spécifique
 * Vérifie que le prof enseigne bien cette classe
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    // Vérification auth + rôle TEACHER
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const { id: classId } = await params;
    const userId = session.user.id;

    // Vérifier que le prof enseigne cette classe
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        classes: {
          where: { id: classId },
          select: { id: true },
        },
      },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    if (teacherProfile.classes.length === 0) {
      return NextResponse.json(
        { error: 'Vous n\'enseignez pas dans cette classe' },
        { status: 403 }
      );
    }

    // Récupérer les élèves de la classe avec leurs infos
    const students = await prisma.studentProfile.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        user: { lastName: 'asc' },
      },
    });

    // Transformer pour une réponse plus simple
    const result = students.map((student) => ({
      id: student.id,
      userId: student.user.id,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
    }));

    return NextResponse.json({ students: result });
  } catch (error) {
    console.error('Erreur API /api/teacher/classes/[id]/students:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

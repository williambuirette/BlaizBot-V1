import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Récupérer les détails d'une classe avec ses élèves
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const { id: classId } = await context.params;

    // Vérifier que le professeur a accès à cette classe
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        Class: {
          where: { id: classId },
        },
      },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    if (teacherProfile.Class.length === 0) {
      return NextResponse.json({ error: 'Classe non trouvée ou accès non autorisé' }, { status: 404 });
    }

    // Récupérer la classe avec ses élèves
    const classData = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        StudentProfile: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: classData,
    });
  } catch (error) {
    console.error('Erreur API GET /api/teacher/classes/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

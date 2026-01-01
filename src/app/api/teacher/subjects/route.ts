import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET : Liste des matières du professeur
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Récupérer le TeacherProfile avec ses matières
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        Subject: {
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ subjects: teacherProfile.Subject || [] });
  } catch (error) {
    console.error('Erreur API GET /api/teacher/subjects:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

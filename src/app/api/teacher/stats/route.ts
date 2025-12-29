import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    // Vérification auth + rôle TEACHER
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const userId = session.user.id;

    // Récupérer le TeacherProfile lié à l'utilisateur
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        classes: { select: { id: true } },
        courses: { select: { id: true } },
      },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    // Compter les messages non lus (conversations où le prof participe)
    // Note: Le schéma actuel n'a pas de champ "read" sur Message,
    // on retourne 0 pour l'instant (à implémenter si besoin)
    const unreadMessages = 0;

    return NextResponse.json({
      classesCount: teacherProfile.classes.length,
      coursesCount: teacherProfile.courses.length,
      unreadMessages,
    });
  } catch (error) {
    console.error('Erreur API /api/teacher/stats:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

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

    // Récupérer le TeacherProfile avec ses classes
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        Class: {
          include: {
            StudentProfile: {
              select: { id: true },
            },
          },
        },
        Subject: true,
      },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    // Transformer les données pour inclure le count d'élèves et la couleur
    const classes = teacherProfile.Class.map((cls) => ({
      id: cls.id,
      name: cls.name,
      level: cls.level,
      color: cls.color,
      studentsCount: cls.StudentProfile.length,
    }));

    // Ajouter les matières enseignées par ce prof
    const subjects = teacherProfile.Subject.map((s) => s.name);

    return NextResponse.json({ classes, subjects });
  } catch (error) {
    console.error('Erreur API /api/teacher/classes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET : Liste des élèves des classes du professeur
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    const userId = session.user.id;

    // Récupérer le profil prof avec ses classes
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        Class: {
          select: { id: true },
        },
      },
    });

    if (!teacherProfile || teacherProfile.Class.length === 0) {
      return NextResponse.json({ students: [] });
    }

    const classIds = teacherProfile.Class.map((c) => c.id);

    // Récupérer les élèves inscrits dans ces classes via StudentProfile
    const studentProfiles = await prisma.studentProfile.findMany({
      where: { classId: { in: classIds } },
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
    });

    // Transformer les données
    const students = studentProfiles.map((sp) => ({
      id: sp.User.id,
      firstName: sp.User.firstName,
      lastName: sp.User.lastName,
      email: sp.User.email,
    })).sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
    );

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Erreur API GET /api/teacher/students:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

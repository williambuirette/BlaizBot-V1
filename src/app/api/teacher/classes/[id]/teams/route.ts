// src/app/api/teacher/classes/[id]/teams/route.ts
// API CRUD pour les équipes d'une classe

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Vérifier que le prof enseigne cette classe
async function verifyClassOwnership(classId: string, userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      classes: {
        where: { id: classId },
      },
    },
  });

  if (!teacherProfile || teacherProfile.classes.length === 0) {
    return null;
  }

  return teacherProfile.classes[0];
}

// GET : Liste les équipes d'une classe
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: classId } = await context.params;
    const classData = await verifyClassOwnership(classId, userId);

    if (!classData) {
      return NextResponse.json({ error: 'Classe non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const teams = await prisma.team.findMany({
      where: { classId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          include: {
            student: {
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

    return NextResponse.json(teams);
  } catch (error) {
    console.error('Erreur GET teams:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer une équipe
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: classId } = await context.params;
    const classData = await verifyClassOwnership(classId, userId);

    if (!classData) {
      return NextResponse.json({ error: 'Classe non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { name, memberIds } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom de l\'équipe est requis' }, { status: 400 });
    }

    // Vérifier que les élèves appartiennent à cette classe
    if (memberIds && memberIds.length > 0) {
      const validStudents = await prisma.studentProfile.findMany({
        where: {
          classId,
          userId: { in: memberIds },
        },
        select: { userId: true },
      });

      const validIds = validStudents.map((s) => s.userId);
      const invalidIds = memberIds.filter((id: string) => !validIds.includes(id));

      if (invalidIds.length > 0) {
        return NextResponse.json({ 
          error: 'Certains élèves ne font pas partie de cette classe',
          invalidIds,
        }, { status: 400 });
      }
    }

    // Créer l'équipe avec ses membres
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        classId,
        members: memberIds && memberIds.length > 0
          ? {
              create: memberIds.map((studentId: string) => ({
                studentId,
              })),
            }
          : undefined,
      },
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          include: {
            student: {
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

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    console.error('Erreur POST team:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

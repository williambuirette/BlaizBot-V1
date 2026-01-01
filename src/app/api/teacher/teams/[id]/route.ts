// src/app/api/teacher/teams/[id]/route.ts
// API pour une équipe spécifique (GET, PUT, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Vérifier que l'équipe appartient à une classe du prof
async function verifyTeamOwnership(teamId: string, userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      Class: true,
    },
  });

  if (!teacherProfile) return null;

  const classIds = teacherProfile.Class.map((c) => c.id);

  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      classId: { in: classIds },
    },
    include: {
      Class: {
        select: { id: true, name: true },
      },
      _count: {
        select: { TeamMember: true },
      },
      TeamMember: {
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

  return team;
}

// GET : Détails d'une équipe avec membres
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

    const { id: teamId } = await context.params;
    const team = await verifyTeamOwnership(teamId, userId);

    if (!team) {
      return NextResponse.json({ error: 'Équipe non trouvée ou accès non autorisé' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Erreur GET team:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier une équipe (nom et/ou membres)
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: teamId } = await context.params;
    const team = await verifyTeamOwnership(teamId, userId);

    if (!team) {
      return NextResponse.json({ error: 'Équipe non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { name, memberIds } = body;

    // Construire les données à mettre à jour
    const updateData: {
      name?: string;
    } = {};

    if (name !== undefined) {
      if (!name?.trim()) {
        return NextResponse.json({ error: 'Le nom ne peut pas être vide' }, { status: 400 });
      }
      updateData.name = name.trim();
    }

    // Si memberIds est fourni, remplacer tous les membres
    if (memberIds !== undefined) {
      // Vérifier que les élèves appartiennent à la classe de l'équipe
      if (memberIds.length > 0) {
        const validStudents = await prisma.studentProfile.findMany({
          where: {
            classId: team.Class.id,
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

      // Supprimer tous les anciens membres et ajouter les nouveaux
      await prisma.$transaction([
        prisma.teamMember.deleteMany({ where: { teamId } }),
        ...memberIds.map((studentId: string) =>
          prisma.teamMember.create({
            data: { id: crypto.randomUUID(), teamId, studentId },
          })
        ),
      ]);
    }

    // Mettre à jour le nom si nécessaire
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        Class: {
          select: { id: true, name: true },
        },
        _count: {
          select: { TeamMember: true },
        },
        TeamMember: {
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

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error('Erreur PUT team:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer une équipe
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: teamId } = await context.params;
    const team = await verifyTeamOwnership(teamId, userId);

    if (!team) {
      return NextResponse.json({ error: 'Équipe non trouvée ou accès non autorisé' }, { status: 404 });
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ success: true, message: 'Équipe supprimée' });
  } catch (error) {
    console.error('Erreur DELETE team:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

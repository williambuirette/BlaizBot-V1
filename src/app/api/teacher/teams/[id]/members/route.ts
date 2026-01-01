// src/app/api/teacher/teams/[id]/members/route.ts
// API pour gérer les membres d'une équipe (ajouter/retirer)

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
    },
  });

  return team;
}

// POST : Ajouter un membre à l'équipe
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

    const { id: teamId } = await context.params;
    const team = await verifyTeamOwnership(teamId, userId);

    if (!team) {
      return NextResponse.json({ error: 'Équipe non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId requis' }, { status: 400 });
    }

    // Vérifier que l'élève appartient à la classe
    const studentProfile = await prisma.studentProfile.findFirst({
      where: {
        userId: studentId,
        classId: team.Class.id,
      },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: 'L\'élève ne fait pas partie de cette classe' }, { status: 400 });
    }

    // Vérifier si déjà membre
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_studentId: {
          teamId,
          studentId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'L\'élève est déjà membre de cette équipe' }, { status: 400 });
    }

    // Ajouter le membre
    const member = await prisma.teamMember.create({
      data: {
        id: crypto.randomUUID(),
        teamId,
        studentId,
      },
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

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Erreur POST team member:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Retirer un membre de l'équipe
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

    const body = await request.json();
    const { studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId requis' }, { status: 400 });
    }

    // Vérifier si le membre existe
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_studentId: {
          teamId,
          studentId,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'L\'élève n\'est pas membre de cette équipe' }, { status: 404 });
    }

    // Retirer le membre
    await prisma.teamMember.delete({
      where: {
        teamId_studentId: {
          teamId,
          studentId,
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Membre retiré de l\'équipe' });
  } catch (error) {
    console.error('Erreur DELETE team member:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

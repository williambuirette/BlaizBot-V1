/**
 * API GET /api/teacher/dashboard/students-alerts
 * Récupère les élèves à surveiller
 * Phase 7-sexies
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { StudentAlert, AlertLevel } from '@/types/dashboard-filters';
import { calculateAverage, getAlertLevel } from '@/lib/utils/kpi-calculations';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les classes du professeur
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        Class: { select: { id: true } },
      },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil professeur non trouvé' },
        { status: 404 }
      );
    }

    const teacherClassIds = teacherProfile.Class.map((c) => c.id);

    // Extraire les filtres
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const alertLevelFilter = searchParams.get('alertLevel') as AlertLevel | null;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Filtrer par classe (soit une classe spécifique, soit toutes les classes du prof)
    const targetClassIds = classId ? [classId] : teacherClassIds;

    if (targetClassIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Récupérer les élèves via StudentProfile (qui a les bonnes relations)
    const studentProfiles = await prisma.studentProfile.findMany({
      where: {
        classId: { in: targetClassIds },
      },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        Class: {
          select: { name: true },
        },
      },
    });

    // Pour chaque élève, récupérer ses scores
    const studentsWithScores = await Promise.all(
      studentProfiles.map(async (profile) => {
        const scores = await prisma.studentScore.findMany({
          where: { studentId: profile.userId },
          select: {
            continuousScore: true,
            Course: { select: { title: true } },
          },
        });

        const lastProgression = await prisma.progression.findFirst({
          where: { studentId: profile.id },
          orderBy: { lastActivity: 'desc' },
          select: { lastActivity: true },
        });

        return {
          profile,
          scores,
          lastActivity: lastProgression?.lastActivity || null,
        };
      })
    );

    // Mapper vers StudentAlert
    const alerts: StudentAlert[] = studentsWithScores.map(({ profile, scores, lastActivity }) => {
      const scoreValues = scores.map((s) => s.continuousScore);
      const avgScore = calculateAverage(scoreValues);

      // Trouver le cours le plus faible
      const sortedScores = [...scores].sort((a, b) => a.continuousScore - b.continuousScore);
      const weakestScore = sortedScores[0];

      return {
        studentId: profile.userId,
        firstName: profile.User.firstName,
        lastName: profile.User.lastName,
        className: profile.Class?.name || 'N/A',
        averageScore: avgScore,
        alertLevel: getAlertLevel(avgScore),
        lastActivity,
        weakCourse: weakestScore?.Course?.title,
      };
    });

    // Filtrer par niveau d'alerte si précisé
    let filteredAlerts = alerts;
    if (alertLevelFilter && alertLevelFilter !== 'all') {
      filteredAlerts = alerts.filter((a) => a.alertLevel === alertLevelFilter);
    }

    // Trier par score croissant (les plus en difficulté en premier)
    const sortedAlerts = filteredAlerts.sort(
      (a, b) => a.averageScore - b.averageScore
    );

    // Limiter le nombre de résultats
    const limitedAlerts = sortedAlerts.slice(0, limit);

    return NextResponse.json({ success: true, data: limitedAlerts });
  } catch (error) {
    console.error('[API] dashboard/students-alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * API GET /api/teacher/dashboard/kpis
 * Récupère les KPIs du centre de pilotage avec filtres
 * Phase 7-sexies
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { DashboardKPIs, DashboardPeriod } from '@/types/dashboard-filters';
import {
  calculateAverage,
  calculateSuccessRate,
  calculateEngagement,
  getPeriodStartDate,
} from '@/lib/utils/kpi-calculations';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le profil professeur
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil professeur non trouvé' },
        { status: 404 }
      );
    }

    // Extraire les filtres des query params
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const courseId = searchParams.get('courseId');
    const period = (searchParams.get('period') as DashboardPeriod) || 'month';

    // Calculer la date de début de période
    const periodStart = getPeriodStartDate(period);

    // Construire le filtre pour les cours du professeur
    const courseWhere = {
      teacherId: teacherProfile.id,
      isFolder: false,
      ...(subjectId && { subjectId }),
      ...(courseId && { id: courseId }),
    };

    // Récupérer les IDs des cours du professeur
    const teacherCourses = await prisma.course.findMany({
      where: courseWhere,
      select: { id: true },
    });
    const courseIds = teacherCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      // Pas de cours, retourner des KPIs vides
      const emptyKpis: DashboardKPIs = {
        averageScore: 0,
        successRate: 0,
        progressionRate: 0,
        engagementRate: 0,
        activeAlerts: 0,
        aiAverageScore: 0,
      };
      return NextResponse.json({ success: true, data: emptyKpis });
    }

    // Filtre par classe si précisé
    let studentIds: string[] | undefined;
    if (classId) {
      const studentsInClass = await prisma.studentProfile.findMany({
        where: { classId },
        select: { userId: true },
      });
      studentIds = studentsInClass.map((s) => s.userId);
    }

    // 1. Récupérer les StudentScores
    const studentScores = await prisma.studentScore.findMany({
      where: {
        courseId: { in: courseIds },
        ...(studentIds && { studentId: { in: studentIds } }),
        ...(periodStart && { updatedAt: { gte: periodStart } }),
      },
      select: {
        continuousScore: true,
        aiComprehension: true,
      },
    });

    // 2. Récupérer les Progressions pour l'engagement
    const progressions = await prisma.progression.findMany({
      where: {
        courseId: { in: courseIds },
        ...(studentIds && { studentId: { in: studentIds } }),
      },
      select: {
        percentage: true,
        lastActivity: true,
      },
    });

    // 3. Calculer les KPIs
    const continuousScores = studentScores.map((s) => s.continuousScore);
    const aiScores = studentScores
      .map((s) => s.aiComprehension)
      .filter((s) => s > 0);
    const progressionPercentages = progressions.map((p) => p.percentage);
    const lastActivities = progressions.map((p) => p.lastActivity);

    const kpis: DashboardKPIs = {
      averageScore: calculateAverage(continuousScores),
      successRate: calculateSuccessRate(continuousScores, 50),
      progressionRate: calculateAverage(progressionPercentages),
      engagementRate: calculateEngagement(lastActivities, 7),
      activeAlerts: continuousScores.filter((s) => s < 40).length,
      aiAverageScore: calculateAverage(aiScores),
    };

    return NextResponse.json({ success: true, data: kpis });
  } catch (error) {
    console.error('[API] dashboard/kpis error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

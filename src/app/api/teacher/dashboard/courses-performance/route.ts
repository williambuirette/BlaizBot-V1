/**
 * API GET /api/teacher/dashboard/courses-performance
 * Récupère les cours top/flop du professeur
 * Phase 7-sexies
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { CoursePerformance, CoursesPerformanceResponse } from '@/types/dashboard-filters';
import { calculateAverage } from '@/lib/utils/kpi-calculations';

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

    // Extraire les filtres
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');

    // Filtre par classe si précisé
    let studentIds: string[] | undefined;
    if (classId) {
      const studentsInClass = await prisma.studentProfile.findMany({
        where: { classId },
        select: { userId: true },
      });
      studentIds = studentsInClass.map((s) => s.userId);
    }

    // Récupérer les cours du professeur avec leurs scores
    const courses = await prisma.course.findMany({
      where: {
        teacherId: teacherProfile.id,
        isFolder: false,
        ...(subjectId && { subjectId }),
      },
      include: {
        StudentScore: {
          where: studentIds ? { studentId: { in: studentIds } } : undefined,
          select: { continuousScore: true },
        },
        Subject: {
          select: { name: true },
        },
      },
    });

    // Calculer la performance de chaque cours
    const performances: CoursePerformance[] = courses
      .map((course) => {
        const scores = course.StudentScore.map((s) => s.continuousScore);
        const avgScore = calculateAverage(scores);

        return {
          courseId: course.id,
          courseTitle: course.title,
          chapterTitle: course.Subject?.name,
          averageScore: avgScore,
          studentCount: scores.length,
          trend: 'stable' as const, // TODO: comparer avec période précédente
          weakPoint: avgScore < 50 ? 'Score moyen faible' : undefined,
        };
      })
      .filter((p) => p.studentCount > 0); // Garder seulement les cours avec des scores

    // Trier par score
    const sorted = [...performances].sort((a, b) => b.averageScore - a.averageScore);

    // Top 3 et Bottom 3
    const top = sorted.slice(0, 3);
    const bottom = sorted.length > 3 
      ? sorted.slice(-3).reverse() 
      : sorted.slice(Math.max(0, sorted.length - 3)).reverse();

    const response: CoursesPerformanceResponse = { top, bottom };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('[API] dashboard/courses-performance error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

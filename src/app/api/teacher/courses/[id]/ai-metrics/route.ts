import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/teacher/courses/[id]/ai-metrics
 * Récupère les métriques IA d'un cours (scores moyens, distribution, etc.)
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id: courseId } = await context.params;

    // Vérifier que le cours appartient au professeur
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId, teacherId: teacherProfile.id },
    });

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Récupérer les scores IA des élèves pour ce cours
    const studentScores = await prisma.studentScore.findMany({
      where: { courseId },
      select: {
        aiComprehension: true,
        studentId: true,
      },
    });

    // Récupérer le nombre total d'élèves assignés à ce cours
    const assignments = await prisma.courseAssignment.findMany({
      where: { courseId },
      select: { classId: true },
    });

    const classIds = [...new Set(assignments.map((a) => a.classId).filter(Boolean))];
    
    let totalStudents = 0;
    if (classIds.length > 0) {
      totalStudents = await prisma.studentProfile.count({
        where: { classId: { in: classIds as string[] } },
      });
    }

    // Filtrer les scores non-null
    const validScores = studentScores
      .filter((s) => s.aiComprehension !== null)
      .map((s) => s.aiComprehension as number);

    const studentsEvaluated = validScores.length;

    // Calculer la moyenne
    const averageScore = studentsEvaluated > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / studentsEvaluated)
      : null;

    // Calculer la distribution
    const distribution = {
      excellent: validScores.filter((s) => s >= 80).length,
      good: validScores.filter((s) => s >= 60 && s < 80).length,
      average: validScores.filter((s) => s >= 40 && s < 60).length,
      weak: validScores.filter((s) => s < 40).length,
    };

    return NextResponse.json({
      averageScore,
      studentsEvaluated,
      totalStudents: totalStudents || studentsEvaluated, // Fallback si pas d'assignations
      distribution,
    });
  } catch (error) {
    console.error('Erreur API ai-metrics:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

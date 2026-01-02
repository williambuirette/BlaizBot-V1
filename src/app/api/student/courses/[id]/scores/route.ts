import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { CourseScoresResponse, CourseScoreData, SectionScoreData, AIActivityData } from '@/types/course-score';

interface ScoresParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/student/courses/[id]/scores
 * Retourne les scores de l'élève sur un cours spécifique
 * 
 * Utilisé par : Page cours élève pour afficher les KPIs de performance
 * Équivalent prof : /teacher/students/[id]/courses/[courseId]/page.tsx (server-side)
 */
export async function GET(request: Request, { params }: ScoresParams) {
  try {
    const session = await auth();
    const { id: courseId } = await params;

    // Vérifications auth
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès réservé aux élèves' }, { status: 403 });
    }

    const studentId = session.user.id;

    // Récupérer le StudentScore pour ce cours
    const studentScore = await prisma.studentScore.findUnique({
      where: { 
        studentId_courseId: { studentId, courseId } 
      },
    });

    // Récupérer les activités IA pour ce cours
    const aiActivities = await prisma.aIActivityScore.findMany({
      where: { studentId, courseId },
      orderBy: { createdAt: 'desc' },
    });

    // Récupérer les progrès par section (quiz/exercices)
    const progressRecords = await prisma.studentProgress.findMany({
      where: {
        studentId,
        CourseAssignment: { courseId },
      },
      include: {
        Section: { 
          select: { 
            id: true, 
            title: true, 
            type: true 
          } 
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transformer les données de score
    const scoreData: CourseScoreData | null = studentScore ? {
      quizAvg: studentScore.quizAvg,
      exerciseAvg: studentScore.exerciseAvg,
      aiComprehension: studentScore.aiComprehension,
      continuousScore: studentScore.continuousScore,
      quizCount: studentScore.quizCount,
      exerciseCount: studentScore.exerciseCount,
      aiSessionCount: studentScore.aiSessionCount,
      examGrade: studentScore.examGrade,
      examDate: studentScore.examDate?.toISOString() ?? null,
      examComment: studentScore.examComment,
      finalGrade: studentScore.finalGrade,
    } : null;

    // Transformer les scores par section (filtrer ceux sans section valide)
    const sectionScores: SectionScoreData[] = progressRecords
      .filter((p) => p.Section?.id || p.sectionId)
      .map((p) => ({
        sectionId: (p.Section?.id ?? p.sectionId) as string,
        sectionTitle: p.Section?.title ?? 'Section',
        sectionType: (p.Section?.type ?? 'LESSON') as SectionScoreData['sectionType'],
        score: p.score,
        status: p.status as SectionScoreData['status'],
        completedAt: p.completedAt?.toISOString() ?? null,
        timeSpent: p.timeSpent,
      }));

    // Transformer les activités IA
    const activitiesData: AIActivityData[] = aiActivities.map((a) => ({
      id: a.id,
      activityType: a.activityType,
      themeId: a.themeId,
      comprehensionScore: a.comprehensionScore,
      accuracyScore: a.accuracyScore,
      autonomyScore: a.autonomyScore,
      finalScore: a.finalScore,
      duration: a.duration,
      messageCount: a.messageCount,
      strengths: a.strengths,
      weaknesses: a.weaknesses,
      recommendation: a.recommendation,
      createdAt: a.createdAt.toISOString(),
    }));

    const response: CourseScoresResponse = {
      courseId,
      studentId,
      score: scoreData,
      sectionScores,
      aiActivities: activitiesData,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Erreur API GET /api/student/courses/[id]/scores:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

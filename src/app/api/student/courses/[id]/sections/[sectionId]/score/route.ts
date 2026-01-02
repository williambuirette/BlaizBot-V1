import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';

interface SectionScoreParams {
  params: Promise<{ id: string; sectionId: string }>;
}

const scoreSchema = z.object({
  score: z.number().min(0).max(100),
  timeSpent: z.number().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).default('COMPLETED'),
});

/**
 * POST /api/student/courses/[id]/sections/[sectionId]/score
 * 
 * Sauvegarde le score d'une section (quiz/exercice) pour l'élève.
 * UPSERT : si l'élève refait la section, le score est remplacé (pas cumulé).
 * 
 * Après sauvegarde, recalcule automatiquement :
 * - StudentScore.quizAvg (moyenne des quiz)
 * - StudentScore.exerciseAvg (moyenne des exercices)
 * - StudentScore.continuousScore (score continu global)
 * - Progression.percentage (% de complétion du cours)
 */
export async function POST(request: Request, { params }: SectionScoreParams) {
  try {
    const session = await auth();
    const { id: courseId, sectionId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Accès réservé aux élèves' }, { status: 403 });
    }

    const body = await request.json();
    const validation = scoreSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { score, timeSpent, status } = validation.data;
    const studentId = session.user.id;

    // Vérifier que la section existe et appartient au cours
    const section = await prisma.section.findFirst({
      where: {
        id: sectionId,
        Chapter: { courseId },
      },
      select: { id: true, type: true },
    });

    if (!section) {
      return NextResponse.json({ error: 'Section non trouvée' }, { status: 404 });
    }

    // Trouver ou créer l'assignation du cours
    let assignment = await prisma.courseAssignment.findFirst({
      where: { courseId, studentId },
    });

    if (!assignment) {
      // Créer une auto-assignation pour l'élève
      assignment = await prisma.courseAssignment.create({
        data: {
          id: randomUUID(),
          courseId,
          studentId,
          title: 'Auto-assignation',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // UPSERT StudentProgress - remplace le score si déjà existant
    await prisma.studentProgress.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignment.id,
          studentId,
        },
      },
      update: {
        sectionId,
        score,
        timeSpent: timeSpent ?? null,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        id: randomUUID(),
        assignmentId: assignment.id,
        studentId,
        sectionId,
        score,
        timeSpent: timeSpent ?? null,
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Recalculer les moyennes et mettre à jour StudentScore
    await recalculateStudentScore(studentId, courseId);

    // Mettre à jour la progression du cours
    await updateCourseProgression(studentId, courseId);

    return NextResponse.json({
      success: true,
      message: 'Score enregistré',
      sectionType: section.type,
    });
  } catch (error) {
    console.error('Erreur API POST section score:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * Recalcule les moyennes quiz/exercices et met à jour StudentScore
 */
async function recalculateStudentScore(studentId: string, courseId: string) {
  // Récupérer tous les progrès de l'élève pour ce cours
  const progressRecords = await prisma.studentProgress.findMany({
    where: {
      studentId,
      CourseAssignment: { courseId },
      status: 'COMPLETED',
    },
    include: {
      Section: { select: { type: true } },
    },
  });

  // Séparer quiz et exercices
  const quizScores = progressRecords
    .filter((p) => p.Section?.type === 'QUIZ' && p.score !== null)
    .map((p) => p.score!);
  
  const exerciseScores = progressRecords
    .filter((p) => p.Section?.type === 'EXERCISE' && p.score !== null)
    .map((p) => p.score!);

  // Calculer les moyennes
  const quizAvg = quizScores.length > 0
    ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
    : 0;
  
  const exerciseAvg = exerciseScores.length > 0
    ? exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length
    : 0;

  // Récupérer les stats IA existantes
  const existingScore = await prisma.studentScore.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    select: { aiComprehension: true, aiSessionCount: true, examGrade: true },
  });

  const aiComprehension = existingScore?.aiComprehension ?? 0;
  const examGrade = existingScore?.examGrade;

  // Calculer le score continu : Quiz (25%) + Exercices (25%) + IA (20%) + Examen (30%)
  // Si pas d'examen, redistribuer sur les autres
  let continuousScore: number;
  if (examGrade !== null && examGrade !== undefined) {
    // Avec examen (note sur 6 → convertie en %)
    const examPercent = (examGrade / 6) * 100;
    continuousScore = 
      quizAvg * 0.25 + 
      exerciseAvg * 0.25 + 
      aiComprehension * 0.20 + 
      examPercent * 0.30;
  } else {
    // Sans examen : Quiz (35%) + Exercices (35%) + IA (30%)
    continuousScore = 
      quizAvg * 0.35 + 
      exerciseAvg * 0.35 + 
      aiComprehension * 0.30;
  }

  // UPSERT StudentScore
  await prisma.studentScore.upsert({
    where: { studentId_courseId: { studentId, courseId } },
    update: {
      quizAvg,
      exerciseAvg,
      quizCount: quizScores.length,
      exerciseCount: exerciseScores.length,
      continuousScore,
      updatedAt: new Date(),
    },
    create: {
      id: randomUUID(),
      studentId,
      courseId,
      quizAvg,
      exerciseAvg,
      quizCount: quizScores.length,
      exerciseCount: exerciseScores.length,
      aiComprehension: 0,
      aiSessionCount: 0,
      continuousScore,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Met à jour le pourcentage de progression du cours
 */
async function updateCourseProgression(studentId: string, courseId: string) {
  // Récupérer le StudentProfile
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    select: { id: true },
  });

  if (!studentProfile) return;

  // Compter les sections complétées vs total
  const [completedCount, totalCount] = await Promise.all([
    prisma.studentProgress.count({
      where: {
        studentId,
        CourseAssignment: { courseId },
        status: 'COMPLETED',
      },
    }),
    prisma.section.count({
      where: { Chapter: { courseId } },
    }),
  ]);

  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // UPSERT Progression
  await prisma.progression.upsert({
    where: {
      studentId_courseId: {
        studentId: studentProfile.id,
        courseId,
      },
    },
    update: {
      percentage,
      lastActivity: new Date(),
      updatedAt: new Date(),
    },
    create: {
      id: randomUUID(),
      studentId: studentProfile.id,
      courseId,
      percentage,
      lastActivity: new Date(),
      updatedAt: new Date(),
    },
  });
}

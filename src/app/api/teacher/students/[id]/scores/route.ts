import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ============================================
// GET : Récupérer tous les scores d'un élève
// ============================================
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: studentId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Accès réservé aux professeurs" }, { status: 403 });
    }

    // 1. Vérifier que le prof a accès à cet élève
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: { Class: { select: { id: true } } },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Profil professeur non trouvé" }, { status: 404 });
    }

    // 2. Récupérer l'élève et vérifier l'accès
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: {
        User: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        Class: { select: { id: true, name: true, level: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
    }

    const hasAccess = teacherProfile.Class.some((c) => c.id === student.classId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // 3. Récupérer les scores par cours
    const scores = await prisma.studentScore.findMany({
      where: { studentId },
      include: {
        Course: {
          select: {
            id: true,
            title: true,
            Subject: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { Course: { title: "asc" } },
    });

    // 4. Récupérer les détails de progression (Quiz/Exercices)
    const progressDetails = await prisma.studentProgress.findMany({
      where: { studentId },
      include: {
        CourseAssignment: {
          include: {
            Course: { select: { id: true, title: true } },
          },
        },
        Section: {
          select: { id: true, title: true, type: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 5. Récupérer les activités IA
    const aiActivities = await prisma.aIActivityScore.findMany({
      where: { studentId },
      include: {
        Course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limiter aux 50 dernières activités
    });

    // 6. Calculer les statistiques globales
    const globalStats = calculateGlobalStats(scores);

    // 7. Transformer les données pour le frontend (camelCase)
    const courseScores = scores.map((score) => ({
      ...score,
      course: score.Course ? {
        id: score.Course.id,
        title: score.Course.title,
        subject: score.Course.Subject ? {
          id: score.Course.Subject.id,
          name: score.Course.Subject.name,
        } : null,
      } : null,
      Course: undefined, // Supprimer la version PascalCase
    }));

    const progressDetailsTransformed = progressDetails.map((progress) => ({
      ...progress,
      courseAssignment: progress.CourseAssignment ? {
        ...progress.CourseAssignment,
        course: progress.CourseAssignment.Course,
        Course: undefined,
      } : null,
      section: progress.Section,
      CourseAssignment: undefined,
      Section: undefined,
    }));

    // Transformer aiActivities pour le frontend
    const aiActivitiesTransformed = aiActivities.map((activity) => ({
      id: activity.id,
      activityType: activity.activityType,
      themeId: activity.themeId,
      courseName: activity.Course?.title ?? null,
      comprehensionScore: activity.comprehensionScore,
      accuracyScore: activity.accuracyScore,
      autonomyScore: activity.autonomyScore,
      finalScore: activity.finalScore,
      duration: activity.duration,
      messageCount: activity.messageCount,
      strengths: activity.strengths,
      weaknesses: activity.weaknesses,
      recommendation: activity.recommendation,
      createdAt: activity.createdAt.toISOString(),
    }));

    return NextResponse.json({
      student: {
        id: student.User.id,
        firstName: student.User.firstName,
        lastName: student.User.lastName,
        email: student.User.email,
        className: student.Class.name,
        classLevel: student.Class.level,
      },
      globalStats,
      courseScores,
      progressDetails: progressDetailsTransformed,
      aiActivities: aiActivitiesTransformed,
    });
  } catch (error) {
    console.error("Erreur API GET /api/teacher/students/[id]/scores:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ============================================
// PUT : Mettre à jour la note d'examen
// ============================================
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id: studentId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Accès réservé aux professeurs" }, { status: 403 });
    }

    // Vérifier accès
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
      include: { Class: { select: { id: true } } },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Profil professeur non trouvé" }, { status: 404 });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      select: { classId: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
    }

    const hasAccess = teacherProfile.Class.some((c) => c.id === student.classId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Parser le body
    const body = await req.json();
    const { courseId, examGrade, examComment } = body;

    if (!courseId) {
      return NextResponse.json({ error: "courseId requis" }, { status: 400 });
    }

    // Validation de la note (système suisse: 0-6)
    if (examGrade !== null && examGrade !== undefined) {
      const grade = parseFloat(examGrade);
      if (isNaN(grade) || grade < 0 || grade > 6) {
        return NextResponse.json(
          { error: "La note doit être comprise entre 0 et 6" },
          { status: 400 }
        );
      }
    }

    // Récupérer le score existant pour calculer le finalScore
    const existingScore = await prisma.studentScore.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });

    const continuousScore = existingScore?.continuousScore || 0;
    const examGradeValue = examGrade !== null ? parseFloat(examGrade) : null;

    // Calculer le score final si on a une note d'examen
    let finalScore: number | null = null;
    let finalGrade: number | null = null;

    if (examGradeValue !== null) {
      // Formule: Final = (Continu × 40%) + (Exam × 60%)
      // Exam est sur 6, on le convertit en pourcentage
      const examScore100 = (examGradeValue / 6) * 100;
      finalScore = continuousScore * 0.4 + examScore100 * 0.6;
      finalGrade = (finalScore / 100) * 6;
      finalGrade = Math.round(finalGrade * 10) / 10; // Arrondi à 0.1
    }

    // Upsert le score
    const score = await prisma.studentScore.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      create: {
        id: randomUUID(),
        studentId,
        courseId,
        examGrade: examGradeValue,
        examDate: examGradeValue !== null ? new Date() : null,
        examComment: examComment || null,
        finalScore,
        finalGrade,
        updatedAt: new Date(),
      },
      update: {
        examGrade: examGradeValue,
        examDate: examGradeValue !== null ? new Date() : null,
        examComment: examComment || null,
        finalScore,
        finalGrade,
        updatedAt: new Date(),
      },
      include: {
        Course: { select: { id: true, title: true } },
      },
    });

    // Transformer pour le frontend (camelCase)
    type ScoreWithCourse = typeof score & { Course?: { id: string; title: string } };
    const scoreWithCourse = score as ScoreWithCourse;
    
    return NextResponse.json({
      success: true,
      score: {
        id: score.id,
        studentId: score.studentId,
        courseId: score.courseId,
        examGrade: score.examGrade,
        examDate: score.examDate,
        examComment: score.examComment,
        finalScore: score.finalScore,
        finalGrade: score.finalGrade,
        course: scoreWithCourse.Course ? { id: scoreWithCourse.Course.id, title: scoreWithCourse.Course.title } : null,
      },
    });
  } catch (error) {
    console.error("Erreur API PUT /api/teacher/students/[id]/scores:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ============================================
// Helpers
// ============================================

interface StudentScoreData {
  continuousScore: number;
  examGrade: number | null;
  finalGrade: number | null;
  aiComprehension: number;
}

function calculateGlobalStats(scores: StudentScoreData[]) {
  if (scores.length === 0) {
    return {
      continuous: 0,
      exams: null,
      final: null,
      courseCount: 0,
      examCount: 0,
      aiAverage: null,
    };
  }

  // Moyenne du score continu (0-100)
  const avgContinuous =
    scores.reduce((acc, s) => acc + s.continuousScore, 0) / scores.length;

  // Moyenne IA (0-100)
  const avgAI =
    scores.reduce((acc, s) => acc + s.aiComprehension, 0) / scores.length;

  // Moyenne des examens (seulement ceux qui ont une note)
  const examsWithGrade = scores.filter((s) => s.examGrade !== null);
  const avgExams =
    examsWithGrade.length > 0
      ? examsWithGrade.reduce((acc, s) => acc + (s.examGrade || 0), 0) / examsWithGrade.length
      : null;

  // Moyenne finale (seulement ceux qui ont un finalGrade)
  const withFinal = scores.filter((s) => s.finalGrade !== null);
  const avgFinal =
    withFinal.length > 0
      ? withFinal.reduce((acc, s) => acc + (s.finalGrade || 0), 0) / withFinal.length
      : null;

  return {
    continuous: Math.round(avgContinuous * 10) / 10,
    exams: avgExams !== null ? Math.round(avgExams * 10) / 10 : null,
    final: avgFinal !== null ? Math.round(avgFinal * 10) / 10 : null,
    courseCount: scores.length,
    examCount: examsWithGrade.length,
    aiAverage: Math.round(avgAI * 10) / 10,
  };
}

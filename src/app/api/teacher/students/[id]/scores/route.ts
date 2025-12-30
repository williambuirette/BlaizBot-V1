import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      include: { classes: { select: { id: true } } },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Profil professeur non trouvé" }, { status: 404 });
    }

    // 2. Récupérer l'élève et vérifier l'accès
    const student = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        class: { select: { id: true, name: true, level: true } },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Élève non trouvé" }, { status: 404 });
    }

    const hasAccess = teacherProfile.classes.some((c) => c.id === student.classId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // 3. Récupérer les scores par cours
    const scores = await prisma.studentScore.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { course: { title: "asc" } },
    });

    // 4. Récupérer les détails de progression (Quiz/Exercices)
    const progressDetails = await prisma.studentProgress.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: {
            course: { select: { id: true, title: true } },
          },
        },
        section: {
          select: { id: true, title: true, type: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 5. Calculer les statistiques globales
    const globalStats = calculateGlobalStats(scores);

    return NextResponse.json({
      student: {
        id: student.user.id,
        firstName: student.user.firstName,
        lastName: student.user.lastName,
        email: student.user.email,
        className: student.class.name,
        classLevel: student.class.level,
      },
      globalStats,
      courseScores: scores,
      progressDetails,
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
      include: { classes: { select: { id: true } } },
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

    const hasAccess = teacherProfile.classes.some((c) => c.id === student.classId);
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
        studentId,
        courseId,
        examGrade: examGradeValue,
        examDate: examGradeValue !== null ? new Date() : null,
        examComment: examComment || null,
        finalScore,
        finalGrade,
      },
      update: {
        examGrade: examGradeValue,
        examDate: examGradeValue !== null ? new Date() : null,
        examComment: examComment || null,
        finalScore,
        finalGrade,
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({
      success: true,
      score,
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
}

function calculateGlobalStats(scores: StudentScoreData[]) {
  if (scores.length === 0) {
    return {
      continuous: 0,
      exams: null,
      final: null,
      courseCount: 0,
      examCount: 0,
    };
  }

  // Moyenne du score continu (0-100)
  const avgContinuous =
    scores.reduce((acc, s) => acc + s.continuousScore, 0) / scores.length;

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
  };
}

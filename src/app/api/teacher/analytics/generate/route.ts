import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { geminiService } from "@/lib/ai/gemini";
import { analyticsService } from "@/lib/analytics";
import { NextResponse } from "next/server";
import { User } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { classId, courseId } = body;

    if (!classId || !courseId) {
      return NextResponse.json({ error: "Missing classId or courseId" }, { status: 400 });
    }

    // Récupérer le profil prof
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 401 });
    }

    // 1. Vérifier que le prof a accès à ce cours et cette classe
    const course = await prisma.course.findUnique({
      where: { id: courseId, teacherId: teacherProfile.id },
      include: {
        resources: true, // On récupère les ressources du cours
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found or unauthorized" }, { status: 404 });
    }

    // 2. Récupérer les progressions des élèves de cette classe pour ce cours
    // On cherche les assignations liées à ce cours (ou ses chapitres/sections) ET à cette classe
    const assignments = await prisma.courseAssignment.findMany({
      where: {
        OR: [
          { courseId: courseId },
          { chapter: { courseId: courseId } },
          { section: { chapter: { courseId: courseId } } },
        ],
        classId: classId, // Assigné à toute la classe
        // TODO: Gérer aussi les assignations aux Teams ou Students de cette classe si besoin
      },
      include: {
        progress: {
          include: {
            student: true, // Pour avoir le nom de l'élève
          },
        },
      },
    });

    // Aplatir les progressions
    const allProgress = assignments.flatMap((a) =>
      a.progress.map((p) => ({
        ...p,
        assignment: a,
        student: p.student as User,
      }))
    );

    if (allProgress.length === 0) {
      return NextResponse.json({
        summary: "Pas assez de données pour une analyse.",
        strengths: [],
        weaknesses: [],
        actions: ["Assigner des exercices aux élèves"],
      });
    }

    // 3. Calculer les stats et lancer l'analyse Gemini
    const stats = analyticsService.calculateClassStats(allProgress);
    const statsContext = analyticsService.formatStatsForAI(stats);

    const analysisResult = await geminiService.analyzeClassProgress(
      course.resources,
      allProgress,
      statsContext
    );

    // 4. Sauvegarder l'analyse
    const savedAnalysis = await prisma.classAnalysis.create({
      data: {
        classId,
        resourceIds: course.resources.map((r) => r.id),
        summary: analysisResult.summary,
        strengths: analysisResult.strengths,
        weaknesses: analysisResult.weaknesses,
        actions: analysisResult.actions,
      },
    });

    return NextResponse.json(savedAnalysis);
  } catch (error) {
    console.error("Error generating analytics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Missing classId" }, { status: 400 });
    }

    // Récupérer la dernière analyse pour cette classe
    const latestAnalysis = await prisma.classAnalysis.findFirst({
      where: { classId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(latestAnalysis || null);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

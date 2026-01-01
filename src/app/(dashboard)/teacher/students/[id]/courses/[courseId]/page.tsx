import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StudentCourseDetailPage } from "@/components/features/teacher/StudentCourseDetailPage";

interface PageProps {
  params: Promise<{ id: string; courseId: string }>;
}

export default async function StudentCourseDetailRoute({ params }: PageProps) {
  const { id: studentId, courseId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }
  if (session.user.role !== "TEACHER") {
    redirect("/");
  }

  // Vérifier que le prof a accès à cet élève
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { Class: { select: { id: true } } },
  });

  if (!teacherProfile) {
    notFound();
  }

  // Récupérer l'élève
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    include: {
      User: { select: { id: true, firstName: true, lastName: true, email: true } },
      Class: { select: { id: true, name: true, level: true } },
    },
  });

  if (!student) {
    notFound();
  }

  // Vérifier accès
  const hasAccess = teacherProfile.Class.some((c) => c.id === student.classId);
  if (!hasAccess) {
    redirect("/teacher/students");
  }

  // Récupérer le cours
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, Subject: { select: { name: true } } },
  });

  if (!course) {
    notFound();
  }

  // Récupérer le StudentScore pour ce cours
  const studentScore = await prisma.studentScore.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });

  // Récupérer les activités IA pour ce cours
  const aiActivities = await prisma.aIActivityScore.findMany({
    where: { studentId, courseId },
    orderBy: { createdAt: "desc" },
  });

  // Récupérer les quiz/exercices (StudentProgress)
  const progressRecords = await prisma.studentProgress.findMany({
    where: {
      studentId,
      CourseAssignment: { courseId },
    },
    include: {
      Section: { select: { id: true, title: true, type: true } },
      CourseAssignment: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Transformer les données
  const studentData = {
    id: student.User.id,
    firstName: student.User.firstName,
    lastName: student.User.lastName,
    email: student.User.email,
    className: student.Class.name,
    classLevel: student.Class.level,
  };

  const courseData = {
    id: course.id,
    title: course.title,
    subjectName: course.Subject?.name ?? "Sans matière",
  };

  const scoreData = studentScore ? {
    continuousScore: studentScore.continuousScore,
    aiComprehension: studentScore.aiComprehension,
    examGrade: studentScore.examGrade,
    finalGrade: studentScore.finalGrade,
    quizAvg: studentScore.quizAvg,
    exerciseAvg: studentScore.exerciseAvg,
    quizCount: studentScore.quizCount,
    exerciseCount: studentScore.exerciseCount,
    aiSessionCount: studentScore.aiSessionCount,
  } : null;

  const activitiesData = aiActivities.map((a) => ({
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

  const progressData = progressRecords.map((p) => ({
    id: p.id,
    sectionTitle: p.Section?.title ?? "Section",
    sectionType: p.Section?.type ?? "CONTENT",
    assignmentTitle: p.CourseAssignment?.title ?? "Devoir",
    status: p.status,
    score: p.score,
    timeSpent: p.timeSpent,
    completedAt: p.completedAt?.toISOString() ?? null,
  }));

  return (
    <StudentCourseDetailPage
      student={studentData}
      course={courseData}
      score={scoreData}
      aiActivities={activitiesData}
      progressRecords={progressData}
    />
  );
}

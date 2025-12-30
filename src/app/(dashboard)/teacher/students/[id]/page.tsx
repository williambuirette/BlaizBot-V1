import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StudentScorePage } from "@/components/features/teacher/StudentScorePage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherStudentDetailPage({ params }: PageProps) {
  const { id: studentId } = await params;
  const session = await auth();

  // Vérification authentification
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    redirect("/login");
  }

  // Récupérer le profil prof avec ses classes
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { Class: { select: { id: true } } },
  });

  if (!teacherProfile) {
    redirect("/login");
  }

  // Récupérer l'élève
  const student = await prisma.studentProfile.findUnique({
    where: { userId: studentId },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      class: {
        select: {
          id: true,
          name: true,
          level: true,
        },
      },
    },
  });

  // Vérifier que l'élève existe
  if (!student) {
    notFound();
  }

  // Vérifier que le prof a accès à cet élève (via ses classes)
  const hasAccess = teacherProfile.Class.some((c) => c.id === student.classId);
  if (!hasAccess) {
    notFound();
  }

  // Passer les données au client component
  return (
    <StudentScorePage
      studentId={studentId}
      studentName={`${student.user.firstName} ${student.user.lastName}`}
      studentEmail={student.user.email}
      className={student.class.name}
      classLevel={student.class.level}
    />
  );
}

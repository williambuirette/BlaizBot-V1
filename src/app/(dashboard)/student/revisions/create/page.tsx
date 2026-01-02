/**
 * Page création d'un nouveau supplément
 * /student/revisions/create
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CreateSupplementForm } from '@/components/features/student/revisions/CreateSupplementForm';

async function getStudentCourses(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true, classId: true },
  });

  if (!student) return [];

  // Récupérer les cours assignés à la classe de l'élève
  const assignments = await prisma.courseAssignment.findMany({
    where: {
      classId: student.classId,
    },
    select: {
      Course: {
        select: {
          id: true,
          title: true,
          Subject: { select: { name: true } },
          TeacherProfile: {
            select: {
              User: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
    distinct: ['courseId'],
  });

  return assignments
    .filter((a) => a.Course)
    .map((a) => ({
      id: a.Course!.id,
      title: a.Course!.title,
      subject: a.Course!.Subject?.name || 'Autre',
      teacher: a.Course!.TeacherProfile?.User
        ? `${a.Course!.TeacherProfile.User.firstName} ${a.Course!.TeacherProfile.User.lastName}`
        : null,
    }));
}

export default async function CreateSupplementPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const courses = await getStudentCourses(session.user.id);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau supplément</h1>
        <p className="text-muted-foreground">
          Créez des notes liées à un cours ou un cours personnel
        </p>
      </div>

      <CreateSupplementForm courses={courses} />
    </div>
  );
}

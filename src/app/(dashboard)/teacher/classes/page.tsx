import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { TeacherClassCard } from '@/components/features/teacher/TeacherClassCard';
import { GraduationCap } from 'lucide-react';

async function getTeacherClasses(userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      classes: {
        include: {
          students: {
            select: { id: true },
          },
        },
      },
      subjects: true,
    },
  });

  if (!teacherProfile) return [];

  const subjectNames = teacherProfile.subjects.map((s) => s.name);

  return teacherProfile.classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    level: cls.level,
    studentsCount: cls.students.length,
    subjects: subjectNames,
  }));
}

export default async function TeacherClassesPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const classes = await getTeacherClasses(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes Classes</h1>
        <p className="text-muted-foreground">
          Consultez et gérez vos classes assignées.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucune classe assignée</h3>
          <p className="text-sm text-muted-foreground">
            Contactez l&apos;administrateur pour être assigné à une classe.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <TeacherClassCard key={cls.id} classData={cls} />
          ))}
        </div>
      )}
    </div>
  );
}

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { StudentsList } from '@/components/features/teacher/StudentsList';

export default async function TeacherStudentsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  // Récupérer le TeacherProfile avec ses classes et toutes les infos des élèves
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      classes: {
        include: {
          students: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  address: true,
                  city: true,
                  postalCode: true,
                  isActive: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacherProfile) {
    redirect('/login');
  }

  // Collecter tous les élèves uniques avec leur classe et infos complètes
  const studentsMap = new Map<string, {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    parentEmail?: string | null;
    classes: string[];
    isActive?: boolean;
  }>();

  teacherProfile.classes.forEach((cls) => {
    cls.students.forEach((student) => {
      const existing = studentsMap.get(student.user.id);
      if (existing) {
        existing.classes.push(cls.name);
      } else {
        studentsMap.set(student.user.id, {
          id: student.user.id,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          email: student.user.email,
          phone: student.user.phone,
          address: student.user.address,
          city: student.user.city,
          postalCode: student.user.postalCode,
          parentEmail: student.parentEmail,
          classes: [cls.name],
          isActive: student.user.isActive,
        });
      }
    });
  });

  const students = Array.from(studentsMap.values()).sort((a, b) =>
    a.lastName.localeCompare(b.lastName)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes Élèves</h1>
        <p className="text-muted-foreground">
          {students.length} élève{students.length > 1 ? 's' : ''} dans vos classes
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucun élève</h3>
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas encore d&apos;élèves dans vos classes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <StudentsList students={students} />
      )}
    </div>
  );
}

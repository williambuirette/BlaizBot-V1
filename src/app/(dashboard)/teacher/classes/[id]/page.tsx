import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ClassStudentsList } from '@/components/features/teacher/ClassStudentsList';

interface ClassDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherClassDetailPage({ params }: ClassDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  // Récupérer le TeacherProfile
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: { classes: { select: { id: true } } },
  });

  if (!teacherProfile) {
    redirect('/login');
  }

  // Vérifier que le prof a accès à cette classe
  const hasAccess = teacherProfile.classes.some((c) => c.id === id);
  if (!hasAccess) {
    notFound();
  }

  // Récupérer les détails de la classe avec toutes les infos des élèves
  const classData = await prisma.class.findUnique({
    where: { id },
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
  });

  if (!classData) {
    notFound();
  }

  // Transformer les données pour le composant
  const students = classData.students.map((s) => ({
    id: s.user.id,
    firstName: s.user.firstName,
    lastName: s.user.lastName,
    email: s.user.email,
    phone: s.user.phone,
    address: s.user.address,
    city: s.user.city,
    postalCode: s.user.postalCode,
    parentEmail: s.parentEmail,
    isActive: s.user.isActive,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/teacher/classes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{classData.name}</h1>
          <p className="text-muted-foreground">Niveau : {classData.level}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="default">
              Active
            </Badge>
          </CardContent>
        </Card>
      </div>

      <ClassStudentsList students={students} className={classData.name} />
    </div>
  );
}

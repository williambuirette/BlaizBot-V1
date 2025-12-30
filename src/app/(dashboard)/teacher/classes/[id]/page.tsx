import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ClassStudentsList } from '@/components/features/teacher/ClassStudentsList';
import { GeminiInsightCard } from '@/components/features/dashboard/GeminiInsightCard';

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
    include: { Class: { select: { id: true } } },
  });

  if (!teacherProfile) {
    redirect('/login');
  }

  // Vérifier que le prof a accès à cette classe
  const hasAccess = teacherProfile.Class.some((c) => c.id === id);
  if (!hasAccess) {
    notFound();
  }

  // Récupérer les détails de la classe avec toutes les infos des élèves
  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      StudentProfile: {
        include: {
          User: {
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

  // Récupérer les assignations pour trouver le cours principal associé à cette classe
  // On cherche un cours assigné directement ou via un chapitre
  const assignments = await prisma.courseAssignment.findMany({
    where: { classId: id },
    select: { 
      courseId: true, 
      Chapter: { select: { courseId: true } } 
    },
    take: 20,
  });
  
  // Extraire le premier courseId valide trouvé
  const courseId = assignments.find(a => a.courseId)?.courseId || 
                   assignments.find(a => a.Chapter?.courseId)?.Chapter?.courseId;

  // Transformer les données pour le composant
  const students = classData.StudentProfile.map((s) => ({
    id: s.User.id,
    firstName: s.User.firstName,
    lastName: s.User.lastName,
    email: s.User.email,
    phone: s.User.phone,
    address: s.User.address,
    city: s.User.city,
    postalCode: s.User.postalCode,
    parentEmail: s.parentEmail,
    isActive: s.User.isActive,
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

      {/* Section Analytics IA */}
      {courseId ? (
        <div className="mb-6">
          <GeminiInsightCard classId={id} courseId={courseId} />
        </div>
      ) : (
        <div className="mb-6 p-4 border border-dashed border-indigo-200 bg-indigo-50/50 rounded-lg text-indigo-600 text-sm flex items-center justify-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Assignez un cours ou un chapitre à cette classe pour activer l'analyse IA (Cockpit Pédagogique).</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.StudentProfile.length}</div>
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

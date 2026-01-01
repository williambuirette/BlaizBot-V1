import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, BookOpen, Bot } from 'lucide-react';
import Link from 'next/link';
import { ClassStudentsList } from '@/components/features/teacher/ClassStudentsList';
import { GeminiInsightCard } from '@/components/features/dashboard/GeminiInsightCard';
import { ClassAIStats } from '@/components/features/teacher/ClassAIStats';

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
              StudentScore: {
                select: {
                  aiComprehension: true,
                  continuousScore: true,
                  finalGrade: true,
                },
              },
              AIActivityScore: {
                select: {
                  id: true,
                  finalScore: true,
                  createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
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
  const students = classData.StudentProfile.map((s) => {
    // Calculer la moyenne IA de l'élève
    const aiScores = s.User.StudentScore
      ?.filter((sc) => sc.aiComprehension !== null)
      .map((sc) => sc.aiComprehension as number) || [];
    const aiAverage = aiScores.length > 0
      ? Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length)
      : null;
    
    // Compter les sessions IA
    const aiSessionsCount = s.User.AIActivityScore?.length || 0;

    return {
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
      aiAverage,
      aiSessionsCount,
    };
  });

  // Préparer les données pour ClassAIStats (top 3 élèves actifs IA)
  const topAIStudents = students
    .filter((s) => s.aiSessionsCount > 0)
    .sort((a, b) => b.aiSessionsCount - a.aiSessionsCount)
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      sessionsCount: s.aiSessionsCount,
      averageScore: s.aiAverage,
    }));

  // Calculer la moyenne IA globale de la classe
  const classAIScores = students
    .filter((s) => s.aiAverage !== null)
    .map((s) => s.aiAverage as number);
  const classAIAverage = classAIScores.length > 0
    ? Math.round(classAIScores.reduce((a, b) => a + b, 0) / classAIScores.length)
    : null;

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
          <span>Assignez un cours ou un chapitre à cette classe pour activer l&apos;analyse IA (Cockpit Pédagogique).</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
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

        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Score IA Moyen</CardTitle>
            <Bot className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {classAIAverage !== null ? `${classAIAverage}%` : '—'}
            </div>
            <p className="text-xs text-purple-600/70">
              {classAIScores.length} élève(s) évalué(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Top Élèves IA */}
      <ClassAIStats topStudents={topAIStudents} classAverage={classAIAverage} />

      <ClassStudentsList students={students} className={classData.name} />
    </div>
  );
}

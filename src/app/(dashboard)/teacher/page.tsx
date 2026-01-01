import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, BookOpen, Mail } from 'lucide-react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { TeacherStatsCard } from '@/components/features/teacher/TeacherStatsCard';
import { ControlCenterDashboard } from '@/components/features/dashboard/ControlCenterDashboard';

async function getTeacherData(userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      Class: { select: { id: true, name: true } },
      Course: { select: { id: true, title: true, subjectId: true }, where: { isFolder: false } },
      Subject: { select: { id: true, name: true } },
      User: { select: { firstName: true } },
    },
  });

  if (!teacherProfile) return null;

  return {
    firstName: teacherProfile.User.firstName,
    classesCount: teacherProfile.Class.length,
    coursesCount: teacherProfile.Course.length,
    unreadMessages: 0,
    // Pour le Centre de Pilotage
    classes: teacherProfile.Class.map((c) => ({ id: c.id, name: c.name })),
    subjects: teacherProfile.Subject.map((s) => ({ id: s.id, name: s.name })),
    courses: teacherProfile.Course.map((c) => ({
      id: c.id,
      name: c.title,
      subjectId: c.subjectId,
    })),
  };
}

export default async function TeacherDashboardPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const data = await getTeacherData(session.user.id);

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Profil professeur non trouvé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold">Bonjour, {data.firstName} 👋</h1>
          <p className="opacity-90">Bienvenue sur votre espace professeur</p>
        </CardContent>
      </Card>

      {/* Stats Cards avec liens */}
      <div className="grid gap-4 md:grid-cols-3">
        <TeacherStatsCard
          title="Mes classes"
          value={data.classesCount}
          icon={GraduationCap}
          href="/teacher/classes"
          iconColor="text-blue-600"
        />
        <TeacherStatsCard
          title="Mes cours"
          value={data.coursesCount}
          icon={BookOpen}
          href="/teacher/courses"
          iconColor="text-green-600"
        />
        <TeacherStatsCard
          title="Messages"
          value={data.unreadMessages}
          icon={Mail}
          href="/teacher/messages"
          iconColor="text-purple-600"
        />
      </div>

      {/* Centre de Pilotage */}
      <div className="pt-4">
        <h2 className="text-lg font-semibold mb-4">📊 Centre de Pilotage</h2>
        <ControlCenterDashboard
          classes={data.classes}
          subjects={data.subjects}
          courses={data.courses}
        />
      </div>
    </div>
  );
}

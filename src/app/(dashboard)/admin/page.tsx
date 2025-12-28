import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, FileText } from 'lucide-react';
import { StatsCard } from '@/components/features/admin/StatsCard';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

async function getStats() {
  const [users, classes, subjects, courses] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.course.count(),
  ]);
  return { users, classes, subjects, courses };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const stats = await getStats();

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold">Administration 🛡️</h1>
          <p className="opacity-90">Vue d&apos;ensemble de la plateforme</p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Utilisateurs"
          value={stats.users}
          icon={Users}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Classes"
          value={stats.classes}
          icon={GraduationCap}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Matières"
          value={stats.subjects}
          icon={BookOpen}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Cours"
          value={stats.courses}
          icon={FileText}
          iconColor="text-orange-600"
        />
      </div>
    </div>
  );
}

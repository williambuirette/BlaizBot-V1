import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminStats } from '@/data/mockData';
import { Users, GraduationCap, BookOpen, Activity, UserCheck, ShieldCheck } from 'lucide-react';

export default function AdminDashboardPage() {
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total inscrits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Élèves</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">{adminStats.totalClasses} classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Professeurs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">{adminStats.totalCourses} cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats.totalAdmins}</div>
            <p className="text-xs text-muted-foreground">Administrateurs</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions actives</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{adminStats.activeSessionsToday}</div>
            <p className="text-xs text-muted-foreground">Utilisateurs connectés aujourd&apos;hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score plateforme</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{adminStats.averagePlatformScore}%</div>
            <p className="text-xs text-muted-foreground">Moyenne générale</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

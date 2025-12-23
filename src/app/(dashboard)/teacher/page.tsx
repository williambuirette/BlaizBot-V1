import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { teacherUser, teacherStats, teacherClasses } from '@/data/mockData';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';

export default function TeacherDashboardPage() {
  const firstName = teacherUser.name.split(' ')[0] ?? teacherUser.name;
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold">Bonjour, {firstName} 👋</h1>
          <p className="opacity-90">{teacherUser.subject}</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.totalClasses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cours créés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.coursesCreated}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.averageClassScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Mes classes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teacherClasses.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{cls.name}</p>
                  <p className="text-sm text-muted-foreground">{cls.students} élèves</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{cls.averageScore}%</p>
                  <p className="text-xs text-muted-foreground">Score moyen</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

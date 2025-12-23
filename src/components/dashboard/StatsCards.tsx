import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Target, Trophy, Clock } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    coursesCompleted: number;
    totalCourses: number;
    averageScore: number;
    hoursSpent: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    {
      label: 'Cours terminés',
      value: `${stats.coursesCompleted}/${stats.totalCourses}`,
      icon: BookOpen,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Progression',
      value: `${Math.round((stats.coursesCompleted / stats.totalCourses) * 100)}%`,
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Score moyen',
      value: `${stats.averageScore}%`,
      icon: Trophy,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Heures passées',
      value: `${stats.hoursSpent}h`,
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

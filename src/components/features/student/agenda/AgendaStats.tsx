// src/components/features/student/agenda/AgendaStats.tsx
// Composant affichant les stats de l'agenda (Total, En retard, Aujourd'hui, À venir)

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, AlertTriangle, Clock, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  stats: {
    total: number;
    overdue: number;
    today: number;
    upcoming: number;
    personal: number;
  };
}

export function AgendaStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="Total"
        value={stats.total}
        icon={<BookOpen className="h-4 w-4" />}
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatCard
        label="En retard"
        value={stats.overdue}
        icon={<AlertTriangle className="h-4 w-4" />}
        color="text-red-600"
        bgColor="bg-red-100"
      />
      <StatCard
        label="Aujourd'hui"
        value={stats.today}
        icon={<Clock className="h-4 w-4" />}
        color="text-orange-600"
        bgColor="bg-orange-100"
      />
      <StatCard
        label="À venir"
        value={stats.upcoming}
        icon={<CalendarDays className="h-4 w-4" />}
        color="text-green-600"
        bgColor="bg-green-100"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className={cn('p-2 rounded-full', bgColor, color)}>
            {icon}
          </span>
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

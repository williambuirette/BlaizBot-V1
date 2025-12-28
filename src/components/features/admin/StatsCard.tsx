import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={cn('rounded-lg bg-muted p-3', iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  iconColor?: string;
  className?: string;
}

export function TeacherStatsCard({
  title,
  value,
  icon: Icon,
  href,
  iconColor = 'text-primary',
  className,
}: TeacherStatsCardProps) {
  const cardContent = (
    <Card className={cn('transition-shadow', href && 'hover:shadow-md cursor-pointer', className)}>
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

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}

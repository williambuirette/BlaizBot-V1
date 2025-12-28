import { cn } from '@/lib/utils';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

const styles: Record<Role, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  TEACHER: 'bg-blue-100 text-blue-800',
  STUDENT: 'bg-green-100 text-green-800',
};

const labels: Record<Role, string> = {
  ADMIN: 'Admin',
  TEACHER: 'Professeur',
  STUDENT: 'Élève',
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span className={cn('rounded-full px-2 py-1 text-xs font-medium', styles[role], className)}>
      {labels[role]}
    </span>
  );
}

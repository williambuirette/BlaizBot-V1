'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Eye, User } from 'lucide-react';
import type { StudentStats } from '@/types/student-filters';

interface StudentCardProps {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    classes: string[];
    stats?: StudentStats;
  };
  onViewContact?: () => void;
  selected?: boolean;
  onToggleSelect?: () => void;
}

const ALERT_BADGES = {
  success: { label: '🟢 En réussite', className: 'bg-green-100 text-green-800 border-green-200' },
  warning: { label: '🟡 À surveiller', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  danger: { label: '🔴 En difficulté', className: 'bg-red-100 text-red-800 border-red-200' },
  'no-data': { label: '⚪ Sans notes', className: 'bg-gray-100 text-gray-600 border-gray-200' },
} as const;

type AlertKey = keyof typeof ALERT_BADGES;

export function StudentCard({ student, onViewContact, selected, onToggleSelect }: StudentCardProps) {
  const stats = student.stats;
  const alertLevel: AlertKey = (stats?.alertLevel as AlertKey) ?? 'no-data';
  const alertConfig = ALERT_BADGES[alertLevel];

  // Calcul des valeurs d'affichage
  const continuousDisplay = stats?.totalCourses 
    ? `${Math.round((stats.averageGrade ?? 0) / 6 * 100)}%` 
    : '—';
  const examDisplay = stats?.coursesWithGrades 
    ? (stats.averageGrade?.toFixed(1) ?? '—')
    : '—';
  const finalDisplay = stats?.averageGrade 
    ? stats.averageGrade.toFixed(1)
    : '—';

  return (
    <Card className={`transition-all hover:shadow-md ${selected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        {/* Header: Nom + Classe */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={onToggleSelect}
                className="h-4 w-4 rounded border-gray-300"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {student.lastName.toUpperCase()} {student.firstName}
                </span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {student.classes.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats: 3 mini-badges */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold text-sm">{continuousDisplay}</div>
            <div className="text-xs text-muted-foreground">Continu</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold text-sm">{examDisplay}</div>
            <div className="text-xs text-muted-foreground">Exam</div>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <div className="font-semibold text-sm">{finalDisplay}</div>
            <div className="text-xs text-muted-foreground">Final</div>
          </div>
        </div>

        {/* Footer: État + Actions */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={alertConfig.className}>
            {alertConfig.label}
          </Badge>
          <div className="flex gap-1">
            {onViewContact && (
              <Button variant="ghost" size="icon" onClick={onViewContact} title="Voir contact">
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild title="Voir détails">
              <Link href={`/teacher/students/${student.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

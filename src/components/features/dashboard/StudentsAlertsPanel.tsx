/**
 * Panel Élèves à Surveiller
 * Phase 7-sexies
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';
import type { StudentAlert } from '@/types/dashboard-filters';
import {
  getAlertBadgeClass,
  getAlertEmoji,
  formatRelativeDate,
} from '@/lib/utils/kpi-calculations';
import { cn } from '@/lib/utils';

interface StudentsAlertsPanelProps {
  alerts: StudentAlert[];
  isLoading?: boolean;
  onStudentClick?: (studentId: string) => void;
}

function StudentAlertItem({
  alert,
  onStudentClick,
}: {
  alert: StudentAlert;
  onStudentClick?: (studentId: string) => void;
}) {
  const initials = `${alert.firstName[0]}${alert.lastName[0]}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 py-2 border-b last:border-0">
      {/* Avatar avec indicateur */}
      <div className="relative">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-0.5 -right-0.5 text-xs">
          {getAlertEmoji(alert.alertLevel)}
        </span>
      </div>

      {/* Info élève */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {alert.firstName} {alert.lastName}
          </span>
          <span className="text-xs text-muted-foreground">{alert.className}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Moy: {alert.averageScore}%</span>
          {alert.weakCourse && (
            <>
              <span>•</span>
              <span className="truncate">Faible: {alert.weakCourse}</span>
            </>
          )}
        </div>
      </div>

      {/* Badge + Action */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={cn('text-xs', getAlertBadgeClass(alert.alertLevel))}
        >
          {alert.averageScore}%
        </Badge>
        {onStudentClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onStudentClick(alert.studentId)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function StudentsAlertsPanel({
  alerts,
  isLoading,
  onStudentClick,
}: StudentsAlertsPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Séparer par niveau d'alerte
  const critical = alerts.filter((a) => a.alertLevel === 'critical');
  const warning = alerts.filter((a) => a.alertLevel === 'warning');
  const good = alerts.filter((a) => a.alertLevel === 'good');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          👥 Élèves à Surveiller
          {alerts.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {alerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun élève à surveiller
          </p>
        ) : (
          <div className="space-y-0">
            {/* Critiques en premier */}
            {critical.map((alert) => (
              <StudentAlertItem
                key={alert.studentId}
                alert={alert}
                onStudentClick={onStudentClick}
              />
            ))}
            {/* Puis warnings */}
            {warning.map((alert) => (
              <StudentAlertItem
                key={alert.studentId}
                alert={alert}
                onStudentClick={onStudentClick}
              />
            ))}
            {/* Puis les bons (si affichés) */}
            {good.slice(0, 2).map((alert) => (
              <StudentAlertItem
                key={alert.studentId}
                alert={alert}
                onStudentClick={onStudentClick}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Carte KPI individuelle avec tendance
 * Phase 7-sexies
 */

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrendDirection } from '@/types/dashboard-filters';
import { getTrendColor, getTrendArrow } from '@/lib/utils/kpi-calculations';

interface KPICardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: TrendDirection;
  trendValue?: number;
  icon?: LucideIcon;
  status?: 'good' | 'warning' | 'critical' | 'neutral';
  inverseTrend?: boolean; // Pour les métriques où down = bon (ex: alertes)
}

const statusColors = {
  good: 'border-l-green-500',
  warning: 'border-l-orange-500',
  critical: 'border-l-red-500',
  neutral: 'border-l-blue-500',
};

export function KPICard({
  title,
  value,
  unit = '%',
  trend,
  trendValue,
  icon: Icon,
  status = 'neutral',
  inverseTrend = false,
}: KPICardProps) {
  return (
    <Card className={cn('border-l-4', statusColors[status])}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{value}</span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
            {trend && trendValue !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  getTrendColor(trend, inverseTrend)
                )}
              >
                <span>{getTrendArrow(trend)}</span>
                <span>
                  {trendValue > 0 ? '+' : ''}
                  {trendValue}
                  {unit}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="p-2 bg-muted rounded-md">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

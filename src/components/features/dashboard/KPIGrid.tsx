/**
 * Grille des 4 KPIs principaux
 * Phase 7-sexies
 */

'use client';

import { Target, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { KPICard } from './KPICard';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardKPIs } from '@/types/dashboard-filters';
import { getAlertLevel } from '@/lib/utils/kpi-calculations';

interface KPIGridProps {
  kpis: DashboardKPIs | null;
  isLoading?: boolean;
}

export function KPIGrid({ kpis, isLoading }: KPIGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px]" />
        ))}
      </div>
    );
  }

  if (!kpis) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  // Déterminer le status de chaque KPI
  const getScoreStatus = (score: number) => {
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'critical';
  };

  const getAlertStatus = (count: number) => {
    if (count === 0) return 'good';
    if (count <= 3) return 'warning';
    return 'critical';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Moyenne Générale"
        value={kpis.averageScore}
        unit="%"
        icon={Target}
        status={getScoreStatus(kpis.averageScore)}
      />
      <KPICard
        title="Taux de Réussite"
        value={kpis.successRate}
        unit="%"
        icon={CheckCircle}
        status={getScoreStatus(kpis.successRate)}
      />
      <KPICard
        title="Progression"
        value={kpis.progressionRate}
        unit="%"
        icon={TrendingUp}
        status={getScoreStatus(kpis.progressionRate)}
      />
      <KPICard
        title="Alertes Actives"
        value={kpis.activeAlerts}
        unit=""
        icon={AlertTriangle}
        status={getAlertStatus(kpis.activeAlerts)}
        inverseTrend
      />
    </div>
  );
}

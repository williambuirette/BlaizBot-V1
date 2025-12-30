'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { GroupStats } from '@/lib/student-filters';

interface StatsCountersProps {
  stats: GroupStats;
  selectedCount: number;
  totalCount: number;
}

const STAT_CARDS = [
  {
    key: 'success' as const,
    label: 'En réussite',
    icon: '🟢',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
  {
    key: 'warning' as const,
    label: 'À surveiller',
    icon: '🟡',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
  },
  {
    key: 'danger' as const,
    label: 'En difficulté',
    icon: '🔴',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
] as const;

export function StatsCounters({ stats, selectedCount, totalCount }: StatsCountersProps) {
  const selectionLabel = selectedCount > 0
    ? `${selectedCount} élève${selectedCount > 1 ? 's' : ''} sélectionné${selectedCount > 1 ? 's' : ''} sur ${totalCount}`
    : `${totalCount} élève${totalCount > 1 ? 's' : ''}`;

  return (
    <div className="space-y-2">
      {/* Titre avec compteur */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          📊 Statistiques ({selectionLabel})
        </h3>
      </div>

      {/* 4 cartes KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map((card) => {
          const count = card.key === 'success' 
            ? stats.successCount 
            : card.key === 'warning' 
              ? stats.warningCount 
              : stats.dangerCount;

          return (
            <Card 
              key={card.key}
              className={`${card.bgColor} ${card.borderColor} border`}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold">
                  <span className="mr-1">{card.icon}</span>
                  {count}
                </div>
                <div className={`text-xs ${card.textColor}`}>
                  {card.label}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Carte moyenne */}
        <Card className="bg-blue-50 border-blue-200 border">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {stats.averageGrade !== null 
                ? `${stats.averageGrade.toFixed(1)}/6` 
                : '—'}
            </div>
            <div className="text-xs text-blue-600">
              Moyenne
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

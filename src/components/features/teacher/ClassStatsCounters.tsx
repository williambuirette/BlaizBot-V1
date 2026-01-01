'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { ClassGroupStats } from '@/types/class-filters';

interface ClassStatsCountersProps {
  stats: ClassGroupStats;
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

export function ClassStatsCounters({ stats, selectedCount, totalCount }: ClassStatsCountersProps) {
  const selectionLabel = selectedCount > 0
    ? `${selectedCount} classe${selectedCount > 1 ? 's' : ''} sélectionnée${selectedCount > 1 ? 's' : ''} sur ${totalCount}`
    : `${totalCount} classe${totalCount > 1 ? 's' : ''}`;

  const studentLabel = `${stats.totalStudents} élève${stats.totalStudents > 1 ? 's' : ''}`;

  return (
    <div className="space-y-2">
      {/* Titre avec compteur */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          📊 Statistiques ({selectionLabel} · {studentLabel})
        </h3>
      </div>

      {/* 5 cartes KPI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

        {/* Carte moyenne IA */}
        <Card className="bg-purple-50 border-purple-200 border">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-700">
              🤖 {stats.averageAI !== null 
                ? `${stats.averageAI.toFixed(0)}%` 
                : '—'}
            </div>
            <div className="text-xs text-purple-600">
              Moy IA
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

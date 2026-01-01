'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Trophy, Activity, TrendingUp } from 'lucide-react';

interface TopStudent {
  id: string;
  name: string;
  sessionsCount: number;
  averageScore: number | null;
}

interface ClassAIStatsProps {
  topStudents: TopStudent[];
  classAverage: number | null;
}

/**
 * ClassAIStats - Affiche les statistiques IA d'une classe
 * - Top 3 élèves les plus actifs en IA
 * - Score moyen de la classe
 */
export function ClassAIStats({ topStudents, classAverage }: ClassAIStatsProps) {
  if (topStudents.length === 0) {
    return (
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Bot className="h-5 w-5" />
            <span className="text-sm">
              Aucune activité IA enregistrée pour cette classe
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-purple-700 flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Top 3 Élèves Actifs IA
          </CardTitle>
          {classAverage !== null && (
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              Moy. classe : {classAverage}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topStudents.map((student, index) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getMedalEmoji(index)}</span>
                <div>
                  <p className="font-medium text-sm">{student.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {student.sessionsCount} session{student.sessionsCount > 1 ? 's' : ''} IA
                  </p>
                </div>
              </div>
              <div className="text-right">
                {student.averageScore !== null ? (
                  <Badge 
                    variant="secondary" 
                    className={
                      student.averageScore >= 70 
                        ? 'bg-green-100 text-green-700' 
                        : student.averageScore >= 50 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                    }
                  >
                    {student.averageScore}%
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

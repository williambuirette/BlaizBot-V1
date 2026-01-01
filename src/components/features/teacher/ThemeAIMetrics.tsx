'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, TrendingUp, Users, Brain, Loader2 } from 'lucide-react';

interface ThemeAIMetricsProps {
  courseId: string;
}

interface AIMetricsData {
  averageScore: number | null;
  studentsEvaluated: number;
  totalStudents: number;
  distribution: {
    excellent: number; // 80-100
    good: number;      // 60-79
    average: number;   // 40-59
    weak: number;      // 0-39
  };
}

/**
 * ThemeAIMetrics - Affiche les métriques IA pour un cours/thème
 * - Score moyen IA
 * - Distribution des niveaux
 * - Nombre d'élèves évalués
 */
export function ThemeAIMetrics({ courseId }: ThemeAIMetricsProps) {
  const [metrics, setMetrics] = useState<AIMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/teacher/courses/${courseId}/ai-metrics`);
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Erreur fetch AI metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [courseId]);

  if (loading) {
    return (
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  if (!metrics || metrics.studentsEvaluated === 0) {
    return (
      <Card className="border-purple-200 bg-purple-50/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Bot className="h-5 w-5" />
            <span className="text-sm">
              Aucune évaluation IA disponible pour ce cours
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const total = metrics.studentsEvaluated;

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-purple-700 flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Évaluations IA du Thème
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score moyen */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Score Moyen IA</span>
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(metrics.averageScore)}`}>
            {metrics.averageScore !== null ? `${metrics.averageScore}%` : '—'}
          </span>
        </div>

        {/* Élèves évalués */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-purple-100">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Élèves évalués</span>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
            {metrics.studentsEvaluated} / {metrics.totalStudents}
          </Badge>
        </div>

        {/* Distribution */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-purple-700">Distribution des niveaux</p>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-green-600">Excellent</span>
              <Progress 
                value={total > 0 ? (metrics.distribution.excellent / total) * 100 : 0} 
                className="flex-1 h-2 bg-green-100"
              />
              <span className="text-xs w-8 text-right">{metrics.distribution.excellent}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-blue-600">Bon</span>
              <Progress 
                value={total > 0 ? (metrics.distribution.good / total) * 100 : 0} 
                className="flex-1 h-2 bg-blue-100"
              />
              <span className="text-xs w-8 text-right">{metrics.distribution.good}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-yellow-600">Moyen</span>
              <Progress 
                value={total > 0 ? (metrics.distribution.average / total) * 100 : 0} 
                className="flex-1 h-2 bg-yellow-100"
              />
              <span className="text-xs w-8 text-right">{metrics.distribution.average}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-16 text-red-600">Faible</span>
              <Progress 
                value={total > 0 ? (metrics.distribution.weak / total) * 100 : 0} 
                className="flex-1 h-2 bg-red-100"
              />
              <span className="text-xs w-8 text-right">{metrics.distribution.weak}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Bot, Target, Trophy, Activity, Loader2 } from 'lucide-react';
import { AIScoreBadge } from './AIScoreBadge';

interface AIProgressData {
  currentScore: number | null;
  previousScore: number | null;
  totalSessions: number;
  weekSessions: number;
  bestScore: number | null;
  averageScore: number | null;
  lastSessionDate: string | null;
  progressGoal: number; // Objectif de progression
}

interface AIProgressCardProps {
  studentId?: string;
  className?: string;
}

/**
 * AIProgressCard - Card de progression IA pour l'élève
 * - Score actuel avec tendance
 * - Objectifs et progression
 * - Statistiques de sessions
 * - Encouragements
 */
export function AIProgressCard({ studentId, className = '' }: AIProgressCardProps) {
  const [data, setData] = useState<AIProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/student/ai-progress`);
        if (res.ok) {
          const progressData = await res.json();
          setData(progressData);
        }
      } catch (error) {
        console.error('Erreur fetch AI progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [studentId]);

  if (loading) {
    return (
      <Card className={`border-purple-200 bg-purple-50/30 ${className}`}>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={`border-purple-200 bg-purple-50/30 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-purple-700 flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Mon Assistant IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-purple-600 mb-3">
              Commence ton aventure avec l&apos;assistant IA !
            </p>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              Première session IA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getEncouragement = () => {
    if (!data.currentScore) return "Commence ton aventure IA !";
    if (data.currentScore >= 80) return "Excellent travail ! Tu maîtrises bien l'IA 🚀";
    if (data.currentScore >= 60) return "Bon travail ! Continue comme ça 👍";
    if (data.currentScore >= 40) return "En bonne voie ! Persévère 💪";
    return "Allez, tu peux y arriver ! 🌟";
  };

  const progressToGoal = data.currentScore ? Math.min(100, (data.currentScore / data.progressGoal) * 100) : 0;

  return (
    <Card className={`border-purple-200 bg-purple-50/30 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-purple-700 flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Mon Assistant IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score actuel avec tendance */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Score actuel</span>
          <AIScoreBadge 
            score={data.currentScore} 
            previousScore={data.previousScore}
            showIcon={true}
            showTrend={true}
            size="default"
          />
        </div>

        {/* Progression vers objectif */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-600 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Objectif: {data.progressGoal}%
            </span>
            <span className="text-xs text-purple-600">{Math.round(progressToGoal)}%</span>
          </div>
          <Progress 
            value={progressToGoal} 
            className="h-2 bg-purple-100"
          />
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-2 rounded-lg bg-white/60 border border-purple-100">
            <p className="text-lg font-bold text-purple-700">{data.totalSessions}</p>
            <p className="text-xs text-purple-600">Sessions totales</p>
          </div>
          <div className="p-2 rounded-lg bg-white/60 border border-purple-100">
            {data.bestScore !== null ? (
              <>
                <p className="text-lg font-bold text-purple-700 flex items-center justify-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {data.bestScore}%
                </p>
                <p className="text-xs text-purple-600">Meilleur score</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-purple-700">—</p>
                <p className="text-xs text-purple-600">Meilleur score</p>
              </>
            )}
          </div>
        </div>

        {/* Encouragement */}
        <div className="p-3 rounded-lg bg-white/80 border border-purple-100 text-center">
          <p className="text-sm text-purple-700 font-medium">
            {getEncouragement()}
          </p>
        </div>

        {/* Sessions cette semaine */}
        {data.weekSessions > 0 && (
          <div className="flex items-center justify-center gap-1 text-xs text-purple-600">
            <Activity className="h-3 w-3" />
            {data.weekSessions} session{data.weekSessions > 1 ? 's' : ''} cette semaine
          </div>
        )}
      </CardContent>
    </Card>
  );
}
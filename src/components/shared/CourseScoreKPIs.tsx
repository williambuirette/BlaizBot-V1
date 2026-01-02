'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Bot, ClipboardCheck, Award, BookOpen, Dumbbell } from 'lucide-react';
import type { CourseScoreData, KPIColor } from '@/types/course-score';

// ============================================
// TYPES
// ============================================

interface CourseScoreKPIsProps {
  score: CourseScoreData | null;
  /** Afficher le compteur de sessions IA (5ème KPI) */
  showAISessions?: boolean;
  /** Mode compact pour mobile */
  compact?: boolean;
  /** Classes CSS supplémentaires */
  className?: string;
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subLabel?: string;
  color: KPIColor;
  compact?: boolean;
}

// ============================================
// MAPPING COULEURS
// ============================================

const colorMap: Record<KPIColor, string> = {
  blue: 'bg-blue-100 text-blue-600',
  purple: 'bg-purple-100 text-purple-600',
  amber: 'bg-amber-100 text-amber-600',
  green: 'bg-green-100 text-green-600',
  slate: 'bg-slate-100 text-slate-600',
  orange: 'bg-orange-100 text-orange-600',
};

// ============================================
// SOUS-COMPOSANT KPI CARD
// ============================================

function KPICard({ icon, label, value, subLabel, color, compact }: KPICardProps) {
  return (
    <Card>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg ${compact ? 'p-1.5' : 'p-2'} ${colorMap[color]}`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-xs'}`}>
              {label}
            </p>
            <p className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>
              {value}
            </p>
            {subLabel && (
              <p className="text-xs text-muted-foreground truncate">
                {subLabel}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

/**
 * CourseScoreKPIs - Affiche les KPIs de score d'un élève sur un cours
 * 
 * Utilisé par :
 * - Page cours élève : /student/courses/[id]
 * - Page détail élève (prof) : /teacher/students/[id]/courses/[courseId]
 * 
 * KPIs affichés :
 * 1. Continu (bleu) - Score continu calculé (%)
 * 2. Quiz (orange) - Moyenne des quiz (%)
 * 3. Exercices (vert) - Moyenne des exercices (%)
 * 4. Score IA (violet) - Compréhension IA (%)
 * 5. Examen (ambre) - Note d'examen (/6)
 * 6. (optionnel) Sessions IA - Nombre de sessions
 */
export function CourseScoreKPIs({ 
  score, 
  showAISessions = false, 
  compact = false,
  className = '' 
}: CourseScoreKPIsProps) {
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';

  // Si aucun score, afficher des placeholders
  const hasScore = score !== null;
  
  return (
    <div className={`grid gap-4 ${showAISessions ? 'md:grid-cols-3 lg:grid-cols-6' : 'md:grid-cols-3 lg:grid-cols-5'} ${className}`}>
      {/* 1. Score Continu */}
      <KPICard
        icon={<TrendingUp className={iconSize} />}
        label="Continu"
        value={hasScore ? `${score.continuousScore.toFixed(0)}%` : '—'}
        subLabel={hasScore ? `Quiz + Exercices + IA` : undefined}
        color="blue"
        compact={compact}
      />

      {/* 2. Moyenne Quiz */}
      <KPICard
        icon={<BookOpen className={iconSize} />}
        label="Quiz"
        value={hasScore ? `${score.quizAvg.toFixed(0)}%` : '—'}
        subLabel={hasScore && score.quizCount > 0 ? `${score.quizCount} quiz` : undefined}
        color="orange"
        compact={compact}
      />

      {/* 3. Moyenne Exercices */}
      <KPICard
        icon={<Dumbbell className={iconSize} />}
        label="Exercices"
        value={hasScore ? `${score.exerciseAvg.toFixed(0)}%` : '—'}
        subLabel={hasScore && score.exerciseCount > 0 ? `${score.exerciseCount} exos` : undefined}
        color="green"
        compact={compact}
      />

      {/* 4. Score IA */}
      <KPICard
        icon={<Bot className={iconSize} />}
        label="Score IA"
        value={hasScore ? `${score.aiComprehension.toFixed(0)}%` : '—'}
        subLabel={hasScore && score.aiSessionCount > 0 ? `${score.aiSessionCount} sessions` : undefined}
        color="purple"
        compact={compact}
      />

      {/* 5. Note Examen */}
      <KPICard
        icon={<ClipboardCheck className={iconSize} />}
        label="Examen"
        value={hasScore && score.examGrade !== null ? `${score.examGrade.toFixed(1)}/6` : '—'}
        subLabel={hasScore && score.examDate ? new Date(score.examDate).toLocaleDateString('fr-FR') : undefined}
        color="amber"
        compact={compact}
      />

      {/* 6. Note Finale (optionnel - remplace sessions IA) */}
      {showAISessions && (
        <KPICard
          icon={<Award className={iconSize} />}
          label="Final"
          value={hasScore && score.finalGrade !== null ? `${score.finalGrade.toFixed(1)}/6` : '—'}
          color="slate"
          compact={compact}
        />
      )}
    </div>
  );
}

// ============================================
// EXPORT
// ============================================

export type { CourseScoreKPIsProps };

'use client';

import { Badge } from '@/components/ui/badge';
import { 
  CoursePerformance, 
  PerformanceGrade 
} from '@/types/course-stats';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users,
  Brain
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CoursePerformanceBadgeProps {
  performance: CoursePerformance | null;
  className?: string;
}

/**
 * Badge affichant la note de performance d'un cours
 * - Couleur selon la note (A+ vert, D rouge)
 * - Tooltip avec détails (score élèves, score IA, nb élèves)
 */
export function CoursePerformanceBadge({ 
  performance, 
  className = '' 
}: CoursePerformanceBadgeProps) {
  // Pas de données = badge gris "N/A"
  if (!performance) {
    return (
      <Badge 
        variant="outline" 
        className={`bg-gray-100 text-gray-500 ${className}`}
      >
        N/A
      </Badge>
    );
  }

  const { grade, globalScore, studentScoreAvg, aiScoreAvg, enrolledCount } = performance;
  const colorClasses = getGradeColorClasses(grade);

  // Icône de tendance basée sur le score global
  const TrendIcon = globalScore >= 80 
    ? TrendingUp 
    : globalScore >= 60 
      ? Minus 
      : TrendingDown;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${colorClasses} cursor-help ${className}`}
          >
            <TrendIcon className="w-3 h-3 mr-1" />
            {grade} ({globalScore}%)
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="w-64">
          <div className="space-y-2 text-sm">
            <div className="font-semibold border-b pb-1">
              Détails Performance
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                Score Élèves (60%)
              </span>
              <span className="font-medium">{studentScoreAvg}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Brain className="w-3 h-3" />
                Score IA (40%)
              </span>
              <span className="font-medium">{aiScoreAvg}%</span>
            </div>
            
            <div className="border-t pt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Élèves inscrits</span>
              <span className="font-medium">{enrolledCount}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Retourne les classes Tailwind pour la couleur de la note
 */
function getGradeColorClasses(grade: PerformanceGrade): string {
  switch (grade) {
    case 'A+':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200';
    case 'A':
      return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    case 'B':
      return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
    case 'C':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
    case 'D':
      return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-300';
  }
}

export default CoursePerformanceBadge;

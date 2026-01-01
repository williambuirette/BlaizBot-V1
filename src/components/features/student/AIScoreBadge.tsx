'use client';

import { Badge } from '@/components/ui/badge';
import { Bot, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AIScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  showTrend?: boolean;
  previousScore?: number | null;
  className?: string;
}

/**
 * AIScoreBadge - Badge de score IA pour les élèves
 * - Couleur basée sur le score (vert >= 70, jaune >= 50, rouge < 50)
 * - Icône IA optionnelle
 * - Tendance optionnelle (comparaison avec score précédent)
 */
export function AIScoreBadge({ 
  score, 
  size = 'default', 
  showIcon = false, 
  showTrend = false,
  previousScore = null,
  className = '' 
}: AIScoreBadgeProps) {
  // Si pas de score, retourner un badge neutre
  if (score === null || score === undefined) {
    return (
      <Badge 
        variant="outline" 
        className={`bg-gray-50 text-gray-500 border-gray-200 ${className}`}
      >
        {showIcon && <Bot className="h-3 w-3 mr-1" />}
        —
      </Badge>
    );
  }

  // Déterminer la couleur selon le score
  const getScoreStyle = (score: number) => {
    if (score >= 70) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (score >= 50) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // Calculer la tendance
  const getTrendIcon = () => {
    if (!showTrend || previousScore === null || previousScore === undefined) {
      return null;
    }
    
    const diff = score - previousScore;
    if (diff > 5) return <TrendingUp className="h-3 w-3 ml-1 text-green-600" />;
    if (diff < -5) return <TrendingDown className="h-3 w-3 ml-1 text-red-600" />;
    return <Minus className="h-3 w-3 ml-1 text-gray-500" />;
  };

  // Déterminer la taille
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs px-1.5 py-0.5';
      case 'lg': return 'text-sm px-3 py-1';
      default: return 'text-xs px-2 py-0.5';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getScoreStyle(score)} ${getSizeClass()} ${className} flex items-center gap-1`}
    >
      {showIcon && <Bot className="h-3 w-3" />}
      {score}%
      {getTrendIcon()}
    </Badge>
  );
}
"use client";

import { cn } from "@/lib/utils";
import { THRESHOLDS } from "@/lib/stats-service";

// ============================================
// ScoreBadge - Affiche une note sur 6
// ============================================

interface ScoreBadgeProps {
  score: number; // Note sur 6
  size?: "sm" | "md" | "lg";
  showLabel?: boolean; // Afficher "/ 6"
  className?: string;
}

export function ScoreBadge({
  score,
  size = "md",
  showLabel = true,
  className,
}: ScoreBadgeProps) {
  const getColorClass = (score: number) => {
    if (score >= THRESHOLDS.success)
      return "bg-green-100 text-green-700 border-green-200";
    if (score >= THRESHOLDS.warning)
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "lg":
        return "px-4 py-2 text-lg font-bold";
      default:
        return "px-3 py-1 text-sm font-medium";
    }
  };

  const displayScore = score.toFixed(1);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border",
        getColorClass(score),
        getSizeClass(size),
        className
      )}
    >
      {displayScore}
      {showLabel && <span className="ml-1 opacity-70">/6</span>}
    </span>
  );
}

// ============================================
// PercentageBadge - Affiche un pourcentage
// ============================================

interface PercentageBadgeProps {
  percentage: number; // 0-100
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PercentageBadge({
  percentage,
  size = "md",
  className,
}: PercentageBadgeProps) {
  // Convertir en note /6 pour utiliser les mêmes seuils
  const grade6 = (percentage / 100) * 6;

  const getColorClass = (grade: number) => {
    if (grade >= THRESHOLDS.success)
      return "bg-green-100 text-green-700 border-green-200";
    if (grade >= THRESHOLDS.warning)
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "lg":
        return "px-4 py-2 text-lg font-bold";
      default:
        return "px-3 py-1 text-sm font-medium";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border",
        getColorClass(grade6),
        getSizeClass(size),
        className
      )}
    >
      {Math.round(percentage)}%
    </span>
  );
}

// ============================================
// AlertDot - Indicateur visuel simple
// ============================================

interface AlertDotProps {
  level: "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AlertDot({ level, size = "md", className }: AlertDotProps) {
  const getColorClass = (level: string) => {
    switch (level) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      default:
        return "bg-red-500";
    }
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case "sm":
        return "h-2 w-2";
      case "lg":
        return "h-4 w-4";
      default:
        return "h-3 w-3";
    }
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full",
        getColorClass(level),
        getSizeClass(size),
        className
      )}
      aria-label={`Niveau: ${level}`}
    />
  );
}

// ============================================
// ScoreDisplay - Note avec indicateur
// ============================================

interface ScoreDisplayProps {
  score: number | null; // Note sur 6
  label?: string;
  showDot?: boolean;
  className?: string;
}

export function ScoreDisplay({
  score,
  label,
  showDot = true,
  className,
}: ScoreDisplayProps) {
  if (score === null) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {label && <span className="text-sm text-muted-foreground">{label}</span>}
        <span className="text-lg font-medium text-muted-foreground">—</span>
      </div>
    );
  }

  const getLevel = (score: number): "success" | "warning" | "danger" => {
    if (score >= THRESHOLDS.success) return "success";
    if (score >= THRESHOLDS.warning) return "warning";
    return "danger";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      {showDot && <AlertDot level={getLevel(score)} size="sm" />}
      <span className="text-lg font-medium">{score.toFixed(1)}/6</span>
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle, Rocket } from "lucide-react";

interface LiveScoreBadgeProps {
  overallScore: number;
  comprehension: number;
  accuracy: number;
  autonomy: number;
  size?: "sm" | "md" | "lg";
}

/**
 * LiveScoreBadge - Badge de score IA temps réel dans le chat
 * Affiche le score global avec détails des 3 critères au survol
 */
export function LiveScoreBadge({
  overallScore,
  comprehension,
  accuracy,
  autonomy,
  size = "md",
}: LiveScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-300";
    if (score >= 60) return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-red-100 text-red-700 border-red-300";
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <div className="relative group">
      <Badge
        className={`${getScoreColor(overallScore)} border ${sizeClasses[size]} font-medium cursor-help`}
      >
        🤖 Score : {overallScore}%
      </Badge>

      {/* Tooltip au survol */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg w-48">
          <p className="font-semibold mb-2">Détails du score IA :</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Compréhension
              </span>
              <span className="font-medium">{comprehension}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Précision
              </span>
              <span className="font-medium">{accuracy}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Rocket className="h-3 w-3" />
                Autonomie
              </span>
              <span className="font-medium">{autonomy}%</span>
            </div>
          </div>
          {/* Triangle pointer */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      </div>
    </div>
  );
}

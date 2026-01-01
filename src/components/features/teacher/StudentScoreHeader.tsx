"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScoreBadge, PercentageBadge, AlertDot } from "@/components/ui/score-badge";
import { THRESHOLDS } from "@/lib/stats-service";
import { TrendingUp, ClipboardCheck, Award, Bot } from "lucide-react";

interface GlobalStats {
  continuous: number;
  exams: number | null;
  final: number | null;
  courseCount: number;
  examCount: number;
  aiAverage?: number | null;
}

interface StudentScoreHeaderProps {
  globalStats: GlobalStats | null;
}

export function StudentScoreHeader({ globalStats }: StudentScoreHeaderProps) {
  if (!globalStats) return null;

  const getAlertLevel = (grade: number | null): "success" | "warning" | "danger" | null => {
    if (grade === null) return null;
    if (grade >= THRESHOLDS.success) return "success";
    if (grade >= THRESHOLDS.warning) return "warning";
    return "danger";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Évaluation Continue */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-blue-100 p-3">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Évaluation Continue</p>
            <div className="mt-1">
              <PercentageBadge percentage={globalStats.continuous} size="lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moyenne IA */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-purple-100 p-3">
            <Bot className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Compréhension IA</p>
            <div className="mt-1">
              {globalStats.aiAverage !== null && globalStats.aiAverage !== undefined ? (
                <PercentageBadge percentage={globalStats.aiAverage} size="lg" />
              ) : (
                <span className="text-lg font-medium text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Moyenne Examens */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-amber-100 p-3">
            <ClipboardCheck className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Moyenne Examens ({globalStats.examCount}/{globalStats.courseCount})
            </p>
            <div className="mt-1">
              {globalStats.exams !== null ? (
                <ScoreBadge score={globalStats.exams} size="lg" />
              ) : (
                <span className="text-lg font-medium text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note Finale */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-green-100 p-3">
            <Award className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex items-center gap-2">
            {globalStats.final !== null && (
              <AlertDot
                level={getAlertLevel(globalStats.final)!}
                size="md"
              />
            )}
            <div>
              <p className="text-sm text-muted-foreground">Note Finale</p>
              <div className="mt-1">
                {globalStats.final !== null ? (
                  <ScoreBadge score={globalStats.final} size="lg" />
                ) : (
                  <span className="text-lg font-medium text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

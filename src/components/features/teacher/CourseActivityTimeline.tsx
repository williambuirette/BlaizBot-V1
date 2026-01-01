"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PercentageBadge } from "@/components/ui/score-badge";
import { Bot, Brain, Target, Rocket, Clock, MessageSquare } from "lucide-react";

// ============================================
// TYPES
// ============================================

type ActivityType = "QUIZ" | "EXERCISE" | "REVISION";

export interface AIActivityData {
  id: string;
  activityType: ActivityType;
  themeId: string | null;
  comprehensionScore: number;
  accuracyScore: number;
  autonomyScore: number;
  finalScore: number;
  duration: number;
  messageCount: number;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string | null;
  createdAt: string;
}

interface CourseActivityTimelineProps {
  activities: AIActivityData[];
}

// ============================================
// HELPERS
// ============================================

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  QUIZ: "Quiz",
  EXERCISE: "Exercice",
  REVISION: "Révision",
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  QUIZ: "bg-blue-100 text-blue-700",
  EXERCISE: "bg-green-100 text-green-700",
  REVISION: "bg-purple-100 text-purple-700",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  return `${mins}min`;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function CourseActivityTimeline({ activities }: CourseActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-purple-600" />
            Activités IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucune activité IA pour ce cours.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-4 w-4 text-purple-600" />
          Activités IA ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================
// SOUS-COMPOSANT
// ============================================

function ActivityCard({ activity }: { activity: AIActivityData }) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {formatDate(activity.createdAt)}
          </span>
          <Badge variant="secondary" className={ACTIVITY_COLORS[activity.activityType]}>
            {ACTIVITY_LABELS[activity.activityType]}
          </Badge>
        </div>
        <PercentageBadge percentage={activity.finalScore} size="md" />
      </div>

      {/* Scores détaillés */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Brain className="h-3.5 w-3.5 text-blue-500" />
          <span>{activity.comprehensionScore}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="h-3.5 w-3.5 text-green-500" />
          <span>{activity.accuracyScore}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Rocket className="h-3.5 w-3.5 text-purple-500" />
          <span>{activity.autonomyScore}%</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDuration(activity.duration)}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{activity.messageCount}</span>
        </div>
      </div>

      {/* Points forts/faibles */}
      <div className="grid gap-2 sm:grid-cols-2 text-sm">
        {activity.strengths && (
          <div className="flex items-start gap-2">
            <span className="text-green-600">💪</span>
            <span className="text-muted-foreground">{activity.strengths}</span>
          </div>
        )}
        {activity.weaknesses && (
          <div className="flex items-start gap-2">
            <span className="text-amber-600">📝</span>
            <span className="text-muted-foreground">{activity.weaknesses}</span>
          </div>
        )}
      </div>

      {/* Recommandation */}
      {activity.recommendation && (
        <div className="text-sm bg-blue-50 dark:bg-blue-950/30 p-2 rounded">
          <span className="text-blue-700 dark:text-blue-300">
            🎯 {activity.recommendation}
          </span>
        </div>
      )}
    </div>
  );
}

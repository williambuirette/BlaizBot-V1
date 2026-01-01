"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PercentageBadge } from "@/components/ui/score-badge";
import { Bot, TrendingUp, Clock, MessageSquare } from "lucide-react";

// ============================================
// TYPES
// ============================================

type ActivityType = "QUIZ" | "EXERCISE" | "REVISION";

export interface AIActivity {
  id: string;
  activityType: ActivityType;
  themeId: string | null;
  themeName?: string;
  courseName?: string;
  comprehensionScore: number;
  accuracyScore: number;
  autonomyScore: number;
  finalScore: number;
  duration: number; // en secondes
  messageCount: number;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string | null;
  createdAt: string;
}

interface AIActivitiesTabProps {
  studentName: string;
  activities: AIActivity[];
}

type PeriodFilter = "7days" | "30days" | "90days" | "all";

// ============================================
// HELPERS
// ============================================

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  QUIZ: "Quiz",
  EXERCISE: "Exercice",
  REVISION: "Révision",
};

const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  QUIZ: "bg-blue-100 text-blue-700",
  EXERCISE: "bg-green-100 text-green-700",
  REVISION: "bg-purple-100 text-purple-700",
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}min ${secs}s` : `${mins}min`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function filterByPeriod(activities: AIActivity[], period: PeriodFilter): AIActivity[] {
  if (period === "all") return activities;
  
  const now = new Date();
  const days = period === "7days" ? 7 : period === "30days" ? 30 : 90;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return activities.filter((a) => new Date(a.createdAt) >= cutoff);
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function AIActivitiesTab({ studentName, activities }: AIActivitiesTabProps) {
  const [period, setPeriod] = useState<PeriodFilter>("30days");

  const filteredActivities = useMemo(
    () => filterByPeriod(activities, period),
    [activities, period]
  );

  // Stats globales
  const stats = useMemo(() => {
    if (filteredActivities.length === 0) {
      return { avgScore: 0, totalDuration: 0, totalSessions: 0, avgMessages: 0 };
    }
    
    const totalScore = filteredActivities.reduce((acc, a) => acc + a.finalScore, 0);
    const totalDuration = filteredActivities.reduce((acc, a) => acc + a.duration, 0);
    const totalMessages = filteredActivities.reduce((acc, a) => acc + a.messageCount, 0);
    
    return {
      avgScore: Math.round(totalScore / filteredActivities.length),
      totalDuration,
      totalSessions: filteredActivities.length,
      avgMessages: Math.round(totalMessages / filteredActivities.length),
    };
  }, [filteredActivities]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Activités IA de {studentName}</h2>
        </div>
        
        <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 derniers jours</SelectItem>
            <SelectItem value="30days">30 derniers jours</SelectItem>
            <SelectItem value="90days">90 derniers jours</SelectItem>
            <SelectItem value="all">Tout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Score moyen"
          value={`${stats.avgScore}%`}
          color="purple"
        />
        <StatsCard
          icon={<Bot className="h-4 w-4" />}
          label="Sessions IA"
          value={stats.totalSessions.toString()}
          color="blue"
        />
        <StatsCard
          icon={<Clock className="h-4 w-4" />}
          label="Temps total"
          value={formatDuration(stats.totalDuration)}
          color="green"
        />
        <StatsCard
          icon={<MessageSquare className="h-4 w-4" />}
          label="Msg/session"
          value={stats.avgMessages.toString()}
          color="amber"
        />
      </div>

      {/* Tableau des activités */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Historique ({filteredActivities.length} activités)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Aucune activité IA sur cette période.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cours/Thème</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-center">Durée</TableHead>
                  <TableHead>Recommandation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="text-sm">
                      {formatDate(activity.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={ACTIVITY_TYPE_COLORS[activity.activityType]}
                      >
                        {ACTIVITY_TYPE_LABELS[activity.activityType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-40 truncate">
                      {activity.courseName || activity.themeName || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <PercentageBadge percentage={activity.finalScore} size="sm" />
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {formatDuration(activity.duration)}
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
                      {activity.recommendation || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Graphique de progression (placeholder simple) */}
      {filteredActivities.length > 1 && (
        <ProgressionChart activities={filteredActivities} />
      )}
    </div>
  );
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "purple" | "blue" | "green" | "amber";
}

const colorClasses = {
  purple: "bg-purple-100 text-purple-600",
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
};

function StatsCard({ icon, label, value, color }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressionChartProps {
  activities: AIActivity[];
}

function ProgressionChart({ activities }: ProgressionChartProps) {
  // Trier par date et prendre les derniers points
  const sortedActivities = [...activities]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-10); // Derniers 10 points

  const maxScore = 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-600" />
          Progression
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex items-end gap-2">
          {sortedActivities.map((activity, index) => {
            const height = (activity.finalScore / maxScore) * 100;
            return (
              <div
                key={activity.id}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs font-medium">{activity.finalScore}%</span>
                <div
                  className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                  style={{ height: `${height}%`, minHeight: "4px" }}
                  title={`${formatDate(activity.createdAt)} - ${ACTIVITY_TYPE_LABELS[activity.activityType]}`}
                />
                <span className="text-[10px] text-muted-foreground">
                  {index === 0 || index === sortedActivities.length - 1
                    ? new Date(activity.createdAt).toLocaleDateString("fr-CH", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          10 dernières activités
        </p>
      </CardContent>
    </Card>
  );
}

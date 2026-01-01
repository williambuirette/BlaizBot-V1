"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PercentageBadge, ScoreBadge } from "@/components/ui/score-badge";
import { ArrowLeft, TrendingUp, Bot, ClipboardCheck, Award, BookOpen, Dumbbell } from "lucide-react";
import { CourseActivityTimeline, AIActivityData } from "./CourseActivityTimeline";

// ============================================
// TYPES
// ============================================

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  className: string;
  classLevel: string;
}

interface CourseData {
  id: string;
  title: string;
  subjectName: string;
}

interface ScoreData {
  continuousScore: number;
  aiComprehension: number;
  examGrade: number | null;
  finalGrade: number | null;
  quizAvg: number;
  exerciseAvg: number;
  quizCount: number;
  exerciseCount: number;
  aiSessionCount: number;
}

interface ProgressRecord {
  id: string;
  sectionTitle: string;
  sectionType: string;
  assignmentTitle: string;
  status: string;
  score: number | null;
  timeSpent: number | null;
  completedAt: string | null;
}

interface StudentCourseDetailPageProps {
  student: StudentData;
  course: CourseData;
  score: ScoreData | null;
  aiActivities: AIActivityData[];
  progressRecords: ProgressRecord[];
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function StudentCourseDetailPage({
  student,
  course,
  score,
  aiActivities,
  progressRecords,
}: StudentCourseDetailPageProps) {
  const router = useRouter();
  const studentName = `${student.firstName} ${student.lastName}`;

  // Séparer quiz et exercices
  const quizRecords = progressRecords.filter((p) => p.sectionType === "QUIZ");
  const exerciseRecords = progressRecords.filter((p) => p.sectionType === "EXERCISE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {studentName} — {course.title}
          </h1>
          <p className="text-muted-foreground">
            {student.className} ({student.classLevel}) • {course.subjectName}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Continu"
          value={score ? `${score.continuousScore.toFixed(0)}%` : "—"}
          color="blue"
        />
        <KPICard
          icon={<Bot className="h-5 w-5" />}
          label="Moy IA"
          value={score ? `${score.aiComprehension.toFixed(0)}%` : "—"}
          color="purple"
        />
        <KPICard
          icon={<ClipboardCheck className="h-5 w-5" />}
          label="Examen"
          value={score?.examGrade !== null ? `${score?.examGrade.toFixed(1)}/6` : "—"}
          color="amber"
        />
        <KPICard
          icon={<Award className="h-5 w-5" />}
          label="Final"
          value={score?.finalGrade !== null ? `${score?.finalGrade.toFixed(1)}/6` : "—"}
          color="green"
        />
        <KPICard
          icon={<Bot className="h-5 w-5" />}
          label="Sessions IA"
          value={score?.aiSessionCount?.toString() ?? "0"}
          color="slate"
        />
      </div>

      {/* Timeline Activités IA */}
      <CourseActivityTimeline activities={aiActivities} />

      {/* Quiz et Exercices */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quiz */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Quiz ({quizRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun quiz effectué</p>
            ) : (
              <div className="space-y-2">
                {quizRecords.map((quiz) => (
                  <ProgressItem key={quiz.id} record={quiz} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exercices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="h-4 w-4 text-green-600" />
              Exercices ({exerciseRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exerciseRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun exercice effectué</p>
            ) : (
              <div className="space-y-2">
                {exerciseRecords.map((exo) => (
                  <ProgressItem key={exo.id} record={exo} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "purple" | "amber" | "green" | "slate";
}

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-green-100 text-green-600",
  slate: "bg-slate-100 text-slate-600",
};

function KPICard({ icon, label, value, color }: KPICardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-lg p-2 ${colorMap[color]}`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressItemProps {
  record: ProgressRecord;
}

function ProgressItem({ record }: ProgressItemProps) {
  const statusColors: Record<string, string> = {
    COMPLETED: "text-green-600",
    IN_PROGRESS: "text-amber-600",
    NOT_STARTED: "text-muted-foreground",
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    return `${mins}min`;
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{record.sectionTitle}</p>
        <p className="text-xs text-muted-foreground truncate">{record.assignmentTitle}</p>
      </div>
      <div className="flex items-center gap-3">
        {record.score !== null && (
          <PercentageBadge percentage={record.score} size="sm" />
        )}
        <span className="text-xs text-muted-foreground">{formatTime(record.timeSpent)}</span>
        <span className={`text-xs ${statusColors[record.status] || "text-muted-foreground"}`}>
          {record.status === "COMPLETED" ? "✓" : record.status === "IN_PROGRESS" ? "⏳" : "—"}
        </span>
      </div>
    </div>
  );
}

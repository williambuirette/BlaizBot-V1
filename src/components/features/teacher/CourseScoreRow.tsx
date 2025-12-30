"use client";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScoreBadge, PercentageBadge, AlertDot } from "@/components/ui/score-badge";
import { THRESHOLDS } from "@/lib/stats-service";
import { Pencil } from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface CourseScoreData {
  id: string;
  quizAvg: number;
  exerciseAvg: number;
  aiComprehension: number;
  continuousScore: number;
  quizCount: number;
  exerciseCount: number;
  aiSessionCount: number;
  examGrade: number | null;
  examDate: string | null;
  examComment: string | null;
  finalGrade: number | null;
  course: {
    id: string;
    title: string;
    subject: { id: string; name: string };
  };
}

interface CourseScoreRowProps {
  courseScore: CourseScoreData;
  onEditExam: () => void;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function CourseScoreRow({ courseScore, onEditExam }: CourseScoreRowProps) {
  const getAlertLevel = (
    grade: number | null,
    continuous: number
  ): "success" | "warning" | "danger" => {
    const ref = grade !== null ? grade : (continuous / 100) * 6;
    if (ref >= THRESHOLDS.success) return "success";
    if (ref >= THRESHOLDS.warning) return "warning";
    return "danger";
  };

  const level = getAlertLevel(courseScore.finalGrade, courseScore.continuousScore);

  return (
    <AccordionItem
      value={courseScore.id}
      className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
    >
      {/* Wrapper flex pour séparer le trigger du bouton */}
      <div className="flex items-center gap-2">
        <AccordionTrigger className="hover:no-underline py-4 flex-1">
          <div className="flex items-center justify-between w-full pr-4">
            {/* Info cours */}
            <div className="flex items-center gap-3">
              <AlertDot level={level} />
              <div className="text-left">
                <p className="font-medium">{courseScore.course.title}</p>
                <p className="text-sm text-muted-foreground">
                  {courseScore.course.subject.name}
                </p>
              </div>
            </div>

            {/* Scores résumés */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Continu</p>
                <PercentageBadge percentage={courseScore.continuousScore} size="sm" />
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Examen</p>
                {courseScore.examGrade !== null ? (
                  <ScoreBadge score={courseScore.examGrade} size="sm" />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Final</p>
                {courseScore.finalGrade !== null ? (
                  <ScoreBadge score={courseScore.finalGrade} size="sm" />
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>
        </AccordionTrigger>
        
        {/* Bouton hors du trigger pour éviter button > button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onEditExam}
          title="Modifier la note d'examen"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      <AccordionContent className="pb-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {/* Détails Quiz */}
          <ScoreDetailCard
            title="Quiz"
            score={courseScore.quizAvg}
            count={courseScore.quizCount}
            countLabel="quiz effectués"
            weight="35%"
          />

          {/* Détails Exercices */}
          <ScoreDetailCard
            title="Exercices"
            score={courseScore.exerciseAvg}
            count={courseScore.exerciseCount}
            countLabel="exercices terminés"
            weight="40%"
          />

          {/* Détails IA */}
          <ScoreDetailCard
            title="Compréhension IA"
            score={courseScore.aiComprehension}
            count={courseScore.aiSessionCount}
            countLabel="sessions IA"
            weight="25%"
          />
        </div>

        {/* Info Examen */}
        {courseScore.examGrade !== null && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Note d&apos;examen</p>
                {courseScore.examDate && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(courseScore.examDate).toLocaleDateString("fr-CH")}
                  </p>
                )}
              </div>
              <ScoreBadge score={courseScore.examGrade} size="md" />
            </div>
            {courseScore.examComment && (
              <p className="mt-2 text-sm text-muted-foreground italic">
                &quot;{courseScore.examComment}&quot;
              </p>
            )}
          </div>
        )}

        {/* Résumé calcul */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Formule :</strong> Score Final = (Continu × 40%) + (Examen × 60%)
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Score Continu = (Quiz × 35%) + (Exercices × 40%) + (IA × 25%) = {courseScore.continuousScore.toFixed(1)}%
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ============================================
// SOUS-COMPOSANT
// ============================================

interface ScoreDetailCardProps {
  title: string;
  score: number;
  count: number;
  countLabel: string;
  weight: string;
}

function ScoreDetailCard({
  title,
  score,
  count,
  countLabel,
  weight,
}: ScoreDetailCardProps) {
  return (
    <div className="p-3 border rounded-lg bg-background">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-xs text-muted-foreground">Poids: {weight}</span>
      </div>
      <div className="flex items-center justify-between">
        <PercentageBadge percentage={score} size="md" />
        <span className="text-xs text-muted-foreground">
          {count} {countLabel}
        </span>
      </div>
    </div>
  );
}

// ============================================
// LISTE AVEC ACCORDION
// ============================================

interface CourseScoreListProps {
  courseScores: CourseScoreData[];
  onEditExam: (course: { id: string; title: string; examGrade: number | null }) => void;
}

export function CourseScoreList({ courseScores, onEditExam }: CourseScoreListProps) {
  if (courseScores.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Aucun score enregistré pour cet élève.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="space-y-2">
      {courseScores.map((cs) => (
        <CourseScoreRow
          key={cs.id}
          courseScore={cs}
          onEditExam={() =>
            onEditExam({
              id: cs.course.id,
              title: cs.course.title,
              examGrade: cs.examGrade,
            })
          }
        />
      ))}
    </Accordion>
  );
}

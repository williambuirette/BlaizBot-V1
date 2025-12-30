"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, RefreshCw, Mail } from "lucide-react";
import { StudentScoreHeader } from "./StudentScoreHeader";
import { CourseScoreList, CourseScoreData } from "./CourseScoreRow";
import { ExamGradeDialog } from "./ExamGradeDialog";
import { ScoreFilterBar } from "./ScoreFilterBar";
import {
  ScoreFilters,
  ScoreSort,
  filterCourseScores,
  sortCourseScores,
  extractSubjects,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
} from "@/lib/stats-service";

// ============================================
// TYPES
// ============================================

interface StudentScorePageProps {
  studentId: string;
  studentName: string;
  studentEmail: string;
  className: string;
  classLevel: string;
}

interface GlobalStats {
  continuous: number;
  exams: number | null;
  final: number | null;
  courseCount: number;
  examCount: number;
}

interface ScoresData {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    className: string;
    classLevel: string;
  };
  globalStats: GlobalStats;
  courseScores: CourseScoreData[];
}

interface SelectedCourse {
  id: string;
  title: string;
  examGrade: number | null;
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function StudentScorePage({
  studentId,
  studentName,
  studentEmail,
  className,
  classLevel,
}: StudentScorePageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ScoresData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);

  // État pour filtres et tri
  const [filters, setFilters] = useState<ScoreFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<ScoreSort>(DEFAULT_SORT);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/teacher/students/${studentId}/scores`);
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des scores");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const handleEditExam = (course: SelectedCourse) => {
    setSelectedCourse(course);
    setExamDialogOpen(true);
  };

  const handleSaveExam = async (grade: number, comment?: string) => {
    if (!selectedCourse) return;

    try {
      const res = await fetch(`/api/teacher/students/${studentId}/scores`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          examGrade: grade,
          examComment: comment,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      // Recharger les données
      await fetchScores();
      setExamDialogOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      throw err; // Laisser le dialog gérer l'erreur
    }
  };

  // Loading state
  if (loading) {
    return <LoadingState studentName={studentName} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={fetchScores}
        onBack={() => router.back()}
      />
    );
  }

  // Calcul des données filtrées et triées
  const courseScores = data?.courseScores ?? [];
  const subjects = extractSubjects(courseScores);
  const filteredScores = filterCourseScores(courseScores, filters);
  const sortedScores = sortCourseScores(filteredScores, sort);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{studentName}</h1>
            <p className="text-muted-foreground">
              {className} ({classLevel}) • {studentEmail}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchScores}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={`mailto:${studentEmail}`}>
              <Mail className="mr-2 h-4 w-4" />
              Contacter
            </a>
          </Button>
        </div>
      </div>

      {/* KPIs globaux */}
      <StudentScoreHeader globalStats={data?.globalStats ?? null} />

      {/* Liste des cours avec filtres */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Scores par cours</h2>

        {/* Barre de filtres */}
        {courseScores.length > 0 && (
          <ScoreFilterBar
            subjects={subjects}
            filters={filters}
            sort={sort}
            onFiltersChange={setFilters}
            onSortChange={setSort}
            resultCount={sortedScores.length}
            totalCount={courseScores.length}
          />
        )}

        <CourseScoreList
          courseScores={sortedScores}
          onEditExam={handleEditExam}
        />
      </div>

      {/* Dialog saisie examen */}
      <ExamGradeDialog
        open={examDialogOpen}
        onOpenChange={setExamDialogOpen}
        courseName={selectedCourse?.title ?? ""}
        currentGrade={selectedCourse?.examGrade}
        onSave={handleSaveExam}
      />
    </div>
  );
}

// ============================================
// SOUS-COMPOSANTS
// ============================================

function LoadingState({ studentName }: { studentName: string }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <h1 className="text-2xl font-bold">{studentName}</h1>
          <Skeleton className="mt-1 h-4 w-48" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
  onBack,
}: {
  error: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <p className="text-red-500">{error}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button onClick={onRetry}>Réessayer</Button>
      </div>
    </div>
  );
}

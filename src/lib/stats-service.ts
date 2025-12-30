/**
 * Service de calcul des statistiques BlaizBot
 * Système de notation suisse (notes sur 6)
 *
 * Formules:
 * - Score Continu = (Quiz × 35%) + (Exercices × 40%) + (IA × 25%)
 * - Score Final = (Continu × 40%) + (Examen × 60%)
 *
 * Seuils d'alerte:
 * - 🟢 ≥ 4.5/6 (success)
 * - 🟡 3.5-4.4/6 (warning)
 * - 🔴 < 3.5/6 (danger)
 */

// ============================================
// TYPES
// ============================================

export type AlertLevel = "success" | "warning" | "danger";

export interface StudentStats {
  continuousScore: number; // 0-100
  examGrade: number | null; // 0-6
  finalGrade: number | null; // 0-6
  alertLevel: AlertLevel;
}

export interface CourseStats {
  courseId: string;
  courseName: string;
  quizAvg: number; // 0-100
  exerciseAvg: number; // 0-100
  aiComprehension: number; // 0-100
  continuousScore: number; // 0-100
  examGrade: number | null; // 0-6
  finalGrade: number | null; // 0-6
  alertLevel: AlertLevel;
}

export interface ClassStats {
  classId: string;
  className: string;
  studentCount: number;
  avgContinuous: number; // 0-100
  avgExams: number | null; // 0-6
  avgFinal: number | null; // 0-6
  atRiskCount: number;
  topPerformersCount: number;
}

export interface GlobalStats {
  totalStudents: number;
  totalClasses: number;
  avgContinuous: number; // 0-100
  avgExams: number | null; // 0-6
  avgFinal: number | null; // 0-6
  atRiskCount: number;
  topPerformersCount: number;
}

// ============================================
// CONSTANTES
// ============================================

export const WEIGHTS = {
  quiz: 0.35,
  exercise: 0.4,
  ai: 0.25,
  continuous: 0.4,
  exam: 0.6,
} as const;

export const THRESHOLDS = {
  success: 4.5, // 🟢 ≥ 4.5
  warning: 3.5, // 🟡 ≥ 3.5
  // < 3.5 = danger 🔴
} as const;

// ============================================
// SERVICE
// ============================================

export const statsService = {
  /**
   * Calcule le score continu (0-100) à partir des moyennes
   */
  calculateContinuousScore(
    quizAvg: number,
    exerciseAvg: number,
    aiComprehension: number
  ): number {
    const score =
      quizAvg * WEIGHTS.quiz +
      exerciseAvg * WEIGHTS.exercise +
      aiComprehension * WEIGHTS.ai;
    return Math.round(score * 10) / 10;
  },

  /**
   * Calcule le score final (0-100) après examen
   */
  calculateFinalScore(continuousScore: number, examGrade: number): number {
    const examScore100 = (examGrade / 6) * 100;
    const finalScore =
      continuousScore * WEIGHTS.continuous + examScore100 * WEIGHTS.exam;
    return Math.round(finalScore * 10) / 10;
  },

  /**
   * Convertit un score /100 en note /6
   */
  convertToGrade6(score100: number): number {
    const grade = (score100 / 100) * 6;
    return Math.round(grade * 10) / 10;
  },

  /**
   * Convertit une note /6 en score /100
   */
  convertTo100(grade6: number): number {
    return Math.round((grade6 / 6) * 100 * 10) / 10;
  },

  /**
   * Détermine le niveau d'alerte selon la note /6
   */
  getAlertLevel(grade6: number): AlertLevel {
    if (grade6 >= THRESHOLDS.success) return "success";
    if (grade6 >= THRESHOLDS.warning) return "warning";
    return "danger";
  },

  /**
   * Détermine le niveau d'alerte depuis un score /100
   */
  getAlertLevelFrom100(score100: number): AlertLevel {
    const grade6 = this.convertToGrade6(score100);
    return this.getAlertLevel(grade6);
  },

  /**
   * Calcule les stats d'un élève pour un cours
   */
  calculateCourseStats(data: {
    courseId: string;
    courseName: string;
    quizAvg: number;
    exerciseAvg: number;
    aiComprehension: number;
    examGrade: number | null;
  }): CourseStats {
    const continuousScore = this.calculateContinuousScore(
      data.quizAvg,
      data.exerciseAvg,
      data.aiComprehension
    );

    let finalGrade: number | null = null;
    let alertLevel: AlertLevel;

    if (data.examGrade !== null) {
      const finalScore = this.calculateFinalScore(continuousScore, data.examGrade);
      finalGrade = this.convertToGrade6(finalScore);
      alertLevel = this.getAlertLevel(finalGrade);
    } else {
      // Sans examen, on se base sur le score continu
      alertLevel = this.getAlertLevelFrom100(continuousScore);
    }

    return {
      courseId: data.courseId,
      courseName: data.courseName,
      quizAvg: data.quizAvg,
      exerciseAvg: data.exerciseAvg,
      aiComprehension: data.aiComprehension,
      continuousScore,
      examGrade: data.examGrade,
      finalGrade,
      alertLevel,
    };
  },

  /**
   * Agrège les scores d'une classe
   */
  aggregateClassScores(
    classId: string,
    className: string,
    studentScores: StudentStats[]
  ): ClassStats {
    const studentCount = studentScores.length;

    if (studentCount === 0) {
      return {
        classId,
        className,
        studentCount: 0,
        avgContinuous: 0,
        avgExams: null,
        avgFinal: null,
        atRiskCount: 0,
        topPerformersCount: 0,
      };
    }

    // Moyenne continue
    const avgContinuous =
      studentScores.reduce((acc, s) => acc + s.continuousScore, 0) / studentCount;

    // Moyenne examens (seulement ceux qui ont passé l'exam)
    const withExam = studentScores.filter((s) => s.examGrade !== null);
    const avgExams =
      withExam.length > 0
        ? withExam.reduce((acc, s) => acc + (s.examGrade || 0), 0) / withExam.length
        : null;

    // Moyenne finale
    const withFinal = studentScores.filter((s) => s.finalGrade !== null);
    const avgFinal =
      withFinal.length > 0
        ? withFinal.reduce((acc, s) => acc + (s.finalGrade || 0), 0) / withFinal.length
        : null;

    // Compteurs
    const atRiskCount = studentScores.filter((s) => s.alertLevel === "danger").length;
    const topPerformersCount = studentScores.filter(
      (s) => s.alertLevel === "success"
    ).length;

    return {
      classId,
      className,
      studentCount,
      avgContinuous: Math.round(avgContinuous * 10) / 10,
      avgExams: avgExams !== null ? Math.round(avgExams * 10) / 10 : null,
      avgFinal: avgFinal !== null ? Math.round(avgFinal * 10) / 10 : null,
      atRiskCount,
      topPerformersCount,
    };
  },

  /**
   * Agrège les scores globaux (toutes classes)
   */
  aggregateGlobalScores(classStats: ClassStats[]): GlobalStats {
    const totalClasses = classStats.length;
    const totalStudents = classStats.reduce((acc, c) => acc + c.studentCount, 0);

    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        totalClasses,
        avgContinuous: 0,
        avgExams: null,
        avgFinal: null,
        atRiskCount: 0,
        topPerformersCount: 0,
      };
    }

    // Moyenne pondérée par nombre d'élèves
    const avgContinuous =
      classStats.reduce((acc, c) => acc + c.avgContinuous * c.studentCount, 0) /
      totalStudents;

    // Moyenne examens
    const classesWithExams = classStats.filter((c) => c.avgExams !== null);
    const studentsWithExams = classesWithExams.reduce(
      (acc, c) => acc + c.studentCount,
      0
    );
    const avgExams =
      studentsWithExams > 0
        ? classesWithExams.reduce(
            (acc, c) => acc + (c.avgExams || 0) * c.studentCount,
            0
          ) / studentsWithExams
        : null;

    // Moyenne finale
    const classesWithFinal = classStats.filter((c) => c.avgFinal !== null);
    const studentsWithFinal = classesWithFinal.reduce(
      (acc, c) => acc + c.studentCount,
      0
    );
    const avgFinal =
      studentsWithFinal > 0
        ? classesWithFinal.reduce(
            (acc, c) => acc + (c.avgFinal || 0) * c.studentCount,
            0
          ) / studentsWithFinal
        : null;

    // Totaux
    const atRiskCount = classStats.reduce((acc, c) => acc + c.atRiskCount, 0);
    const topPerformersCount = classStats.reduce(
      (acc, c) => acc + c.topPerformersCount,
      0
    );

    return {
      totalStudents,
      totalClasses,
      avgContinuous: Math.round(avgContinuous * 10) / 10,
      avgExams: avgExams !== null ? Math.round(avgExams * 10) / 10 : null,
      avgFinal: avgFinal !== null ? Math.round(avgFinal * 10) / 10 : null,
      atRiskCount,
      topPerformersCount,
    };
  },

  /**
   * Formate une note pour affichage
   */
  formatGrade(grade: number | null, withSuffix = true): string {
    if (grade === null) return "—";
    const formatted = grade.toFixed(1);
    return withSuffix ? `${formatted}/6` : formatted;
  },

  /**
   * Formate un pourcentage pour affichage
   */
  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  },
};

// ============================================
// TYPES POUR FILTRAGE & TRI
// ============================================

export interface ScoreFilters {
  subject: string | null; // null = tous
  alertLevel: "all" | "success" | "warning" | "danger";
  hasExam: "all" | "with" | "without";
}

export interface ScoreSort {
  field: "finalGrade" | "continuousScore" | "courseName" | "subjectName";
  direction: "asc" | "desc";
}

// Type pour les données de score (compatible avec CourseScoreData)
export interface FilterableCourseScore {
  id: string;
  continuousScore: number;
  examGrade: number | null;
  finalGrade: number | null;
  course: {
    id: string;
    title: string;
    subject: { id: string; name: string };
  };
}

// ============================================
// FONCTIONS DE FILTRAGE & TRI
// ============================================

/**
 * Filtre les scores selon les critères
 */
export function filterCourseScores<T extends FilterableCourseScore>(
  scores: T[],
  filters: ScoreFilters
): T[] {
  return scores.filter((score) => {
    // Filtre par matière
    if (filters.subject && score.course.subject.id !== filters.subject) {
      return false;
    }

    // Filtre par état d'alerte
    if (filters.alertLevel !== "all") {
      // Si finalGrade existe, l'utiliser, sinon convertir continuousScore
      const level = score.finalGrade !== null
        ? statsService.getAlertLevel(score.finalGrade)
        : statsService.getAlertLevelFrom100(score.continuousScore);
      if (level !== filters.alertLevel) return false;
    }

    // Filtre par présence d'examen
    if (filters.hasExam === "with" && score.examGrade === null) return false;
    if (filters.hasExam === "without" && score.examGrade !== null) return false;

    return true;
  });
}

/**
 * Trie les scores selon le champ et la direction
 */
export function sortCourseScores<T extends FilterableCourseScore>(
  scores: T[],
  sort: ScoreSort
): T[] {
  return [...scores].sort((a, b) => {
    let comparison = 0;

    switch (sort.field) {
      case "finalGrade":
        // null en dernier
        if (a.finalGrade === null && b.finalGrade === null) comparison = 0;
        else if (a.finalGrade === null) comparison = 1;
        else if (b.finalGrade === null) comparison = -1;
        else comparison = a.finalGrade - b.finalGrade;
        break;

      case "continuousScore":
        comparison = a.continuousScore - b.continuousScore;
        break;

      case "courseName":
        comparison = a.course.title.localeCompare(b.course.title);
        break;

      case "subjectName":
        comparison = a.course.subject.name.localeCompare(b.course.subject.name);
        break;
    }

    return sort.direction === "asc" ? comparison : -comparison;
  });
}

/**
 * Extrait la liste des matières uniques depuis les scores
 */
export function extractSubjects<T extends FilterableCourseScore>(
  scores: T[]
): { id: string; name: string }[] {
  const map = new Map<string, string>();
  scores.forEach((s) => map.set(s.course.subject.id, s.course.subject.name));
  return Array.from(map, ([id, name]) => ({ id, name })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Valeurs par défaut pour les filtres
 */
export const DEFAULT_FILTERS: ScoreFilters = {
  subject: null,
  alertLevel: "all",
  hasExam: "all",
};

/**
 * Valeurs par défaut pour le tri
 */
export const DEFAULT_SORT: ScoreSort = {
  field: "finalGrade",
  direction: "desc",
};

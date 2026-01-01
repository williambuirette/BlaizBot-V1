/**
 * Types pour les statistiques de performance des cours
 * Agrège StudentScore.totalScore (60%) + AIActivityScore.finalScore (40%)
 */

export type PerformanceGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

export interface CoursePerformance {
  studentScoreAvg: number;    // Moyenne StudentScore.totalScore (0-100)
  aiScoreAvg: number;         // Moyenne AIActivityScore.finalScore (0-100)
  globalScore: number;        // Score combiné : (student*0.6) + (ai*0.4)
  grade: PerformanceGrade;    // A+/A/B/C/D selon globalScore
  enrolledCount: number;      // Nombre élèves inscrits au cours
  activeCount: number;        // Nombre élèves avec au moins 1 score
}

export interface CourseWithStats {
  id: string;
  title: string;
  description: string | null;
  subject: { id: string; name: string };
  performance: CoursePerformance | null;  // null si aucun élève
  aiComprehensionAvg: number | null;      // Colonne Score IA existante
}

export interface CoursesOverview {
  totalCourses: number;
  totalStudents: number;        // Élèves uniques tous cours confondus
  averagePerformance: number;   // Moyenne des globalScore
  coursesWithData: number;      // Cours avec au moins 1 élève
}

/**
 * Calcule le grade selon le score global
 * A+ : 90-100%, A : 80-89%, B : 70-79%, C : 60-69%, D : <60%
 */
export function calculateGrade(score: number): PerformanceGrade {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

/**
 * Retourne la couleur Tailwind selon le grade
 */
export function getGradeColor(grade: PerformanceGrade | null): string {
  switch (grade) {
    case 'A+': return 'bg-emerald-600 text-white';
    case 'A':  return 'bg-green-500 text-white';
    case 'B':  return 'bg-amber-500 text-white';
    case 'C':  return 'bg-orange-500 text-white';
    case 'D':  return 'bg-red-500 text-white';
    default:   return 'bg-gray-300 text-gray-600';
  }
}

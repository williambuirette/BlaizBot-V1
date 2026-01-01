/**
 * Types pour le filtrage des classes
 * @module class-filters
 */

/** Filtres actifs sur la page "Mes Classes" */
export interface ClassFilters {
  /** IDs des matières sélectionnées ([] = toutes) */
  subjectIds: string[];
  /** ID de la classe filtrée (null = toutes) */
  classId: string | null;
  /** Recherche par nom de classe */
  search: string;
  /** IDs des classes sélectionnées pour stats */
  selectedClassIds: string[];
}

export const DEFAULT_CLASS_FILTERS: ClassFilters = {
  subjectIds: [],
  classId: null,
  search: '',
  selectedClassIds: [],
};

/** Stats agrégées d'un groupe de classes */
export interface ClassGroupStats {
  /** Nombre total d'élèves */
  totalStudents: number;
  /** Élèves en réussite (🟢 ≥4.5) */
  successCount: number;
  /** Élèves à surveiller (🟡 3.5-4.4) */
  warningCount: number;
  /** Élèves en difficulté (🔴 <3.5) */
  dangerCount: number;
  /** Élèves sans notes */
  noDataCount: number;
  /** Moyenne générale (/6) */
  averageGrade: number | null;
  /** Moyenne IA (0-100) */
  averageAI: number | null;
}

export type ClassAlertLevel = 'success' | 'warning' | 'danger' | 'no-data';

/** Classe enrichie avec stats pour la liste */
export interface ClassWithStats {
  id: string;
  name: string;
  level: string;
  color?: string | null;
  studentsCount: number;
  subjects: { id: string; name: string }[];
  stats: {
    successCount: number;
    warningCount: number;
    dangerCount: number;
    averageGrade: number | null;
    aiAverageScore: number | null;
    alertLevel: ClassAlertLevel;
  };
}

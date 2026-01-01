/**
 * Types pour le filtrage et tri des élèves avec statistiques
 * @module student-filters
 */

import type { Class, StudentProfile } from '@prisma/client'

// ============================================================================
// FILTRES
// ============================================================================

/**
 * Niveaux d'alerte pour les moyennes élèves
 * - all: Tous les élèves
 * - success: Moyenne ≥ 4.5 (🟢)
 * - warning: Moyenne 3.5-4.4 (🟡)
 * - danger: Moyenne < 3.5 (🔴)
 * - no-data: Aucune note
 */
export type StudentAlertLevel = 'all' | 'success' | 'warning' | 'danger' | 'no-data'

/**
 * Filtres pour la liste des élèves
 */
export interface StudentFilters {
  /** Filtre par classe (null = toutes) */
  classId: string | null
  /** Filtre par niveau d'alerte */
  alertLevel: StudentAlertLevel
  /** IDs des élèves sélectionnés (multi-select) */
  selectedStudentIds: string[]
  /** Recherche par nom */
  search: string
}

// ============================================================================
// TRI
// ============================================================================

/**
 * Champs de tri disponibles
 */
export type StudentSortField = 
  | 'lastName'      // Nom de famille
  | 'averageGrade'  // Moyenne générale
  | 'coursesCount'  // Nombre de cours
  | 'className'     // Nom de la classe

/**
 * Configuration du tri
 */
export interface StudentSort {
  field: StudentSortField
  direction: 'asc' | 'desc'
}

// ============================================================================
// STATS ÉLÈVE
// ============================================================================

/**
 * Statistiques calculées pour un élève
 */
export interface StudentStats {
  /** Moyenne générale (note finale /6), null si aucune note */
  averageGrade: number | null
  /** Nombre de cours avec notes */
  coursesWithGrades: number
  /** Nombre total de cours */
  totalCourses: number
  /** Niveau d'alerte basé sur la moyenne */
  alertLevel: 'success' | 'warning' | 'danger' | 'no-data'
  /** Moyenne compréhension IA (0-100), null si aucune activité */
  aiComprehension: number | null
}

/**
 * Élève enrichi avec ses statistiques
 */
export interface StudentWithStats {
  /** ID de l'utilisateur (clé primaire) */
  id: string
  /** Prénom */
  firstName: string
  /** Nom de famille */
  lastName: string
  /** Email */
  email: string
  /** Profil étudiant */
  studentProfile: StudentProfile | null
  /** Classe de l'élève */
  class: Class | null
  /** Statistiques calculées */
  stats: StudentStats
}

// ============================================================================
// CONSTANTES PAR DÉFAUT
// ============================================================================

/**
 * Filtres par défaut (tout afficher)
 */
export const DEFAULT_STUDENT_FILTERS: StudentFilters = {
  classId: null,
  alertLevel: 'all',
  selectedStudentIds: [],
  search: '',
}

/**
 * Tri par défaut (nom croissant)
 */
export const DEFAULT_STUDENT_SORT: StudentSort = {
  field: 'lastName',
  direction: 'asc',
}

// ============================================================================
// OPTIONS UI
// ============================================================================

/**
 * Options pour le select de niveau d'alerte
 */
export const ALERT_LEVEL_OPTIONS: { value: StudentAlertLevel; label: string }[] = [
  { value: 'all', label: 'Tous les niveaux' },
  { value: 'success', label: '🟢 En réussite (≥4.5)' },
  { value: 'warning', label: '🟡 À surveiller (3.5-4.4)' },
  { value: 'danger', label: '🔴 En difficulté (<3.5)' },
  { value: 'no-data', label: '⚪ Sans notes' },
]

/**
 * Options pour le select de tri
 */
export const SORT_FIELD_OPTIONS: { value: StudentSortField; label: string }[] = [
  { value: 'lastName', label: 'Nom' },
  { value: 'averageGrade', label: 'Moyenne' },
  { value: 'coursesCount', label: 'Nombre de cours' },
  { value: 'className', label: 'Classe' },
]

/**
 * Types pour le Centre de Pilotage Pédagogique
 * Phase 7-sexies
 */

// ============================================================================
// FILTRES
// ============================================================================

/**
 * Période de filtrage
 */
export type DashboardPeriod = 'week' | 'month' | 'trimester' | 'year' | 'all';

/**
 * Niveau d'alerte pour filtrer les élèves
 */
export type AlertLevel = 'all' | 'critical' | 'warning' | 'good';

/**
 * Filtres du centre de pilotage
 */
export interface DashboardFilters {
  classId: string | null;
  subjectId: string | null;
  courseId: string | null;
  chapterId: string | null;
  period: DashboardPeriod;
  alertLevel: AlertLevel;
  studentSearch: string;
}

/**
 * Filtres par défaut
 */
export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  classId: null,
  subjectId: null,
  courseId: null,
  chapterId: null,
  period: 'month',
  alertLevel: 'all',
  studentSearch: '',
};

// ============================================================================
// KPIs
// ============================================================================

/**
 * KPIs calculés du dashboard
 */
export interface DashboardKPIs {
  averageScore: number;      // Moyenne générale (0-100)
  successRate: number;       // Taux de réussite % (score >= 50)
  progressionRate: number;   // Progression moyenne %
  engagementRate: number;    // % élèves actifs (< 7 jours)
  activeAlerts: number;      // Nb élèves en difficulté
  aiAverageScore: number;    // Score IA moyen
}

/**
 * Tendance d'un KPI (comparaison période précédente)
 */
export type TrendDirection = 'up' | 'down' | 'stable';

export interface KPITrend {
  value: number;
  trend: TrendDirection;
  trendValue: number; // Ex: +5 ou -3
}

/**
 * KPIs avec tendances
 */
export interface DashboardKPIsWithTrends {
  averageScore: KPITrend;
  successRate: KPITrend;
  progressionRate: KPITrend;
  engagementRate: KPITrend;
  activeAlerts: KPITrend;
}

// ============================================================================
// PERFORMANCE COURS
// ============================================================================

/**
 * Performance d'un cours
 */
export interface CoursePerformance {
  courseId: string;
  courseTitle: string;
  chapterTitle?: string;
  averageScore: number;
  studentCount: number;
  trend: TrendDirection;
  weakPoint?: string; // Point de blocage identifié
}

/**
 * Réponse API courses-performance
 */
export interface CoursesPerformanceResponse {
  top: CoursePerformance[];
  bottom: CoursePerformance[];
}

// ============================================================================
// ALERTES ÉLÈVES
// ============================================================================

/**
 * Alerte d'un élève
 */
export interface StudentAlert {
  studentId: string;
  firstName: string;
  lastName: string;
  className: string;
  averageScore: number;
  alertLevel: 'critical' | 'warning' | 'good';
  lastActivity: Date | null;
  weakCourse?: string;
}

// ============================================================================
// OPTIONS UI
// ============================================================================

/**
 * Options pour les sélecteurs de période
 */
export const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'trimester', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
  { value: 'all', label: 'Tout' },
];

/**
 * Options pour les sélecteurs d'alerte
 */
export const ALERT_LEVEL_OPTIONS: { value: AlertLevel; label: string }[] = [
  { value: 'all', label: 'Tous les élèves' },
  { value: 'critical', label: 'Critiques (< 40%)' },
  { value: 'warning', label: 'Attention (40-60%)' },
  { value: 'good', label: 'Bons (> 60%)' },
];

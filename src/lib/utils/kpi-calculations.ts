/**
 * Utilitaires de calcul pour les KPIs du Centre de Pilotage
 * Phase 7-sexies
 */

import type { KPITrend, TrendDirection, DashboardPeriod } from '@/types/dashboard-filters';

// ============================================================================
// CALCULS DE BASE
// ============================================================================

/**
 * Calcule la moyenne d'un tableau de scores
 * @param scores - Tableau de scores numériques
 * @returns Moyenne arrondie, 0 si tableau vide
 */
export function calculateAverage(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / scores.length);
}

/**
 * Calcule le taux de réussite (% de scores >= seuil)
 * @param scores - Tableau de scores (0-100)
 * @param threshold - Seuil de réussite (défaut: 50)
 * @returns Pourcentage de réussite arrondi
 */
export function calculateSuccessRate(scores: number[], threshold = 50): number {
  if (scores.length === 0) return 0;
  const passed = scores.filter((score) => score >= threshold).length;
  return Math.round((passed / scores.length) * 100);
}

/**
 * Calcule la tendance entre deux valeurs
 * @param current - Valeur actuelle
 * @param previous - Valeur précédente
 * @param threshold - Seuil pour considérer stable (défaut: 2)
 * @returns Objet KPITrend avec direction et différence
 */
export function calculateTrend(
  current: number,
  previous: number,
  threshold = 2
): KPITrend {
  const diff = current - previous;
  let trend: TrendDirection = 'stable';
  
  if (diff > threshold) {
    trend = 'up';
  } else if (diff < -threshold) {
    trend = 'down';
  }

  return {
    value: current,
    trend,
    trendValue: Math.round(diff),
  };
}

/**
 * Calcule le taux d'engagement (% d'activité récente)
 * @param lastActivities - Tableau de dates de dernière activité
 * @param daysThreshold - Nombre de jours pour considérer actif (défaut: 7)
 * @returns Pourcentage d'engagement arrondi
 */
export function calculateEngagement(
  lastActivities: (Date | null)[],
  daysThreshold = 7
): number {
  if (lastActivities.length === 0) return 0;

  const now = new Date();
  const activeCount = lastActivities.filter((date) => {
    if (!date) return false;
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= daysThreshold;
  }).length;

  return Math.round((activeCount / lastActivities.length) * 100);
}

// ============================================================================
// NIVEAUX D'ALERTE
// ============================================================================

/**
 * Détermine le niveau d'alerte selon le score
 * @param score - Score de l'élève (0-100)
 * @returns Niveau d'alerte
 */
export function getAlertLevel(score: number): 'critical' | 'warning' | 'good' {
  if (score < 40) return 'critical';
  if (score < 60) return 'warning';
  return 'good';
}

/**
 * Retourne la classe CSS de couleur selon le niveau d'alerte
 */
export function getAlertColor(level: 'critical' | 'warning' | 'good'): string {
  const colors = {
    critical: 'text-red-600',
    warning: 'text-orange-500',
    good: 'text-green-600',
  };
  return colors[level];
}

/**
 * Retourne les classes CSS pour un badge selon le niveau d'alerte
 */
export function getAlertBadgeClass(level: 'critical' | 'warning' | 'good'): string {
  const classes = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-orange-100 text-orange-800 border-orange-200',
    good: 'bg-green-100 text-green-800 border-green-200',
  };
  return classes[level];
}

/**
 * Retourne l'icône emoji selon le niveau d'alerte
 */
export function getAlertEmoji(level: 'critical' | 'warning' | 'good'): string {
  const emojis = {
    critical: '🔴',
    warning: '🟠',
    good: '🟢',
  };
  return emojis[level];
}

// ============================================================================
// TENDANCES UI
// ============================================================================

/**
 * Retourne la classe CSS de couleur pour une tendance
 */
export function getTrendColor(trend: TrendDirection, inverse = false): string {
  // inverse = true pour les métriques où "down" est bon (ex: alertes)
  const colors = {
    up: inverse ? 'text-red-600' : 'text-green-600',
    down: inverse ? 'text-green-600' : 'text-red-600',
    stable: 'text-gray-500',
  };
  return colors[trend];
}

/**
 * Retourne la flèche pour une tendance
 */
export function getTrendArrow(trend: TrendDirection): string {
  const arrows = {
    up: '↑',
    down: '↓',
    stable: '→',
  };
  return arrows[trend];
}

// ============================================================================
// PÉRIODE
// ============================================================================

/**
 * Calcule la date de début selon la période
 * @param period - Période sélectionnée
 * @returns Date de début ou null si 'all'
 */
export function getPeriodStartDate(period: DashboardPeriod): Date | null {
  if (period === 'all') return null;

  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'trimester':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return start;
}

/**
 * Formate une date relative (ex: "il y a 3 jours")
 */
export function formatRelativeDate(date: Date | null): string {
  if (!date) return 'Jamais';

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
  return `Il y a ${Math.floor(diffDays / 30)} mois`;
}

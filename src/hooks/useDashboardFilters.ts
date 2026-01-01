/**
 * Hook pour gérer les filtres du Centre de Pilotage
 * Phase 7-sexies
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import type { DashboardFilters, DashboardPeriod, AlertLevel } from '@/types/dashboard-filters';
import { DEFAULT_DASHBOARD_FILTERS } from '@/types/dashboard-filters';

export function useDashboardFilters(initialFilters?: Partial<DashboardFilters>) {
  const [filters, setFilters] = useState<DashboardFilters>({
    ...DEFAULT_DASHBOARD_FILTERS,
    ...initialFilters,
  });

  /**
   * Met à jour un filtre spécifique
   */
  const updateFilter = useCallback(
    <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };

        // Cascade: si on change la matière, reset le cours
        if (key === 'subjectId') {
          newFilters.courseId = null;
          newFilters.chapterId = null;
        }
        // Cascade: si on change le cours, reset le chapitre
        if (key === 'courseId') {
          newFilters.chapterId = null;
        }

        return newFilters;
      });
    },
    []
  );

  /**
   * Réinitialise tous les filtres
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_DASHBOARD_FILTERS);
  }, []);

  /**
   * Compte le nombre de filtres actifs
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.classId) count++;
    if (filters.subjectId) count++;
    if (filters.courseId) count++;
    if (filters.chapterId) count++;
    if (filters.period !== 'month') count++;
    if (filters.alertLevel !== 'all') count++;
    if (filters.studentSearch) count++;
    return count;
  }, [filters]);

  /**
   * Construit la query string pour les appels API
   */
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.classId) params.set('classId', filters.classId);
    if (filters.subjectId) params.set('subjectId', filters.subjectId);
    if (filters.courseId) params.set('courseId', filters.courseId);
    if (filters.period) params.set('period', filters.period);
    if (filters.alertLevel !== 'all') params.set('alertLevel', filters.alertLevel);
    return params.toString();
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    activeFiltersCount,
    buildQueryString,
  };
}

// Types pour les options de filtres
export interface FilterOption {
  id: string;
  name: string;
}

export interface CourseFilterOption extends FilterOption {
  subjectId: string;
}

/**
 * Centre de Pilotage - Client Component
 * Gère les filtres et le chargement des données
 * Phase 7-sexies
 */

'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { DashboardFilterBar } from './DashboardFilterBar';
import { KPIGrid } from './KPIGrid';
import { CoursesPerformancePanel } from './CoursesPerformancePanel';
import { StudentsAlertsPanel } from './StudentsAlertsPanel';
import { useDashboardFilters, type FilterOption, type CourseFilterOption } from '@/hooks/useDashboardFilters';
import type { DashboardKPIs, CoursesPerformanceResponse, StudentAlert } from '@/types/dashboard-filters';

interface ControlCenterDashboardProps {
  classes: FilterOption[];
  subjects: FilterOption[];
  courses: CourseFilterOption[];
}

// Fetcher pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ControlCenterDashboard({
  classes,
  subjects,
  courses,
}: ControlCenterDashboardProps) {
  const router = useRouter();
  const {
    filters,
    updateFilter,
    resetFilters,
    activeFiltersCount,
    buildQueryString,
  } = useDashboardFilters();

  // Query string pour les APIs
  const queryString = buildQueryString();
  const apiBase = '/api/teacher/dashboard';

  // Charger les KPIs
  const { data: kpisResponse, isLoading: kpisLoading } = useSWR<{
    success: boolean;
    data: DashboardKPIs;
  }>(`${apiBase}/kpis?${queryString}`, fetcher, {
    refreshInterval: 60000, // Refresh toutes les minutes
  });

  // Charger la performance des cours
  const { data: coursesResponse, isLoading: coursesLoading } = useSWR<{
    success: boolean;
    data: CoursesPerformanceResponse;
  }>(`${apiBase}/courses-performance?${queryString}`, fetcher);

  // Charger les alertes élèves
  const { data: alertsResponse, isLoading: alertsLoading } = useSWR<{
    success: boolean;
    data: StudentAlert[];
  }>(
    `${apiBase}/students-alerts?${queryString}&limit=8`,
    fetcher
  );

  // Navigation vers fiche élève
  const handleStudentClick = useCallback(
    (studentId: string) => {
      router.push(`/teacher/students/${studentId}`);
    },
    [router]
  );

  return (
    <div className="space-y-6">
      {/* Barre de filtres */}
      <DashboardFilterBar
        filters={filters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        activeFiltersCount={activeFiltersCount}
        classes={classes}
        subjects={subjects}
        courses={courses}
      />

      {/* Grille KPIs */}
      <KPIGrid
        kpis={kpisResponse?.success ? kpisResponse.data : null}
        isLoading={kpisLoading}
      />

      {/* Panels Performance & Alertes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CoursesPerformancePanel
          top={coursesResponse?.success ? coursesResponse.data.top : []}
          bottom={coursesResponse?.success ? coursesResponse.data.bottom : []}
          isLoading={coursesLoading}
        />
        <StudentsAlertsPanel
          alerts={alertsResponse?.success ? alertsResponse.data : []}
          isLoading={alertsLoading}
          onStudentClick={handleStudentClick}
        />
      </div>
    </div>
  );
}

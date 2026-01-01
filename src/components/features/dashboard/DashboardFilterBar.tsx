/**
 * Barre de filtres pour le Centre de Pilotage
 * Phase 7-sexies
 */

'use client';

import { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Filter } from 'lucide-react';
import type { DashboardFilters, DashboardPeriod, AlertLevel } from '@/types/dashboard-filters';
import { PERIOD_OPTIONS } from '@/types/dashboard-filters';
import type { FilterOption, CourseFilterOption } from '@/hooks/useDashboardFilters';

interface DashboardFilterBarProps {
  filters: DashboardFilters;
  onFilterChange: <K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K]
  ) => void;
  onReset: () => void;
  activeFiltersCount: number;
  classes: FilterOption[];
  subjects: FilterOption[];
  courses: CourseFilterOption[];
}

export function DashboardFilterBar({
  filters,
  onFilterChange,
  onReset,
  activeFiltersCount,
  classes,
  subjects,
  courses,
}: DashboardFilterBarProps) {
  // Filtrer les cours par matière sélectionnée
  const filteredCourses = useMemo(() => {
    if (!filters.subjectId) return courses;
    return courses.filter((c) => c.subjectId === filters.subjectId);
  }, [courses, filters.subjectId]);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filtres
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </div>

      {/* Filtre Classe */}
      <Select
        value={filters.classId || 'all'}
        onValueChange={(v) => onFilterChange('classId', v === 'all' ? null : v)}
      >
        <SelectTrigger className="w-[150px] bg-background">
          <SelectValue placeholder="Classe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les classes</SelectItem>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre Matière */}
      <Select
        value={filters.subjectId || 'all'}
        onValueChange={(v) => onFilterChange('subjectId', v === 'all' ? null : v)}
      >
        <SelectTrigger className="w-[150px] bg-background">
          <SelectValue placeholder="Matière" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les matières</SelectItem>
          {subjects.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre Cours */}
      <Select
        value={filters.courseId || 'all'}
        onValueChange={(v) => onFilterChange('courseId', v === 'all' ? null : v)}
      >
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Cours" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les cours</SelectItem>
          {filteredCourses.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filtre Période */}
      <Select
        value={filters.period}
        onValueChange={(v) => onFilterChange('period', v as DashboardPeriod)}
      >
        <SelectTrigger className="w-[140px] bg-background">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Bouton Reset */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
          <RotateCcw className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
}

// AssignmentFiltersBar - Refactorisé
// 537 lignes → ~130 lignes (sous-composants extraits)

'use client';

import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

import {
  AssignmentFiltersState,
  PRIORITY_OPTIONS,
  useFiltersData,
  useFiltersActions,
  FilterDropdown,
  DateRangeDropdown,
} from './filters';

// Ré-exporter le type pour compatibilité
export type { AssignmentFiltersState } from './filters';

interface AssignmentFiltersBarProps {
  filters: AssignmentFiltersState;
  onFiltersChange: (filters: AssignmentFiltersState) => void;
}

export function AssignmentFiltersBar({ filters, onFiltersChange }: AssignmentFiltersBarProps) {
  const {
    subjects,
    chapters,
    sections,
    classes,
    students,
    filteredCourses,
    isLoading,
  } = useFiltersData(filters, onFiltersChange);

  const { toggleItem, handleReset, activeFiltersCount } = useFiltersActions(filters, onFiltersChange);

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg border">
      {/* Matières */}
      <FilterDropdown
        label="Matières"
        items={subjects}
        selected={filters.subjectIds}
        onToggle={(id) => toggleItem('subjectIds', id)}
        getId={(s) => s.id}
        renderItem={(s) => s.name}
        isLoading={isLoading}
        emptyMessage="Aucune matière"
      />

      {/* Cours */}
      <FilterDropdown
        label="Cours"
        items={filteredCourses}
        selected={filters.courseIds}
        onToggle={(id) => toggleItem('courseIds', id)}
        getId={(c) => c.id}
        renderItem={(c) => c.title}
        isLoading={isLoading}
        emptyMessage={filters.subjectIds.length > 0 ? "Aucun cours pour ces matières" : "Aucun cours"}
      />

      {/* Chapitres (visible si cours sélectionnés) */}
      {filters.courseIds.length > 0 && (
        <FilterDropdown
          label="Chapitres"
          items={chapters}
          selected={filters.chapterIds}
          onToggle={(id) => toggleItem('chapterIds', id)}
          getId={(c) => c.id}
          renderItem={(c) => c.title}
          isLoading={isLoading}
          emptyMessage="Aucun chapitre"
        />
      )}

      {/* Sections (visible si chapitres sélectionnés) */}
      {filters.chapterIds.length > 0 && (
        <FilterDropdown
          label="Sections"
          items={sections}
          selected={filters.sectionIds}
          onToggle={(id) => toggleItem('sectionIds', id)}
          getId={(s) => s.id}
          renderItem={(s) => s.title}
          isLoading={isLoading}
          emptyMessage="Aucune section"
        />
      )}

      {/* Classes */}
      <FilterDropdown
        label="Classes"
        items={classes}
        selected={filters.classIds}
        onToggle={(id) => toggleItem('classIds', id)}
        getId={(c) => c.id}
        renderItem={(c) => (
          <span className="flex items-center gap-2">
            {c.color && (
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: c.color }}
              />
            )}
            {c.name}
          </span>
        )}
        isLoading={isLoading}
        emptyMessage="Aucune classe"
      />

      {/* Élèves (visible si classes sélectionnées) */}
      {filters.classIds.length > 0 && (
        <FilterDropdown
          label="Élèves"
          items={students}
          selected={filters.studentIds}
          onToggle={(id) => toggleItem('studentIds', id)}
          getId={(s) => s.id}
          renderItem={(s) => `${s.firstName} ${s.lastName}`}
          isLoading={false}
          emptyMessage="Aucun élève"
        />
      )}

      {/* Priorité */}
      <FilterDropdown
        label="Priorité"
        items={PRIORITY_OPTIONS}
        selected={filters.priorities}
        onToggle={(id) => toggleItem('priorities', id)}
        getId={(p) => p.value}
        renderItem={(p) => <span className={p.color}>{p.label}</span>}
        isLoading={false}
        emptyMessage=""
      />

      {/* Période */}
      <DateRangeDropdown
        dateRange={filters.dateRange}
        onChange={(range) => onFiltersChange({ ...filters, dateRange: range })}
      />

      {/* Reset */}
      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1 text-muted-foreground"
        >
          <RotateCcw className="h-3 w-3" />
          Effacer ({activeFiltersCount})
        </Button>
      )}
    </div>
  );
}

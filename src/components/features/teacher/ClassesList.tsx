'use client';

import { useState, useMemo } from 'react';
import { TeacherClassCard } from './TeacherClassCard';
import { ClassStatsCounters } from './ClassStatsCounters';
import { ClassSelectionButtons } from './ClassSelectionButtons';
import { ClassFilterBar } from './ClassFilterBar';
import type { ClassWithStats, ClassFilters } from '@/types/class-filters';
import { DEFAULT_CLASS_FILTERS } from '@/types/class-filters';
import { filterClasses, calculateClassGroupStats, extractLevelsFromClasses } from '@/lib/class-filters';

interface ClassesListProps {
  classes: ClassWithStats[];
  subjects: { id: string; name: string }[];
}

export function ClassesList({ classes, subjects }: ClassesListProps) {
  const [filters, setFilters] = useState<ClassFilters>(DEFAULT_CLASS_FILTERS);

  // Appliquer filtres
  const filteredClasses = useMemo(() => {
    return filterClasses(classes, filters);
  }, [classes, filters]);

  // Classes sélectionnées (pour stats)
  const selectedClasses = useMemo(() => {
    if (filters.selectedClassIds.length === 0) return filteredClasses;
    return filteredClasses.filter(c => filters.selectedClassIds.includes(c.id));
  }, [filteredClasses, filters.selectedClassIds]);

  // Stats de groupe
  const groupStats = useMemo(() => {
    const stats = calculateClassGroupStats(selectedClasses);
    console.log('📊 Stats recalculées:', {
      filtresMatières: filters.subjectIds,
      classesFiltrées: filteredClasses.length,
      classesSélectionnées: selectedClasses.length,
      stats
    });
    return stats;
  }, [selectedClasses, filters.subjectIds, filteredClasses.length]);

  // Toggle sélection classe
  const toggleClassSelection = (classId: string) => {
    setFilters(prev => {
      const newSelectedIds = prev.selectedClassIds.includes(classId)
        ? prev.selectedClassIds.filter(id => id !== classId)
        : [...prev.selectedClassIds, classId];
      return { ...prev, selectedClassIds: newSelectedIds };
    });
  };

  return (
    <div className="space-y-4">
      {/* Boutons sélection groupe */}
      <ClassSelectionButtons
        allIds={filteredClasses.map(c => c.id)}
        selectedIds={filters.selectedClassIds}
        onSelectionChange={(ids) => setFilters({ ...filters, selectedClassIds: ids })}
      />

      {/* Stats */}
      <ClassStatsCounters
        stats={groupStats}
        selectedCount={filters.selectedClassIds.length}
        totalCount={filteredClasses.length}
      />

      {/* Filtres */}
      <ClassFilterBar
        subjects={subjects}
        classes={classes}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredClasses.length}
        totalCount={classes.length}
      />

      {/* Grille de cartes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((cls) => {
          // Filtrer les matières affichées selon le filtre actif
          const displayedSubjects = filters.subjectIds.length > 0
            ? cls.subjects.filter(s => filters.subjectIds.includes(s.id))
            : cls.subjects;

          return (
            <TeacherClassCard
              key={cls.id}
              classData={{
                ...cls,
                subjects: displayedSubjects
              }}
              selected={filters.selectedClassIds.includes(cls.id)}
              onToggleSelect={() => toggleClassSelection(cls.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

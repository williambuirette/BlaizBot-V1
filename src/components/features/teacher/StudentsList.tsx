'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StudentFilterBar } from './StudentFilterBar';
import { StudentCard } from './StudentCard';
import { StatsCounters } from './StatsCounters';
import { SelectionButtons } from './SelectionButtons';
import { LayoutGrid, List } from 'lucide-react';
import type { StudentStats, StudentFilters } from '@/types/student-filters';
import { DEFAULT_STUDENT_FILTERS } from '@/types/student-filters';
import { filterStudents, sortStudents, calculateGroupStats } from '@/lib/student-filters';

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  parentEmail?: string | null;
  classes: string[];
  classIds?: string[];
  isActive?: boolean;
  stats?: StudentStats;
}

interface ClassData {
  id: string;
  name: string;
  level: string;
}

interface StudentsListProps {
  students: StudentData[];
  classes?: ClassData[];
}

export function StudentsList({ students, classes = [] }: StudentsListProps) {
  // État des filtres
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_STUDENT_FILTERS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrage et tri
  const filteredStudents = useMemo(() => {
    const filtered = filterStudents(students, filters);
    return sortStudents(filtered, 'lastName', 'asc');
  }, [students, filters]);

  // Stats du groupe (basé sur sélection ou tous les filtrés)
  const groupStats = useMemo(() => {
    const studentsForStats = filters.selectedStudentIds.length > 0
      ? filteredStudents.filter(s => filters.selectedStudentIds.includes(s.id))
      : filteredStudents;
    return calculateGroupStats(studentsForStats);
  }, [filteredStudents, filters.selectedStudentIds]);

  // IDs des élèves filtrés pour la sélection
  const filteredIds = useMemo(() => 
    filteredStudents.map(s => s.id), 
    [filteredStudents]
  );

  // Callback pour changer la sélection
  const handleSelectionChange = (ids: string[]) => {
    setFilters({ ...filters, selectedStudentIds: ids });
  };

  // Liste pour le multi-select
  const allStudentsForSelect = students.map(s => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
  }));

  return (
    <div className="space-y-4">
      {/* Boutons de sélection + toggle vue */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <SelectionButtons
          allIds={filteredIds}
          selectedIds={filters.selectedStudentIds}
          onSelectionChange={handleSelectionChange}
        />

        <div className="flex gap-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistiques du groupe */}
      <StatsCounters
        stats={groupStats}
        selectedCount={filters.selectedStudentIds.length}
        totalCount={filteredStudents.length}
      />

      {/* Barre de filtres */}
      <StudentFilterBar
        classes={classes}
        allStudents={allStudentsForSelect}
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredStudents.length}
        totalCount={students.length}
      />

      {/* Grille de cartes ou liste */}
      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun élève ne correspond aux filtres sélectionnés.
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              selected={filters.selectedStudentIds.includes(student.id)}
              onToggleSelect={() => {
                const newSelection = filters.selectedStudentIds.includes(student.id)
                  ? filters.selectedStudentIds.filter(id => id !== student.id)
                  : [...filters.selectedStudentIds, student.id];
                setFilters({ ...filters, selectedStudentIds: newSelection });
              }}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des élèves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  selected={filters.selectedStudentIds.includes(student.id)}
                  onToggleSelect={() => {
                    const newSelection = filters.selectedStudentIds.includes(student.id)
                      ? filters.selectedStudentIds.filter(id => id !== student.id)
                      : [...filters.selectedStudentIds, student.id];
                    setFilters({ ...filters, selectedStudentIds: newSelection });
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

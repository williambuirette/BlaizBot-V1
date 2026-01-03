// src/components/features/student/StudentCoursesFiltersMulti.tsx
// Filtres multi-select pour la liste des cours élève
// Refactorisé : utilise les composants partagés (417 → 185 lignes)

'use client';

import { useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { MultiSelectDropdown, SingleSelectDropdown } from '@/components/shared/filters';

interface FilterOption {
  id: string;
  name: string;
}

interface CourseForFilter {
  id: string;
  title: string;
  tags: string[];
  subject: { id: string };
  teacher: { id: string };
}

export interface StudentCoursesFiltersProps {
  subjects: FilterOption[];
  teachers: FilterOption[];
  courses: CourseForFilter[];
  selectedSubjects: string[];
  selectedTeachers: string[];
  selectedThemes: string[];
  selectedStatus: string;
  onSubjectsChange: (ids: string[]) => void;
  onTeachersChange: (ids: string[]) => void;
  onThemesChange: (ids: string[]) => void;
  onStatusChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'not-started', label: 'Non commencé' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
];

export function StudentCoursesFilters({
  subjects,
  teachers,
  courses,
  selectedSubjects,
  selectedTeachers,
  selectedThemes,
  selectedStatus,
  onSubjectsChange,
  onTeachersChange,
  onThemesChange,
  onStatusChange,
}: StudentCoursesFiltersProps) {
  // Matières disponibles selon les profs sélectionnés
  const availableSubjects = useMemo(() => {
    if (selectedTeachers.length === 0) return subjects;
    const filteredCourses = courses.filter(c => selectedTeachers.includes(c.teacher.id));
    const subjectIds = new Set(filteredCourses.map(c => c.subject.id));
    return subjects.filter(s => subjectIds.has(s.id));
  }, [courses, selectedTeachers, subjects]);

  // Nettoyer les matières invalides
  useEffect(() => {
    const availableIds = new Set(availableSubjects.map(s => s.id));
    const valid = selectedSubjects.filter(id => availableIds.has(id));
    if (valid.length !== selectedSubjects.length) onSubjectsChange(valid);
  }, [availableSubjects, selectedSubjects, onSubjectsChange]);

  // Thèmes disponibles selon les filtres
  const availableThemes = useMemo(() => {
    let filtered = courses;
    if (selectedTeachers.length > 0) {
      filtered = filtered.filter(c => selectedTeachers.includes(c.teacher.id));
    }
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(c => selectedSubjects.includes(c.subject.id));
    }
    const themes = new Set(filtered.map(c => c.title));
    return Array.from(themes).map(name => ({ id: name, name }));
  }, [courses, selectedTeachers, selectedSubjects]);

  // Nettoyer les thèmes invalides
  useEffect(() => {
    const availableIds = new Set(availableThemes.map(t => t.id));
    const valid = selectedThemes.filter(id => availableIds.has(id));
    if (valid.length !== selectedThemes.length) onThemesChange(valid);
  }, [availableThemes, selectedThemes, onThemesChange]);

  const activeCount = 
    selectedTeachers.length + 
    selectedSubjects.length + 
    selectedThemes.length + 
    (selectedStatus !== 'all' ? 1 : 0);

  const handleClearAll = () => {
    onTeachersChange([]);
    onSubjectsChange([]);
    onThemesChange([]);
    onStatusChange('all');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg border">
        <MultiSelectDropdown
          label="Professeur"
          options={teachers}
          selectedIds={selectedTeachers}
          onChange={onTeachersChange}
          placeholder="Tous les profs"
        />

        <MultiSelectDropdown
          label="Matière"
          options={availableSubjects}
          selectedIds={selectedSubjects}
          onChange={onSubjectsChange}
          placeholder="Toutes"
        />

        <MultiSelectDropdown
          label="Thématique"
          options={availableThemes}
          selectedIds={selectedThemes}
          onChange={onThemesChange}
          placeholder="Toutes"
        />

        <SingleSelectDropdown
          label="Statut"
          options={STATUS_OPTIONS}
          selectedValue={selectedStatus}
          onChange={onStatusChange}
          placeholder="Tous"
        />
      </div>

      {/* Badges des filtres actifs */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtres actifs :</span>
          
          {selectedTeachers.map(id => {
            const item = teachers.find(t => t.id === id);
            return item ? (
              <Badge key={id} variant="secondary" className="gap-1">
                {item.name}
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" 
                   onClick={() => onTeachersChange(selectedTeachers.filter(i => i !== id))} />
              </Badge>
            ) : null;
          })}
          
          {selectedSubjects.map(id => {
            const item = availableSubjects.find(s => s.id === id) || subjects.find(s => s.id === id);
            return item ? (
              <Badge key={id} variant="secondary" className="gap-1">
                {item.name}
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" 
                   onClick={() => onSubjectsChange(selectedSubjects.filter(i => i !== id))} />
              </Badge>
            ) : null;
          })}
          
          {selectedThemes.map(id => {
            const item = availableThemes.find(t => t.id === id);
            return item ? (
              <Badge key={id} variant="secondary" className="gap-1">
                {item.name}
                <X className="h-3 w-3 cursor-pointer hover:text-destructive" 
                   onClick={() => onThemesChange(selectedThemes.filter(i => i !== id))} />
              </Badge>
            ) : null;
          })}
          
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {STATUS_OPTIONS.find(o => o.value === selectedStatus)?.label}
              <X className="h-3 w-3 cursor-pointer hover:text-destructive" 
                 onClick={() => onStatusChange('all')} />
            </Badge>
          )}

          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClearAll}>
            Tout effacer
          </Button>
        </div>
      )}
    </div>
  );
}

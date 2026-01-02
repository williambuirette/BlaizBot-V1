'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  name: string;
}

// Type simplifié pour les cours (pour le calcul des thèmes dynamiques)
interface CourseForFilter {
  id: string;
  title: string;
  tags: string[];
  subject: { id: string };
  teacher: { id: string };
}

interface MultiSelectFilterProps {
  label: string;
  options: FilterOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

function MultiSelectFilter({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = 'Tous',
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedCount = selectedIds.length;
  const displayText = selectedCount === 0 
    ? placeholder 
    : selectedCount === 1 
      ? options.find(o => o.id === selectedIds[0])?.name || '1 sélectionné'
      : `${selectedCount} sélectionnés`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label} :</span>
      <div className="relative" ref={containerRef}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between font-normal"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-[250px] bg-popover border rounded-md shadow-lg z-50">
            {/* Header avec bouton tout effacer */}
            {selectedCount > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-xs text-muted-foreground">{selectedCount} sélectionné(s)</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleClearAll}
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer
                </Button>
              </div>
            )}
            
            {/* Liste des options */}
            <div className="max-h-[200px] overflow-y-auto p-1">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Aucune option disponible
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => handleToggle(option.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(option.id)}
                      onCheckedChange={() => handleToggle(option.id)}
                    />
                    <span className="text-sm">{option.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Filtre simple pour le statut (single select)
interface SingleSelectFilterProps {
  label: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

function SingleSelectFilter({
  label,
  options,
  selectedValue,
  onChange,
}: SingleSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === selectedValue);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label} :</span>
      <div className="relative" ref={containerRef}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between font-normal"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{selectedOption?.label || 'Tous'}</span>
          <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-[200px] bg-popover border rounded-md shadow-lg z-50">
            <div className="p-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "px-3 py-2 text-sm rounded-sm cursor-pointer",
                    selectedValue === option.value ? "bg-accent" : "hover:bg-accent/50"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Props du composant principal
export interface StudentCoursesFiltersProps {
  subjects: FilterOption[];
  teachers: FilterOption[];
  courses: CourseForFilter[]; // Tous les cours pour calculer les thèmes dynamiquement
  selectedSubjects: string[];
  selectedTeachers: string[];
  selectedThemes: string[];
  selectedStatus: string;
  onSubjectsChange: (ids: string[]) => void;
  onTeachersChange: (ids: string[]) => void;
  onThemesChange: (ids: string[]) => void;
  onStatusChange: (value: string) => void;
}

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
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'not-started', label: 'Non commencé' },
    { value: 'in-progress', label: 'En cours' },
    { value: 'completed', label: 'Terminé' },
  ];

  // Calculer les matières disponibles dynamiquement
  // en fonction du professeur sélectionné
  const availableSubjects = useMemo(() => {
    if (selectedTeachers.length === 0) {
      return subjects; // Toutes les matières si aucun prof sélectionné
    }
    
    // Filtrer les cours par professeur sélectionné
    const filteredCourses = courses.filter(c => selectedTeachers.includes(c.teacher.id));
    
    // Extraire les matières uniques de ces cours
    const subjectIds = new Set(filteredCourses.map(c => c.subject.id));
    
    return subjects.filter(s => subjectIds.has(s.id));
  }, [courses, selectedTeachers, subjects]);

  // Nettoyer les matières sélectionnées qui ne sont plus disponibles
  useEffect(() => {
    const availableSubjectIds = new Set(availableSubjects.map(s => s.id));
    const validSubjects = selectedSubjects.filter(id => availableSubjectIds.has(id));
    if (validSubjects.length !== selectedSubjects.length) {
      onSubjectsChange(validSubjects);
    }
  }, [availableSubjects, selectedSubjects, onSubjectsChange]);

  // Calculer les thèmes disponibles dynamiquement
  // en fonction des filtres Professeur et Matière sélectionnés
  const availableThemes = useMemo(() => {
    // Filtrer les cours selon les filtres actifs
    let filteredCourses = courses;
    
    if (selectedTeachers.length > 0) {
      filteredCourses = filteredCourses.filter(c => selectedTeachers.includes(c.teacher.id));
    }
    
    if (selectedSubjects.length > 0) {
      filteredCourses = filteredCourses.filter(c => selectedSubjects.includes(c.subject.id));
    }
    
    // Extraire uniquement les TITRES des cours filtrés (pas les tags)
    const themesSet = new Set<string>();
    filteredCourses.forEach(course => {
      themesSet.add(course.title);
    });
    
    // Convertir en array d'options
    return Array.from(themesSet).map(name => ({ id: name, name }));
  }, [courses, selectedTeachers, selectedSubjects]);

  // Nettoyer les thèmes sélectionnés qui ne sont plus disponibles
  useEffect(() => {
    const availableThemeIds = new Set(availableThemes.map(t => t.id));
    const validThemes = selectedThemes.filter(id => availableThemeIds.has(id));
    if (validThemes.length !== selectedThemes.length) {
      onThemesChange(validThemes);
    }
  }, [availableThemes, selectedThemes, onThemesChange]);

  // Compter les filtres actifs
  const activeFiltersCount = 
    selectedTeachers.length + 
    selectedSubjects.length + 
    selectedThemes.length + 
    (selectedStatus !== 'all' ? 1 : 0);

  const handleClearAllFilters = () => {
    onTeachersChange([]);
    onSubjectsChange([]);
    onThemesChange([]);
    onStatusChange('all');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg border">
        {/* Filtre Professeur */}
        <MultiSelectFilter
          label="Professeur"
          options={teachers}
          selectedIds={selectedTeachers}
          onChange={onTeachersChange}
          placeholder="Tous les profs"
        />

        {/* Filtre Matière - dynamique selon Professeur */}
        <MultiSelectFilter
          label="Matière"
          options={availableSubjects}
          selectedIds={selectedSubjects}
          onChange={onSubjectsChange}
          placeholder="Toutes"
        />

        {/* Filtre Thématique - dynamique selon Professeur/Matière */}
        <MultiSelectFilter
          label="Thématique"
          options={availableThemes}
          selectedIds={selectedThemes}
          onChange={onThemesChange}
          placeholder="Toutes"
        />

        {/* Filtre Statut */}
        <SingleSelectFilter
          label="Statut"
          options={statusOptions}
          selectedValue={selectedStatus}
          onChange={onStatusChange}
        />
      </div>

      {/* Badges des filtres actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtres actifs :</span>
          
          {selectedTeachers.map(id => {
            const teacher = teachers.find(t => t.id === id);
            return teacher ? (
              <Badge key={id} variant="secondary" className="gap-1">
                {teacher.name}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onTeachersChange(selectedTeachers.filter(i => i !== id))}
                />
              </Badge>
            ) : null;
          })}
          
          {selectedSubjects.map(id => {
            const subject = availableSubjects.find(s => s.id === id) || subjects.find(s => s.id === id);
            return subject ? (
              <Badge key={id} variant="secondary" className="gap-1">
                {subject.name}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onSubjectsChange(selectedSubjects.filter(i => i !== id))}
                />
              </Badge>
            ) : null;
          })}
          
          {selectedThemes.map(id => {
            const theme = availableThemes.find(t => t.id === id);
            return theme ? (
              <Badge key={id} variant="secondary" className="gap-1">
                {theme.name}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => onThemesChange(selectedThemes.filter(i => i !== id))}
                />
              </Badge>
            ) : null;
          })}
          
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {statusOptions.find(o => o.value === selectedStatus)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => onStatusChange('all')}
              />
            </Badge>
          )}

          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs"
            onClick={handleClearAllFilters}
          >
            Tout effacer
          </Button>
        </div>
      )}
    </div>
  );
}

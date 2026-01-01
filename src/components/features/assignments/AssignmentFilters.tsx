'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { CollapsibleFilterSection, FilterCheckbox, FilterDatePicker } from './FilterComponents';

// Types alignés avec le modal NewAssignmentModal
export interface AssignmentFiltersState {
  subjectIds: string[];
  courseIds: string[];
  classIds: string[];
  priorities: string[];
  dateRange: { start: Date; end: Date } | null;
}

interface AssignmentFiltersProps {
  filters: AssignmentFiltersState;
  onFiltersChange: (filters: AssignmentFiltersState) => void;
}

interface Subject { id: string; name: string }
interface Course { id: string; title: string; subjectId?: string; subject?: { id: string } }
interface ClassOption { id: string; name: string }

const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: 'Haute', color: 'text-red-600' },
  { value: 'MEDIUM', label: 'Moyenne', color: 'text-orange-600' },
  { value: 'LOW', label: 'Basse', color: 'text-green-600' },
];

export function AssignmentFilters({ filters, onFiltersChange }: AssignmentFiltersProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sections ouvertes/fermées
  const [openSections, setOpenSections] = useState({
    subjects: true,
    courses: true,
    classes: true,
    priority: true,
    period: false,
  });

  // Ref pour éviter les appels multiples
  const prevSubjectsRef = useRef<string>('');

  // Chargement initial des données
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [subjectsRes, coursesRes, classesRes] = await Promise.all([
          fetch('/api/teacher/subjects'),
          fetch('/api/teacher/courses'),
          fetch('/api/teacher/classes'),
        ]);
        
        const [subjectsJson, coursesJson, classesJson] = await Promise.all([
          subjectsRes.json(),
          coursesRes.json(),
          classesRes.json(),
        ]);
        
        // Matières
        setSubjects(subjectsJson.subjects || subjectsJson.data || []);
        
        // Cours
        const coursesArray = coursesJson.data?.courses || coursesJson.data || [];
        setCourses(Array.isArray(coursesArray) ? coursesArray : []);
        
        // Classes
        const classesArray = classesJson.classes || classesJson.data || [];
        setClasses(Array.isArray(classesArray) ? classesArray : []);
      } catch (error) {
        console.error('Erreur chargement filtres:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOptions();
  }, []);

  // Filtrage cascade : Matières → Cours
  const filteredCourses = useMemo(() => {
    if (filters.subjectIds.length === 0) return courses;
    return courses.filter(c => {
      const courseSubjectId = c.subject?.id || c.subjectId;
      return courseSubjectId && filters.subjectIds.includes(courseSubjectId);
    });
  }, [courses, filters.subjectIds]);

  // Quand les matières changent, nettoyer les cours non valides
  useEffect(() => {
    const subjectsKey = filters.subjectIds.sort().join(',');
    if (subjectsKey === prevSubjectsRef.current) return;
    prevSubjectsRef.current = subjectsKey;

    if (filters.subjectIds.length > 0 && filters.courseIds.length > 0) {
      const validCourseIds = filteredCourses.map(c => c.id);
      const newCourseIds = filters.courseIds.filter(id => validCourseIds.includes(id));
      if (newCourseIds.length !== filters.courseIds.length) {
        onFiltersChange({ ...filters, courseIds: newCourseIds });
      }
    }
  }, [filters, filteredCourses, onFiltersChange]);

  const handleCheckboxChange = (
    key: 'subjectIds' | 'courseIds' | 'classIds' | 'priorities',
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[key];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({ ...filters, [key]: newValues });
  };

  const handleDateRangeChange = (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    
    const newRange = filters.dateRange || { start: new Date(), end: new Date() };
    onFiltersChange({
      ...filters,
      dateRange: { ...newRange, [type]: date },
    });
  };

  const handleReset = () => {
    onFiltersChange({
      subjectIds: [],
      courseIds: [],
      classIds: [],
      priorities: [],
      dateRange: null,
    });
  };

  const hasActiveFilters = 
    filters.subjectIds.length > 0 ||
    filters.courseIds.length > 0 ||
    filters.classIds.length > 0 ||
    filters.priorities.length > 0 ||
    filters.dateRange !== null;

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-4">
      {/* 1. Matières */}
      <CollapsibleFilterSection
        title="Matières"
        count={filters.subjectIds.length}
        isOpen={openSections.subjects}
        onToggle={() => toggleSection('subjects')}
        isLoading={isLoading}
      >
        {subjects.map(subject => (
          <FilterCheckbox
            key={subject.id}
            id={`subject-${subject.id}`}
            label={subject.name}
            checked={filters.subjectIds.includes(subject.id)}
            onChange={(checked) => handleCheckboxChange('subjectIds', subject.id, checked)}
          />
        ))}
        {subjects.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">Aucune matière</p>
        )}
      </CollapsibleFilterSection>

      {/* 2. Cours (filtrés par matières) */}
      <CollapsibleFilterSection
        title="Cours"
        count={filters.courseIds.length}
        isOpen={openSections.courses}
        onToggle={() => toggleSection('courses')}
        isLoading={isLoading}
      >
        {filteredCourses.map(course => (
          <FilterCheckbox
            key={course.id}
            id={`course-${course.id}`}
            label={course.title}
            checked={filters.courseIds.includes(course.id)}
            onChange={(checked) => handleCheckboxChange('courseIds', course.id, checked)}
          />
        ))}
        {filteredCourses.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">
            {filters.subjectIds.length > 0 ? 'Aucun cours pour ces matières' : 'Aucun cours'}
          </p>
        )}
      </CollapsibleFilterSection>

      {/* 3. Classes */}
      <CollapsibleFilterSection
        title="Classes"
        count={filters.classIds.length}
        isOpen={openSections.classes}
        onToggle={() => toggleSection('classes')}
        isLoading={isLoading}
      >
        {classes.map(cls => (
          <FilterCheckbox
            key={cls.id}
            id={`class-${cls.id}`}
            label={cls.name}
            checked={filters.classIds.includes(cls.id)}
            onChange={(checked) => handleCheckboxChange('classIds', cls.id, checked)}
          />
        ))}
        {classes.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">Aucune classe</p>
        )}
      </CollapsibleFilterSection>

      {/* 4. Priorité */}
      <CollapsibleFilterSection
        title="Priorité"
        count={filters.priorities.length}
        isOpen={openSections.priority}
        onToggle={() => toggleSection('priority')}
      >
        {PRIORITY_OPTIONS.map(opt => (
          <FilterCheckbox
            key={opt.value}
            id={`priority-${opt.value}`}
            label={opt.label}
            checked={filters.priorities.includes(opt.value)}
            onChange={(checked) => handleCheckboxChange('priorities', opt.value, checked)}
            className={opt.color}
          />
        ))}
      </CollapsibleFilterSection>

      {/* 5. Période */}
      <CollapsibleFilterSection
        title="Période"
        count={filters.dateRange ? 1 : 0}
        isOpen={openSections.period}
        onToggle={() => toggleSection('period')}
      >
        <div className="space-y-2">
          <FilterDatePicker
            label="Du"
            date={filters.dateRange?.start}
            onSelect={(date) => handleDateRangeChange('start', date)}
          />
          <FilterDatePicker
            label="Au"
            date={filters.dateRange?.end}
            onSelect={(date) => handleDateRangeChange('end', date)}
          />
        </div>
      </CollapsibleFilterSection>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );
}

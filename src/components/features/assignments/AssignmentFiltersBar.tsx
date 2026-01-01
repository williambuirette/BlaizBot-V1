'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, ChevronDown, RotateCcw, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Types alignés avec NewAssignmentModal
export interface AssignmentFiltersState {
  subjectIds: string[];
  courseIds: string[];
  chapterIds: string[];
  sectionIds: string[];
  classIds: string[];
  studentIds: string[];
  priorities: string[];
  dateRange: { start: Date; end: Date } | null;
}

interface AssignmentFiltersBarProps {
  filters: AssignmentFiltersState;
  onFiltersChange: (filters: AssignmentFiltersState) => void;
}

interface Subject { id: string; name: string }
interface Course { id: string; title: string; subjectId?: string; subject?: { id: string } }
interface Chapter { id: string; title: string; courseId: string }
interface Section { id: string; title: string; chapterId: string }
interface ClassOption { id: string; name: string; color?: string | null }
interface Student { id: string; firstName: string; lastName: string; classId: string }

const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: 'Haute', color: 'text-red-600' },
  { value: 'MEDIUM', label: 'Moyenne', color: 'text-orange-600' },
  { value: 'LOW', label: 'Basse', color: 'text-green-600' },
];

export function AssignmentFiltersBar({ filters, onFiltersChange }: AssignmentFiltersBarProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs pour éviter les boucles infinies
  const prevSubjectsRef = useRef<string>('');
  const prevClassesRef = useRef<string>('');
  const prevCoursesRef = useRef<string>('');
  const prevChaptersRef = useRef<string>('');

  // Chargement initial
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
        
        setSubjects(subjectsJson.subjects || subjectsJson.data || []);
        const coursesArray = coursesJson.data?.courses || coursesJson.data || [];
        setCourses(Array.isArray(coursesArray) ? coursesArray : []);
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

  // Charger les chapitres quand les cours changent
  useEffect(() => {
    const coursesKey = filters.courseIds.sort().join(',');
    if (coursesKey === prevCoursesRef.current) return;
    prevCoursesRef.current = coursesKey;

    if (filters.courseIds.length === 0) {
      setChapters([]);
      // Aussi nettoyer les sections si pas de chapitres
      if (filters.chapterIds.length > 0) {
        onFiltersChange({ ...filters, chapterIds: [], sectionIds: [] });
      }
      return;
    }

    async function loadChapters() {
      try {
        const allChapters: Chapter[] = [];
        for (const courseId of filters.courseIds) {
          const response = await fetch(`/api/teacher/courses/${courseId}`);
          const json = await response.json();
          if (json.success && json.data?.Chapter) {
            for (const chapter of json.data.Chapter) {
              allChapters.push({
                id: chapter.id,
                title: chapter.title,
                courseId: chapter.courseId,
              });
            }
          }
        }
        setChapters(allChapters);
      } catch (error) {
        console.error('Erreur chargement chapitres:', error);
      }
    }
    loadChapters();
  }, [filters.courseIds, onFiltersChange]);

  // Charger les sections quand les chapitres changent
  useEffect(() => {
    const chaptersKey = filters.chapterIds.sort().join(',');
    if (chaptersKey === prevChaptersRef.current) return;
    prevChaptersRef.current = chaptersKey;

    if (filters.chapterIds.length === 0) {
      setSections([]);
      // Aussi nettoyer les sections si pas de chapitres
      if (filters.sectionIds.length > 0) {
        onFiltersChange({ ...filters, sectionIds: [] });
      }
      return;
    }

    async function loadSections() {
      try {
        const allSections: Section[] = [];
        for (const chapterId of filters.chapterIds) {
          const response = await fetch(`/api/teacher/chapters/${chapterId}`);
          const json = await response.json();
          if (json.success && json.data?.Section) {
            for (const section of json.data.Section) {
              allSections.push({
                id: section.id,
                title: section.title,
                chapterId: section.chapterId,
              });
            }
          }
        }
        setSections(allSections);
      } catch (error) {
        console.error('Erreur chargement sections:', error);
      }
    }
    loadSections();
  }, [filters.chapterIds, onFiltersChange]);

  // Charger les élèves quand les classes changent
  useEffect(() => {
    const classesKey = filters.classIds.sort().join(',');
    if (classesKey === prevClassesRef.current) return;
    prevClassesRef.current = classesKey;

    if (filters.classIds.length === 0) {
      setStudents([]);
      return;
    }

    async function loadStudents() {
      try {
        const allStudents: Student[] = [];
        for (const classId of filters.classIds) {
          const response = await fetch(`/api/teacher/classes/${classId}`);
          const json = await response.json();
          if (json.success && json.data?.StudentProfile) {
            for (const student of json.data.StudentProfile) {
              if (student.User) {
                allStudents.push({
                  id: student.User.id,
                  firstName: student.User.firstName,
                  lastName: student.User.lastName,
                  classId,
                });
              }
            }
          }
        }
        setStudents(allStudents);
      } catch (error) {
        console.error('Erreur chargement élèves:', error);
      }
    }
    loadStudents();
  }, [filters.classIds]);

  // Filtrage cascade : Matières → Cours
  const filteredCourses = useMemo(() => {
    if (filters.subjectIds.length === 0) return courses;
    return courses.filter(c => {
      const courseSubjectId = c.subject?.id || c.subjectId;
      return courseSubjectId && filters.subjectIds.includes(courseSubjectId);
    });
  }, [courses, filters.subjectIds]);

  // Nettoyage cascade
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

  const toggleItem = useCallback((key: keyof AssignmentFiltersState, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [key]: newValues });
  }, [filters, onFiltersChange]);

  const handleReset = () => {
    onFiltersChange({
      subjectIds: [],
      courseIds: [],
      chapterIds: [],
      sectionIds: [],
      classIds: [],
      studentIds: [],
      priorities: [],
      dateRange: null,
    });
  };

  const activeFiltersCount = 
    filters.subjectIds.length +
    filters.courseIds.length +
    filters.chapterIds.length +
    filters.sectionIds.length +
    filters.classIds.length +
    filters.studentIds.length +
    filters.priorities.length +
    (filters.dateRange ? 1 : 0);

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

// Dropdown générique pour les filtres
function FilterDropdown<T>({
  label,
  items,
  selected,
  onToggle,
  getId,
  renderItem,
  isLoading,
  emptyMessage,
}: {
  label: string;
  items: T[];
  selected: string[];
  onToggle: (id: string) => void;
  getId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  isLoading: boolean;
  emptyMessage: string;
}) {
  const count = selected.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1">
          {label}
          {count > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {count}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <ScrollArea className="max-h-64">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              {emptyMessage}
            </p>
          ) : (
            <div className="p-2 space-y-1">
              {items.map((item) => {
                const id = getId(item);
                const isSelected = selected.includes(id);
                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors text-sm',
                      isSelected && 'bg-muted'
                    )}
                    onClick={() => onToggle(id)}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => onToggle(id)} />
                    <span className="flex-1">{renderItem(item)}</span>
                    {isSelected && <Check className="h-3 w-3 text-primary" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Dropdown pour la période
function DateRangeDropdown({
  dateRange,
  onChange,
}: {
  dateRange: { start: Date; end: Date } | null;
  onChange: (range: { start: Date; end: Date } | null) => void;
}) {
  const hasRange = dateRange !== null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1">
          <CalendarIcon className="h-3 w-3" />
          Période
          {hasRange && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">1</Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Du</p>
            <Calendar
              mode="single"
              selected={dateRange?.start}
              onSelect={(date) => {
                if (date) {
                  onChange({
                    start: date,
                    end: dateRange?.end || date,
                  });
                }
              }}
              locale={fr}
              className="rounded-md border"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Au</p>
            <Calendar
              mode="single"
              selected={dateRange?.end}
              onSelect={(date) => {
                if (date) {
                  onChange({
                    start: dateRange?.start || date,
                    end: date,
                  });
                }
              }}
              locale={fr}
              className="rounded-md border"
            />
          </div>
          {hasRange && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {format(dateRange.start, 'dd MMM yyyy', { locale: fr })} - {format(dateRange.end, 'dd MMM yyyy', { locale: fr })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => onChange(null)}
              >
                Effacer la période
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

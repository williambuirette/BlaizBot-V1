// Hooks pour AssignmentFiltersBar

'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { 
  AssignmentFiltersState, 
  Subject, 
  Course, 
  Chapter, 
  Section, 
  ClassOption, 
  Student 
} from './types';

interface UseFiltersDataReturn {
  subjects: Subject[];
  courses: Course[];
  chapters: Chapter[];
  sections: Section[];
  classes: ClassOption[];
  students: Student[];
  filteredCourses: Course[];
  isLoading: boolean;
}

export function useFiltersData(
  filters: AssignmentFiltersState,
  onFiltersChange: (filters: AssignmentFiltersState) => void
): UseFiltersDataReturn {
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
  }, [filters.courseIds, filters.chapterIds.length, filters, onFiltersChange]);

  // Charger les sections quand les chapitres changent
  useEffect(() => {
    const chaptersKey = filters.chapterIds.sort().join(',');
    if (chaptersKey === prevChaptersRef.current) return;
    prevChaptersRef.current = chaptersKey;

    if (filters.chapterIds.length === 0) {
      setSections([]);
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
  }, [filters.chapterIds, filters.sectionIds.length, filters, onFiltersChange]);

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

  return {
    subjects,
    courses,
    chapters,
    sections,
    classes,
    students,
    filteredCourses,
    isLoading,
  };
}

export function useFiltersActions(
  filters: AssignmentFiltersState,
  onFiltersChange: (filters: AssignmentFiltersState) => void
) {
  const toggleItem = useCallback((key: keyof AssignmentFiltersState, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [key]: newValues });
  }, [filters, onFiltersChange]);

  const handleReset = useCallback(() => {
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
  }, [onFiltersChange]);

  const activeFiltersCount = 
    filters.subjectIds.length +
    filters.courseIds.length +
    filters.chapterIds.length +
    filters.sectionIds.length +
    filters.classIds.length +
    filters.studentIds.length +
    filters.priorities.length +
    (filters.dateRange ? 1 : 0);

  return { toggleItem, handleReset, activeFiltersCount };
}

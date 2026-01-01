'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Subject, Course, Chapter, Section, ClassOption, Student } from './types';

interface UseAssignmentFormReturn {
  // Data
  subjects: Subject[];
  courses: Course[];
  chapters: Chapter[];
  sections: Section[];
  classes: ClassOption[];
  students: Student[];
  
  // Selections
  selectedSubjects: string[];
  selectedCourses: string[];
  selectedSections: string[];
  selectedClasses: string[];
  selectedStudents: string[];
  dueDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  instructions: string;
  
  // Computed
  filteredCourses: Course[];
  filteredStudents: Student[];
  sectionsByChapter: Record<string, { chapter: Chapter; sections: Section[] }>;
  studentsByClass: Record<string, { classInfo: ClassOption; students: Student[] }>;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setSelectedSubjects: (ids: string[]) => void;
  setSelectedCourses: (ids: string[]) => void;
  setSelectedSections: (ids: string[]) => void;
  setSelectedClasses: (ids: string[]) => void;
  setSelectedStudents: (ids: string[]) => void;
  setDueDate: (date: Date | undefined) => void;
  setPriority: (priority: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  setInstructions: (instructions: string) => void;
  
  // Helpers
  toggleSelection: (id: string, selected: string[], setSelected: (val: string[]) => void) => void;
  selectAll: (items: { id: string }[], setSelected: (val: string[]) => void) => void;
  clearAll: (setSelected: (val: string[]) => void) => void;
  toggleClassStudents: (classId: string) => void;
  isClassFullySelected: (classId: string) => boolean;
  
  // Reset
  reset: () => void;
}

export function useAssignmentForm(open: boolean): UseAssignmentFormReturn {
  // Data from API
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Selections
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [instructions, setInstructions] = useState('');

  // Track previous values to avoid infinite loops (declared early for use in reset)
  const prevSelectedCoursesRef = useRef<string>('');
  const prevSelectedClassesRef = useRef<string>('');

  // Reset function
  const reset = useCallback(() => {
    setSelectedSubjects([]);
    setSelectedCourses([]);
    setSelectedSections([]);
    setSelectedClasses([]);
    setSelectedStudents([]);
    setDueDate(undefined);
    setPriority('MEDIUM');
    setInstructions('');
    // Reset refs too
    prevSelectedCoursesRef.current = '';
    prevSelectedClassesRef.current = '';
  }, []);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  // Load initial data
  useEffect(() => {
    if (!open) return;
    
    async function loadInitialData() {
      setIsLoading(true);
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
        const coursesArray = coursesJson.data?.courses || coursesJson.data?.data || [];
        setCourses(Array.isArray(coursesArray) ? coursesArray : []);
        setClasses(classesJson.classes || classesJson.data || []);
      } catch (error) {
        console.error('Erreur chargement données:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitialData();
  }, [open]);

  // Load chapters when courses change
  useEffect(() => {
    const coursesKey = selectedCourses.sort().join(',');
    if (coursesKey === prevSelectedCoursesRef.current) return;
    prevSelectedCoursesRef.current = coursesKey;

    if (selectedCourses.length === 0) {
      setChapters([]);
      setSections([]);
      return;
    }
    
    async function loadChaptersAndSections() {
      try {
        const allChapters: Chapter[] = [];
        const allSections: Section[] = [];

        for (const courseId of selectedCourses) {
          const response = await fetch(`/api/teacher/courses/${courseId}/chapters`);
          const json = await response.json();
          const chaptersArray = Array.isArray(json) ? json : (json.data || []);
          
          for (const chapter of chaptersArray) {
            allChapters.push({ ...chapter, courseId });
            if (chapter.sections && Array.isArray(chapter.sections)) {
              for (const section of chapter.sections) {
                allSections.push({ ...section, chapterId: chapter.id, courseId });
              }
            }
          }
        }

        setChapters(allChapters);
        setSections(allSections);
      } catch (error) {
        console.error('Erreur chargement chapitres:', error);
      }
    }
    
    loadChaptersAndSections();
  }, [selectedCourses]);

  // Load students when classes change
  useEffect(() => {
    const classesKey = selectedClasses.sort().join(',');
    if (classesKey === prevSelectedClassesRef.current) return;
    prevSelectedClassesRef.current = classesKey;

    if (selectedClasses.length === 0) {
      setStudents([]);
      return;
    }
    
    async function loadStudents() {
      try {
        const allStudents: Student[] = [];

        for (const classId of selectedClasses) {
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
  }, [selectedClasses]);

  // Computed values
  const filteredCourses = useMemo(() => {
    if (selectedSubjects.length === 0) return courses;
    return courses.filter(c => {
      const subjectId = c.subject?.id || c.subjectId;
      return subjectId && selectedSubjects.includes(subjectId);
    });
  }, [courses, selectedSubjects]);

  const filteredStudents = useMemo(() => {
    if (selectedClasses.length === 0) return [];
    return students.filter(s => selectedClasses.includes(s.classId));
  }, [students, selectedClasses]);

  const sectionsByChapter = useMemo(() => {
    const grouped: Record<string, { chapter: Chapter; sections: Section[] }> = {};
    for (const chapter of chapters) {
      grouped[chapter.id] = { chapter, sections: [] };
    }
    for (const section of sections) {
      grouped[section.chapterId]?.sections.push(section);
    }
    return grouped;
  }, [chapters, sections]);

  const studentsByClass = useMemo(() => {
    const grouped: Record<string, { classInfo: ClassOption; students: Student[] }> = {};
    for (const classId of selectedClasses) {
      const classInfo = classes.find(c => c.id === classId);
      if (classInfo) grouped[classId] = { classInfo, students: [] };
    }
    for (const student of filteredStudents) {
      grouped[student.classId]?.students.push(student);
    }
    return grouped;
  }, [selectedClasses, classes, filteredStudents]);

  // Helper functions
  const toggleSelection = useCallback((id: string, selected: string[], setSelected: (val: string[]) => void) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  }, []);

  const selectAll = useCallback((items: { id: string }[], setSelected: (val: string[]) => void) => {
    setSelected(items.map(i => i.id));
  }, []);

  const clearAll = useCallback((setSelected: (val: string[]) => void) => {
    setSelected([]);
  }, []);

  const toggleClassStudents = useCallback((classId: string) => {
    const classStudentIds = filteredStudents.filter(s => s.classId === classId).map(s => s.id);
    const allSelected = classStudentIds.every(id => selectedStudents.includes(id));
    
    if (allSelected) {
      setSelectedStudents(selectedStudents.filter(id => !classStudentIds.includes(id)));
    } else {
      const newSelection = [...selectedStudents];
      for (const id of classStudentIds) {
        if (!newSelection.includes(id)) newSelection.push(id);
      }
      setSelectedStudents(newSelection);
    }
  }, [filteredStudents, selectedStudents]);

  const isClassFullySelected = useCallback((classId: string) => {
    const classStudents = filteredStudents.filter(s => s.classId === classId);
    return classStudents.length > 0 && classStudents.every(s => selectedStudents.includes(s.id));
  }, [filteredStudents, selectedStudents]);

  return {
    subjects,
    courses,
    chapters,
    sections,
    classes,
    students,
    selectedSubjects,
    selectedCourses,
    selectedSections,
    selectedClasses,
    selectedStudents,
    dueDate,
    priority,
    instructions,
    filteredCourses,
    filteredStudents,
    sectionsByChapter,
    studentsByClass,
    isLoading,
    setSelectedSubjects,
    setSelectedCourses,
    setSelectedSections,
    setSelectedClasses,
    setSelectedStudents,
    setDueDate,
    setPriority,
    setInstructions,
    toggleSelection,
    selectAll,
    clearAll,
    toggleClassStudents,
    isClassFullySelected,
    reset,
  };
}

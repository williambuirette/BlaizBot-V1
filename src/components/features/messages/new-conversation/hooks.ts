// Hooks pour NewConversationDialog

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { ClassOption, StudentOption, CourseOption } from './types';

export function useClasses(open: boolean) {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchClasses = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/teacher/classes');
          if (!res.ok) throw new Error(`Erreur ${res.status}`);
          const data = await res.json();
          setClasses(data.classes || []);
        } catch (error) {
          console.error('Erreur fetchClasses:', error);
          toast.error('Erreur lors du chargement des classes');
        } finally {
          setLoading(false);
        }
      };
      setTimeout(fetchClasses, 100);
    }
  }, [open]);

  return { classes, loading };
}

export function useStudents(classId: string) {
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classId) {
      const fetchStudents = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/teacher/classes/${classId}/students`);
          if (!res.ok) throw new Error('Erreur chargement élèves');
          const data = await res.json();
          setStudents(data.students || []);
        } catch (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors du chargement des élèves');
        } finally {
          setLoading(false);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [classId]);

  return { students, loading };
}

export function useCourses(open: boolean) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchCourses = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/teacher/courses');
          if (!res.ok) throw new Error('Erreur chargement cours');
          const data = await res.json();
          setCourses(data.courses || []);
        } catch (error) {
          console.error('Erreur:', error);
        } finally {
          setLoading(false);
        }
      };
      setTimeout(fetchCourses, 100);
    }
  }, [open]);

  return { courses, loading };
}

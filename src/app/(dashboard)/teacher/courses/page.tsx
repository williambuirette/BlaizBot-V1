'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { CoursesTable, CourseData } from '@/components/features/teacher/CoursesTable';
import { CourseFormModal } from '@/components/features/teacher/CourseFormModal';

interface Subject {
  id: string;
  name: string;
}

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Erreur fetch courses:', error);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Erreur fetch subjects:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchSubjects()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCourses, fetchSubjects]);

  const handleEdit = (course: CourseData) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Supprimer ce cours ?')) return;

    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleSubmit = async (data: { title: string; description: string; subjectId: string }) => {
    const isEdit = !!editingCourse;
    const url = isEdit ? `/api/teacher/courses/${editingCourse.id}` : '/api/teacher/courses';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Erreur API');
    }

    // Recharger les cours
    await fetchCourses();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes Cours</h1>
          <p className="text-muted-foreground">
            Gérez et créez vos contenus pédagogiques.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau cours
          </Link>
        </Button>
      </div>

      <CoursesTable
        courses={courses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CourseFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        course={editingCourse}
        subjects={subjects}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

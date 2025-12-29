'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { CourseForm } from '@/components/features/teacher/CourseForm';
import { CourseFormInitialData, UploadedFile } from '@/hooks/teacher/useCourseForm';
import { Loader2 } from 'lucide-react';

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  subjectId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: number | null;
  objectives: string[];
  tags: string[];
  isDraft: boolean;
  files: { id: string; filename: string; url: string; fileType: string }[];
}

interface CourseEditClientProps {
  courseId: string;
}

export function CourseEditClient({ courseId }: CourseEditClientProps) {
  const [initialData, setInitialData] = useState<CourseFormInitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setNotFoundState(true);
          return;
        }
        throw new Error('Erreur fetch');
      }
      const data = await res.json();
      const course: CourseData = data.course;

      const files: UploadedFile[] = course.files.map((f) => ({
        id: f.id,
        filename: f.filename,
        url: f.url,
        size: 0,
        type: f.fileType,
      }));

      setInitialData({
        id: course.id,
        title: course.title,
        description: course.description || '',
        subjectId: course.subjectId,
        content: course.content || '',
        difficulty: course.difficulty,
        duration: course.duration?.toString() || '',
        objectives: course.objectives.join('\n'),
        tags: course.tags.join(', '),
        isDraft: course.isDraft,
        files,
      });
    } catch (error) {
      console.error('Erreur fetch course:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  if (notFoundState) {
    notFound();
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center text-muted-foreground">Erreur lors du chargement</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <CourseForm initialData={initialData} />
    </div>
  );
}

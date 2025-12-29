'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Types
export interface Subject {
  id: string;
  name: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface CourseFormData {
  title: string;
  description: string;
  subjectId: string;
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: string;
  objectives: string;
  tags: string;
  isDraft: boolean;
}

export interface CourseFormInitialData extends Partial<CourseFormData> {
  id?: string;
  files?: UploadedFile[];
}

interface UseCourseFormOptions {
  initialData?: CourseFormInitialData;
  onSuccess?: () => void;
}

export function useCourseForm(options: UseCourseFormOptions = {}) {
  const { initialData, onSuccess } = options;
  const router = useRouter();
  const isEditMode = !!initialData?.id;

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>(
    initialData?.difficulty || 'MEDIUM'
  );
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [objectives, setObjectives] = useState(initialData?.objectives || '');
  const [tags, setTags] = useState(initialData?.tags || '');
  const [files, setFiles] = useState<UploadedFile[]>(initialData?.files || []);

  // AI generation
  const [aiInstructions, setAiInstructions] = useState('');
  const [generating, setGenerating] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/teacher/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Erreur fetch subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setSubjectId(initialData.subjectId || '');
      setContent(initialData.content || '');
      setDifficulty(initialData.difficulty || 'MEDIUM');
      setDuration(initialData.duration || '');
      setObjectives(initialData.objectives || '');
      setTags(initialData.tags || '');
      setFiles(initialData.files || []);
    }
  }, [initialData]);

  // Save course (create or update)
  const handleSave = async (isDraft: boolean) => {
    if (!title.trim() || !subjectId) {
      alert('Le titre et la matière sont requis');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        subjectId,
        content,
        difficulty,
        duration: duration ? parseInt(duration) : null,
        objectives: objectives.split('\n').filter(Boolean),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        isDraft,
        // Inclure l'ID pour les fichiers existants (permet de les conserver)
        files: files.map((f) => ({ id: f.id, filename: f.filename, url: f.url })),
      };

      const url = isEditMode
        ? `/api/teacher/courses/${initialData?.id}`
        : '/api/teacher/courses';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess?.();
        router.push('/teacher/courses');
      } else {
        const error = await res.json();
        alert(error.error || `Erreur lors de ${isEditMode ? 'la modification' : 'la création'}`);
      }
    } catch (error) {
      console.error('Erreur save cours:', error);
      alert(`Erreur lors de ${isEditMode ? 'la modification' : 'la création'}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete course (edit mode only)
  const handleDelete = async () => {
    if (!isEditMode || !initialData?.id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/teacher/courses/${initialData.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/teacher/courses');
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression cours:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  // Generate with AI
  const handleGenerateWithAI = async () => {
    if (!title.trim()) {
      alert("Veuillez d'abord renseigner un titre pour le cours");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          objectives: objectives.split('\n').filter(Boolean),
          difficulty,
          instructions: aiInstructions.trim(),
          files: files.map((f) => ({ filename: f.filename, url: f.url, type: f.type })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur génération IA:', error);
      alert('Erreur lors de la génération du cours');
    } finally {
      setGenerating(false);
    }
  };

  // Handle files change
  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
  };

  // Get subject name by ID
  const getSubjectName = (id: string) => {
    return subjects.find((s) => s.id === id)?.name;
  };

  return {
    // Mode
    isEditMode,
    
    // Subjects
    subjects,
    loadingSubjects,
    
    // Form fields
    title,
    setTitle,
    description,
    setDescription,
    subjectId,
    setSubjectId,
    content,
    setContent,
    difficulty,
    setDifficulty,
    duration,
    setDuration,
    objectives,
    setObjectives,
    tags,
    setTags,
    files,
    handleFilesChange,
    
    // AI
    aiInstructions,
    setAiInstructions,
    generating,
    handleGenerateWithAI,
    
    // Actions
    saving,
    deleting,
    handleSave,
    handleDelete,
    
    // Helpers
    getSubjectName,
  };
}

// src/components/features/courses/assign-dialog/useAssignDialogState.ts
// Hook pour gérer l'état du formulaire d'assignation
// NOTE: This hook uses setState inside useEffect for legitimate async fetch patterns
/* eslint-disable react-hooks/set-state-in-effect */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  ContentType,
  TargetType,
  Chapter,
  ClassData,
  StudentData,
  StudentSelection,
  AssignDialogState,
  AssignDialogActions,
} from './types';

export function useAssignDialogState(
  open: boolean,
  courseId: string,
  onSuccess: () => void,
  onOpenChange: (open: boolean) => void
): AssignDialogState & AssignDialogActions {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: What to assign
  const [contentType, setContentType] = useState<ContentType>('course');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Step 2: Who to assign to
  const [targetType, setTargetType] = useState<TargetType>('CLASS');
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({});
  const [selectedStudents, setSelectedStudents] = useState<StudentSelection[]>([]);
  const [teamName, setTeamName] = useState('');

  // Step 3: Details
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Reset on close
  const reset = useCallback(() => {
    setStep(1);
    setContentType('course');
    setSelectedChapterId('');
    setSelectedSectionId('');
    setTargetType('CLASS');
    setSelectedClassIds([]);
    setSelectedClassId('');
    setSelectedTeamId('');
    setSelectedStudentId('');
    setSelectedStudents([]);
    setTeamName('');
    setTitle('');
    setInstructions('');
    setDueDate('');
  }, []);

  // Note: Le reset est exposé et doit être appelé par le parent via onOpenChange
  // Cela évite les cascading renders avec setState dans useEffect

  // Fetch chapters
  useEffect(() => {
    if (open) {
      fetch(`/api/teacher/courses/${courseId}/chapters`)
        .then((res) => res.json())
        .then(setChapters)
        .catch(console.error);
    }
  }, [open, courseId]);

  // Fetch classes when on step 2
  useEffect(() => {
    if (open && step === 2 && classes.length === 0) {
      setLoading(true);
      fetch('/api/teacher/classes')
        .then((res) => res.json())
        .then((data) => setClasses(data.classes || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, step, classes.length]);

  // Fetch students when class selected
  useEffect(() => {
    if (targetType === 'TEAM' && selectedClassIds.length > 0) {
      selectedClassIds.forEach(async (classId) => {
        const cls = classes.find((c) => c.id === classId);
        if (cls?.students) return;

        setLoadingStudents((prev) => ({ ...prev, [classId]: true }));
        try {
          const res = await fetch(`/api/teacher/classes/${classId}/students`);
          const data = await res.json();
          const students = Array.isArray(data) ? data : data.students || [];
          setClasses((prev) =>
            prev.map((c) => (c.id === classId ? { ...c, students } : c))
          );
        } catch (error) {
          console.error(error);
        }
        setLoadingStudents((prev) => ({ ...prev, [classId]: false }));
      });
    }

    if (targetType === 'STUDENT' && selectedClassId) {
      const cls = classes.find((c) => c.id === selectedClassId);
      if (cls?.students) return;

      setLoading(true);
      fetch(`/api/teacher/classes/${selectedClassId}/students`)
        .then((res) => res.json())
        .then((data) => {
          const students = Array.isArray(data) ? data : data.students || [];
          setClasses((prev) =>
            prev.map((c) => (c.id === selectedClassId ? { ...c, students } : c))
          );
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedClassIds, selectedClassId, targetType, classes]);

  // Auto-generate title
  useEffect(() => {
    if (step === 3 && !title) {
      let autoTitle = '';
      if (contentType === 'course') {
        autoTitle = 'Assignation du cours';
      } else if (contentType === 'chapter') {
        const chapter = chapters.find((c) => c.id === selectedChapterId);
        autoTitle = chapter ? `Chapitre : ${chapter.title}` : 'Assignation chapitre';
      } else if (contentType === 'section') {
        const chapter = chapters.find((c) => c.id === selectedChapterId);
        const section = chapter?.sections.find((s) => s.id === selectedSectionId);
        autoTitle = section ? `Section : ${section.title}` : 'Assignation section';
      }
      setTitle(autoTitle);
    }
  }, [step, contentType, selectedChapterId, selectedSectionId, chapters, title]);

  // Toggle student selection
  const toggleStudentSelection = useCallback(
    (student: StudentData) => {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      if (!selectedClass) return;

      setSelectedStudents((prev) => {
        const exists = prev.find((s) => s.id === student.id);
        if (exists) {
          return prev.filter((s) => s.id !== student.id);
        }
        return [
          ...prev,
          { ...student, classId: selectedClassId, className: selectedClass.name },
        ];
      });
    },
    [classes, selectedClassId]
  );

  const removeStudent = useCallback((studentId: string) => {
    setSelectedStudents((prev) => prev.filter((s) => s.id !== studentId));
  }, []);

  const toggleAllStudents = useCallback(
    (classId: string) => {
      const cls = classes.find((c) => c.id === classId);
      if (!cls?.students) return;

      const allSelected = cls.students.every((s) =>
        selectedStudents.some((sel) => sel.id === s.id)
      );

      if (allSelected) {
        setSelectedStudents((prev) => prev.filter((s) => s.classId !== classId));
      } else {
        const newStudents = cls.students
          .filter((s) => !selectedStudents.some((sel) => sel.id === s.id))
          .map((s) => ({ ...s, classId, className: cls.name }));
        setSelectedStudents((prev) => [...prev, ...newStudents]);
      }
    },
    [classes, selectedStudents]
  );

  // Validation
  const canProceedStep1 = useCallback(() => {
    if (contentType === 'course') return true;
    if (contentType === 'chapter') return !!selectedChapterId;
    if (contentType === 'section') return !!selectedChapterId && !!selectedSectionId;
    return false;
  }, [contentType, selectedChapterId, selectedSectionId]);

  const canProceedStep2 = useCallback(() => {
    if (targetType === 'CLASS') return selectedClassIds.length >= 1;
    if (targetType === 'TEAM') return selectedStudents.length >= 1;
    if (targetType === 'STUDENT') return !!selectedClassId && !!selectedStudentId;
    return false;
  }, [targetType, selectedClassIds, selectedStudents, selectedClassId, selectedStudentId]);

  const canProceedStep3 = useCallback(() => {
    return !!title.trim();
  }, [title]);

  // Submit
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        instructions: instructions.trim() || undefined,
        dueDate: dueDate || undefined,
        targetType,
      };

      if (contentType === 'course') {
        body.courseId = courseId;
      } else if (contentType === 'chapter') {
        body.chapterId = selectedChapterId;
      } else {
        body.sectionId = selectedSectionId;
      }

      if (targetType === 'CLASS') {
        body.classIds = selectedClassIds;
      } else if (targetType === 'TEAM') {
        body.studentIds = selectedStudents.map((s) => s.id);
      } else {
        body.studentId = selectedStudentId;
      }

      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erreur création assignation:', error);
    }
    setSubmitting(false);
  }, [
    title, instructions, dueDate, targetType, contentType, courseId,
    selectedChapterId, selectedSectionId, selectedClassIds, selectedStudents,
    selectedStudentId, onSuccess, onOpenChange
  ]);

  return {
    // State
    step, loading, submitting,
    contentType, chapters, selectedChapterId, selectedSectionId,
    targetType, classes, selectedClassIds, selectedClassId,
    selectedTeamId, selectedStudentId, loadingStudents, selectedStudents, teamName,
    title, instructions, dueDate,
    // Actions
    setStep, setContentType, setSelectedChapterId, setSelectedSectionId,
    setTargetType, setSelectedClassIds, setSelectedClassId, setSelectedStudentId,
    setSelectedStudents, setTitle, setInstructions, setDueDate,
    toggleStudentSelection, removeStudent, toggleAllStudents,
    canProceedStep1, canProceedStep2, canProceedStep3, handleSubmit, reset,
  };
}

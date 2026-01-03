// src/components/features/assignments/useAssignmentSubmit.ts
// Hook pour la soumission des assignations (création et mise à jour)

import { useToast } from '@/hooks/use-toast';
import type { AssignmentWithDetails } from '@/app/(dashboard)/teacher/assignments/page';

interface SubmitParams {
  editingAssignment: AssignmentWithDetails | null | undefined;
  selectedCourses: string[];
  selectedSections: string[];
  selectedStudents: string[];
  selectedClasses: string[];
  courses: Array<{ id: string; title: string }>;
  sections: Array<{ id: string; title: string; courseId: string }>;
  students: Array<{ id: string; classId: string | null }>;
  dueDate?: Date;
  dueTime?: string;
  priority: string;
  instructions: string;
  onSuccess: () => void;
}

export function useAssignmentSubmit() {
  const { toast } = useToast();

  const buildFinalDueDate = (dueDate?: Date, dueTime?: string): Date | undefined => {
    if (!dueDate) return undefined;
    
    const finalDueDate = new Date(dueDate);
    
    if (dueTime) {
      const timeParts = dueTime.split(':').map(Number);
      const hours = timeParts[0] ?? 23;
      const minutes = timeParts[1] ?? 59;
      finalDueDate.setHours(hours, minutes, 0, 0);
    } else {
      finalDueDate.setHours(23, 59, 0, 0);
    }
    
    return finalDueDate;
  };

  const handleUpdate = async (
    editingAssignment: AssignmentWithDetails,
    params: Pick<SubmitParams, 'dueDate' | 'dueTime' | 'priority' | 'instructions' | 'onSuccess'>
  ): Promise<boolean> => {
    const finalDueDate = buildFinalDueDate(params.dueDate, params.dueTime);
    
    const response = await fetch(`/api/teacher/assignments/${editingAssignment.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editingAssignment.title,
        instructions: params.instructions,
        dueDate: finalDueDate?.toISOString(),
        priority: params.priority,
      }),
    });

    if (response.ok) {
      toast({
        title: 'Assignation modifiée',
        description: 'Les modifications ont été enregistrées',
      });
      params.onSuccess();
      return true;
    } else {
      const json = await response.json();
      throw new Error(json.error || 'Erreur mise à jour');
    }
  };

  const buildAssignments = (params: Omit<SubmitParams, 'editingAssignment' | 'onSuccess'>) => {
    const assignments: Array<{
      courseId: string;
      sectionId: string | null;
      studentId: string;
      classId: string | null;
      targetType: string;
      title: string;
      instructions: string;
      dueDate: string | undefined;
      priority: string;
    }> = [];
    
    const finalDueDate = buildFinalDueDate(params.dueDate, params.dueTime);

    // Fallback: création au niveau cours si pas de sections
    if (params.selectedSections.length === 0 && params.selectedCourses.length > 0) {
      for (const courseId of params.selectedCourses) {
        const course = params.courses.find(c => c.id === courseId);
        for (const studentId of params.selectedStudents) {
          const student = params.students.find(s => s.id === studentId);
          const classId = student?.classId || params.selectedClasses[0] || null;
          
          assignments.push({
            courseId,
            sectionId: null,
            studentId,
            classId,
            targetType: 'STUDENT',
            title: course?.title || 'Assignation',
            instructions: params.instructions,
            dueDate: finalDueDate?.toISOString(),
            priority: params.priority,
          });
        }
      }
    } else {
      // Mode normal avec sections
      for (const sectionId of params.selectedSections) {
        const section = params.sections.find(s => s.id === sectionId);
        if (!section) continue;
        
        const course = params.courses.find(c => c.id === section.courseId);
        
        for (const studentId of params.selectedStudents) {
          const student = params.students.find(s => s.id === studentId);
          const classId = student?.classId || params.selectedClasses[0] || null;
          
          assignments.push({
            courseId: section.courseId,
            sectionId,
            studentId,
            classId,
            targetType: 'STUDENT',
            title: `${course?.title || 'Cours'} - ${section.title}`,
            instructions: params.instructions,
            dueDate: finalDueDate?.toISOString(),
            priority: params.priority,
          });
        }
      }
    }
    
    return assignments;
  };

  const handleCreate = async (params: Omit<SubmitParams, 'editingAssignment'>): Promise<boolean> => {
    const assignments = buildAssignments(params);
    
    if (assignments.length === 0) {
      toast({
        title: 'Aucune assignation',
        description: 'Aucune assignation valide à créer. Vérifiez les sections et étudiants sélectionnés.',
        variant: 'destructive',
      });
      return false;
    }

    const response = await fetch('/api/teacher/assignments/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments }),
    });

    const json = await response.json();

    if (json.success) {
      toast({
        title: 'Assignations créées',
        description: `${assignments.length} assignation(s) créée(s) avec succès`,
      });
      params.onSuccess();
      return true;
    } else {
      throw new Error(json.error || 'Erreur création');
    }
  };

  const submit = async (params: SubmitParams): Promise<boolean> => {
    try {
      if (params.editingAssignment) {
        return await handleUpdate(params.editingAssignment, params);
      } else {
        return await handleCreate(params);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la création',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { submit };
}

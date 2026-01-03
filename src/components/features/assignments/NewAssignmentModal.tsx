'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

import { useAssignmentForm } from './useAssignmentForm';
import { useAssignmentSubmit } from './useAssignmentSubmit';
import { StepProgressBar, STEPS } from './StepProgressBar';
import {
  StepSubjects,
  StepCourses,
  StepSections,
  StepClasses,
  StepStudents,
  StepDeadline,
  StepValidation,
} from './steps';
import type { AssignmentWithDetails } from '@/app/(dashboard)/teacher/assignments/page';

interface NewAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingAssignment?: AssignmentWithDetails | null;
}

export function NewAssignmentModal({ open, onOpenChange, onSuccess, editingAssignment }: NewAssignmentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingAssignment;

  const form = useAssignmentForm(open);
  const { submit } = useAssignmentSubmit();

  // Pré-remplir en mode édition
  useEffect(() => {
    if (editingAssignment && open) {
      if (editingAssignment.Course) {
        form.setSelectedCourses([editingAssignment.Course.id]);
      }
      if (editingAssignment.Section) {
        form.setSelectedSections([editingAssignment.Section.id]);
      }
      if (editingAssignment.Class) {
        form.setSelectedClasses([editingAssignment.Class.id]);
      }
      if (editingAssignment.User_CourseAssignment_studentIdToUser) {
        form.setSelectedStudents([editingAssignment.User_CourseAssignment_studentIdToUser.id]);
      }
      if (editingAssignment.dueDate) {
        form.setDueDate(new Date(editingAssignment.dueDate));
      }
      form.setPriority(editingAssignment.priority);
      form.setInstructions(editingAssignment.instructions || '');
      setCurrentStep(6);
    }
  }, [editingAssignment, open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
    }
  }, [open]);

  // Validation par étape
  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return form.selectedCourses.length > 0 || isEditing;
      case 3: return form.selectedSections.length > 0 || isEditing;
      case 4: return form.selectedClasses.length > 0 || isEditing;
      case 5: return form.selectedStudents.length > 0 || isEditing;
      case 6: return form.dueDate !== undefined;
      default: return true;
    }
  };

  // Submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submit({
        editingAssignment,
        selectedCourses: form.selectedCourses,
        selectedSections: form.selectedSections,
        selectedStudents: form.selectedStudents,
        selectedClasses: form.selectedClasses,
        courses: form.courses,
        sections: form.sections,
        students: form.students,
        dueDate: form.dueDate,
        dueTime: form.dueTime,
        priority: form.priority,
        instructions: form.instructions,
        onSuccess,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepSubjects
            subjects={form.subjects}
            selectedSubjects={form.selectedSubjects}
            onToggle={(id) => form.toggleSelection(id, form.selectedSubjects, form.setSelectedSubjects)}
            onSelectAll={() => form.selectAll(form.subjects, form.setSelectedSubjects)}
            onClearAll={() => form.clearAll(form.setSelectedSubjects)}
          />
        );
      case 2:
        return (
          <StepCourses
            courses={form.filteredCourses}
            selectedCourses={form.selectedCourses}
            onToggle={(id) => form.toggleSelection(id, form.selectedCourses, form.setSelectedCourses)}
            onSelectAll={() => form.selectAll(form.filteredCourses, form.setSelectedCourses)}
            onClearAll={() => form.clearAll(form.setSelectedCourses)}
            hasSubjectFilter={form.selectedSubjects.length > 0}
          />
        );
      case 3:
        return (
          <StepSections
            chapters={form.chapters}
            sections={form.sections}
            sectionsByChapter={form.sectionsByChapter}
            selectedSections={form.selectedSections}
            onToggleSection={(id) => form.toggleSelection(id, form.selectedSections, form.setSelectedSections)}
          />
        );
      case 4:
        return (
          <StepClasses
            classes={form.classes}
            selectedClasses={form.selectedClasses}
            onToggle={(id) => form.toggleSelection(id, form.selectedClasses, form.setSelectedClasses)}
            onSelectAll={() => form.selectAll(form.classes, form.setSelectedClasses)}
            onClearAll={() => form.clearAll(form.setSelectedClasses)}
          />
        );
      case 5:
        return (
          <StepStudents
            studentsByClass={form.studentsByClass}
            selectedStudents={form.selectedStudents}
            onToggleStudent={(id) => form.toggleSelection(id, form.selectedStudents, form.setSelectedStudents)}
            onToggleClass={form.toggleClassStudents}
            isClassFullySelected={form.isClassFullySelected}
            totalStudents={form.filteredStudents.length}
          />
        );
      case 6:
        return (
          <StepDeadline
            dueDate={form.dueDate}
            onDateChange={form.setDueDate}
            dueTime={form.dueTime}
            onTimeChange={form.setDueTime}
            priority={form.priority}
            onPriorityChange={form.setPriority}
            instructions={form.instructions}
            onInstructionsChange={form.setInstructions}
          />
        );
      case 7:
        return (
          <StepValidation
            subjects={form.subjects}
            courses={form.courses}
            sections={form.sections}
            classes={form.classes}
            students={form.students}
            selectedSubjects={form.selectedSubjects}
            selectedCourses={form.selectedCourses}
            selectedSections={form.selectedSections}
            selectedClasses={form.selectedClasses}
            selectedStudents={form.selectedStudents}
            dueDate={form.dueDate}
            priority={form.priority}
            instructions={form.instructions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier l\'assignation' : 'Nouvelle Assignation'}</DialogTitle>
          {!isEditing && <StepProgressBar currentStep={currentStep} />}
          {isEditing && editingAssignment && (
            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{editingAssignment.title}</p>
              <p className="text-sm text-muted-foreground">
                {editingAssignment.Course?.title}
                {editingAssignment.Class && ` • ${editingAssignment.Class.name}`}
                {editingAssignment.User_CourseAssignment_studentIdToUser && 
                  ` • ${editingAssignment.User_CourseAssignment_studentIdToUser.firstName} ${editingAssignment.User_CourseAssignment_studentIdToUser.lastName}`
                }
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          {form.isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">{renderStep()}</ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          {currentStep > 1 && !isEditing && (
            <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)} disabled={isSubmitting}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
          )}
          {currentStep < STEPS.length && !isEditing ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? 'Enregistrer' : 'Créer les assignations'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronRight, ChevronLeft, Check, BookOpen, FileText, HelpCircle, GraduationCap, Users, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useAssignmentForm } from './useAssignmentForm';
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

const STEPS = [
  { id: 1, title: 'Matières', icon: BookOpen },
  { id: 2, title: 'Cours', icon: FileText },
  { id: 3, title: 'Contenus', icon: HelpCircle },
  { id: 4, title: 'Classes', icon: Users },
  { id: 5, title: 'Élèves', icon: GraduationCap },
  { id: 6, title: 'Deadline', icon: CalendarIcon },
  { id: 7, title: 'Validation', icon: Check },
];

export function NewAssignmentModal({ open, onOpenChange, onSuccess, editingAssignment }: NewAssignmentModalProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingAssignment;

  const form = useAssignmentForm(open);

  // Pré-remplir en mode édition
  useEffect(() => {
    if (editingAssignment && open) {
      // Pré-sélectionner le cours
      if (editingAssignment.Course) {
        form.setSelectedCourses([editingAssignment.Course.id]);
      }
      // Pré-sélectionner la section si disponible
      if (editingAssignment.Section) {
        form.setSelectedSections([editingAssignment.Section.id]);
      }
      // Pré-sélectionner la classe
      if (editingAssignment.Class) {
        form.setSelectedClasses([editingAssignment.Class.id]);
      }
      // Pré-sélectionner l'élève
      if (editingAssignment.User_CourseAssignment_studentIdToUser) {
        form.setSelectedStudents([editingAssignment.User_CourseAssignment_studentIdToUser.id]);
      }
      // Pré-remplir deadline et priorité
      if (editingAssignment.dueDate) {
        form.setDueDate(new Date(editingAssignment.dueDate));
      }
      form.setPriority(editingAssignment.priority);
      form.setInstructions(editingAssignment.instructions || '');
      // Aller directement à l'étape deadline en mode édition
      setCurrentStep(6);
    }
  }, [editingAssignment, open]);

  // Reset on close - use form.reset directly without form in deps
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
    }
  }, [open]);

  // Validation
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

  // Submit (création ou mise à jour)
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Mode édition : mise à jour de l'assignation existante
      if (isEditing && editingAssignment) {
        const response = await fetch(`/api/teacher/assignments/${editingAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editingAssignment.title, // Garder le titre original
            instructions: form.instructions,
            dueDate: form.dueDate?.toISOString(),
            priority: form.priority,
          }),
        });

        if (response.ok) {
          toast({
            title: 'Assignation modifiée',
            description: 'Les modifications ont été enregistrées',
          });
          onSuccess();
        } else {
          const json = await response.json();
          throw new Error(json.error || 'Erreur mise à jour');
        }
        return;
      }

      // Mode création : logique existante
      console.log('=== SUBMIT DEBUG ===');
      console.log('selectedSections:', form.selectedSections);
      console.log('selectedStudents:', form.selectedStudents);
      
      const assignments = [];
      
      // Si aucune section sélectionnée mais des cours sont sélectionnés, créer des assignations au niveau cours
      if (form.selectedSections.length === 0 && form.selectedCourses.length > 0) {
        console.log('Fallback: Création au niveau cours (pas de sections)');
        for (const courseId of form.selectedCourses) {
          const course = form.courses.find(c => c.id === courseId);
          for (const studentId of form.selectedStudents) {
            // Trouver la classe de l'étudiant
            const student = form.students.find(s => s.id === studentId);
            const classId = student?.classId || form.selectedClasses[0] || null;
            
            assignments.push({
              courseId,
              sectionId: null,
              studentId,
              classId,
              targetType: 'STUDENT',
              title: course?.title || 'Assignation',
              instructions: form.instructions,
              dueDate: form.dueDate?.toISOString(),
              priority: form.priority,
            });
          }
        }
      } else {
        // Mode normal avec sections
        for (const sectionId of form.selectedSections) {
          const section = form.sections.find(s => s.id === sectionId);
          console.log(`Looking for section ${sectionId}:`, section);
          if (!section) {
            console.warn(`Section ${sectionId} non trouvée dans form.sections`);
            continue;
          }
          const course = form.courses.find(c => c.id === section.courseId);
          
          for (const studentId of form.selectedStudents) {
            // Trouver la classe de l'étudiant
            const student = form.students.find(s => s.id === studentId);
            const classId = student?.classId || form.selectedClasses[0] || null;
            
            assignments.push({
              courseId: section.courseId,
              sectionId,
              studentId,
              classId, // Ajout du classId pour les filtres
              targetType: 'STUDENT',
              title: `${course?.title || 'Cours'} - ${section.title}`,
              instructions: form.instructions,
              dueDate: form.dueDate?.toISOString(),
              priority: form.priority,
            });
          }
        }
      }

      console.log('Assignments to create:', assignments);
      
      if (assignments.length === 0) {
        toast({
          title: 'Aucune assignation',
          description: 'Aucune assignation valide à créer. Vérifiez les sections et étudiants sélectionnés.',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Sending POST to /api/teacher/assignments/bulk...');
      const response = await fetch('/api/teacher/assignments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments }),
      });
      console.log('Response status:', response.status);

      const json = await response.json();
      console.log('Response JSON:', json);

      if (json.success) {
        toast({
          title: 'Assignations créées',
          description: `${assignments.length} assignation(s) créée(s) avec succès`,
        });
        onSuccess();
      } else {
        throw new Error(json.error || 'Erreur création');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur lors de la création',
        variant: 'destructive',
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
          {/* Progress steps - masquer en mode édition */}
          {!isEditing && (
            <>
              <div className="flex items-center justify-between mt-4 px-2">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors',
                        currentStep === step.id
                          ? 'bg-primary text-primary-foreground'
                          : currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div className={cn('w-8 h-0.5 mx-1', currentStep > step.id ? 'bg-green-500' : 'bg-muted')} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Étape {currentStep} : {STEPS[currentStep - 1]?.title}
              </p>
            </>
          )}
          {/* Info assignation en mode édition */}
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
          {currentStep < 7 && !isEditing ? (
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

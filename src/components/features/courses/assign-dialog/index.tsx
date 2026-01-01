// src/components/features/courses/assign-dialog/index.tsx
// Composant principal AssignDialog (orchestrateur)

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';

import { useAssignDialogState } from './useAssignDialogState';
import { AssignDialogStep1 } from './AssignDialogStep1';
import { AssignDialogStep2 } from './AssignDialogStep2';
import { AssignDialogStep3 } from './AssignDialogStep3';
import { AssignDialogStep4 } from './AssignDialogStep4';
import type { AssignDialogProps } from './types';

export function AssignDialog({
  open,
  onOpenChange,
  courseId,
  onSuccess,
}: AssignDialogProps) {
  const state = useAssignDialogState(open, courseId, onSuccess, onOpenChange);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nouvelle assignation</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s === state.step
                    ? 'bg-primary text-primary-foreground'
                    : s < state.step
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s < state.step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 mx-1 ${
                    s < state.step ? 'bg-green-600' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[350px] flex-1 overflow-auto">
          {state.step === 1 && (
            <AssignDialogStep1
              contentType={state.contentType}
              setContentType={state.setContentType}
              chapters={state.chapters}
              selectedChapterId={state.selectedChapterId}
              setSelectedChapterId={state.setSelectedChapterId}
              selectedSectionId={state.selectedSectionId}
              setSelectedSectionId={state.setSelectedSectionId}
            />
          )}

          {state.step === 2 && (
            <AssignDialogStep2
              targetType={state.targetType}
              setTargetType={state.setTargetType}
              classes={state.classes}
              selectedClassIds={state.selectedClassIds}
              setSelectedClassIds={state.setSelectedClassIds}
              selectedClassId={state.selectedClassId}
              setSelectedClassId={state.setSelectedClassId}
              selectedStudentId={state.selectedStudentId}
              setSelectedStudentId={state.setSelectedStudentId}
              selectedStudents={state.selectedStudents}
              setSelectedStudents={state.setSelectedStudents}
              loadingStudents={state.loadingStudents}
              loading={state.loading}
              removeStudent={state.removeStudent}
              toggleAllStudents={state.toggleAllStudents}
            />
          )}

          {state.step === 3 && (
            <AssignDialogStep3
              title={state.title}
              setTitle={state.setTitle}
              instructions={state.instructions}
              setInstructions={state.setInstructions}
              dueDate={state.dueDate}
              setDueDate={state.setDueDate}
            />
          )}

          {state.step === 4 && (
            <AssignDialogStep4
              contentType={state.contentType}
              chapters={state.chapters}
              selectedChapterId={state.selectedChapterId}
              selectedSectionId={state.selectedSectionId}
              targetType={state.targetType}
              selectedClassIds={state.selectedClassIds}
              selectedStudents={state.selectedStudents}
              selectedStudentId={state.selectedStudentId}
              classes={state.classes}
              title={state.title}
              dueDate={state.dueDate}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => state.setStep(state.step - 1)}
            disabled={state.step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          {state.step < 4 ? (
            <Button
              onClick={() => state.setStep(state.step + 1)}
              disabled={
                (state.step === 1 && !state.canProceedStep1()) ||
                (state.step === 2 && !state.canProceedStep2()) ||
                (state.step === 3 && !state.canProceedStep3())
              }
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={state.handleSubmit} disabled={state.submitting}>
              {state.submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Assigner
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-export types
export type { AssignDialogProps } from './types';

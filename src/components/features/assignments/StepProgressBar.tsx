// src/components/features/assignments/StepProgressBar.tsx
// Barre de progression des étapes pour le wizard d'assignation

'use client';

import { cn } from '@/lib/utils';
import { Check, BookOpen, FileText, HelpCircle, GraduationCap, Users, CalendarIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
}

export const STEPS: readonly Step[] = [
  { id: 1, title: 'Matières', icon: BookOpen },
  { id: 2, title: 'Cours', icon: FileText },
  { id: 3, title: 'Contenus', icon: HelpCircle },
  { id: 4, title: 'Classes', icon: Users },
  { id: 5, title: 'Élèves', icon: GraduationCap },
  { id: 6, title: 'Deadline', icon: CalendarIcon },
  { id: 7, title: 'Validation', icon: Check },
] as const;

interface StepProgressBarProps {
  currentStep: number;
}

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
  return (
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
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PRIORITY_OPTIONS } from '../types';

interface StepDeadlineProps {
  dueDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  onPriorityChange: (priority: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  instructions: string;
  onInstructionsChange: (instructions: string) => void;
}

export function StepDeadline({
  dueDate,
  onDateChange,
  priority,
  onPriorityChange,
  instructions,
  onInstructionsChange,
}: StepDeadlineProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-2">Définissez la deadline</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choisissez la date limite et la priorité de l&apos;assignation
        </p>
      </div>

      {/* Date picker */}
      <div className="space-y-2">
        <Label>Date limite *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !dueDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate
                ? format(dueDate, 'EEEE d MMMM yyyy', { locale: fr })
                : 'Sélectionner une date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={onDateChange}
              locale={fr}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        {!dueDate && (
          <p className="text-sm text-destructive">
            ⚠️ Sélectionnez une date limite pour continuer
          </p>
        )}
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label>Priorité</Label>
        <div className="flex gap-2">
          {PRIORITY_OPTIONS.map((opt) => (
            <Badge
              key={opt.value}
              variant={priority === opt.value ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer px-4 py-2',
                priority === opt.value ? '' : opt.color
              )}
              onClick={() => onPriorityChange(opt.value)}
            >
              {opt.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label>Instructions (optionnel)</Label>
        <Textarea
          placeholder="Ajoutez des instructions pour les élèves..."
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}

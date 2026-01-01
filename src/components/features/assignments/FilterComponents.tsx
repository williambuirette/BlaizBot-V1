'use client';

import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Composant section collapsible avec compteur
export function CollapsibleFilterSection({ 
  title, 
  count = 0,
  children, 
  isLoading = false,
  isOpen,
  onToggle,
}: { 
  title: string;
  count?: number;
  children: React.ReactNode;
  isLoading?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-muted/50 rounded-md px-2 -mx-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium cursor-pointer">{title}</Label>
          {count > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">{children}</div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Checkbox avec label
export function FilterCheckbox({
  id,
  label,
  checked,
  onChange,
  className,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label
        htmlFor={id}
        className={cn('text-sm font-normal cursor-pointer', className)}
      >
        {label}
      </Label>
    </div>
  );
}

// Date picker compact
export function FilterDatePicker({
  label,
  date,
  onSelect,
}: {
  label: string;
  date?: Date;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground w-6">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'dd MMM yyyy', { locale: fr }) : 'Sélectionner'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            locale={fr}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

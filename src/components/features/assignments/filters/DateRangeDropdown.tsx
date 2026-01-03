// Dropdown pour la période (date range)

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateRangeDropdownProps {
  dateRange: { start: Date; end: Date } | null;
  onChange: (range: { start: Date; end: Date } | null) => void;
}

export function DateRangeDropdown({ dateRange, onChange }: DateRangeDropdownProps) {
  const hasRange = dateRange !== null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1">
          <CalendarIcon className="h-3 w-3" />
          Période
          {hasRange && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">1</Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">Du</p>
            <Calendar
              mode="single"
              selected={dateRange?.start}
              onSelect={(date) => {
                if (date) {
                  onChange({
                    start: date,
                    end: dateRange?.end || date,
                  });
                }
              }}
              locale={fr}
              className="rounded-md border"
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Au</p>
            <Calendar
              mode="single"
              selected={dateRange?.end}
              onSelect={(date) => {
                if (date) {
                  onChange({
                    start: dateRange?.start || date,
                    end: date,
                  });
                }
              }}
              locale={fr}
              className="rounded-md border"
            />
          </div>
          {hasRange && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {format(dateRange.start, 'dd MMM yyyy', { locale: fr })} - {format(dateRange.end, 'dd MMM yyyy', { locale: fr })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => onChange(null)}
              >
                Effacer la période
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Dropdown générique pour les filtres

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterDropdownProps<T> {
  label: string;
  items: T[];
  selected: string[];
  onToggle: (id: string) => void;
  getId: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  isLoading: boolean;
  emptyMessage: string;
}

export function FilterDropdown<T>({
  label,
  items,
  selected,
  onToggle,
  getId,
  renderItem,
  isLoading,
  emptyMessage,
}: FilterDropdownProps<T>) {
  const count = selected.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1">
          {label}
          {count > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {count}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <ScrollArea className="max-h-64">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ) : items.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">
              {emptyMessage}
            </p>
          ) : (
            <div className="p-2 space-y-1">
              {items.map((item) => {
                const id = getId(item);
                const isSelected = selected.includes(id);
                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors text-sm',
                      isSelected && 'bg-muted'
                    )}
                    onClick={() => onToggle(id)}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => onToggle(id)} />
                    <span className="flex-1">{renderItem(item)}</span>
                    {isSelected && <Check className="h-3 w-3 text-primary" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

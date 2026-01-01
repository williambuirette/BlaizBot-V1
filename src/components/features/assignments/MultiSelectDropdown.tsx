'use client';

import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MultiSelectDropdownProps<T> {
  label: string;
  placeholder: string;
  items: T[];
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  renderItem: (item: T) => React.ReactNode;
  getId: (item: T) => string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function MultiSelectDropdown<T>({
  label,
  placeholder,
  items,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  renderItem,
  getId,
  emptyMessage = 'Aucun élément',
  disabled = false,
}: MultiSelectDropdownProps<T>) {
  const selectedCount = selected.length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {selectedCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedCount} sélectionné(s)
          </Badge>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedCount > 0
                ? `${selectedCount} sélectionné(s)`
                : placeholder}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          {/* Actions rapides */}
          <div className="flex items-center justify-between p-2 border-b">
            <span className="text-sm text-muted-foreground">
              {items.length} élément(s)
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                disabled={allSelected}
              >
                Tout sélectionner
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                disabled={selectedCount === 0}
              >
                Effacer
              </Button>
            </div>
          </div>

          {/* Liste des items */}
          <ScrollArea className="max-h-[300px]">
            {items.length === 0 ? (
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
                        'flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors',
                        isSelected && 'bg-muted'
                      )}
                      onClick={() => onToggle(id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggle(id)}
                      />
                      <span className="flex-1 text-sm">{renderItem(item)}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

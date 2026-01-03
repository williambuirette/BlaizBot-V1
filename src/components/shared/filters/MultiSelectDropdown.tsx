// src/components/shared/filters/MultiSelectDropdown.tsx
// Composant dropdown multi-select réutilisable

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  id: string;
  name: string;
  icon?: React.ReactNode;
}

interface MultiSelectDropdownProps {
  label?: string;
  options: MultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
  width?: string;
  className?: string;
}

export function MultiSelectDropdown({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = 'Tous',
  width = 'w-[200px]',
  className,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedCount = selectedIds.length;
  const displayText = selectedCount === 0 
    ? placeholder 
    : selectedCount === 1 
      ? options.find(o => o.id === selectedIds[0])?.name || '1 sélectionné'
      : `${selectedCount} sélectionnés`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {label} :
        </span>
      )}
      <div className="relative" ref={containerRef}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(width, "justify-between font-normal")}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown 
            className={cn(
              "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", 
              isOpen && "rotate-180"
            )} 
          />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-[250px] bg-popover border rounded-md shadow-lg z-50">
            {/* Header avec bouton tout effacer */}
            {selectedCount > 0 && (
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-xs text-muted-foreground">
                  {selectedCount} sélectionné(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleClearAll}
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer
                </Button>
              </div>
            )}
            
            {/* Liste des options */}
            <div className="max-h-[200px] overflow-y-auto p-1">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Aucune option disponible
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => handleToggle(option.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(option.id)}
                      onCheckedChange={() => handleToggle(option.id)}
                    />
                    {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                    <span className="text-sm truncate">{option.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

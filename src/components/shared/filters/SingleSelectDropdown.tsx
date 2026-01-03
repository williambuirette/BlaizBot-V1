// src/components/shared/filters/SingleSelectDropdown.tsx
// Composant dropdown single-select réutilisable

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SingleSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SingleSelectDropdownProps {
  label?: string;
  options: SingleSelectOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
  className?: string;
}

export function SingleSelectDropdown({
  label,
  options,
  selectedValue,
  onChange,
  placeholder = 'Tous',
  width = 'w-[200px]',
  className,
}: SingleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === selectedValue);

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
          <span className="truncate flex items-center gap-2">
            {selectedOption?.icon}
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown 
            className={cn(
              "ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform", 
              isOpen && "rotate-180"
            )} 
          />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] bg-popover border rounded-md shadow-lg z-50">
            <div className="p-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-sm cursor-pointer",
                    selectedValue === option.value ? "bg-accent" : "hover:bg-accent/50"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.icon}
                  {option.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { ClassFilters } from '@/types/class-filters';

interface ClassFilterBarProps {
  subjects: { id: string; name: string }[];
  levels: string[];
  filters: ClassFilters;
  onFiltersChange: (filters: ClassFilters) => void;
  resultCount: number;
  totalCount: number;
}

export function ClassFilterBar({
  subjects,
  levels,
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: ClassFilterBarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const selectedSubjects = subjects.filter(s => filters.subjectIds.includes(s.id));
  const availableSubjects = subjects.filter(s => !filters.subjectIds.includes(s.id));

  const addSubject = (subjectId: string) => {
    onFiltersChange({
      ...filters,
      subjectIds: [...filters.subjectIds, subjectId],
    });
  };

  const removeSubject = (subjectId: string) => {
    onFiltersChange({
      ...filters,
      subjectIds: filters.subjectIds.filter(id => id !== subjectId),
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">🔍 Filtres</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            📊 {resultCount} classe{resultCount > 1 ? 's' : ''} / {totalCount} total
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <>
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une classe..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Matières (multi-select avec popover) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Matières</label>
          <div className="flex flex-wrap gap-1 min-h-[40px] p-2 border rounded-md">
            {selectedSubjects.map(subject => (
              <Badge key={subject.id} variant="secondary" className="gap-1">
                {subject.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSubject(subject.id);
                  }}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {availableSubjects.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Badge variant="outline" className="cursor-pointer">
                    <Plus className="h-3 w-3 mr-1" />
                    Ajouter
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-1">
                    {availableSubjects.map(subject => (
                      <div
                        key={subject.id}
                        className="p-2 hover:bg-gray-100 rounded cursor-pointer text-sm"
                        onClick={() => addSubject(subject.id)}
                      >
                        {subject.name}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Niveau */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Niveau</label>
          <Select
            value={filters.level ?? 'all'}
            onValueChange={(value) => onFiltersChange({ ...filters, level: value === 'all' ? null : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les niveaux" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Indicateur matières actives */}
      {filters.subjectIds.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Matières: {selectedSubjects.map(s => s.name).join(', ')}
        </div>
      )}
        </>
      )}
    </div>
  );
}

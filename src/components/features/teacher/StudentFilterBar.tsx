'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import type { StudentFilters, StudentAlertLevel } from '@/types/student-filters';
import { ALERT_LEVEL_OPTIONS } from '@/types/student-filters';

interface ClassOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface StudentFilterBarProps {
  classes: ClassOption[];
  allStudents: StudentOption[];
  filters: StudentFilters;
  onFiltersChange: (filters: StudentFilters) => void;
  resultCount: number;
  totalCount: number;
}

export function StudentFilterBar({
  classes,
  allStudents,
  filters,
  onFiltersChange,
  resultCount,
  totalCount,
}: StudentFilterBarProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const updateFilter = <K extends keyof StudentFilters>(key: K, value: StudentFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = filters.selectedStudentIds.includes(studentId)
      ? filters.selectedStudentIds.filter(id => id !== studentId)
      : [...filters.selectedStudentIds, studentId];
    updateFilter('selectedStudentIds', newSelection);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      classId: null,
      alertLevel: 'all',
      selectedStudentIds: [],
      search: '',
    });
  };

  const hasActiveFilters = filters.classId || filters.alertLevel !== 'all' || 
    filters.selectedStudentIds.length > 0 || filters.search;

  // Élèves sélectionnés pour affichage chips
  const selectedStudents = allStudents.filter(s => 
    filters.selectedStudentIds.includes(s.id)
  );

  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border">
      {/* En-tête avec bouton toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">🔍 Filtres</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            📊 {resultCount} élève{resultCount > 1 ? 's' : ''} / {totalCount} total
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
          {/* Ligne de filtres */}
          <div className="flex flex-wrap items-center gap-3">
        
        {/* Filtre Classe */}
        <Select
          value={filters.classId ?? 'all'}
          onValueChange={(v) => updateFilter('classId', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre État */}
        <Select
          value={filters.alertLevel}
          onValueChange={(v) => updateFilter('alertLevel', v as StudentAlertLevel)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="État" />
          </SelectTrigger>
          <SelectContent>
            {ALERT_LEVEL_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Recherche */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un élève..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      {/* Chips élèves sélectionnés */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Sélection :</span>
          {selectedStudents.map(student => (
            <Badge key={student.id} variant="secondary" className="gap-1">
              {student.firstName} {student.lastName}
              <button
                onClick={() => toggleStudentSelection(student.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}

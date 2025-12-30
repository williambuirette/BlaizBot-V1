"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown, Filter } from "lucide-react";
import type { ScoreFilters, ScoreSort } from "@/lib/stats-service";

// ============================================
// TYPES
// ============================================

interface ScoreFilterBarProps {
  subjects: { id: string; name: string }[];
  filters: ScoreFilters;
  sort: ScoreSort;
  onFiltersChange: (filters: ScoreFilters) => void;
  onSortChange: (sort: ScoreSort) => void;
  resultCount: number;
  totalCount: number;
}

// ============================================
// COMPOSANT
// ============================================

export function ScoreFilterBar({
  subjects,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  resultCount,
  totalCount,
}: ScoreFilterBarProps) {
  const handleSubjectChange = (value: string) => {
    onFiltersChange({
      ...filters,
      subject: value === "all" ? null : value,
    });
  };

  const handleAlertChange = (value: string) => {
    onFiltersChange({
      ...filters,
      alertLevel: value as ScoreFilters["alertLevel"],
    });
  };

  const handleExamChange = (value: string) => {
    onFiltersChange({
      ...filters,
      hasExam: value as ScoreFilters["hasExam"],
    });
  };

  const handleSortFieldChange = (value: string) => {
    onSortChange({
      ...sort,
      field: value as ScoreSort["field"],
    });
  };

  const toggleSortDirection = () => {
    onSortChange({
      ...sort,
      direction: sort.direction === "asc" ? "desc" : "asc",
    });
  };

  const SortIcon = sort.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
      {/* Ligne 1 : Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filtres</span>
        </div>

        {/* Filtre Matière */}
        <Select
          value={filters.subject ?? "all"}
          onValueChange={handleSubjectChange}
        >
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Matière" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes matières</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre État */}
        <Select value={filters.alertLevel} onValueChange={handleAlertChange}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="État" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous états</SelectItem>
            <SelectItem value="success">🟢 Bon (≥4.5)</SelectItem>
            <SelectItem value="warning">🟡 À surveiller</SelectItem>
            <SelectItem value="danger">🔴 À risque (&lt;3.5)</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtre Examen */}
        <Select value={filters.hasExam} onValueChange={handleExamChange}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Examen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="with">Avec note</SelectItem>
            <SelectItem value="without">Sans note</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ligne 2 : Tri + Compteur */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Trier par</span>

          {/* Champ de tri */}
          <Select value={sort.field} onValueChange={handleSortFieldChange}>
            <SelectTrigger className="w-[150px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="finalGrade">Note finale</SelectItem>
              <SelectItem value="continuousScore">Score continu</SelectItem>
              <SelectItem value="courseName">Nom du cours</SelectItem>
              <SelectItem value="subjectName">Matière</SelectItem>
            </SelectContent>
          </Select>

          {/* Direction */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={toggleSortDirection}
            title={sort.direction === "asc" ? "Croissant" : "Décroissant"}
          >
            <SortIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Compteur */}
        <Badge variant="secondary" className="font-normal">
          {resultCount === totalCount
            ? `${totalCount} cours`
            : `${resultCount} / ${totalCount} cours`}
        </Badge>
      </div>
    </div>
  );
}

// Export du type pour réutilisation
export type { ScoreFilterBarProps };

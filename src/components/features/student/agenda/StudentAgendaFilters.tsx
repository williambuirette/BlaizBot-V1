// src/components/features/student/agenda/StudentAgendaFilters.tsx
// Barre de filtres horizontale pour l'agenda élève avec multi-select profs
// Refactorisé : utilise les composants partagés (424 → 270 lignes)

'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { X, ChevronDown, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MultiSelectDropdown } from '@/components/shared/filters';

export interface AgendaFiltersState {
  type: 'all' | 'teacher' | 'personal';
  teacherIds: string[];
  subjectIds: string[];
  courseId: string | null;
  status: 'all' | 'pending' | 'completed';
  dateRange: { start: Date; end: Date } | null;
}

interface Subject {
  id: string;
  name: string;
  teacherIds: string[];
}

interface Course {
  id: string;
  title: string;
  subjectId: string;
  teacherId: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  subjectIds: string[];
  courseIds: string[];
}

interface Props {
  filters: AgendaFiltersState;
  onFiltersChange: (filters: AgendaFiltersState) => void;
}

export function StudentAgendaFilters({ filters, onFiltersChange }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Charger les options de filtrage
  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch('/api/student/agenda/filter-options');
        const json = await res.json();
        if (json.success) {
          setTeachers(json.data.teachers);
          setSubjects(json.data.subjects);
          setCourses(json.data.courses);
        }
      } catch (error) {
        console.error('Erreur chargement filtres:', error);
      }
    }
    loadOptions();
  }, []);

  // Filtrer les matières selon les profs sélectionnés
  const filteredSubjects = filters.teacherIds.length > 0
    ? subjects.filter((s) => 
        filters.teacherIds.some((teacherId) => s.teacherIds.includes(teacherId))
      )
    : subjects;

  // Filtrer les cours selon les profs ET matières sélectionnés
  const filteredCourses = courses.filter((c) => {
    if (filters.teacherIds.length > 0 && !filters.teacherIds.includes(c.teacherId)) {
      return false;
    }
    if (filters.subjectIds.length > 0 && !filters.subjectIds.includes(c.subjectId)) {
      return false;
    }
    return true;
  });

  const hasFilters =
    filters.type !== 'all' ||
    filters.teacherIds.length > 0 ||
    filters.subjectIds.length > 0 ||
    filters.courseId ||
    filters.status !== 'all' ||
    filters.dateRange !== null;

  const resetFilters = () => {
    onFiltersChange({
      type: 'all',
      teacherIds: [],
      subjectIds: [],
      courseId: null,
      status: 'all',
      dateRange: null,
    });
  };

  return (
    <Card>
      <CardContent className="py-3 flex flex-wrap items-center gap-3">
        {/* Type */}
        <Select
          value={filters.type}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              type: v as AgendaFiltersState['type'],
              teacherIds: v === 'teacher' ? filters.teacherIds : [],
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="type-all" value="all">Tous</SelectItem>
            <SelectItem key="type-teacher" value="teacher">📘 Prof</SelectItem>
            <SelectItem key="type-personal" value="personal">🟢 Perso</SelectItem>
          </SelectContent>
        </Select>

        {/* Multi-select Profs (visible si type === 'teacher') */}
        {filters.type === 'teacher' && (
          <MultiSelectDropdown
            options={teachers.map(t => ({ 
              id: t.id, 
              name: `${t.firstName} ${t.lastName}` 
            }))}
            selectedIds={filters.teacherIds}
            onChange={(ids) => {
              onFiltersChange({ 
                ...filters, 
                teacherIds: ids, 
                subjectIds: [], 
                courseId: null 
              });
            }}
            placeholder="Filtrer par prof"
            width="w-[180px]"
          />
        )}

        {/* Multi-select Matières */}
        <MultiSelectDropdown
          options={filteredSubjects.map(s => ({ id: s.id, name: s.name }))}
          selectedIds={filters.subjectIds}
          onChange={(ids) => {
            onFiltersChange({ 
              ...filters, 
              subjectIds: ids, 
              courseId: null 
            });
          }}
          placeholder="Matières"
          width="w-[160px]"
        />

        {/* Cours (filtré par matière ET profs) */}
        <Select
          value={filters.courseId || 'all'}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, courseId: v === 'all' ? null : v })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Cours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="course-all" value="all">Tous cours</SelectItem>
            {filteredCourses.map((c) => (
              <SelectItem key={`course-${c.id}`} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Statut */}
        <Select
          value={filters.status}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, status: v as AgendaFiltersState['status'] })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="status-all" value="all">Tous statuts</SelectItem>
            <SelectItem key="status-pending" value="pending">À faire</SelectItem>
            <SelectItem key="status-completed" value="completed">Terminé</SelectItem>
          </SelectContent>
        </Select>

        {/* Période */}
        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1">
              <CalendarIcon className="h-3 w-3" />
              Période
              {filters.dateRange && (
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
                  selected={filters.dateRange?.start}
                  onSelect={(date) => {
                    if (date) {
                      onFiltersChange({
                        ...filters,
                        dateRange: {
                          start: date,
                          end: filters.dateRange?.end || date,
                        },
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
                  selected={filters.dateRange?.end}
                  onSelect={(date) => {
                    if (date) {
                      onFiltersChange({
                        ...filters,
                        dateRange: {
                          start: filters.dateRange?.start || date,
                          end: date,
                        },
                      });
                    }
                  }}
                  locale={fr}
                  className="rounded-md border"
                />
              </div>
              {filters.dateRange && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {format(filters.dateRange.start, 'dd MMM yyyy', { locale: fr })} -{' '}
                    {format(filters.dateRange.end, 'dd MMM yyyy', { locale: fr })}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => onFiltersChange({ ...filters, dateRange: null })}
                  >
                    Effacer la période
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Reset */}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

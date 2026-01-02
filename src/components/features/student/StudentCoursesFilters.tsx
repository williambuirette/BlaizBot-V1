'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterOption {
  id: string;
  name: string;
}

interface StudentCoursesFiltersProps {
  subjects: FilterOption[];
  teachers: FilterOption[];
  selectedSubject: string;
  selectedTeacher: string;
  selectedStatus: string;
  onSubjectChange: (value: string) => void;
  onTeacherChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function StudentCoursesFilters({
  subjects,
  teachers,
  selectedSubject,
  selectedTeacher,
  selectedStatus,
  onSubjectChange,
  onTeacherChange,
  onStatusChange,
}: StudentCoursesFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg border">
      {/* Filtre Professeur */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Professeur :</span>
        <Select value={selectedTeacher} onValueChange={onTeacherChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les professeurs</SelectItem>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtre Matière */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Matière :</span>
        <Select value={selectedSubject} onValueChange={onSubjectChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les matières</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtre Thématique (basé sur le titre du cours) */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Thématique :</span>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les thématiques</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtre Statut / Deadline */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Statut :</span>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="not-started">Non commencé</SelectItem>
            <SelectItem value="in-progress">En cours</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, BookOpen, Users } from 'lucide-react';
import { SubjectRow } from '@/types/admin';

// Re-export pour compatibilité
export type { SubjectRow } from '@/types/admin';

// Couleurs prédéfinies pour les matières (basées sur le nom)
const SUBJECT_COLORS: Record<string, string> = {
  'Mathématiques': 'bg-blue-500',
  'Français': 'bg-red-500',
  'Histoire': 'bg-amber-500',
  'Géographie': 'bg-green-500',
  'Sciences': 'bg-purple-500',
  'Anglais': 'bg-pink-500',
  'Physique': 'bg-cyan-500',
  'Chimie': 'bg-orange-500',
  'SVT': 'bg-emerald-500',
  'Philosophie': 'bg-indigo-500',
};

function getSubjectColor(name: string): string {
  return SUBJECT_COLORS[name] || 'bg-gray-500';
}

interface SubjectsTableProps {
  subjects: SubjectRow[];
  onEdit: (subject: SubjectRow) => void;
  onDelete: (subject: SubjectRow) => void;
}

export function SubjectsTable({ subjects, onEdit, onDelete }: SubjectsTableProps) {
  if (subjects.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Aucune matière trouvée
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Matière</TableHead>
            <TableHead>Cours</TableHead>
            <TableHead>Professeurs</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell className="font-medium">
                <span className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${getSubjectColor(subject.name)}`} />
                  {subject.name}
                </span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {subject.courseCount}
                </span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {subject.teacherCount}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(subject)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(subject)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

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
import { MoreHorizontal, Pencil, Trash2, Users } from 'lucide-react';
import { ClassRow } from '@/types/admin';

// Re-export pour compatibilité
export type { ClassRow } from '@/types/admin';

interface ClassesTableProps {
  classes: ClassRow[];
  onEdit: (classItem: ClassRow) => void;
  onDelete: (classItem: ClassRow) => void;
}

export function ClassesTable({ classes, onEdit, onDelete }: ClassesTableProps) {
  if (classes.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        Aucune classe trouvée
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>Élèves</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((classItem) => (
            <TableRow key={classItem.id}>
              <TableCell className="font-medium">{classItem.name}</TableCell>
              <TableCell>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                  {classItem.level}
                </span>
              </TableCell>
              <TableCell>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {classItem.studentCount}
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
                    <DropdownMenuItem onClick={() => onEdit(classItem)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(classItem)}
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

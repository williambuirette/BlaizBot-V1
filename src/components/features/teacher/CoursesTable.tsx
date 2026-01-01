'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, FolderOpen, BookOpen, TrendingUp } from 'lucide-react';
import { CoursePerformanceBadge } from './CoursePerformanceBadge';
import { CoursePerformance } from '@/types/course-stats';

export interface CourseData {
  id: string;
  title: string;
  description: string | null;
  subjectId?: string;
  subjectName?: string;
  subject?: { id: string; name: string };
  // Nouvelles données de performance
  performance?: CoursePerformance | null;
  aiComprehensionAvg?: number | null;
  // Anciennes données (compatibilité)
  chaptersCount?: number;
  aiAverageScore?: number | null;
  studentsEvaluatedCount?: number;
  createdAt?: Date | string;
}

interface CoursesTableProps {
  courses: CourseData[];
  onEdit: (course: CourseData) => void;
  onDelete: (courseId: string) => void;
}

export function CoursesTable({ courses, onEdit, onDelete }: CoursesTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (courseId: string) => {
    setDeletingId(courseId);
    await onDelete(courseId);
    setDeletingId(null);
  };

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucun cours</h3>
        <p className="text-sm text-muted-foreground">
          Créez votre premier cours pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Matière</TableHead>
            <TableHead>Thème</TableHead>
            <TableHead className="text-center">
              <span className="flex items-center justify-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                Performance
              </span>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => {
            // Compatibilité: subject peut venir de plusieurs formats
            const subjectName = course.subject?.name || course.subjectName || 'N/A';
            
            return (
              <TableRow key={course.id}>
                <TableCell>
                  <Badge variant="secondary">{subjectName}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  <Link 
                    href={`/teacher/courses/${course.id}`}
                    className="hover:underline hover:text-primary"
                  >
                    {course.title}
                  </Link>
                </TableCell>
                <TableCell className="text-center">
                  <CoursePerformanceBadge performance={course.performance ?? null} />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={deletingId === course.id}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/teacher/courses/${course.id}`}>
                          <FolderOpen className="mr-2 h-4 w-4" />
                          Modifier le cours
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Eye, FileText, Dumbbell } from 'lucide-react';

export interface StudentCourseData {
  id: string;
  title: string;
  description: string | null;
  subject: { id: string; name: string };
  teacher: { id: string; firstName: string; lastName: string };
  theme: string;
  tags: string[];
  chaptersCount: number;
  exercisesCount: number;
  completedChapters: number;
  progressPercent: number;
  status: 'not-started' | 'in-progress' | 'completed';
  deadline: string | null;
  createdAt: string;
}

interface StudentCoursesTableProps {
  courses: StudentCourseData[];
}

function getStatusBadge(status: StudentCourseData['status']) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Terminé</Badge>;
    case 'in-progress':
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">En cours</Badge>;
    default:
      return <Badge variant="secondary">Non commencé</Badge>;
  }
}

export function StudentCoursesTable({ courses }: StudentCoursesTableProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Aucun cours disponible</h3>
        <p className="text-sm text-muted-foreground">
          Les cours de vos professeurs apparaîtront ici.
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
            <TableHead>Professeur</TableHead>
            <TableHead className="text-center">
              <span className="flex items-center justify-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Chapitres
              </span>
            </TableHead>
            <TableHead className="text-center">
              <span className="flex items-center justify-center gap-1">
                <Dumbbell className="h-3.5 w-3.5" />
                Exercices
              </span>
            </TableHead>
            <TableHead className="w-[200px]">Progression</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <Badge variant="secondary">{course.subject.name}</Badge>
              </TableCell>
              <TableCell className="font-medium">
                <Link 
                  href={`/student/courses/${course.id}`}
                  className="hover:underline hover:text-primary"
                >
                  {course.title}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {course.teacher.firstName} {course.teacher.lastName}
              </TableCell>
              <TableCell className="text-center">
                <span className="font-medium">{course.completedChapters}</span>
                <span className="text-muted-foreground">/{course.chaptersCount}</span>
              </TableCell>
              <TableCell className="text-center">
                {course.exercisesCount}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={course.progressPercent} className="h-2 flex-1" />
                  <span className="text-sm font-medium w-10 text-right">
                    {course.progressPercent}%
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(course.status)}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/student/courses/${course.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

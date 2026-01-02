/**
 * Card affichant un supplément avec ses stats
 */

'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Book, FileText, Layers, Clock, MoreVertical, Trash2, Edit, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseAttributionDialog } from './CourseAttributionDialog';

interface Supplement {
  id: string;
  title: string;
  description: string | null;
  // Support many-to-many (nouveaux champs)
  courseIds?: string[];
  courses?: {
    id: string;
    title: string;
    teacher: string | null;
  }[];
  // Backward compat (anciens champs)
  courseId?: string | null;
  course?: {
    id: string;
    title: string;
    teacher: string | null;
  } | null;
  chapterCount: number;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SupplementCardProps {
  supplement: Supplement;
}

export function SupplementCard({ supplement }: SupplementCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAttributionDialog, setShowAttributionDialog] = useState(false);

  // Support both many-to-many (new) and single course (old)
  const linkedCourses = supplement.courses || (supplement.course ? [supplement.course] : []);
  const linkedCourseIds = supplement.courseIds || (supplement.courseId ? [supplement.courseId] : []);
  const hasLinkedCourses = linkedCourses.length > 0;

  const handleDelete = async () => {
    if (!confirm('Supprimer ce supplément et tout son contenu ?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/student/supplements/${supplement.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link
            href={`/student/revisions/${supplement.id}`}
            className="flex-1 hover:underline"
          >
            <div className="flex items-center gap-2">
              {hasLinkedCourses ? (
                <Book className="h-5 w-5 text-blue-500" />
              ) : (
                <FileText className="h-5 w-5 text-purple-500" />
              )}
              <h3 className="font-semibold line-clamp-1">{supplement.title}</h3>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/student/revisions/${supplement.id}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Éditer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowAttributionDialog(true)}>
                <Link2 className="mr-2 h-4 w-4" />
                {hasLinkedCourses ? 'Modifier l\'attribution' : 'Lier à un cours'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Lien vers cours si existant - cliquable pour modifier */}
        {hasLinkedCourses ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {linkedCourses.slice(0, 2).map((course) => (
              <Badge 
                key={course.id}
                variant="secondary" 
                className="w-fit cursor-pointer hover:bg-secondary/80"
                onClick={() => setShowAttributionDialog(true)}
              >
                🔗 {course.title}
              </Badge>
            ))}
            {linkedCourses.length > 2 && (
              <Badge 
                variant="secondary" 
                className="w-fit cursor-pointer hover:bg-secondary/80"
                onClick={() => setShowAttributionDialog(true)}
              >
                +{linkedCourses.length - 2} autre{linkedCourses.length > 3 ? 's' : ''}
              </Badge>
            )}
          </div>
        ) : (
          <Badge 
            variant="outline" 
            className="w-fit mt-1 cursor-pointer hover:bg-muted text-muted-foreground"
            onClick={() => setShowAttributionDialog(true)}
          >
            + Lier à un cours
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {supplement.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {supplement.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            {supplement.chapterCount} chap.
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {supplement.cardCount} cartes
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          Modifié{' '}
          {formatDistanceToNow(new Date(supplement.updatedAt), {
            addSuffix: true,
            locale: fr,
          })}
        </div>
      </CardContent>

      {/* Dialog d'attribution de cours */}
      <CourseAttributionDialog
        open={showAttributionDialog}
        onOpenChange={setShowAttributionDialog}
        supplementId={supplement.id}
        supplementTitle={supplement.title}
        currentCourseIds={linkedCourseIds}
      />
    </Card>
  );
}

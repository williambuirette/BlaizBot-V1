/**
 * Header de la page détail d'un supplément
 */

'use client';

import Link from 'next/link';
import { ArrowLeft, Book, User, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Supplement {
  id: string;
  title: string;
  description: string | null;
  courseId: string | null;
  course: {
    id: string;
    title: string;
    teacher: string | null;
  } | null;
}

interface SupplementDetailHeaderProps {
  supplement: Supplement;
}

export function SupplementDetailHeader({ supplement }: SupplementDetailHeaderProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Supprimer ce supplément et tout son contenu ?')) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/student/supplements/${supplement.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/student/revisions');
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <Link href="/student/revisions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {supplement.courseId ? (
              <Book className="h-6 w-6 text-blue-500" />
            ) : (
              <User className="h-6 w-6 text-purple-500" />
            )}
            <h1 className="text-2xl font-bold">{supplement.title}</h1>
          </div>

          {supplement.description && (
            <p className="text-muted-foreground">{supplement.description}</p>
          )}

          {supplement.course && (
            <Badge variant="secondary" className="mt-2">
              🔗 Lié à : {supplement.course.title}
              {supplement.course.teacher && ` (${supplement.course.teacher})`}
            </Badge>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer le supplément
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Composant de sélection de cours pour attribution d'un supplément
 * Permet de lier/délier un supplément à plusieurs cours du professeur
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Loader2, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Course {
  id: string;
  title: string;
  subject: string;
  teacher: string | null;
}

interface CourseAttributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplementId: string;
  supplementTitle: string;
  currentCourseIds: string[];
}

export function CourseAttributionDialog({
  open,
  onOpenChange,
  supplementId,
  supplementTitle,
  currentCourseIds,
}: CourseAttributionDialogProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(currentCourseIds);
  const [error, setError] = useState<string | null>(null);

  // Charger les cours disponibles
  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      setSelectedCourseIds(currentCourseIds);
      
      fetch('/api/student/available-courses')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCourses(data.data);
          } else {
            setError('Erreur lors du chargement des cours');
          }
        })
        .catch(() => setError('Erreur réseau'))
        .finally(() => setLoading(false));
    }
  }, [open, currentCourseIds]);

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/student/supplements/${supplementId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseIds: selectedCourseIds }),
      });

      const data = await res.json();

      if (data.success) {
        onOpenChange(false);
        router.refresh();
      } else {
        setError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  // Vérifier si les sélections ont changé
  const hasChanged = 
    selectedCourseIds.length !== currentCourseIds.length ||
    selectedCourseIds.some(id => !currentCourseIds.includes(id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Attribution aux cours
          </DialogTitle>
          <DialogDescription>
            Sélectionnez les cours auxquels lier &quot;{supplementTitle}&quot;.
            Vous pouvez en choisir plusieurs ou aucun.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error && courses.length === 0 ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Aucun cours disponible. Vous n&apos;êtes peut-être pas encore inscrit à des cours.
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {courses.map((course) => {
                  const isSelected = selectedCourseIds.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleToggleCourse(course.id)}
                    >
                      <Checkbox
                        id={`course-${course.id}`}
                        checked={isSelected}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => handleToggleCourse(course.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`course-${course.id}`}
                          className="flex items-center gap-2 cursor-pointer font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          {course.title}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {course.subject}
                          {course.teacher && ` • ${course.teacher}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Résumé de la sélection */}
          {courses.length > 0 && (
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              {selectedCourseIds.length === 0 ? (
                <span>Aucun cours sélectionné (cours personnel)</span>
              ) : (
                <span>
                  {selectedCourseIds.length} cours sélectionné{selectedCourseIds.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {error && courses.length > 0 && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving || loading || !hasChanged}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Appliquer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

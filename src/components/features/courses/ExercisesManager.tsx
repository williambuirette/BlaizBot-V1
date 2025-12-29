// src/components/features/courses/ExercisesManager.tsx
// Gestionnaire des exercices et quiz d'un cours

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  PenTool,
  FileQuestion,
  Eye,
  Pencil,
  Users,
  Calendar,
  Loader2,
  CheckCircle,
  Clock,
  Plus,
  FileEdit,
} from 'lucide-react';
import { QuizEditor } from './QuizEditor';
import { ExerciseEditor } from './ExerciseEditor';

// Types
type SectionType = 'LESSON' | 'EXERCISE' | 'QUIZ' | 'VIDEO';

interface Section {
  id: string;
  title: string;
  type: SectionType;
  order: number;
  duration: number | null;
  content?: string | null;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  sections: Section[];
}

interface Assignment {
  id: string;
  title: string;
  targetType: 'CLASS' | 'TEAM' | 'STUDENT';
  targetName?: string;
  dueDate: string | null;
  progress: {
    total: number;
    completed: number;
  };
}

interface ExercisesManagerProps {
  courseId: string;
  onViewSection?: (sectionId: string) => void;
  onEditSection?: (sectionId: string) => void;
  onAssignSection?: (sectionId: string) => void;
}

// Mapping des icônes par type
const sectionTypeConfig = {
  EXERCISE: { icon: PenTool, label: 'Exercice', color: 'bg-green-100 text-green-800' },
  QUIZ: { icon: FileQuestion, label: 'Quiz', color: 'bg-orange-100 text-orange-800' },
};

export function ExercisesManager({
  courseId,
  onViewSection,
  onEditSection,
  onAssignSection,
}: ExercisesManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour les éditeurs intégrés
  const [quizEditorOpen, setQuizEditorOpen] = useState(false);
  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Fetch chapters with sections
  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/chapters`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data);
      }
    } catch (error) {
      console.error('Erreur fetch chapters:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Filter only EXERCISE and QUIZ sections
  const getExercisesFromChapter = (chapter: Chapter): Section[] => {
    return chapter.sections.filter(
      (s) => s.type === 'EXERCISE' || s.type === 'QUIZ'
    );
  };

  // Check if course has any exercises
  const hasExercises = chapters.some(
    (chapter) => getExercisesFromChapter(chapter).length > 0
  );

  // Ouvrir l'éditeur pour une section
  const handleEditContent = (section: Section) => {
    setEditingSection(section);
    if (section.type === 'QUIZ') {
      setQuizEditorOpen(true);
    } else if (section.type === 'EXERCISE') {
      setExerciseEditorOpen(true);
    }
  };

  // Sauvegarder le contenu
  const handleSaveContent = async (content: unknown) => {
    if (!editingSection) return;
    const res = await fetch(`/api/teacher/sections/${editingSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: JSON.stringify(content) }),
    });
    if (res.ok) {
      fetchChapters(); // Refresh pour mettre à jour le badge "Contenu"
    }
  };

  // Parser le contenu initial
  const getInitialContent = () => {
    if (!editingSection?.content) return null;
    try {
      return JSON.parse(editingSection.content);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Exercices & Quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasExercises ? (
            <div className="text-center py-8 text-muted-foreground">
              <PenTool className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun exercice ou quiz</p>
              <p className="text-sm">
                Créez des sections de type &quot;Exercice&quot; ou &quot;Quiz&quot; dans l&apos;onglet Structure
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {chapters.map((chapter) => {
                const exercises = getExercisesFromChapter(chapter);

                return (
                  <div key={chapter.id}>
                    {/* Chapter Header */}
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      Chapitre {chapter.order + 1} : {chapter.title}
                    </h3>

                    {exercises.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic pl-4 mb-4">
                        (aucun exercice)
                      </p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {exercises.map((exercise) => (
                          <ExerciseItem
                            key={exercise.id}
                            exercise={exercise}
                            chapterOrder={chapter.order}
                            onView={() => onViewSection?.(exercise.id)}
                            onEdit={() => onEditSection?.(exercise.id)}
                            onEditContent={() => handleEditContent(exercise)}
                            onAssign={() => onAssignSection?.(exercise.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Editor Modal */}
      {editingSection && editingSection.type === 'QUIZ' && (
        <QuizEditor
          open={quizEditorOpen}
          onOpenChange={(open) => {
            setQuizEditorOpen(open);
            if (!open) setEditingSection(null);
          }}
          sectionId={editingSection.id}
          sectionTitle={editingSection.title}
          initialContent={getInitialContent()}
          onSave={handleSaveContent}
        />
      )}

      {/* Exercise Editor Modal */}
      {editingSection && editingSection.type === 'EXERCISE' && (
        <ExerciseEditor
          open={exerciseEditorOpen}
          onOpenChange={(open) => {
            setExerciseEditorOpen(open);
            if (!open) setEditingSection(null);
          }}
          sectionId={editingSection.id}
          sectionTitle={editingSection.title}
          initialContent={getInitialContent()}
          onSave={handleSaveContent}
        />
      )}
    </>
  );
}

// ExerciseItem component
interface ExerciseItemProps {
  exercise: Section;
  chapterOrder: number;
  onView?: () => void;
  onEdit?: () => void;
  onEditContent?: () => void;
  onAssign?: () => void;
  assignment?: Assignment;
}

function ExerciseItem({
  exercise,
  chapterOrder,
  onView,
  onEdit,
  onEditContent,
  onAssign,
  assignment,
}: ExerciseItemProps) {
  const config = sectionTypeConfig[exercise.type as 'EXERCISE' | 'QUIZ'];
  const Icon = config.icon;
  const hasContent = !!exercise.content;

  // Mock assignment data for now (will be replaced with real data)
  const mockAssignment: Assignment | null = null; // TODO: Fetch real assignments

  return (
    <div className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded ${config.color} flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">
              {config.label} {chapterOrder + 1}.{exercise.order + 1}
            </span>
            <span className="text-muted-foreground">:</span>
            <span className="truncate">{exercise.title}</span>
            <Badge className={`text-xs ${config.color}`} variant="secondary">
              {config.label}
            </Badge>
            <Badge variant={hasContent ? 'default' : 'outline'} className="text-xs">
              {hasContent ? '✓ Contenu' : 'Vide'}
            </Badge>
          </div>

          {/* Assignment Status */}
          {mockAssignment ? (
            <AssignmentStatus assignment={mockAssignment} />
          ) : (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Non assigné
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="default"
            size="sm"
            onClick={onEditContent}
            title="Éditer le contenu"
            className="text-xs"
          >
            <FileEdit className="h-3 w-3 mr-1" />
            {hasContent ? 'Modifier' : 'Créer'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onView}
            title="Voir le contenu"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            title="Modifier"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onAssign}
            className="text-xs"
          >
            <Users className="h-3 w-3 mr-1" />
            Assigner
          </Button>
        </div>
      </div>
    </div>
  );
}

// AssignmentStatus component
interface AssignmentStatusProps {
  assignment: Assignment;
}

function AssignmentStatus({ assignment }: AssignmentStatusProps) {
  const { total, completed } = assignment.progress;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isCompleted = completed === total && total > 0;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2 text-sm">
        <Users className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">
          Assigné à : {assignment.targetName}
        </span>
        {assignment.dueDate && (
          <>
            <span className="text-muted-foreground">•</span>
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {new Date(assignment.dueDate).toLocaleDateString('fr-FR')}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Progress value={percentage} className="h-2 flex-1 max-w-[150px]" />
        <span className="text-xs text-muted-foreground">
          {completed}/{total}
        </span>
        {isCompleted && (
          <CheckCircle className="h-4 w-4 text-green-600" />
        )}
      </div>
    </div>
  );
}

// src/components/features/courses/AssignmentsManager.tsx
// Gestionnaire des assignations d'un cours

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  ClipboardList,
  Users,
  User,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  BookOpen,
  PenTool,
  FileQuestion,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { AssignDialog } from './assign-dialog';
import { ProgressSheet } from './ProgressSheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Types
type TargetType = 'CLASS' | 'TEAM' | 'STUDENT';

interface Assignment {
  id: string;
  title: string;
  instructions: string | null;
  dueDate: string | null;
  targetType: TargetType;
  courseId: string | null;
  chapterId: string | null;
  sectionId: string | null;
  classId: string | null;
  teamId: string | null;
  studentId: string | null;
  createdAt: string;
  // Nested info
  course?: { id: string; title: string } | null;
  chapter?: { id: string; title: string } | null;
  section?: { id: string; title: string; type: string } | null;
  class?: { id: string; name: string } | null;
  team?: { id: string; name: string } | null;
  student?: { id: string; firstName: string; lastName: string } | null;
  // Stats
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
  };
}

interface AssignmentsManagerProps {
  courseId: string;
}

// Target type config
const targetTypeConfig = {
  CLASS: { icon: Users, label: 'Classe', color: 'bg-blue-100 text-blue-800' },
  TEAM: { icon: Users, label: 'Équipe', color: 'bg-purple-100 text-purple-800' },
  STUDENT: { icon: User, label: 'Élève', color: 'bg-green-100 text-green-800' },
};

// Content type icons
const getContentIcon = (assignment: Assignment) => {
  if (assignment.section) {
    const type = assignment.section.type;
    if (type === 'EXERCISE') return PenTool;
    if (type === 'QUIZ') return FileQuestion;
  }
  return BookOpen;
};

export function AssignmentsManager({ courseId }: AssignmentsManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Dialogs
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [progressSheetOpen, setProgressSheetOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(null);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/assignments?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Erreur fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return !a.stats || a.stats.completionRate < 100;
    }
    if (filter === 'completed') {
      return a.stats && a.stats.completionRate === 100;
    }
    return true;
  });

  // Delete assignment
  const handleDelete = async () => {
    if (!deleteAssignmentId) return;
    try {
      const res = await fetch(`/api/teacher/assignments/${deleteAssignmentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchAssignments();
      }
    } catch (error) {
      console.error('Erreur delete assignment:', error);
    }
    setDeleteAssignmentId(null);
  };

  // Open progress sheet
  const openProgressSheet = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setProgressSheetOpen(true);
  };

  // Handle new assignment created
  const handleAssignmentCreated = () => {
    fetchAssignments();
    setAssignDialogOpen(false);
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Assignations
          </CardTitle>
          <Button onClick={() => setAssignDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle assignation
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="active">En cours</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignments List */}
          {filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune assignation</p>
              <p className="text-sm">
                Créez une assignation pour distribuer du contenu à vos élèves
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onViewProgress={() => openProgressSheet(assignment)}
                  onDelete={() => setDeleteAssignmentId(assignment.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <AssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        courseId={courseId}
        onSuccess={handleAssignmentCreated}
      />

      {/* Progress Sheet */}
      {selectedAssignment && (
        <ProgressSheet
          open={progressSheetOpen}
          onOpenChange={setProgressSheetOpen}
          assignment={selectedAssignment}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAssignmentId} onOpenChange={() => setDeleteAssignmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette assignation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera également toutes les progressions des élèves.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// AssignmentCard component
interface AssignmentCardProps {
  assignment: Assignment;
  onViewProgress: () => void;
  onDelete: () => void;
}

function AssignmentCard({ assignment, onViewProgress, onDelete }: AssignmentCardProps) {
  const ContentIcon = getContentIcon(assignment);
  const targetConfig = targetTypeConfig[assignment.targetType];
  const TargetIcon = targetConfig.icon;

  // Get content label
  const getContentLabel = () => {
    if (assignment.section) {
      return `Section : ${assignment.section.title}`;
    }
    if (assignment.chapter) {
      return `Chapitre : ${assignment.chapter.title}`;
    }
    if (assignment.course) {
      return `Cours : ${assignment.course.title}`;
    }
    return 'Contenu inconnu';
  };

  // Get target label
  const getTargetLabel = () => {
    if (assignment.class) return assignment.class.name;
    if (assignment.team) return assignment.team.name;
    if (assignment.student) {
      return `${assignment.student.firstName} ${assignment.student.lastName}`;
    }
    return 'Cible inconnue';
  };

  const stats = assignment.stats || { total: 0, completed: 0, completionRate: 0 };
  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const isCompleted = stats.completionRate === 100;

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2 rounded bg-muted flex-shrink-0">
          <ContentIcon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium">{assignment.title}</span>
          </div>

          <p className="text-sm text-muted-foreground mb-2">{getContentLabel()}</p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <div className="flex items-center gap-1">
              <TargetIcon className="h-4 w-4 text-muted-foreground" />
              <Badge className={`text-xs ${targetConfig.color}`} variant="secondary">
                {getTargetLabel()}
              </Badge>
            </div>

            {assignment.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue && !isCompleted ? 'text-destructive' : 'text-muted-foreground'}`}>
                <Calendar className="h-4 w-4" />
                <span>{new Date(assignment.dueDate).toLocaleDateString('fr-FR')}</span>
                {isOverdue && !isCompleted && <AlertCircle className="h-4 w-4" />}
              </div>
            )}

            {isCompleted ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Terminé</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>En cours</span>
              </div>
            )}
          </div>

          {/* Progress */}
          {stats.total > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Progress value={stats.completionRate} className="h-2 flex-1 max-w-[200px]" />
              <span className="text-xs text-muted-foreground">
                {stats.completed}/{stats.total} ({stats.completionRate}%)
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProgress}
          >
            <Eye className="h-4 w-4 mr-1" />
            Progression
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

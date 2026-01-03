// AssignmentCard - Carte d'assignation avec KPI et actions
// Refactorisé : 485 → ~250 lignes

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { 
  BookOpen,
  Clock,
  Users,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  RefreshCw,
  ClipboardEdit,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExamGradeDialog } from '@/components/features/teacher/ExamGradeDialog';

// Sub-components
import { 
  AssignmentCardData,
  AssignmentCardProps,
  PRIORITY_CONFIG,
  TARGET_TYPE_CONFIG,
  KPICell,
  StudentsListPopover,
} from './assignment-card';

// Re-export pour compatibilité
export type { AssignmentCardData, AssignmentCardProps } from './assignment-card';

export function AssignmentCard({
  assignment,
  studentId,
  onEdit,
  onDelete,
  onExamGradeUpdated,
  showActions = true,
  compact = false,
}: AssignmentCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [savingExam, setSavingExam] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[assignment.priority];
  const targetConfig = TARGET_TYPE_CONFIG[assignment.targetType] || { label: assignment.targetType, icon: '📋' };
  const student = assignment.User_CourseAssignment_studentIdToUser;
  const dueDate = parseISO(assignment.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const kpi = assignment.kpi;
  const effectiveStudentId = studentId || student?.id;

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(assignment.id);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleSaveExamGrade = async (grade: number, comment?: string) => {
    if (!effectiveStudentId || !assignment.Course?.id) return;
    
    setSavingExam(true);
    try {
      const response = await fetch(`/api/teacher/students/${effectiveStudentId}/scores`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: assignment.Course.id,
          examGrade: grade,
          examComment: comment,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      setExamDialogOpen(false);
      onExamGradeUpdated?.();
    } finally {
      setSavingExam(false);
    }
  };

  // Trouver l'élève dans le StudentProgress si nécessaire
  const filteredStudent = !student && studentId && assignment.StudentProgress
    ? assignment.StudentProgress.find(p => p.studentId === studentId)?.User
    : null;

  return (
    <>
      <Card 
        className={cn(
          'transition-colors hover:bg-muted/50 relative overflow-hidden',
          isOverdue && 'border-red-200 bg-red-50/30',
          onEdit && 'cursor-pointer'
        )}
        style={{
          borderLeft: assignment.Class?.color ? `4px solid ${assignment.Class.color}` : undefined
        }}
        onClick={() => onEdit?.(assignment)}
      >
        <CardContent className={cn('p-4', compact && 'p-3')}>
          {/* Ligne 1: Titre + Actions */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-lg flex-shrink-0">{targetConfig.icon}</span>
              <div className="min-w-0">
                <p 
                  className={cn(
                    'font-medium truncate cursor-pointer hover:text-primary transition-colors',
                    compact ? 'text-sm' : 'text-base'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (assignment.Course?.id) {
                      router.push(`/teacher/courses/${assignment.Course.id}`);
                    }
                  }}
                >
                  {assignment.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {assignment.Course.title}
                  </span>
                  {assignment.Class && (
                    <>
                      <span 
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-medium shadow-sm"
                        style={{ 
                          backgroundColor: assignment.Class.color || '#3b82f6',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        <Users className="h-3 w-3" />
                        {assignment.Class.name}
                      </span>
                      {assignment.StudentProgress && assignment.StudentProgress.length > 0 && (
                        <StudentsListPopover studentProgress={assignment.StudentProgress} />
                      )}
                    </>
                  )}
                  {student && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <User className="h-3 w-3" />
                      {student.firstName} {student.lastName}
                    </span>
                  )}
                  {filteredStudent && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <User className="h-3 w-3" />
                      {filteredStudent.firstName} {filteredStudent.lastName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Badges + Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs flex items-center gap-1',
                  isOverdue ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-200'
                )}
              >
                <Clock className="h-3 w-3" />
                {format(dueDate, 'dd MMM', { locale: fr })}
              </Badge>
              <Badge className={cn('text-xs', priorityConfig.color)}>
                {priorityConfig.label}
              </Badge>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(assignment); }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                    )}
                    {effectiveStudentId && assignment.Course?.id && (
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setExamDialogOpen(true); }}>
                        <ClipboardEdit className="mr-2 h-4 w-4" />
                        Saisir note examen
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => { e.stopPropagation(); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Ligne 2: KPI */}
          {kpi && (
            <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t">
              <KPICell label="Continu" value={`${kpi.continuous}%`} />
              <KPICell 
                label="🤖 IA" 
                value={`${kpi.ai}%`} 
                className="bg-purple-50 border border-purple-200"
                valueClassName="text-purple-700"
              />
              <KPICell 
                label="Exam" 
                value={kpi.exam !== null ? `${kpi.exam}/6` : '—'} 
                onClick={effectiveStudentId ? () => setExamDialogOpen(true) : undefined}
                editable={!!effectiveStudentId}
              />
              <KPICell label="Final" value={kpi.final !== null ? `${kpi.final}/6` : '—'} />
            </div>
          )}

          {assignment.isRecurring && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Récurrent
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog confirmation suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;assignation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;assignation &quot;{assignment.title}&quot; 
              sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog saisie note examen */}
      <ExamGradeDialog
        open={examDialogOpen}
        onOpenChange={setExamDialogOpen}
        courseName={assignment.Course.title}
        currentGrade={kpi?.exam}
        onSave={handleSaveExamGrade}
      />
    </>
  );
}

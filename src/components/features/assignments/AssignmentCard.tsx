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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExamGradeDialog } from '@/components/features/teacher/ExamGradeDialog';

// ============================================
// TYPES
// ============================================

export interface AssignmentCardData {
  id: string;
  title: string;
  instructions: string | null;
  targetType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  startDate: string | null;
  dueDate: string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  courseId?: string | null;
  Course: { id: string; title: string };
  Chapter?: { id: string; title: string } | null;
  Section?: { id: string; title: string } | null;
  Class?: { id: string; name: string } | null;
  Team?: { id: string; name: string } | null;
  User_CourseAssignment_studentIdToUser?: { id: string; firstName: string; lastName: string } | null;
  StudentProgress?: Array<{
    id: string;
    studentId: string;
    status: string;
    User?: { id: string; firstName: string; lastName: string };
  }>;
  // KPI scores de l'élève
  kpi?: {
    continuous: number;
    ai: number;
    exam: number | null;
    final: number | null;
  } | null;
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
  };
}

interface AssignmentCardProps {
  assignment: AssignmentCardData;
  studentId?: string; // Pour la saisie de la note d'examen
  onEdit?: (assignment: AssignmentCardData) => void;
  onDelete?: (assignmentId: string) => Promise<void>;
  onExamGradeUpdated?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

// ============================================
// CONSTANTES
// ============================================

const PRIORITY_CONFIG = {
  HIGH: { label: 'Haute', color: 'bg-red-100 text-red-700 border-red-200' },
  MEDIUM: { label: 'Moyenne', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  LOW: { label: 'Basse', color: 'bg-green-100 text-green-700 border-green-200' },
};

const TARGET_TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  CLASS: { label: 'Classe', icon: '👥' },
  TEAM: { label: 'Équipe', icon: '👤' },
  STUDENT: { label: 'Élève', icon: '🎓' },
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

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
  const [studentsPopoverOpen, setStudentsPopoverOpen] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[assignment.priority];
  const targetConfig = TARGET_TYPE_CONFIG[assignment.targetType] || { label: assignment.targetType, icon: '📋' };
  const student = assignment.User_CourseAssignment_studentIdToUser;
  const dueDate = parseISO(assignment.dueDate);
  const isOverdue = isPast(dueDate) && !isToday(dueDate);
  const kpi = assignment.kpi;

  // ID de l'élève pour la note d'examen
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

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      setExamDialogOpen(false);
      onExamGradeUpdated?.();
    } finally {
      setSavingExam(false);
    }
  };

  return (
    <>
      <Card 
        className={cn(
          'transition-colors hover:bg-muted/50 relative overflow-hidden',
          isOverdue && 'border-red-200 bg-red-50/30',
          onEdit && 'cursor-pointer'
        )}
        style={{
          borderLeft: assignment.Class?.color 
            ? `4px solid ${assignment.Class.color}` 
            : undefined
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
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                      >
                        <Users className="h-3 w-3" />
                        {assignment.Class.name}
                      </span>
                      {/* Bouton pour voir la liste des élèves */}
                      {assignment.StudentProgress && assignment.StudentProgress.length > 0 && (
                        <Popover open={studentsPopoverOpen} onOpenChange={setStudentsPopoverOpen}>
                          <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 px-1 -ml-1 hover:bg-blue-100"
                            >
                              <ChevronDown className="h-3 w-3 text-blue-600" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-64 p-3" 
                            align="start"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-2">
                              <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Élèves assignés ({assignment.StudentProgress.length})
                              </h4>
                              <div className="max-h-64 overflow-y-auto space-y-1">
                                {assignment.StudentProgress
                                  .filter(p => p.User)
                                  .sort((a, b) => {
                                    const nameA = `${a.User?.lastName} ${a.User?.firstName}`;
                                    const nameB = `${b.User?.lastName} ${b.User?.firstName}`;
                                    return nameA.localeCompare(nameB);
                                  })
                                  .map((progress) => (
                                    <div
                                      key={progress.id}
                                      className="flex items-center justify-between p-2 rounded hover:bg-muted text-sm"
                                    >
                                      <div className="flex items-center gap-2">
                                        <User className="h-3 w-3 text-muted-foreground" />
                                        <span>
                                          {progress.User?.firstName} {progress.User?.lastName}
                                        </span>
                                      </div>
                                      <Badge 
                                        variant="outline" 
                                        className="text-[10px] px-1 py-0"
                                      >
                                        {progress.status === 'COMPLETED' ? '✓' : 
                                         progress.status === 'IN_PROGRESS' ? '⏳' : '○'}
                                      </Badge>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </>
                  )}
                  {student && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <User className="h-3 w-3" />
                      {student.firstName} {student.lastName}
                    </span>
                  )}
                  {/* Afficher l'élève filtré si fourni */}
                  {!student && studentId && assignment.StudentProgress && assignment.StudentProgress.length > 0 && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <User className="h-3 w-3" />
                      {assignment.StudentProgress.find(p => p.studentId === studentId)?.User?.firstName}{' '}
                      {assignment.StudentProgress.find(p => p.studentId === studentId)?.User?.lastName}
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

              {/* Menu actions */}
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

          {/* Ligne 2: KPI (si élève assigné avec scores) */}
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
              <KPICell 
                label="Final" 
                value={kpi.final !== null ? `${kpi.final}/6` : '—'} 
              />
            </div>
          )}

          {/* Récurrent badge si applicable */}
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

// ============================================
// SOUS-COMPOSANTS
// ============================================

function KPICell({
  label,
  value,
  className,
  valueClassName,
  onClick,
  editable,
}: {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
  editable?: boolean;
}) {
  return (
    <div 
      className={cn(
        'text-center p-1.5 bg-muted/50 rounded',
        editable && 'cursor-pointer hover:bg-muted transition-colors',
        className
      )}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div className={cn('font-semibold text-xs', valueClassName)}>
        {value}
        {editable && <Pencil className="inline-block ml-1 h-2.5 w-2.5 text-muted-foreground" />}
      </div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarDays, 
  BookOpen,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssignmentCard, type AssignmentCardData } from './AssignmentCard';
import type { AssignmentWithDetails } from '@/app/(dashboard)/teacher/assignments/page';

interface AssignmentsListProps {
  assignments: AssignmentWithDetails[];
  selectedDate: Date | null;
  onSelectAssignment: (assignment: AssignmentWithDetails) => void;
  onDeleteAssignment?: (assignmentId: string) => Promise<void>;
  onAssignmentUpdated?: () => void;
}

interface GroupedAssignments {
  [date: string]: AssignmentWithDetails[];
}

export function AssignmentsList({
  assignments,
  selectedDate,
  onSelectAssignment,
  onDeleteAssignment,
  onAssignmentUpdated,
}: AssignmentsListProps) {
  // Grouper les assignations par date
  const groupedByDate = useMemo<GroupedAssignments>(() => {
    const grouped: GroupedAssignments = {};
    
    assignments.forEach(assignment => {
      // Ignorer les assignations sans date limite
      if (!assignment.dueDate) return;
      
      const dateKey = format(parseISO(assignment.dueDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(assignment);
    });

    // Trier les dates
    const sortedKeys = Object.keys(grouped).sort();
    const sortedGrouped: GroupedAssignments = {};
    sortedKeys.forEach(key => {
      const items = grouped[key];
      if (items) {
        sortedGrouped[key] = items;
      }
    });

    return sortedGrouped;
  }, [assignments]);

  // Stats
  const stats = useMemo(() => {
    const overdue = assignments.filter(a => a.dueDate && isPast(parseISO(a.dueDate))).length;
    const today = assignments.filter(a => a.dueDate && isToday(parseISO(a.dueDate))).length;
    const upcoming = assignments.length - overdue - today;
    return { overdue, today, upcoming, total: assignments.length };
  }, [assignments]);

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucune assignation</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {selectedDate 
              ? `Aucune assignation pour le ${format(selectedDate, 'dd MMMM yyyy', { locale: fr })}`
              : 'Créez votre première assignation'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicateur de date sélectionnée */}
      {selectedDate && (
        <Card className="border-blue-500 bg-blue-50/50">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span className="font-medium">
                Vue filtrée : {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<BookOpen className="h-4 w-4" />}
          color="text-blue-600"
        />
        <StatCard
          label="En retard"
          value={stats.overdue}
          icon={<AlertTriangle className="h-4 w-4" />}
          color="text-red-600"
        />
        <StatCard
          label="Aujourd'hui"
          value={stats.today}
          icon={<Clock className="h-4 w-4" />}
          color="text-orange-600"
        />
        <StatCard
          label="À venir"
          value={stats.upcoming}
          icon={<CalendarDays className="h-4 w-4" />}
          color="text-green-600"
        />
      </div>

      {/* Liste groupée par date */}
      {Object.entries(groupedByDate).map(([dateKey, dateAssignments]) => (
        <DateGroup
          key={dateKey}
          date={dateKey}
          assignments={dateAssignments}
          onSelectAssignment={onSelectAssignment}
          onDeleteAssignment={onDeleteAssignment}
          onAssignmentUpdated={onAssignmentUpdated}
        />
      ))}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className={cn('flex items-center gap-1', color)}>
            {icon}
          </span>
          <span className="text-2xl font-bold">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function DateGroup({
  date,
  assignments,
  onSelectAssignment,
  onDeleteAssignment,
  onAssignmentUpdated,
}: {
  date: string;
  assignments: AssignmentWithDetails[];
  onSelectAssignment: (assignment: AssignmentWithDetails) => void;
  onDeleteAssignment?: (assignmentId: string) => Promise<void>;
  onAssignmentUpdated?: () => void;
}) {
  const parsedDate = parseISO(date);
  const isOverdue = isPast(parsedDate) && !isToday(parsedDate);
  
  const formatDateLabel = () => {
    if (isToday(parsedDate)) return "Aujourd'hui";
    if (isTomorrow(parsedDate)) return 'Demain';
    return format(parsedDate, 'EEEE d MMMM', { locale: fr });
  };

  return (
    <Card className={cn(isOverdue && 'border-red-200 bg-red-50/50')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className={cn('h-4 w-4', isOverdue ? 'text-red-500' : 'text-muted-foreground')} />
            <span className={cn(isOverdue && 'text-red-700')}>
              {formatDateLabel()}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                En retard
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary">{assignments.length} assignation{assignments.length > 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {assignments.map(assignment => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment as AssignmentCardData}
              studentId={assignment.User_CourseAssignment_studentIdToUser?.id}
              onEdit={() => onSelectAssignment(assignment)}
              onDelete={onDeleteAssignment}
              onExamGradeUpdated={onAssignmentUpdated}
              showActions={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

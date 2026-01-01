'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isTomorrow, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDays, AlertCircle } from 'lucide-react';
import { AssignmentCard, type AssignmentCardData } from '@/components/features/assignments/AssignmentCard';

interface StudentAssignmentsListProps {
  studentId: string;
  onAssignmentUpdated?: () => void;
}

interface GroupedAssignments {
  [date: string]: AssignmentCardData[];
}

export function StudentAssignmentsList({ 
  studentId,
  onAssignmentUpdated,
}: StudentAssignmentsListProps) {
  const [assignments, setAssignments] = useState<AssignmentCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teacher/assignments?studentId=${studentId}`);
      const json = await response.json();
      
      if (json.success) {
        setAssignments(json.data);
      } else {
        setError('Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur chargement assignations élève:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [studentId]);

  const handleAssignmentUpdated = () => {
    fetchAssignments();
    onAssignmentUpdated?.();
  };

  // Grouper par date
  const groupedByDate = assignments.reduce<GroupedAssignments>((acc, assignment) => {
    // Ignorer les assignations sans date limite
    if (!assignment.dueDate) return acc;
    
    const dateKey = format(parseISO(assignment.dueDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(assignment);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="flex items-center gap-3 p-6 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucune assignation</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Cet élève n&apos;a pas encore d&apos;assignation.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return 'Demain';
    return format(date, 'EEEE d MMMM', { locale: fr });
  };

  return (
    <div className="space-y-4">
      {sortedDates.map(dateKey => {
        const dateAssignments = groupedByDate[dateKey] || [];
        const count = dateAssignments.length;

        return (
          <Card key={dateKey}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{formatDateLabel(dateKey)}</h3>
                </div>
                <Badge variant="secondary">
                  {count} assignation{count > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="space-y-2">
                {dateAssignments.map(assignment => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    studentId={studentId}
                    onExamGradeUpdated={handleAssignmentUpdated}
                    showActions={true}
                    compact={false}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

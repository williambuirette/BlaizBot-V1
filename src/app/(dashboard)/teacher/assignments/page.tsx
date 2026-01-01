'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, List, Plus, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignmentFiltersBar, type AssignmentFiltersState } from '@/components/features/assignments/AssignmentFiltersBar';
import { AssignmentsCalendar } from '@/components/features/assignments/AssignmentsCalendar';
import { AssignmentsList } from '@/components/features/assignments/AssignmentsList';
import { NewAssignmentModal } from '@/components/features/assignments/NewAssignmentModal';

export interface AssignmentWithDetails {
  id: string;
  title: string;
  instructions: string | null;
  targetType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  startDate: string | null;
  dueDate: string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  createdAt: string;
  Teacher: { User: { firstName: string; lastName: string } };
  Course: { id: string; title: string };
  Chapter: { id: string; title: string } | null;
  Section: { id: string; title: string } | null;
  Class: { id: string; name: string } | null;
  Team: { id: string; name: string } | null;
  User_CourseAssignment_studentIdToUser?: { id: string; firstName: string; lastName: string } | null;
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
  };
  kpi?: {
    continuous: number;
    ai: number;
    exam: number | null;
    final: number | null;
  } | null;
  _count?: { Children: number };
}

type ViewMode = 'calendar' | 'list';

const initialFilters: AssignmentFiltersState = {
  subjectIds: [],
  courseIds: [],
  classIds: [],
  studentIds: [],
  priorities: [],
  dateRange: null,
};

export default function AssignmentsPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [filters, setFilters] = useState<AssignmentFiltersState>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.subjectIds[0]) params.append('subjectId', filters.subjectIds[0]);
      if (filters.courseIds[0]) params.append('courseId', filters.courseIds[0]);
      if (filters.classIds[0]) params.append('classId', filters.classIds[0]);
      if (filters.studentIds[0]) params.append('studentId', filters.studentIds[0]);
      if (filters.priorities[0]) params.append('priority', filters.priorities[0]);
      if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start.toISOString());
      if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end.toISOString());

      const url = `/api/teacher/assignments${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      const json = await response.json();
      
      if (json.success) {
        setAssignments(json.data);
      }
    } catch (error) {
      console.error('Erreur chargement assignations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleFiltersChange = (newFilters: AssignmentFiltersState) => {
    setFilters(newFilters);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setView('list');
    setFilters((prev: AssignmentFiltersState) => ({
      ...prev,
      dateRange: { start: date, end: date },
    }));
  };

  const handleSelectAssignment = (assignment: AssignmentWithDetails) => {
    setEditingAssignment(assignment);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Erreur suppression assignation:', error);
    }
  };

  const handleAssignmentCreated = () => {
    setIsModalOpen(false);
    fetchAssignments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignations & Calendrier</h1>
          <p className="text-muted-foreground">
            Gérez vos assignations de cours et exercices
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border bg-muted p-1">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendrier</span>
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Liste</span>
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAssignments}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle assignation</span>
          </Button>
        </div>
      </div>

      {/* Barre de filtres horizontale */}
      <AssignmentFiltersBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Vue principale */}
      <div className="min-h-150">
        {isLoading ? (
          <LoadingState />
        ) : view === 'calendar' ? (
          <AssignmentsCalendar
            assignments={assignments}
            onSelectDate={handleSelectDate}
            onSelectAssignment={handleSelectAssignment}
          />
        ) : (
          <AssignmentsList
            assignments={assignments}
            selectedDate={selectedDate}
            onSelectAssignment={handleSelectAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onAssignmentUpdated={fetchAssignments}
          />
        )}
      </div>

      {/* Modal Nouvelle Assignation / Édition */}
      <NewAssignmentModal
        open={isModalOpen || editingAssignment !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setEditingAssignment(null);
          }
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setEditingAssignment(null);
          fetchAssignments();
        }}
        editingAssignment={editingAssignment}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

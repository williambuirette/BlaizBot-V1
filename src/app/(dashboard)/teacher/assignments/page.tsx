'use client';

import { useState, useEffect, useCallback } from 'react';
import { View, Views } from 'react-big-calendar';
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
  Class: { id: string; name: string; color: string | null } | null;
  Team: { id: string; name: string } | null;
  User_CourseAssignment_studentIdToUser?: { id: string; firstName: string; lastName: string } | null;
  StudentProgress?: Array<{
    id: string;
    studentId: string;
    status: string;
    User?: { id: string; firstName: string; lastName: string };
  }>;
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

function hasActiveFilters(filters: AssignmentFiltersState): boolean {
  return (
    filters.subjectIds.length > 0 ||
    filters.courseIds.length > 0 ||
    filters.classIds.length > 0 ||
    filters.studentIds.length > 0 ||
    filters.priorities.length > 0 ||
    filters.dateRange !== null
  );
}

export default function AssignmentsPage() {
  const [view, setView] = useState<ViewMode>('list');
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [filters, setFilters] = useState<AssignmentFiltersState>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // État du calendrier (remonté pour éviter la réinitialisation)
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [editingAssignment, setEditingAssignment] = useState<AssignmentWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Envoyer tous les IDs sélectionnés, pas seulement le premier
      filters.subjectIds.forEach(id => params.append('subjectId', id));
      filters.courseIds.forEach(id => params.append('courseId', id));
      filters.classIds.forEach(id => params.append('classId', id));
      filters.studentIds.forEach(id => params.append('studentId', id));
      filters.priorities.forEach(priority => params.append('priority', priority));
      
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
    
    // Si tous les filtres sont réinitialisés, réinitialiser aussi selectedDate
    const isAllFiltersEmpty = (
      newFilters.subjectIds.length === 0 && 
      newFilters.courseIds.length === 0 && 
      newFilters.classIds.length === 0 && 
      newFilters.studentIds.length === 0 && 
      newFilters.priorities.length === 0 && 
      newFilters.dateRange === null
    );
    
    if (isAllFiltersEmpty) {
      setSelectedDate(null);
    }
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setView('calendar'); // Rester en vue calendrier
    setIsModalOpen(false);
    setEditingAssignment(null);
    
    // Passer en vue AGENDA et naviguer vers la date
    setCalendarView(Views.AGENDA);
    setCalendarDate(date);
    
    // Créer une plage qui couvre toute la journée (00:00:00 à 23:59:59)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    setFilters((prev: AssignmentFiltersState) => ({
      ...prev,
      dateRange: { start: startOfDay, end: endOfDay },
    }));
    // Le useEffect sur [filters] déclenchera automatiquement fetchAssignments
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
        ) : view === 'calendar' && !hasActiveFilters(filters) && assignments.length === 0 ? (
          <EmptyFiltersState />
        ) : view === 'calendar' ? (
          <AssignmentsCalendar
            assignments={assignments}
            onSelectDate={handleSelectDate}
            onSelectAssignment={handleSelectAssignment}
            calendarView={calendarView}
            onCalendarViewChange={setCalendarView}
            calendarDate={calendarDate}
            onCalendarDateChange={setCalendarDate}
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

function EmptyFiltersState() {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="rounded-full bg-muted p-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Aucun filtre actif</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Sélectionnez au moins un filtre (matière, cours, classe, élève, priorité ou période) 
              pour afficher les assignations dans le calendrier.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>💡</span>
            <span>Astuce : Utilisez les filtres ci-dessus pour cibler vos assignations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// src/app/(dashboard)/student/agenda/page.tsx
// Page principale de l'agenda élève

'use client';

import { useState, useEffect, useCallback } from 'react';
import { View, Views } from 'react-big-calendar';
import { Calendar, List, Plus, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AgendaStats,
  StudentAgendaFilters,
  StudentAgendaCalendar,
  StudentAgendaList,
  NewPersonalEventModal,
  type AgendaFiltersState,
} from '@/components/features/student/agenda';

export interface AgendaItem {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  type: 'assignment' | 'personal' | 'course';
  source: 'teacher' | 'student';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: string;
  targetType?: string;
  course?: { id: string; title: string; subject?: { name: string; color?: string } };
  class?: { id: string; name: string; color?: string | null };
  color: string;
  isEditable: boolean;
}

type ViewMode = 'calendar' | 'list';

const initialFilters: AgendaFiltersState = {
  type: 'all',
  teacherIds: [],
  subjectIds: [],
  courseId: null,
  status: 'all',
  dateRange: null,
};

export default function StudentAgendaPage() {
  const [view, setView] = useState<ViewMode>('calendar');
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [stats, setStats] = useState({ total: 0, overdue: 0, today: 0, upcoming: 0, personal: 0 });
  const [filters, setFilters] = useState<AgendaFiltersState>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [editingEvent, setEditingEvent] = useState<AgendaItem | null>(null);

  const fetchAgenda = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type !== 'all') params.append('type', filters.type);
      if (filters.teacherIds.length > 0) params.append('teacherIds', filters.teacherIds.join(','));
      if (filters.subjectIds.length > 0) params.append('subjectIds', filters.subjectIds.join(','));
      if (filters.courseId) params.append('courseId', filters.courseId);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await fetch(`/api/student/agenda?${params}`);
      const json = await response.json();

      if (json.success) {
        setItems(json.data);
        setStats(json.stats);
      }
    } catch (error) {
      console.error('Erreur chargement agenda:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const handleEventClick = (item: AgendaItem) => {
    if (item.isEditable) {
      setEditingEvent(item);
      setIsModalOpen(true);
    }
    // TODO: Si non éditable (assignment prof), afficher détails read-only
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mon Agenda</h1>
          <p className="text-muted-foreground">Mes devoirs et objectifs personnels</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle vue */}
          <div className="flex rounded-lg border bg-muted p-1">
            <Button
              variant={view === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('calendar')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendrier
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4 mr-1" />
              Liste
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchAgenda}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouvel objectif
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <StudentAgendaFilters filters={filters} onFiltersChange={setFilters} />

      {/* Stats */}
      <AgendaStats stats={stats} />

      {/* Vue principale */}
      {view === 'calendar' ? (
        <StudentAgendaCalendar
          items={items}
          isLoading={isLoading}
          onEventClick={handleEventClick}
          calendarView={calendarView}
          onCalendarViewChange={setCalendarView}
          calendarDate={calendarDate}
          onCalendarDateChange={setCalendarDate}
        />
      ) : (
        <StudentAgendaList
          items={items}
          isLoading={isLoading}
          onEventClick={handleEventClick}
        />
      )}

      {/* Modal */}
      <NewPersonalEventModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onSuccess={() => {
          handleModalClose();
          fetchAgenda();
        }}
        editingEvent={editingEvent}
      />
    </div>
  );
}

'use client';

import { useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AssignmentWithDetails } from '@/app/(dashboard)/teacher/assignments/page';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';

const locales = { fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: AssignmentWithDetails;
}

interface AssignmentsCalendarProps {
  assignments: AssignmentWithDetails[];
  onSelectDate: (date: Date) => void;
  onSelectAssignment: (assignment: AssignmentWithDetails) => void;
}

const PRIORITY_COLORS = {
  HIGH: { bg: 'bg-red-500', text: 'text-white' },
  MEDIUM: { bg: 'bg-orange-500', text: 'text-white' },
  LOW: { bg: 'bg-green-500', text: 'text-white' },
};

const TARGET_TYPE_ICONS: Record<string, string> = {
  CLASS: '👥',
  TEAM: '👤',
  STUDENT: '🎓',
};

const ASSIGNMENT_TYPE_ICONS: Record<string, string> = {
  LESSON: '📚',
  EXERCISE: '✍️',
  QUIZ: '📝',
  PROJECT: '🎯',
};

const messages = {
  today: "Aujourd'hui",
  previous: 'Précédent',
  next: 'Suivant',
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Événement',
  noEventsInRange: 'Aucune assignation sur cette période',
  showMore: (total: number) => `+${total} de plus`,
};

export function AssignmentsCalendar({
  assignments,
  onSelectDate,
  onSelectAssignment,
}: AssignmentsCalendarProps) {
  // Convertir les assignations en événements calendrier
  const events: CalendarEvent[] = useMemo(() => {
    return assignments.map(assignment => ({
      id: assignment.id,
      title: `${TARGET_TYPE_ICONS[assignment.targetType] || '📋'} ${assignment.title}`,
      start: new Date(assignment.startDate || assignment.dueDate),
      end: new Date(assignment.dueDate),
      allDay: true,
      resource: assignment,
    }));
  }, [assignments]);

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectAssignment(event.resource);
    },
    [onSelectAssignment]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      onSelectDate(slotInfo.start);
    },
    [onSelectDate]
  );

  // Style des événements selon priorité
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const priority = event.resource.priority;
    const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
    
    return {
      className: `${colors.bg} ${colors.text} rounded px-1 text-xs`,
      style: {
        border: 'none',
      },
    };
  }, []);

  // Stats du calendrier
  const stats = useMemo(() => {
    const high = assignments.filter(a => a.priority === 'HIGH').length;
    const medium = assignments.filter(a => a.priority === 'MEDIUM').length;
    const low = assignments.filter(a => a.priority === 'LOW').length;
    const recurring = assignments.filter(a => a.isRecurring).length;
    return { high, medium, low, recurring, total: assignments.length };
  }, [assignments]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vue Calendrier</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-red-600 border-red-200">
              {stats.high} haute
            </Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              {stats.medium} moyenne
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              {stats.low} basse
            </Badge>
            {stats.recurring > 0 && (
              <Badge variant="secondary">
                🔄 {stats.recurring} récurrent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.MONTH}
            views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
            messages={messages}
            culture="fr"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            popup
            className="assignments-calendar"
          />
        </div>
        
        {/* Légende */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span>Haute priorité</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-orange-500" />
            <span>Moyenne priorité</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span>Basse priorité</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

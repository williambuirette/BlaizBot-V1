// src/components/features/student/agenda/StudentAgendaCalendar.tsx
// Calendrier react-big-calendar pour l'agenda élève

'use client';

import { useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { AgendaItem } from '@/app/(dashboard)/student/agenda/page';

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
  resource: AgendaItem;
}

interface Props {
  items: AgendaItem[];
  isLoading: boolean;
  onEventClick: (item: AgendaItem) => void;
  calendarView: View;
  onCalendarViewChange: (view: View) => void;
  calendarDate: Date;
  onCalendarDateChange: (date: Date) => void;
}

const messages = {
  today: "Aujourd'hui",
  previous: 'Précédent',
  next: 'Suivant',
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  noEventsInRange: 'Aucun événement sur cette période',
};

export function StudentAgendaCalendar({
  items,
  isLoading,
  onEventClick,
  calendarView,
  onCalendarViewChange,
  calendarDate,
  onCalendarDateChange,
}: Props) {
  // Convertir les items en événements calendrier
  // IMPORTANT: On affiche uniquement sur la date de deadline (endDate), pas sur une plage
  const events: CalendarEvent[] = useMemo(() => {
    return items.map((item) => {
      // Utiliser endDate (deadline) comme seule date d'affichage
      const deadlineDate = new Date(item.endDate);
      return {
        id: item.id,
        title: `${item.type === 'personal' ? '🟢' : '📘'} ${item.title}`,
        start: deadlineDate,
        end: deadlineDate,
        allDay: true,
        resource: item,
      };
    });
  }, [items]);

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onEventClick(event.resource);
    },
    [onEventClick]
  );

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.75rem',
      },
    };
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[500px]" />
        </CardContent>
      </Card>
    );
  }

  const teacherCount = items.filter((i) => i.type === 'assignment').length;
  const personalCount = items.filter((i) => i.type === 'personal').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Vue Calendrier</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-blue-500 text-blue-600">
              📘 Devoirs prof ({teacherCount})
            </Badge>
            <Badge variant="outline" className="border-green-500 text-green-600">
              🟢 Mes objectifs ({personalCount})
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[550px]">
          <Calendar
            localizer={localizer}
            events={events}
            view={calendarView}
            onView={onCalendarViewChange}
            date={calendarDate}
            onNavigate={onCalendarDateChange}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            messages={messages}
            culture="fr"
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            popup
          />
        </div>

        {/* Légende */}
        <div className="mt-4 pt-4 border-t flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span>Assignations professeur</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span>Mes objectifs personnels</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

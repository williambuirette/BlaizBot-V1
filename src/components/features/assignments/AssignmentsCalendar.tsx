'use client';

import { useMemo, useCallback, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, SlotInfo, View, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  calendarView: View;
  onCalendarViewChange: (view: View) => void;
  calendarDate: Date;
  onCalendarDateChange: (date: Date) => void;
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

// Toolbar personnalisée sans le bouton "Aujourd'hui"
const CustomToolbar = ({ label, onNavigate, onView, view }: ToolbarProps) => {
  return (
    <div className="rbc-toolbar">
      <span className="rbc-btn-group">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
          className="rbc-btn rbc-btn-prev"
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
          className="rbc-btn rbc-btn-next"
        >
          Suivant
        </Button>
      </span>
      
      <span className="rbc-toolbar-label text-lg font-semibold">
        {label}
      </span>
      
      <span className="rbc-btn-group">
        {[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA].map((viewName) => (
          <Button
            key={viewName}
            variant={view === viewName ? "default" : "outline"}
            size="sm"
            onClick={() => onView(viewName)}
            className="rbc-btn"
          >
            {messages[viewName as keyof typeof messages]}
          </Button>
        ))}
      </span>
    </div>
  );
};

export function AssignmentsCalendar({
  assignments,
  onSelectDate,
  onSelectAssignment,
  calendarView,
  onCalendarViewChange,
  calendarDate,
  onCalendarDateChange,
}: AssignmentsCalendarProps) {
  // Gestionnaires de navigation
  const handleNavigate = (newDate: Date) => {
    onCalendarDateChange(newDate);
  };

  // Convertir les assignations en événements calendrier
  const events: CalendarEvent[] = useMemo(() => {
    return assignments.map(assignment => ({
      id: assignment.id,
      title: `${TARGET_TYPE_ICONS[assignment.targetType] || '📋'} ${assignment.title}`,
      start: new Date(assignment.dueDate),
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
      // Notifier le parent de la date sélectionnée (pour filtrer)
      // Cela déclenchera aussi le passage en vue AGENDA via handleSelectDate
      onSelectDate(slotInfo.start);
    },
    [onSelectDate]
  );

  // Style des événements selon la couleur de la classe
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const classColor = event.resource.Class?.color;
    
    if (classColor) {
      return {
        style: {
          backgroundColor: classColor,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '2px 4px',
          fontSize: '0.75rem',
          fontWeight: '500',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        },
      };
    }
    
    // Fallback: utiliser la priorité si pas de classe
    const priority = event.resource.priority;
    const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
    
    return {
      className: `${colors.bg} ${colors.text} rounded px-1 text-xs`,
      style: {
        border: 'none',
      },
    };
  }, []);

  // Stats du calendrier par classe
  const stats = useMemo(() => {
    const classStats = new Map<string, { name: string; color: string; count: number }>();
    assignments.forEach(a => {
      if (a.Class) {
        const existing = classStats.get(a.Class.id);
        if (existing) {
          existing.count++;
        } else {
          classStats.set(a.Class.id, {
            name: a.Class.name,
            color: a.Class.color || '#3b82f6',
            count: 1,
          });
        }
      }
    });
    const recurring = assignments.filter(a => a.isRecurring).length;
    return { classes: Array.from(classStats.values()), recurring, total: assignments.length };
  }, [assignments]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Vue Calendrier</CardTitle>
            <Badge variant="secondary" className="font-normal">
              {stats.total} assignation{stats.total > 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {stats.classes.map((cls) => (
              <Badge 
                key={cls.name}
                variant="outline"
                className="font-medium"
                style={{
                  borderColor: cls.color,
                  color: cls.color,
                  borderWidth: '2px',
                }}
              >
                {cls.name} ({cls.count})
              </Badge>
            ))}
            {stats.recurring > 0 && (
              <Badge variant="secondary">
                🔄 {stats.recurring} récurrent{stats.recurring > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px] bg-gradient-to-br from-background to-muted/20 rounded-lg p-2">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={calendarView}
            onView={onCalendarViewChange}
            date={calendarDate}
            onNavigate={handleNavigate}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            messages={messages}
            culture="fr"
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            popup
            className="assignments-calendar"
            components={{
              toolbar: CustomToolbar,
            }}
          />
        </div>
        
        {/* Légende améliorée */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm">
            {stats.classes.map((cls) => (
              <div key={cls.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                <div 
                  className="h-3 w-3 rounded-full shadow-sm" 
                  style={{ backgroundColor: cls.color }}
                />
                <span className="font-medium text-foreground">{cls.name}</span>
                <span className="text-muted-foreground">({cls.count})</span>
              </div>
            ))}
            {stats.classes.length === 0 && (
              <span className="text-muted-foreground italic">Aucune classe avec assignation</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// src/components/features/student/agenda/StudentAgendaList.tsx
// Vue liste pour l'agenda élève - Groupée par date comme le prof

'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  CalendarDays,
  CheckCircle, 
  Clock, 
  Edit,
  BookOpen,
  MoreVertical,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AgendaItem } from '@/app/(dashboard)/student/agenda/page';

interface Props {
  items: AgendaItem[];
  isLoading: boolean;
  onEventClick: (item: AgendaItem) => void;
}

const priorityLabels = {
  HIGH: { label: 'Haute', color: 'bg-red-100 text-red-700' },
  MEDIUM: { label: 'Moyenne', color: 'bg-orange-100 text-orange-700' },
  LOW: { label: 'Basse', color: 'bg-green-100 text-green-700' },
};

const statusLabels = {
  NOT_STARTED: { label: 'À faire', color: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-700' },
  COMPLETED: { label: 'Terminé', color: 'bg-green-100 text-green-700' },
};

const TARGET_TYPE_ICONS: Record<string, string> = {
  HOMEWORK: '📝',
  CLASS_WORK: '📚',
  REVISION: '🔄',
  EXERCISE: '✏️',
  EXAM: '📋',
  PROJECT: '🎯',
  QUIZ: '❓',
  OTHER: '📌',
};

interface GroupedItems {
  [date: string]: AgendaItem[];
}

export function StudentAgendaList({ items, isLoading, onEventClick }: Props) {
  // Grouper les événements par date d'échéance
  const groupedByDate = useMemo<GroupedItems>(() => {
    const grouped: GroupedItems = {};
    
    items.forEach(item => {
      const dateKey = format(parseISO(item.endDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    // Trier par date
    const sortedKeys = Object.keys(grouped).sort();
    const sortedGrouped: GroupedItems = {};
    sortedKeys.forEach(key => {
      const dateItems = grouped[key];
      if (dateItems) {
        sortedGrouped[key] = dateItems;
      }
    });

    return sortedGrouped;
  }, [items]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold">Aucun événement</h3>
          <p className="text-sm text-muted-foreground">
            Ajoutez un objectif personnel ou attendez les assignations du professeur.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedByDate).map(([dateKey, dateItems]) => (
        <DateGroup
          key={dateKey}
          date={dateKey}
          items={dateItems}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
}

function DateGroup({
  date,
  items,
  onEventClick,
}: {
  date: string;
  items: AgendaItem[];
  onEventClick: (item: AgendaItem) => void;
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
            <CalendarDays className={cn(
              'h-4 w-4', 
              isOverdue ? 'text-red-500' : 'text-muted-foreground'
            )} />
            <span className={cn(isOverdue && 'text-red-700')}>
              {formatDateLabel()}
            </span>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                En retard
              </Badge>
            )}
          </CardTitle>
          <Badge variant="secondary">
            {items.length} assignation{items.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map(item => (
            <AgendaItemCard
              key={item.id}
              item={item}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaItemCard({
  item,
  onEventClick,
}: {
  item: AgendaItem;
  onEventClick: (item: AgendaItem) => void;
}) {
  const priority = item.priority ? priorityLabels[item.priority] : null;
  const status = item.status
    ? statusLabels[item.status as keyof typeof statusLabels]
    : null;
  
  // Icône selon le type
  let typeIcon = '📌';
  if (item.type === 'course') {
    typeIcon = '📖'; // Livre pour les cours
  } else if (item.type === 'personal') {
    typeIcon = '🎯'; // Cible pour perso
  } else if (item.targetType) {
    typeIcon = TARGET_TYPE_ICONS[item.targetType] || '📋';
  }
  
  // Couleur de la bordure
  let borderColor = item.color || '#3b82f6';
  if (item.type === 'personal') {
    borderColor = '#8b5cf6'; // Violet pour perso
  } else if (item.type === 'course') {
    borderColor = '#6366f1'; // Indigo pour cours
  } else if (item.class?.color) {
    borderColor = item.class.color;
  }

  return (
    <Card
      className="transition-colors hover:bg-muted/50 cursor-pointer overflow-hidden"
      style={{ borderLeft: `4px solid ${borderColor}` }}
      onClick={() => onEventClick(item)}
    >
      <CardContent className="p-4">
        {/* Ligne 1: Titre + Type */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-lg flex-shrink-0">{typeIcon}</span>
            <div className="min-w-0">
              <p className="font-medium truncate">{item.title}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                {item.course && item.type !== 'course' && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {item.course.title}
                  </span>
                )}
                {item.course?.subject && item.type === 'course' && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {item.course.subject.name}
                  </span>
                )}
                {item.class && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-white text-xs font-medium shadow-sm"
                    style={{
                      backgroundColor: item.class.color || '#3b82f6',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    }}
                  >
                    {item.class.name}
                  </span>
                )}
                {item.type === 'personal' && (
                  <Badge variant="outline" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    Perso
                  </Badge>
                )}
                {item.type === 'course' && (
                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                    📖 Cours
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.type !== 'course' && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(parseISO(item.endDate), 'dd MMM', { locale: fr })}
              </span>
            )}
            {item.type === 'course' && (
              <span className="text-xs text-muted-foreground">Sans deadline</span>
            )}
            {priority && (
              <Badge className={priority.color} variant="secondary">
                {priority.label}
              </Badge>
            )}
            {item.isEditable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(item);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Ligne 2: Statut si applicable */}
        {status && (
          <div className="flex items-center gap-2 mt-2">
            <Badge className={status.color} variant="secondary">
              {status.label === 'Terminé' && <CheckCircle className="h-3 w-3 mr-1" />}
              {status.label}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

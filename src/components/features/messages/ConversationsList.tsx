'use client';

import { useState, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Search, MessageSquare, User, Users, School, BookOpen, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

interface CourseRef {
  id: string;
  title: string;
}

export interface Conversation {
  id: string;
  type: 'PRIVATE' | 'CLASS_GENERAL' | 'CLASS_TOPIC';
  topicName: string | null;
  subject: { id: string; name: string } | null;
  course?: CourseRef | null;
  participants: Participant[];
  lastMessage: LastMessage | null;
  updatedAt: string;
  schoolYear?: string;
  unreadCount?: number;
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  currentUserId: string;
}

type Category = 'private' | 'group' | 'class';

function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

function getConversationCategory(conv: Conversation): Category {
  if (conv.type === 'CLASS_GENERAL' || conv.type === 'CLASS_TOPIC') {
    return 'class';
  }
  if (conv.participants.length > 1) {
    return 'group';
  }
  return 'private';
}

const categoryConfig = {
  private: {
    label: 'Conversations privées',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  group: {
    label: 'Groupes',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  class: {
    label: 'Classes',
    icon: School,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
};

export function ConversationsList({
  conversations,
  selectedId,
  onSelect,
  currentUserId,
}: ConversationsListProps) {
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState(getCurrentSchoolYear());
  const [openCategories, setOpenCategories] = useState<Record<Category, boolean>>({
    private: true,
    group: true,
    class: true,
  });

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add(getCurrentSchoolYear());
    conversations.forEach((conv) => {
      if (conv.schoolYear) years.add(conv.schoolYear);
    });
    return Array.from(years).sort().reverse();
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (selectedYear !== 'all') {
        const convYear = conv.schoolYear || getCurrentSchoolYear();
        if (convYear !== selectedYear) return false;
      }
      if (!search.trim()) return true;
      const searchLower = search.toLowerCase();
      const participantMatch = conv.participants.some(
        (p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchLower)
      );
      const topicMatch = conv.topicName?.toLowerCase().includes(searchLower);
      const subjectMatch = conv.subject?.name.toLowerCase().includes(searchLower);
      const courseMatch = conv.course?.title.toLowerCase().includes(searchLower);
      return participantMatch || topicMatch || subjectMatch || courseMatch;
    });
  }, [conversations, search, selectedYear]);

  // Grouper par catégorie
  const groupedConversations = useMemo(() => {
    const groups: Record<Category, Conversation[]> = {
      private: [],
      group: [],
      class: [],
    };
    filteredConversations.forEach((conv) => {
      const category = getConversationCategory(conv);
      groups[category].push(conv);
    });
    return groups;
  }, [filteredConversations]);

  // Compter les non-lus par catégorie
  const unreadCounts = useMemo(() => {
    const counts: Record<Category, number> = { private: 0, group: 0, class: 0 };
    filteredConversations.forEach((conv) => {
      if (conv.unreadCount && conv.unreadCount > 0) {
        const category = getConversationCategory(conv);
        counts[category] += conv.unreadCount;
      }
    });
    return counts;
  }, [filteredConversations]);

  const getConversationTitle = (conv: Conversation) => {
    if (conv.topicName) return conv.topicName;
    if (conv.participants.length === 1 && conv.participants[0]) {
      const p = conv.participants[0];
      return `${p.firstName} ${p.lastName}`;
    }
    return conv.participants.map((p) => p.firstName).join(', ');
  };

  const toggleCategory = (category: Category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const renderConversationItem = (conv: Conversation) => {
    const category = getConversationCategory(conv);
    const config = categoryConfig[category];

    return (
      <button
        key={conv.id}
        onClick={() => onSelect(conv)}
        className={cn(
          'w-full text-left p-3 rounded-lg transition-colors',
          'hover:bg-accent',
          selectedId === conv.id && 'bg-accent ring-2 ring-primary/20'
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full relative', config.bgColor)}>
            <config.icon className={cn('h-5 w-5', config.color)} />
            {conv.unreadCount && conv.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={cn(
                'font-medium truncate',
                conv.unreadCount && conv.unreadCount > 0 && 'font-semibold'
              )}>
                {getConversationTitle(conv)}
              </span>
              {conv.lastMessage && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {conv.course && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 px-1.5 py-0">
                  <BookOpen className="h-3 w-3" />
                  {conv.course.title.length > 12 
                    ? conv.course.title.substring(0, 12) + '...' 
                    : conv.course.title}
                </Badge>
              )}
              {conv.subject && !conv.course && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {conv.subject.name}
                </Badge>
              )}
            </div>
            {conv.lastMessage && (
              <p className={cn(
                'text-sm truncate mt-1',
                conv.unreadCount && conv.unreadCount > 0 
                  ? 'text-foreground font-medium' 
                  : 'text-muted-foreground'
              )}>
                {conv.lastMessage.senderId === currentUserId ? 'Vous: ' : ''}
                {conv.lastMessage.content}
              </p>
            )}
          </div>
        </div>
      </button>
    );
  };

  const renderCategorySection = (category: Category) => {
    const config = categoryConfig[category];
    const convs = groupedConversations[category];
    const unread = unreadCounts[category];

    if (convs.length === 0) return null;

    return (
      <Collapsible
        key={category}
        open={openCategories[category]}
        onOpenChange={() => toggleCategory(category)}
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="flex items-center gap-2">
            <config.icon className={cn('h-4 w-4', config.color)} />
            <span className="font-medium text-sm">{config.label}</span>
            <Badge variant="secondary" className="text-xs">
              {convs.length}
            </Badge>
            {unread > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unread} non-lu{unread > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <ChevronDown className={cn(
            'h-4 w-4 transition-transform',
            openCategories[category] && 'rotate-180'
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          {convs.map(renderConversationItem)}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const totalConversations = filteredConversations.length;
  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </span>
          {totalUnread > 0 && (
            <Badge variant="destructive">{totalUnread} non-lu{totalUnread > 1 ? 's' : ''}</Badge>
          )}
        </CardTitle>
        
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Année scolaire" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les années</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-340px)]">
          {totalConversations === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mb-2" />
              <p className="text-sm">Aucune conversation</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {renderCategorySection('private')}
              {renderCategorySection('group')}
              {renderCategorySection('class')}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

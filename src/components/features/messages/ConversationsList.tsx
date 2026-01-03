'use client';

import { useState, useMemo } from 'react';
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
import { Search, MessageSquare, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import { ConversationItem } from './ConversationItem';
import {
  categoryConfig,
  getConversationCategory,
  getCurrentSchoolYear,
} from './types';
import type { Conversation, Category } from './types';

// Re-export types for backward compatibility
export type { Conversation } from './types';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conversation: Conversation) => void;
  currentUserId: string;
}

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

  const toggleCategory = (category: Category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
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
          {convs.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              category={category}
              isSelected={selectedId === conv.id}
              currentUserId={currentUserId}
              onClick={() => onSelect(conv)}
            />
          ))}
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

// src/components/features/messages/ConversationItem.tsx
// Item de conversation individuel pour ConversationsList

'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation, Category } from './types';
import { categoryConfig } from './types';

interface ConversationItemProps {
  conversation: Conversation;
  category: Category;
  isSelected: boolean;
  currentUserId: string;
  onClick: () => void;
}

function getConversationTitle(conv: Conversation): string {
  if (conv.topicName) return conv.topicName;
  if (conv.participants.length === 1 && conv.participants[0]) {
    const p = conv.participants[0];
    return `${p.firstName} ${p.lastName}`;
  }
  return conv.participants.map((p) => p.firstName).join(', ');
}

export function ConversationItem({
  conversation: conv,
  category,
  isSelected,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const config = categoryConfig[category];
  const hasUnread = conv.unreadCount && conv.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors',
        'hover:bg-accent',
        isSelected && 'bg-accent ring-2 ring-primary/20'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full relative', config.bgColor)}>
          <config.icon className={cn('h-5 w-5', config.color)} />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
              {conv.unreadCount! > 9 ? '9+' : conv.unreadCount}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              'font-medium truncate',
              hasUnread && 'font-semibold'
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
              hasUnread 
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
}

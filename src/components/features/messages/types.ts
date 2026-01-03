// src/components/features/messages/types.ts
// Types partagés pour le module messages

import { User, Users, School } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}

export interface CourseRef {
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

export type Category = 'private' | 'group' | 'class';

interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const categoryConfig: Record<Category, CategoryConfig> = {
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

export function getConversationCategory(conv: Conversation): Category {
  if (conv.type === 'CLASS_GENERAL' || conv.type === 'CLASS_TOPIC') {
    return 'class';
  }
  if (conv.participants.length > 1) {
    return 'group';
  }
  return 'private';
}

export function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

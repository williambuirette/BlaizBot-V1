/**
 * Affichage d'une carte de révision étudiant
 */

'use client';

import Link from 'next/link';
import { FileText, HelpCircle, BookOpen, Repeat, Edit, Trash2, PenTool, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface StudentCard {
  id: string;
  title: string;
  content: string | null;
  cardType: 'NOTE' | 'SUMMARY' | 'QUIZ' | 'EXERCISE' | 'FLASHCARD';
  orderIndex: number;
}

interface StudentCardItemProps {
  card: StudentCard;
  supplementId: string;
  onDelete: () => void;
}

const cardTypeConfig = {
  NOTE: {
    icon: FileText,
    label: 'Note',
    color: 'bg-blue-100 text-blue-700',
  },
  SUMMARY: {
    icon: BookOpen,
    label: 'Résumé',
    color: 'bg-green-100 text-green-700',
  },
  QUIZ: {
    icon: HelpCircle,
    label: 'Quiz',
    color: 'bg-purple-100 text-purple-700',
  },
  EXERCISE: {
    icon: PenTool,
    label: 'Exercice',
    color: 'bg-orange-100 text-orange-700',
  },
  FLASHCARD: {
    icon: Repeat,
    label: 'Flashcard',
    color: 'bg-pink-100 text-pink-700',
  },
};

export function StudentCardItem({ card, supplementId, onDelete }: StudentCardItemProps) {
  const config = cardTypeConfig[card.cardType];
  const Icon = config.icon;

  return (
    <div className="group flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{card.title}</span>
        <Badge className={cn('text-xs', config.color)} variant="secondary">
          {config.label}
        </Badge>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/student/revisions/${supplementId}/cards/${card.id}`}>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Éditer
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

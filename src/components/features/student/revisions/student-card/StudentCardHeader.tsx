// Header de la StudentCard avec édition inline du titre

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  GripVertical,
  Pencil,
  Trash2,
  ChevronDown,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  cardTypeIcons, 
  cardTypeLabels, 
  cardTypeColors, 
  cardTypeIconColors,
  StudentCardData 
} from './types';

interface StudentCardHeaderProps {
  card: StudentCardData;
  isExpanded: boolean;
  hasContent: boolean;
  onDelete: () => void;
  onTitleSaved?: (newTitle: string) => void;
}

export function StudentCardHeader({
  card,
  isExpanded,
  hasContent,
  onDelete,
  onTitleSaved,
}: StudentCardHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(card.title);
  const [savingTitle, setSavingTitle] = useState(false);

  const Icon = cardTypeIcons[card.cardType];

  const startEditingTitle = () => {
    setEditingTitle(card.title);
    setIsEditingTitle(true);
  };

  const cancelEditingTitle = () => {
    setEditingTitle(card.title);
    setIsEditingTitle(false);
  };

  const saveCardTitle = async () => {
    if (!editingTitle.trim() || editingTitle === card.title) {
      cancelEditingTitle();
      return;
    }
    
    setSavingTitle(true);
    try {
      const res = await fetch(`/api/student/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });
      
      if (res.ok) {
        setIsEditingTitle(false);
        onTitleSaved?.(editingTitle.trim());
      }
    } catch (error) {
      console.error('Erreur sauvegarde titre:', error);
    } finally {
      setSavingTitle(false);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 hover:bg-muted/50 rounded-t-lg transition-colors",
      isExpanded && "border-b"
    )}>
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-50 hover:opacity-100" />
      <div className={cn("p-1.5 rounded", cardTypeIconColors[card.cardType])}>
        <Icon className="h-4 w-4" />
      </div>
      
      {/* Titre avec édition inline */}
      {isEditingTitle ? (
        <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="h-7 text-sm font-medium"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveCardTitle();
              if (e.key === 'Escape') cancelEditingTitle();
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-100"
            onClick={saveCardTitle}
            disabled={savingTitle}
          >
            {savingTitle ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={cancelEditingTitle}
            disabled={savingTitle}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <CollapsibleTrigger asChild>
          <span className="flex-1 font-medium cursor-pointer">{card.title}</span>
        </CollapsibleTrigger>
      )}
      
      <Badge className={`text-xs ${cardTypeColors[card.cardType]}`}>
        {cardTypeLabels[card.cardType]}
      </Badge>
      
      <Badge variant={hasContent ? 'default' : 'outline'} className="text-xs">
        {hasContent ? '✓ Contenu' : 'Vide'}
      </Badge>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {!isEditingTitle && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              startEditingTitle();
            }}
            title="Modifier le titre"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Supprimer"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-180"
          )} />
        </Button>
      </CollapsibleTrigger>
    </div>
  );
}

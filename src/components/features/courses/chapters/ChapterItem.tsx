// ChapterItem - Un chapitre avec ses sections

'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { SectionCard, type Section } from '../SectionCard';
import type { ChapterItemProps } from './types';

export function ChapterItem({
  chapter,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onContentSaved,
  expandedSectionId,
  onToggleSection,
}: ChapterItemProps) {
  // Handler pour update section inline
  const handleUpdateSection = async (sectionId: string, data: Partial<Section>) => {
    try {
      const res = await fetch(`/api/teacher/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        onContentSaved();
      }
    } catch (error) {
      console.error('Erreur update section:', error);
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="border rounded-lg">
        {/* Chapter Header */}
        <div className="flex items-center gap-2 p-3 bg-muted/50">
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <div className="flex-1">
            <span className="font-medium">{chapter.title}</span>
            {chapter.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {chapter.description}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            {chapter.sections?.length || 0} section{(chapter.sections?.length || 0) > 1 ? 's' : ''}
          </Badge>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive" 
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sections */}
        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-2">
            {!chapter.sections || chapter.sections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2 pl-8">
                Aucune section dans ce chapitre
              </p>
            ) : (
              chapter.sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  chapterId={chapter.id}
                  isExpanded={expandedSectionId === section.id}
                  onToggle={() => onToggleSection(section.id)}
                  onEdit={() => onEditSection(section)}
                  onUpdate={(data) => handleUpdateSection(section.id, data)}
                  onDelete={() => onDeleteSection(section.id)}
                  onContentSaved={onContentSaved}
                />
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-8 text-muted-foreground"
              onClick={onAddSection}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter une section
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

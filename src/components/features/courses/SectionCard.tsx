// src/components/features/courses/SectionCard.tsx
// Carte accordéon dépliable pour les sections de cours
// Remplace SectionItem avec édition inline au lieu de modales

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  GripVertical,
  Pencil,
  Trash2,
  BookOpen,
  Video,
  FileQuestion,
  PenTool,
  ChevronDown,
  Loader2,
  Save,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LessonEditorInline,
  QuizEditorInline,
  VideoEditorInline,
  ExerciseEditorInline,
} from './inline-editors';
import { SectionFilesUploader } from './SectionFilesUploader';

// Types
export interface Section {
  id: string;
  title: string;
  type: 'LESSON' | 'EXERCISE' | 'QUIZ' | 'VIDEO';
  order: number;
  duration: number | null;
  content?: string | null;
  aiInstructions?: string | null;
}

interface SectionCardProps {
  section: Section;
  chapterId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onUpdate: (data: Partial<Section>) => Promise<void>;
  onDelete: () => void;
  onContentSaved?: () => void;
}

// Mapping des icônes par type de section
const sectionTypeIcons = {
  LESSON: BookOpen,
  VIDEO: Video,
  QUIZ: FileQuestion,
  EXERCISE: PenTool,
};

const sectionTypeLabels = {
  LESSON: 'Leçon',
  VIDEO: 'Vidéo',
  QUIZ: 'Quiz',
  EXERCISE: 'Exercice',
};

const sectionTypeColors = {
  LESSON: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  VIDEO: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  QUIZ: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  EXERCISE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export function SectionCard({
  section,
  isExpanded,
  onToggle,
  onEdit,
  onUpdate,
  onDelete,
  onContentSaved,
}: SectionCardProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const Icon = sectionTypeIcons[section.type];
  const hasContent = !!section.content;

  // Charger le contenu quand la carte s'ouvre
  const fetchContent = useCallback(async () => {
    if (!isExpanded) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/sections/${section.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          try {
            setContent(JSON.parse(data.content));
          } catch {
            setContent(data.content);
          }
        }
      }
    } catch (error) {
      console.error('Erreur fetch contenu section:', error);
    } finally {
      setLoading(false);
    }
  }, [isExpanded, section.id]);

  useEffect(() => {
    if (isExpanded && !content) {
      fetchContent();
    }
  }, [isExpanded, content, fetchContent]);

  // Reset content quand la carte se ferme
  useEffect(() => {
    if (!isExpanded) {
      setContent(null);
      setHasChanges(false);
    }
  }, [isExpanded]);

  // Sauvegarder le contenu
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: typeof content === 'string' ? content : JSON.stringify(content) 
        }),
      });
      if (res.ok) {
        setHasChanges(false);
        onContentSaved?.();
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  // Annuler les modifications
  const handleCancel = () => {
    setContent(null);
    setHasChanges(false);
    onToggle(); // Fermer la carte
  };

  // Callback pour les éditeurs inline
  const handleContentChange = (newContent: unknown) => {
    setContent(newContent);
    setHasChanges(true);
  };

  return (
    <Card className={cn(
      "ml-4 transition-all duration-200 group",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        {/* Header de la carte - toujours visible */}
        <CollapsibleTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50 rounded-t-lg transition-colors",
            isExpanded && "border-b"
          )}>
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-50 hover:opacity-100" />
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 font-medium">{section.title}</span>
            
            <Badge className={`text-xs ${sectionTypeColors[section.type]}`}>
              {sectionTypeLabels[section.type]}
            </Badge>
            
            {section.duration && (
              <span className="text-xs text-muted-foreground">{section.duration} min</span>
            )}
            
            <Badge variant={hasContent ? 'default' : 'outline'} className="text-xs">
              {hasContent ? '✓ Contenu' : 'Vide'}
            </Badge>

            {/* Actions - toujours visibles */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                title="Modifier la section"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Delete clicked for section:', section.id);
                  onDelete();
                }}
                title="Supprimer"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
          </div>
        </CollapsibleTrigger>

        {/* Contenu dépliable */}
        <CollapsibleContent>
          <CardContent className="pt-4">
            {/* Barre d'action sticky quand il y a des changements */}
            {hasChanges && !loading && (
              <div className="sticky top-0 z-10 -mx-4 mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between rounded-t-lg">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Modifications non enregistrées</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer maintenant
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Éditeur inline selon le type de section */}
                {section.type === 'LESSON' && (
                  <LessonEditorInline
                    sectionId={section.id}
                    sectionTitle={section.title}
                    initialContent={content as { html: string } | null}
                    aiInstructions={section.aiInstructions || ''}
                    onContentChange={handleContentChange}
                  />
                )}
                
                {section.type === 'QUIZ' && (
                  <QuizEditorInline
                    sectionId={section.id}
                    sectionTitle={section.title}
                    initialContent={content as never}
                    aiInstructions={section.aiInstructions || ''}
                    onContentChange={handleContentChange}
                  />
                )}
                
                {section.type === 'VIDEO' && (
                  <VideoEditorInline
                    sectionId={section.id}
                    sectionTitle={section.title}
                    initialContent={content as Record<string, unknown> | null}
                    aiInstructions={section.aiInstructions || ''}
                    onContentChange={handleContentChange}
                  />
                )}
                
                {section.type === 'EXERCISE' && (
                  <ExerciseEditorInline
                    sectionId={section.id}
                    sectionTitle={section.title}
                    initialContent={content as never}
                    aiInstructions={section.aiInstructions || ''}
                    onContentChange={handleContentChange}
                  />
                )}

                {/* Base de connaissance - fichiers */}
                <SectionFilesUploader sectionId={section.id} className="mt-4" />

                {/* Footer avec boutons Save/Cancel */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

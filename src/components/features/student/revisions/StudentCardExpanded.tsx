// src/components/features/student/revisions/StudentCardExpanded.tsx
// Carte accordéon dépliable pour les cartes de révision étudiantes
// Copie exacte de SectionCard du professeur

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
  FileText,
  ChevronDown,
  Loader2,
  Save,
  X,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  LessonEditorInline,
  QuizEditorInline,
  VideoEditorInline,
  ExerciseEditorInline,
} from './inline-editors';
import { NoteEditorInline } from './inline-editors/NoteEditorInline';
import { StudentFilesManager } from './StudentFilesManager';

// Types
export interface StudentCardData {
  id: string;
  title: string;
  content: string | null;
  cardType: 'NOTE' | 'LESSON' | 'VIDEO' | 'EXERCISE' | 'QUIZ';
  orderIndex: number;
  // Optionnels pour compatibilité avec Prisma
  files?: Array<{
    id: string;
    filename: string;
    fileType: string;
    url: string;
  }>;
  quiz?: {
    id: string;
    aiGenerated: boolean;
    attemptCount: number;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudentCardExpandedProps {
  card: StudentCardData;
  supplementId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onContentSaved?: () => void;
  onTitleSaved?: (newTitle: string) => void;
}

// Mapping des icônes par type de carte (identique au professeur)
const cardTypeIcons = {
  NOTE: FileText,
  LESSON: BookOpen,
  VIDEO: Video,
  QUIZ: FileQuestion,
  EXERCISE: PenTool,
};

const cardTypeLabels = {
  NOTE: 'Note',
  LESSON: 'Leçon',
  VIDEO: 'Vidéo',
  QUIZ: 'Quiz',
  EXERCISE: 'Exercice',
};

const cardTypeColors = {
  NOTE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  LESSON: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  VIDEO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  QUIZ: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  EXERCISE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

// Couleurs des icônes (fond coloré comme le professeur)
const cardTypeIconColors = {
  NOTE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  LESSON: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  VIDEO: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
  QUIZ: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  EXERCISE: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
};

interface StudentCardFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
}

export function StudentCardExpanded({
  card,
  isExpanded,
  onToggle,
  onDelete,
  onContentSaved,
  onTitleSaved,
}: StudentCardExpandedProps) {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<unknown>(null);
  const [files, setFiles] = useState<StudentCardFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // État pour édition inline du titre
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(card.title);
  const [savingTitle, setSavingTitle] = useState(false);

  const Icon = cardTypeIcons[card.cardType];
  const hasContent = !!card.content;

  // Charger le contenu quand la carte s'ouvre
  const fetchContent = useCallback(async () => {
    if (!isExpanded) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/student/cards/${card.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data.content) {
          try {
            setContent(JSON.parse(data.data.content));
          } catch {
            setContent(data.data.content);
          }
        }
        setFiles(data.data.files || []);
      }
    } catch (error) {
      console.error('Erreur fetch contenu carte:', error);
    } finally {
      setLoading(false);
    }
  }, [isExpanded, card.id]);

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
      const res = await fetch(`/api/student/cards/${card.id}`, {
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

  // === Édition inline du titre ===
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

  // Callback pour les éditeurs inline
  const handleContentChange = (newContent: unknown) => {
    setContent(newContent);
    setHasChanges(true);
  };

  // Callbacks fichiers
  const handleFileUploaded = (file: StudentCardFile) => {
    setFiles(prev => [...prev, file]);
  };

  const handleFileDeleted = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <Card className={cn(
      "ml-4 transition-all duration-200 group",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        {/* Header de la carte - toujours visible */}
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

          {/* Actions - toujours visibles */}
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
                {/* Éditeur inline selon le type de carte */}
                {card.cardType === 'NOTE' && (
                  <NoteEditorInline
                    cardId={card.id}
                    cardTitle={card.title}
                    initialContent={content as { html: string } | null}
                    onContentChange={handleContentChange}
                  />
                )}

                {card.cardType === 'LESSON' && (
                  <LessonEditorInline
                    sectionId={card.id}
                    sectionTitle={card.title}
                    initialContent={content as { html: string } | null}
                    aiInstructions=""
                    onContentChange={handleContentChange}
                  />
                )}
                
                {card.cardType === 'QUIZ' && (
                  <QuizEditorInline
                    sectionId={card.id}
                    sectionTitle={card.title}
                    initialContent={content as never}
                    aiInstructions=""
                    onContentChange={handleContentChange}
                  />
                )}
                
                {card.cardType === 'VIDEO' && (
                  <VideoEditorInline
                    sectionId={card.id}
                    sectionTitle={card.title}
                    initialContent={content as Record<string, unknown> | null}
                    aiInstructions=""
                    onContentChange={handleContentChange}
                  />
                )}
                
                {card.cardType === 'EXERCISE' && (
                  <ExerciseEditorInline
                    sectionId={card.id}
                    sectionTitle={card.title}
                    initialContent={content as never}
                    aiInstructions=""
                    onContentChange={handleContentChange}
                  />
                )}

                {/* Fichiers attachés */}
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-3">Fichiers attachés</h4>
                  <StudentFilesManager
                    cardId={card.id}
                    files={files}
                    onFileUploaded={handleFileUploaded}
                    onFileDeleted={handleFileDeleted}
                  />
                </div>

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

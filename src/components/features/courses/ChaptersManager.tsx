// src/components/features/courses/ChaptersManager.tsx
// Gestionnaire de la structure des chapitres et sections d'un cours

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  BookOpen,
  Video,
  FileQuestion,
  PenTool,
  Loader2,
} from 'lucide-react';
import { ChapterFormDialog } from './ChapterFormDialog';
import { SectionFormDialog } from './SectionFormDialog';
import { SectionItem, type Section } from './SectionItem';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  order: number;
  sections: Section[];
  _count?: { sections: number };
}

interface ChaptersManagerProps {
  courseId: string;
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
  LESSON: 'bg-blue-100 text-blue-800',
  VIDEO: 'bg-purple-100 text-purple-800',
  QUIZ: 'bg-orange-100 text-orange-800',
  EXERCISE: 'bg-green-100 text-green-800',
};

export function ChaptersManager({ courseId }: ChaptersManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Dialogs state
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  // Delete confirmation
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null);

  // Fetch chapters
  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}/chapters`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data);
        // Expand all by default
        setExpandedChapters(new Set(data.map((c: Chapter) => c.id)));
      }
    } catch (error) {
      console.error('Erreur fetch chapters:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  // Toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  // Create/Edit chapter
  const handleChapterSubmit = async (data: { title: string; description?: string }) => {
    try {
      if (editingChapter) {
        // Update
        const res = await fetch(`/api/teacher/chapters/${editingChapter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          await fetchChapters();
        }
      } else {
        // Create
        const res = await fetch(`/api/teacher/courses/${courseId}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const newChapter = await res.json();
          await fetchChapters();
          setExpandedChapters((prev) => new Set([...prev, newChapter.id]));
        }
      }
    } catch (error) {
      console.error('Erreur save chapter:', error);
    }
    setChapterDialogOpen(false);
    setEditingChapter(null);
  };

  // Delete chapter
  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return;
    try {
      const res = await fetch(`/api/teacher/chapters/${deleteChapterId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchChapters();
      }
    } catch (error) {
      console.error('Erreur delete chapter:', error);
    }
    setDeleteChapterId(null);
  };

  // Create/Edit section
  const handleSectionSubmit = async (data: {
    title: string;
    type: Section['type'];
    duration?: number;
  }) => {
    try {
      if (editingSection) {
        // Update
        const res = await fetch(`/api/teacher/sections/${editingSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          await fetchChapters();
        }
      } else if (selectedChapterId) {
        // Create
        const res = await fetch(`/api/teacher/chapters/${selectedChapterId}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          await fetchChapters();
        }
      }
    } catch (error) {
      console.error('Erreur save section:', error);
    }
    setSectionDialogOpen(false);
    setEditingSection(null);
    setSelectedChapterId(null);
  };

  // Delete section
  const handleDeleteSection = async () => {
    if (!deleteSectionId) return;
    try {
      const res = await fetch(`/api/teacher/sections/${deleteSectionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchChapters();
      }
    } catch (error) {
      console.error('Erreur delete section:', error);
    }
    setDeleteSectionId(null);
  };

  // Open dialogs
  const openCreateChapter = () => {
    setEditingChapter(null);
    setChapterDialogOpen(true);
  };

  const openEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChapterDialogOpen(true);
  };

  const openCreateSection = (chapterId: string) => {
    setEditingSection(null);
    setSelectedChapterId(chapterId);
    setSectionDialogOpen(true);
  };

  const openEditSection = (section: Section) => {
    setEditingSection(section);
    setSectionDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Structure du cours
          </CardTitle>
          <Button onClick={openCreateChapter} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter un chapitre
          </Button>
        </CardHeader>
        <CardContent>
          {chapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun chapitre créé</p>
              <p className="text-sm">Commencez par ajouter un chapitre pour structurer votre cours</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  isExpanded={expandedChapters.has(chapter.id)}
                  onToggle={() => toggleChapter(chapter.id)}
                  onEdit={() => openEditChapter(chapter)}
                  onDelete={() => setDeleteChapterId(chapter.id)}
                  onAddSection={() => openCreateSection(chapter.id)}
                  onEditSection={openEditSection}
                  onDeleteSection={(sectionId) => setDeleteSectionId(sectionId)}
                  onContentSaved={fetchChapters}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chapter Dialog */}
      <ChapterFormDialog
        open={chapterDialogOpen}
        onOpenChange={setChapterDialogOpen}
        chapter={editingChapter}
        onSubmit={handleChapterSubmit}
      />

      {/* Section Dialog */}
      <SectionFormDialog
        open={sectionDialogOpen}
        onOpenChange={setSectionDialogOpen}
        section={editingSection}
        onSubmit={handleSectionSubmit}
      />

      {/* Delete Chapter Confirmation */}
      <AlertDialog open={!!deleteChapterId} onOpenChange={() => setDeleteChapterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce chapitre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera également toutes les sections de ce chapitre.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChapter} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Section Confirmation */}
      <AlertDialog open={!!deleteSectionId} onOpenChange={() => setDeleteSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette section ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ChapterItem component
interface ChapterItemProps {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: string) => void;
  onContentSaved: () => void;
}

function ChapterItem({
  chapter,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onContentSaved,
}: ChapterItemProps) {
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
            {chapter.sections.length} section{chapter.sections.length > 1 ? 's' : ''}
          </Badge>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sections */}
        <CollapsibleContent>
          <div className="p-3 pt-0 space-y-2">
            {chapter.sections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2 pl-8">
                Aucune section dans ce chapitre
              </p>
            ) : (
              chapter.sections.map((section) => (
                <SectionItem
                  key={section.id}
                  section={section}
                  onEdit={() => onEditSection(section)}
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


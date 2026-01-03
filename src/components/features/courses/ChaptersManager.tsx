// ChaptersManager - Gestionnaire de la structure des chapitres et sections
// Refactorisé : 473 → ~280 lignes

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  BookOpen,
  Loader2,
} from 'lucide-react';
import { ChapterFormDialog } from './ChapterFormDialog';
import { SectionFormDialog } from './SectionFormDialog';
import { type Section } from './SectionCard';
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

import { Chapter, ChapterItem } from './chapters';

interface ChaptersManagerProps {
  courseId: string;
}

export function ChaptersManager({ courseId }: ChaptersManagerProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

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
        const res = await fetch(`/api/teacher/chapters/${editingChapter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) await fetchChapters();
      } else {
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
      if (res.ok) await fetchChapters();
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
        const res = await fetch(`/api/teacher/sections/${editingSection.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) await fetchChapters();
      } else if (selectedChapterId) {
        const res = await fetch(`/api/teacher/chapters/${selectedChapterId}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) await fetchChapters();
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
      if (res.ok) await fetchChapters();
    } catch (error) {
      console.error('Erreur delete section:', error);
    }
    setDeleteSectionId(null);
  };

  // Open dialogs helpers
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
                  expandedSectionId={expandedSectionId}
                  onToggleSection={(sectionId) => 
                    setExpandedSectionId(expandedSectionId === sectionId ? null : sectionId)
                  }
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
            <AlertDialogAction 
              onClick={handleDeleteChapter} 
              className="bg-destructive text-destructive-foreground"
            >
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
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSection} 
              className="bg-destructive text-destructive-foreground"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


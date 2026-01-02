/**
 * Gestionnaire de chapitres et cartes pour les révisions étudiantes
 * Utilise des cartes dépliables avec éditeurs inline (comme le professeur)
 */

'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight, GripVertical, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StudentCardExpanded, StudentCardData } from './StudentCardExpanded';
import { StudentCardEditor } from './StudentCardEditor';

interface Chapter {
  id: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  cards: StudentCardData[];
}

interface StudentChapterManagerProps {
  supplementId: string;
  chapters: Chapter[];
}

export function StudentChapterManager({ supplementId, chapters: initialChapters }: StudentChapterManagerProps) {
  const [chapters, setChapters] = useState(initialChapters);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  // Carte actuellement dépliée (une seule à la fois)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  // Modale uniquement pour CRÉER une nouvelle carte
  const [creatingCardForChapter, setCreatingCardForChapter] = useState<string | null>(null);
  // État pour édition inline du titre de chapitre
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState('');

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) return;
    setIsAddingChapter(true);

    try {
      const res = await fetch(`/api/student/supplements/${supplementId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChapterTitle.trim(),
          order: chapters.length,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChapters(prev => [...prev, { ...data.data, cards: [] }]);
        setNewChapterTitle('');
        setExpandedChapters(prev => new Set(prev).add(data.data.id));
      }
    } catch (error) {
      console.error('Erreur ajout chapitre:', error);
    } finally {
      setIsAddingChapter(false);
    }
  };

  // Édition inline du titre de chapitre
  const startEditingChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingChapterTitle(chapter.title);
  };

  const cancelEditingChapter = () => {
    setEditingChapterId(null);
    setEditingChapterTitle('');
  };

  const saveChapterTitle = async (chapterId: string) => {
    if (!editingChapterTitle.trim()) return;

    try {
      const res = await fetch(
        `/api/student/supplements/${supplementId}/chapters/${chapterId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editingChapterTitle.trim() }),
        }
      );
      if (res.ok) {
        setChapters(prev =>
          prev.map(ch =>
            ch.id === chapterId ? { ...ch, title: editingChapterTitle.trim() } : ch
          )
        );
      }
    } catch (error) {
      console.error('Erreur mise à jour chapitre:', error);
    } finally {
      setEditingChapterId(null);
      setEditingChapterTitle('');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Supprimer ce chapitre et toutes ses cartes ?')) return;

    try {
      const res = await fetch(
        `/api/student/supplements/${supplementId}/chapters/${chapterId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setChapters(prev => prev.filter(c => c.id !== chapterId));
      }
    } catch (error) {
      console.error('Erreur suppression chapitre:', error);
    }
  };

  // Callback après création d'une nouvelle carte
  const handleCardCreated = (newCard: StudentCardData) => {
    if (creatingCardForChapter) {
      setChapters(prev =>
        prev.map(ch => {
          if (ch.id !== creatingCardForChapter) return ch;
          return { ...ch, cards: [...ch.cards, newCard] };
        })
      );
    }
    setCreatingCardForChapter(null);
    // Ouvrir automatiquement la nouvelle carte pour édition inline
    setExpandedCardId(newCard.id);
  };

  // Toggle d'une carte (ferme l'autre si une est ouverte)
  const handleToggleCard = (cardId: string) => {
    setExpandedCardId(prev => (prev === cardId ? null : cardId));
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Supprimer cette carte ?')) return;

    try {
      const res = await fetch(`/api/student/cards/${cardId}`, { method: 'DELETE' });
      if (res.ok) {
        setChapters(prev =>
          prev.map(ch => ({
            ...ch,
            cards: ch.cards.filter(c => c.id !== cardId),
          }))
        );
      }
    } catch (error) {
      console.error('Erreur suppression carte:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Liste des chapitres */}
      {chapters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun chapitre. Créez votre premier chapitre ci-dessous.
          </CardContent>
        </Card>
      ) : (
        chapters.map(chapter => (
          <Collapsible
            key={chapter.id}
            open={expandedChapters.has(chapter.id)}
            onOpenChange={() => toggleChapter(chapter.id)}
          >
            <div className="border rounded-lg">
              {/* Chapter Header - style identique au professeur */}
              <div className="flex items-center gap-2 p-3 bg-muted/50">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    {expandedChapters.has(chapter.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                {/* Titre éditable inline */}
                {editingChapterId === chapter.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editingChapterTitle}
                      onChange={(e) => setEditingChapterTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveChapterTitle(chapter.id);
                        if (e.key === 'Escape') cancelEditingChapter();
                      }}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-green-600"
                      onClick={() => saveChapterTitle(chapter.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={cancelEditingChapter}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1">
                    <span className="font-medium">{chapter.title}</span>
                    {chapter.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                )}

                <Badge variant="secondary" className="text-xs">
                  {chapter.cards.length} carte{chapter.cards.length !== 1 ? 's' : ''}
                </Badge>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingChapter(chapter);
                    }}
                    title="Modifier le titre"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChapter(chapter.id);
                    }}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sections / Cartes */}
              <CollapsibleContent>
                <div className="p-3 pt-0 space-y-2">
                  {chapter.cards.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic py-2 pl-8">
                      Aucune carte dans ce chapitre
                    </p>
                  ) : (
                    chapter.cards.map(card => (
                      <StudentCardExpanded
                        key={card.id}
                        card={card}
                        supplementId={supplementId}
                        isExpanded={expandedCardId === card.id}
                        onToggle={() => handleToggleCard(card.id)}
                        onDelete={() => handleDeleteCard(card.id)}
                        onContentSaved={() => {
                          // Optionnel: rafraîchir les données si besoin
                        }}
                        onTitleSaved={(newTitle) => {
                          // Mettre à jour le titre localement
                          setChapters(prev => prev.map(ch => ({
                            ...ch,
                            cards: ch.cards.map(c => 
                              c.id === card.id ? { ...c, title: newTitle } : c
                            )
                          })));
                        }}
                      />
                    ))
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-8 text-muted-foreground"
                    onClick={() => setCreatingCardForChapter(chapter.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter une carte
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))
      )}

      {/* Ajout de chapitre */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nouveau chapitre..."
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddChapter()}
        />
        <Button onClick={handleAddChapter} disabled={isAddingChapter || !newChapterTitle.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      {/* Modal de création de nouvelle carte (pas d'édition, juste créer puis rediriger) */}
      {creatingCardForChapter && (
        <StudentCardEditor
          chapterId={creatingCardForChapter}
          onSave={handleCardCreated}
          onCancel={() => setCreatingCardForChapter(null)}
        />
      )}
    </div>
  );
}

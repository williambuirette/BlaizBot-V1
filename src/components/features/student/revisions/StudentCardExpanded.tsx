// StudentCardExpanded - Carte de révision élève avec contenu éditeur inline
// Refactorisé : 493 → ~220 lignes (types, header, unsaved bar extraits)

'use client';

import { useState, useCallback } from 'react';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Sub-components
import { 
  StudentCardData, 
  StudentCardHeader, 
  UnsavedChangesBar 
} from './student-card';

// Inline editors - utiliser le barrel export qui gère le partage avec shared/
import { 
  NoteEditorInline,
  LessonEditorInline,
  QuizEditorInline,
  VideoEditorInline,
  ExerciseEditorInline,
} from './inline-editors';

// File manager
import { StudentFilesManager } from './StudentFilesManager';

// Re-export pour compatibilité
export type { StudentCardData } from './student-card';

interface StudentCardExpandedProps {
  card: StudentCardData;
  supplementId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onContentSaved?: () => void;
  onTitleSaved?: (newTitle: string) => void;
}

export function StudentCardExpanded({
  card,
  supplementId,
  isExpanded,
  onToggle,
  onDelete,
  onContentSaved,
  onTitleSaved,
}: StudentCardExpandedProps) {
  const [cardData, setCardData] = useState(card);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingContent, setPendingContent] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  // Charger le contenu complet quand on ouvre la carte
  const loadFullContent = useCallback(async () => {
    if (cardData.content !== null) return; // Déjà chargé
    
    setLoadingContent(true);
    try {
      const res = await fetch(`/api/student/cards/${card.id}`);
      if (res.ok) {
        const data = await res.json();
        setCardData(prev => ({ ...prev, content: data.content || '' }));
      }
    } catch (error) {
      console.error('Erreur chargement contenu:', error);
    } finally {
      setLoadingContent(false);
    }
  }, [card.id, cardData.content]);

  // Gérer l'expansion
  const handleOpenChange = (open: boolean) => {
    onToggle();
    if (open && !isExpanded) {
      loadFullContent();
    }
  };

  // Callback pour changement de contenu (inline editors)
  const handleContentChange = useCallback((newContent: string) => {
    setPendingContent(newContent);
    setHasUnsavedChanges(true);
  }, []);

  // Sauvegarder le contenu
  const saveContent = async () => {
    if (pendingContent === null) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/student/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: pendingContent }),
      });
      
      if (res.ok) {
        setCardData(prev => ({ ...prev, content: pendingContent }));
        setHasUnsavedChanges(false);
        setPendingContent(null);
        onContentSaved?.();
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  // Annuler les changements
  const cancelChanges = () => {
    setPendingContent(null);
    setHasUnsavedChanges(false);
  };

  // Titre mis à jour
  const handleTitleSaved = (newTitle: string) => {
    setCardData(prev => ({ ...prev, title: newTitle }));
    onTitleSaved?.(newTitle);
  };

  // Fichiers mis à jour
  const handleFilesChange = (files: StudentCardData['files']) => {
    setCardData(prev => ({ ...prev, files }));
    onContentSaved?.();
  };

  const hasContent = Boolean(cardData.content?.trim() || pendingContent?.trim());
  const currentContent = pendingContent ?? cardData.content ?? '';

  return (
    <Collapsible open={isExpanded} onOpenChange={handleOpenChange}>
      <Card className="overflow-hidden">
        <StudentCardHeader
          card={cardData}
          isExpanded={isExpanded}
          hasContent={hasContent}
          onDelete={onDelete}
          onTitleSaved={handleTitleSaved}
        />

        <CollapsibleContent>
          <div className="p-4 border-t bg-muted/20">
            {/* Barre de modifications non enregistrées */}
            {hasUnsavedChanges && (
              <UnsavedChangesBar
                saving={saving}
                onCancel={cancelChanges}
                onSave={saveContent}
              />
            )}

            {/* Chargement */}
            {loadingContent ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            ) : (
              <>
                {/* Éditeur inline selon le type */}
                {renderEditor({
                  cardType: cardData.cardType,
                  content: currentContent,
                  cardId: card.id,
                  supplementId,
                  quiz: cardData.quiz,
                  onChange: handleContentChange,
                  onSave: saveContent,
                })}

                {/* Fichiers attachés */}
                <StudentFilesManager
                  cardId={card.id}
                  files={cardData.files || []}
                  onFilesChange={handleFilesChange}
                />
              </>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// Helper pour rendre l'éditeur approprié
interface EditorConfig {
  cardType: StudentCardData['cardType'];
  content: string;
  cardId: string;
  supplementId: string;
  quiz?: StudentCardData['quiz'];
  onChange: (content: string) => void;
  onSave: () => void;
}

function renderEditor({
  cardType,
  content,
  cardId,
  supplementId,
  quiz,
  onChange,
  onSave,
}: EditorConfig) {
  switch (cardType) {
    case 'NOTE':
      return (
        <NoteEditorInline
          content={content}
          onChange={onChange}
          onSave={onSave}
        />
      );
    case 'LESSON':
      return (
        <LessonEditorInline
          content={content}
          onChange={onChange}
          onSave={onSave}
        />
      );
    case 'VIDEO':
      return (
        <VideoEditorInline
          content={content}
          onChange={onChange}
          onSave={onSave}
        />
      );
    case 'QUIZ':
      return (
        <QuizEditorInline
          content={content}
          cardId={cardId}
          supplementId={supplementId}
          quizData={quiz}
          onChange={onChange}
          onSave={onSave}
        />
      );
    case 'EXERCISE':
      return (
        <ExerciseEditorInline
          content={content}
          onChange={onChange}
          onSave={onSave}
        />
      );
    default:
      return (
        <div className="text-sm text-muted-foreground">
          Type de carte non supporté
        </div>
      );
  }
}

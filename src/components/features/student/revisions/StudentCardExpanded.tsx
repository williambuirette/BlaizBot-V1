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
  const handleFileUploaded = (file: NonNullable<StudentCardData['files']>[number]) => {
    setCardData(prev => ({ ...prev, files: [...(prev.files || []), file] }));
    onContentSaved?.();
  };

  const handleFileDeleted = (fileId: string) => {
    setCardData(prev => ({ 
      ...prev, 
      files: (prev.files || []).filter(f => f.id !== fileId) 
    }));
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
                  cardTitle: cardData.title,
                  onChange: handleContentChange,
                })}

                {/* Fichiers attachés */}
                <StudentFilesManager
                  cardId={card.id}
                  files={cardData.files || []}
                  onFileUploaded={handleFileUploaded}
                  onFileDeleted={handleFileDeleted}
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
  cardTitle: string;
  onChange: (content: string) => void;
}

// Parse le contenu JSON ou retourne un objet vide
function parseContent<T>(content: string, defaultValue: T): T {
  if (!content) return defaultValue;
  try {
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

function renderEditor({
  cardType,
  content,
  cardId,
  cardTitle,
  onChange,
}: EditorConfig) {
  switch (cardType) {
    case 'NOTE':
      return (
        <NoteEditorInline
          cardId={cardId}
          cardTitle={cardTitle}
          initialContent={parseContent(content, { html: content })}
          onContentChange={(c) => onChange(JSON.stringify(c))}
        />
      );
    case 'LESSON':
      return (
        <LessonEditorInline
          sectionId={cardId}
          sectionTitle={cardTitle}
          initialContent={parseContent(content, { html: '' })}
          onContentChange={(c) => onChange(JSON.stringify(c))}
        />
      );
    case 'VIDEO':
      return (
        <VideoEditorInline
          sectionId={cardId}
          sectionTitle={cardTitle}
          initialContent={parseContent(content, null)}
          onContentChange={(c) => onChange(JSON.stringify(c))}
        />
      );
    case 'QUIZ':
      return (
        <QuizEditorInline
          sectionId={cardId}
          sectionTitle={cardTitle}
          initialContent={parseContent(content, null)}
          onContentChange={(c) => onChange(JSON.stringify(c))}
        />
      );
    case 'EXERCISE':
      return (
        <ExerciseEditorInline
          sectionId={cardId}
          sectionTitle={cardTitle}
          initialContent={parseContent(content, null)}
          onContentChange={(c) => onChange(JSON.stringify(c))}
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

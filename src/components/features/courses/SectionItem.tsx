// src/components/features/courses/SectionItem.tsx
// Composant de section avec bouton d'édition de contenu

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Pencil,
  Trash2,
  BookOpen,
  Video,
  FileQuestion,
  PenTool,
  FileEdit,
} from 'lucide-react';
import { QuizEditor } from './QuizEditor';
import { ExerciseEditor } from './ExerciseEditor';
import { LessonEditor } from './LessonEditor';
import { VideoEditor } from './VideoEditor';

// Types
export interface Section {
  id: string;
  title: string;
  type: 'LESSON' | 'EXERCISE' | 'QUIZ' | 'VIDEO';
  order: number;
  duration: number | null;
  content?: string | null;
}

interface SectionItemProps {
  section: Section;
  onEdit: () => void;
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
  LESSON: 'bg-blue-100 text-blue-800',
  VIDEO: 'bg-purple-100 text-purple-800',
  QUIZ: 'bg-orange-100 text-orange-800',
  EXERCISE: 'bg-green-100 text-green-800',
};

export function SectionItem({ section, onEdit, onDelete, onContentSaved }: SectionItemProps) {
  const [quizEditorOpen, setQuizEditorOpen] = useState(false);
  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [videoEditorOpen, setVideoEditorOpen] = useState(false);
  
  const Icon = sectionTypeIcons[section.type];

  // Parse le contenu existant
  const getInitialContent = () => {
    if (!section.content) return null;
    try {
      return JSON.parse(section.content);
    } catch {
      return null;
    }
  };

  // Vérifie si le contenu existe
  const hasContent = !!section.content;

  // Sauvegarde du contenu Quiz
  const handleQuizSave = async (content: unknown) => {
    const res = await fetch(`/api/teacher/sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: JSON.stringify(content) }),
    });
    if (res.ok && onContentSaved) {
      onContentSaved();
    }
  };

  // Sauvegarde du contenu Exercice
  const handleExerciseSave = async (content: unknown) => {
    const res = await fetch(`/api/teacher/sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: JSON.stringify(content) }),
    });
    if (res.ok && onContentSaved) {
      onContentSaved();
    }
  };

  // Sauvegarde du contenu Leçon
  const handleLessonSave = async (content: unknown) => {
    const res = await fetch(`/api/teacher/sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: JSON.stringify(content) }),
    });
    if (res.ok && onContentSaved) {
      onContentSaved();
    }
  };

  // Sauvegarde du contenu Vidéo
  const handleVideoSave = async (content: unknown) => {
    const res = await fetch(`/api/teacher/sections/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: JSON.stringify(content) }),
    });
    if (res.ok && onContentSaved) {
      onContentSaved();
    }
  };

  // Ouvre l'éditeur approprié selon le type
  const openContentEditor = () => {
    switch (section.type) {
      case 'QUIZ':
        setQuizEditorOpen(true);
        break;
      case 'EXERCISE':
        setExerciseEditorOpen(true);
        break;
      case 'LESSON':
        setLessonEditorOpen(true);
        break;
      case 'VIDEO':
        setVideoEditorOpen(true);
        break;
    }
  };

  // Gère le clic sur le titre
  const handleTitleClick = () => {
    openContentEditor();
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 ml-8 rounded-md hover:bg-muted/50 group">
        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100" />
        <Icon className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={handleTitleClick}
          className="flex-1 text-left hover:text-primary hover:underline cursor-pointer transition-colors"
          title="Cliquez pour éditer le contenu"
        >
          {section.title}
        </button>
        <Badge className={`text-xs ${sectionTypeColors[section.type]}`}>
          {sectionTypeLabels[section.type]}
        </Badge>
        {section.duration && (
          <span className="text-xs text-muted-foreground">{section.duration} min</span>
        )}
        
        {/* Indicateur de contenu - pour tous les types */}
        <Badge variant={hasContent ? 'default' : 'outline'} className="text-xs">
          {hasContent ? '✓ Contenu' : 'Vide'}
        </Badge>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          {/* Bouton Éditer le contenu - visible pour tous les types */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-primary"
            onClick={openContentEditor}
            title="Éditer le contenu"
          >
            <FileEdit className="h-3 w-3" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} title="Modifier">
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={onDelete}
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Quiz Editor */}
      <QuizEditor
        open={quizEditorOpen}
        onOpenChange={setQuizEditorOpen}
        sectionId={section.id}
        sectionTitle={section.title}
        initialContent={getInitialContent()}
        onSave={handleQuizSave}
      />

      {/* Exercise Editor */}
      <ExerciseEditor
        open={exerciseEditorOpen}
        onOpenChange={setExerciseEditorOpen}
        sectionId={section.id}
        sectionTitle={section.title}
        initialContent={getInitialContent()}
        onSave={handleExerciseSave}
      />

      {/* Lesson Editor */}
      <LessonEditor
        open={lessonEditorOpen}
        onOpenChange={setLessonEditorOpen}
        sectionId={section.id}
        sectionTitle={section.title}
        initialContent={getInitialContent()}
        onSave={handleLessonSave}
      />

      {/* Video Editor */}
      <VideoEditor
        open={videoEditorOpen}
        onOpenChange={setVideoEditorOpen}
        sectionId={section.id}
        sectionTitle={section.title}
        initialContent={getInitialContent()}
        onSave={handleVideoSave}
      />
    </>
  );
}

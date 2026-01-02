// src/components/features/student/SectionViewerModal.tsx
// Modal de visualisation des sections pour les étudiants
// Refactorisé - utilise les viewers extraits dans ./viewers/

'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Play, 
  Dumbbell, 
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { 
  LessonViewer, 
  VideoViewer, 
  QuizViewer, 
  ExerciseViewer,
  type SectionFile 
} from './viewers';

// =============================================
// Types
// =============================================

interface Section {
  id: string;
  title: string;
  type: string;
  order: number;
  content: string | null;
  files?: SectionFile[];
}

interface SectionViewerModalProps {
  section: Section | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
  courseId?: string;
  onScoreUpdate?: () => void;
}

// =============================================
// Helpers
// =============================================

function getIcon(type: string) {
  switch (type) {
    case 'LESSON': return <FileText className="h-5 w-5 text-blue-500" />;
    case 'QUIZ': return <HelpCircle className="h-5 w-5 text-purple-500" />;
    case 'VIDEO': return <Play className="h-5 w-5 text-red-500" />;
    case 'EXERCISE': return <Dumbbell className="h-5 w-5 text-orange-500" />;
    default: return <FileText className="h-5 w-5" />;
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case 'LESSON': return <Badge className="bg-blue-100 text-blue-700">Leçon</Badge>;
    case 'QUIZ': return <Badge className="bg-purple-100 text-purple-700">Quiz</Badge>;
    case 'VIDEO': return <Badge className="bg-red-100 text-red-700">Vidéo</Badge>;
    case 'EXERCISE': return <Badge className="bg-orange-100 text-orange-700">Exercice</Badge>;
    default: return <Badge variant="secondary">{type}</Badge>;
  }
}

// =============================================
// Composant principal
// =============================================

export function SectionViewerModal({ 
  section, 
  open, 
  onOpenChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onComplete,
  courseId,
  onScoreUpdate
}: SectionViewerModalProps) {
  // État pour le mode étendu (leçons uniquement)
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Reset l'état étendu quand la modal se ferme
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) setIsExpanded(false);
    onOpenChange(newOpen);
  }, [onOpenChange]);

  if (!section) return null;

  // Déterminer les classes de taille en fonction du type et de l'état étendu
  const isLesson = section.type === 'LESSON';
  const sizeClasses = isLesson && isExpanded 
    ? '!max-w-[98vw] !w-[98vw] !max-h-[95vh]' 
    : 'max-w-3xl max-h-[85vh]';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${sizeClasses} overflow-y-auto transition-all duration-300`}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon(section.type)}
            <div className="flex-1">
              <DialogTitle className="text-xl">{section.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {getTypeBadge(section.type)}
              </DialogDescription>
            </div>
            {/* Bouton agrandir/réduire pour les leçons */}
            {isLesson && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleExpand}
                className="shrink-0"
                title={isExpanded ? 'Réduire' : 'Agrandir pour la lecture'}
              >
                {isExpanded ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="mt-4">
          <SectionContent 
            section={section} 
            courseId={courseId} 
            onScoreUpdate={onScoreUpdate} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// Router vers le bon viewer
// =============================================

interface SectionContentProps {
  section: Section;
  courseId?: string;
  onScoreUpdate?: () => void;
}

function SectionContent({ section, courseId, onScoreUpdate }: SectionContentProps) {
  switch (section.type) {
    case 'LESSON':
      return <LessonViewer content={section.content} files={section.files} />;
    
    case 'QUIZ':
      return (
        <QuizViewer 
          content={section.content} 
          courseId={courseId}
          sectionId={section.id}
          onScoreUpdate={onScoreUpdate}
        />
      );
    
    case 'VIDEO':
      return <VideoViewer content={section.content} />;
    
    case 'EXERCISE':
      return (
        <ExerciseViewer 
          content={section.content} 
          sectionId={section.id}
          sectionTitle={section.title}
          courseId={courseId}
          onScoreUpdate={onScoreUpdate}
        />
      );
    
    default:
      return (
        <p className="text-muted-foreground text-center py-8">
          Type de section non supporté : {section.type}
        </p>
      );
  }
}

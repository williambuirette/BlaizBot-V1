'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { CheckCircle, Circle, FileText, Dumbbell, Play, HelpCircle, ChevronRight } from 'lucide-react';
import { SectionViewerModal } from './SectionViewerModal';

interface SectionFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  size?: number;
}

interface Section {
  id: string;
  title: string;
  type: string;
  order: number;
  content: string | null;
  files?: SectionFile[];
}

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isCompleted: boolean;
  sections: Section[];
}

interface StudentChaptersViewerProps {
  chapters: Chapter[];
  courseId: string;
  onProgressUpdate: () => void;
}

function getSectionIcon(type: string) {
  switch (type) {
    case 'LESSON':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'EXERCISE':
      return <Dumbbell className="h-4 w-4 text-orange-500" />;
    case 'VIDEO':
      return <Play className="h-4 w-4 text-red-500" />;
    case 'QUIZ':
      return <HelpCircle className="h-4 w-4 text-purple-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
}

function getSectionTypeBadge(type: string) {
  switch (type) {
    case 'LESSON':
      return <Badge variant="secondary" className="text-xs">Leçon</Badge>;
    case 'EXERCISE':
      return <Badge className="bg-orange-100 text-orange-700 text-xs hover:bg-orange-100">Exercice</Badge>;
    case 'VIDEO':
      return <Badge className="bg-red-100 text-red-700 text-xs hover:bg-red-100">Vidéo</Badge>;
    case 'QUIZ':
      return <Badge className="bg-purple-100 text-purple-700 text-xs hover:bg-purple-100">Quiz</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{type}</Badge>;
  }
}

export function StudentChaptersViewer({ 
  chapters, 
  courseId, 
  onProgressUpdate 
}: StudentChaptersViewerProps) {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Ouvrir une section
  const handleOpenSection = (section: Section) => {
    setSelectedSection(section);
    setModalOpen(true);
  };

  // Marquer un chapitre comme terminé
  const handleMarkComplete = async (chapterId: string) => {
    setMarking(chapterId);
    try {
      const res = await fetch(`/api/student/courses/${courseId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, completed: true }),
      });
      if (res.ok) {
        onProgressUpdate();
      }
    } catch (error) {
      console.error('Erreur marquage progression:', error);
    } finally {
      setMarking(null);
    }
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Ce cours n&apos;a pas encore de contenu.</p>
      </div>
    );
  }

  return (
    <>
    <Accordion 
      type="single" 
      collapsible 
      value={expandedChapter || undefined}
      onValueChange={(val) => setExpandedChapter(val || null)}
      className="space-y-2"
    >
      {chapters.map((chapter, index) => (
        <AccordionItem 
          key={chapter.id} 
          value={chapter.id}
          className="border rounded-lg px-4"
        >
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Status icon */}
              {chapter.isCompleted ? (
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              
              {/* Chapter number */}
              <span className="text-sm font-medium text-muted-foreground w-8">
                {index + 1}.
              </span>
              
              {/* Title */}
              <span className="font-medium text-left flex-1">{chapter.title}</span>
              
              {/* Sections count */}
              <Badge variant="outline" className="mr-2">
                {chapter.sections.length} section{chapter.sections.length > 1 ? 's' : ''}
              </Badge>
              
              {/* Completed badge */}
              {chapter.isCompleted && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  Terminé
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          
          <AccordionContent className="pb-4">
            {/* Description */}
            {chapter.description && (
              <p className="text-sm text-muted-foreground mb-4 pl-8">
                {chapter.description}
              </p>
            )}
            
            {/* Sections list */}
            <div className="space-y-2 pl-8">
              {chapter.sections.map((section) => (
                <div 
                  key={section.id}
                  onClick={() => handleOpenSection(section)}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  {getSectionIcon(section.type)}
                  <span className="flex-1 text-sm group-hover:text-primary transition-colors">
                    {section.title}
                  </span>
                  {getSectionTypeBadge(section.type)}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
            
            {/* Mark complete button */}
            {!chapter.isCompleted && (
              <div className="mt-4 pl-8">
                <Button 
                  size="sm"
                  onClick={() => handleMarkComplete(chapter.id)}
                  disabled={marking === chapter.id}
                >
                  {marking === chapter.id ? (
                    'Enregistrement...'
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer comme terminé
                    </>
                  )}
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>

    {/* Modal de visualisation de section */}
    <SectionViewerModal
      section={selectedSection}
      open={modalOpen}
      onOpenChange={setModalOpen}
      onComplete={onProgressUpdate}
    />
    </>
  );
}

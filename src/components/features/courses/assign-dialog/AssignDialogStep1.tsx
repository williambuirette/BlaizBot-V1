// src/components/features/courses/assign-dialog/AssignDialogStep1.tsx
// Étape 1 : Quoi assigner ?

'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen } from 'lucide-react';
import type { ContentType, Chapter } from './types';

interface Step1Props {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  chapters: Chapter[];
  selectedChapterId: string;
  setSelectedChapterId: (id: string) => void;
  selectedSectionId: string;
  setSelectedSectionId: (id: string) => void;
}

export function AssignDialogStep1({
  contentType,
  setContentType,
  chapters,
  selectedChapterId,
  setSelectedChapterId,
  selectedSectionId,
  setSelectedSectionId,
}: Step1Props) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Quoi assigner ?</Label>
      <RadioGroup
        value={contentType}
        onValueChange={(v) => setContentType(v as ContentType)}
      >
        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="course" id="course" />
          <Label htmlFor="course" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tout le cours
            </div>
            <p className="text-sm text-muted-foreground">
              Assigner l&apos;intégralité du cours
            </p>
          </Label>
        </div>

        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="chapter" id="chapter" />
          <Label htmlFor="chapter" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Un chapitre
            </div>
            <p className="text-sm text-muted-foreground">
              Assigner un chapitre spécifique
            </p>
          </Label>
        </div>

        <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
          <RadioGroupItem value="section" id="section" />
          <Label htmlFor="section" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Une section
            </div>
            <p className="text-sm text-muted-foreground">
              Assigner une section spécifique (exercice, quiz...)
            </p>
          </Label>
        </div>
      </RadioGroup>

      {/* Chapter select */}
      {(contentType === 'chapter' || contentType === 'section') && (
        <div className="space-y-2 pt-2">
          <Label>Chapitre</Label>
          <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un chapitre" />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((chapter) => (
                <SelectItem key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Section select */}
      {contentType === 'section' && selectedChapterId && (
        <div className="space-y-2">
          <Label>Section</Label>
          <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une section" />
            </SelectTrigger>
            <SelectContent>
              {chapters
                .find((c) => c.id === selectedChapterId)
                ?.sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {section.type}
                      </Badge>
                      {section.title}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

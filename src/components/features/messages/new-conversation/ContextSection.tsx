// Section contexte (cours + thématique)

'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Tag, Loader2 } from 'lucide-react';
import type { CourseOption } from './types';

interface ContextSectionProps {
  courses: CourseOption[];
  loadingCourses: boolean;
  selectedCourse: string;
  topicName: string;
  onCourseChange: (value: string) => void;
  onTopicChange: (value: string) => void;
}

export function ContextSection({
  courses,
  loadingCourses,
  selectedCourse,
  topicName,
  onCourseChange,
  onTopicChange,
}: ContextSectionProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <h4 className="font-medium text-sm flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Contexte (optionnel)
      </h4>
      
      {/* Cours lié */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          Lié au cours
        </Label>
        <Select value={selectedCourse} onValueChange={onCourseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Aucun cours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun cours</SelectItem>
            {loadingCourses ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Thématique */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sm">
          <Tag className="h-4 w-4" />
          Thématique / Sujet
        </Label>
        <Input
          placeholder="Ex: Rappel devoirs, Questions sur le cours, Sortie scolaire..."
          value={topicName}
          onChange={(e) => onTopicChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Aide à organiser vos conversations par thème
        </p>
      </div>
    </div>
  );
}

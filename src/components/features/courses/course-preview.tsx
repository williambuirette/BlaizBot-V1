'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, Tag, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoursePreviewProps {
  title: string;
  description?: string;
  content?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  duration?: number | null;
  objectives?: string[];
  tags?: string[];
  subjectName?: string;
  className?: string;
}

const difficultyLabels = {
  EASY: { label: 'Facile', variant: 'default' as const },
  MEDIUM: { label: 'Moyen', variant: 'secondary' as const },
  HARD: { label: 'Difficile', variant: 'destructive' as const },
};

export function CoursePreview({
  title,
  description,
  content,
  difficulty = 'MEDIUM',
  duration,
  objectives = [],
  tags = [],
  subjectName,
  className,
}: CoursePreviewProps) {
  const difficultyInfo = difficultyLabels[difficulty];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {subjectName && (
            <Badge variant="outline">
              <BookOpen className="mr-1 h-3 w-3" />
              {subjectName}
            </Badge>
          )}
          <Badge variant={difficultyInfo.variant}>
            {difficultyInfo.label}
          </Badge>
          {duration && (
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {duration} min
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold">{title || 'Sans titre'}</h1>
        {description && (
          <p className="text-lg text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Objectives */}
      {objectives.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objectifs pédagogiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {objectives.map((obj, i) => (
                <li key={i} className="text-muted-foreground">
                  {obj}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      {content && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Contenu du cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

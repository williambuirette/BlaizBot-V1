'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Chapter, Section } from '../types';
import { SECTION_TYPE_ICONS } from '../types';

interface StepSectionsProps {
  chapters: Chapter[];
  sections: Section[];
  sectionsByChapter: Record<string, { chapter: Chapter; sections: Section[] }>;
  selectedSections: string[];
  onToggleSection: (id: string) => void;
}

export function StepSections({
  chapters,
  sections,
  sectionsByChapter,
  selectedSections,
  onToggleSection,
}: StepSectionsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Sélectionnez les contenus</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choisissez les sections à assigner aux élèves
        </p>
      </div>

      {chapters.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Aucun contenu disponible pour les cours sélectionnés
        </p>
      ) : (
        <div className="space-y-3">
          {Object.values(sectionsByChapter).map(({ chapter, sections: chapterSections }) => (
            <Card key={chapter.id}>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-medium">
                  📖 {chapter.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-3">
                {chapterSections.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aucune section dans ce chapitre
                  </p>
                ) : (
                  <div className="space-y-2">
                    {chapterSections.map((section) => {
                      const typeInfo = SECTION_TYPE_ICONS[section.type] || {
                        icon: '📄',
                        label: section.type,
                      };
                      const isSelected = selectedSections.includes(section.id);

                      return (
                        <div
                          key={section.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors',
                            isSelected && 'bg-muted border border-primary/20'
                          )}
                          onClick={() => onToggleSection(section.id)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleSection(section.id)}
                          />
                          <span className="text-lg">{typeInfo.icon}</span>
                          <span className="flex-1 text-sm">{section.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSections.length === 0 && sections.length > 0 && (
        <p className="text-sm text-destructive">
          ⚠️ Sélectionnez au moins une section pour continuer
        </p>
      )}

      {selectedSections.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {selectedSections.length} section(s) sélectionnée(s)
        </p>
      )}
    </div>
  );
}

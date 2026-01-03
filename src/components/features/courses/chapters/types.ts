// Types pour ChaptersManager

import type { Section } from '../SectionCard';

export interface Chapter {
  id: string;
  title: string;
  description: string | null;
  order: number;
  sections: Section[];
  _count?: { sections: number };
}

export interface ChapterItemProps {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSection: () => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (sectionId: string) => void;
  onContentSaved: () => void;
  expandedSectionId: string | null;
  onToggleSection: (sectionId: string) => void;
}

// Types pour AssignmentFiltersBar

export interface AssignmentFiltersState {
  subjectIds: string[];
  courseIds: string[];
  chapterIds: string[];
  sectionIds: string[];
  classIds: string[];
  studentIds: string[];
  priorities: string[];
  dateRange: { start: Date; end: Date } | null;
}

export interface Subject { id: string; name: string }
export interface Course { id: string; title: string; subjectId?: string; subject?: { id: string } }
export interface Chapter { id: string; title: string; courseId: string }
export interface Section { id: string; title: string; chapterId: string }
export interface ClassOption { id: string; name: string; color?: string | null }
export interface Student { id: string; firstName: string; lastName: string; classId: string }

export const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: 'Haute', color: 'text-red-600' },
  { value: 'MEDIUM', label: 'Moyenne', color: 'text-orange-600' },
  { value: 'LOW', label: 'Basse', color: 'text-green-600' },
];

// Types partagés pour le système d'assignations

export interface Subject {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  subject?: { id: string; name: string };
  subjectId?: string;
}

export interface Chapter {
  id: string;
  title: string;
  courseId: string;
}

export interface Section {
  id: string;
  title: string;
  type: string;
  chapterId: string;
  courseId?: string;
}

export interface ClassOption {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
}

export interface AssignmentFormData {
  selectedSubjects: string[];
  selectedCourses: string[];
  selectedSections: string[];
  selectedClasses: string[];
  selectedStudents: string[];
  dueDate?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  instructions: string;
}

export const SECTION_TYPE_ICONS: Record<string, { icon: string; label: string }> = {
  LESSON: { icon: '📚', label: 'Leçon' },
  EXERCISE: { icon: '✍️', label: 'Exercice' },
  QUIZ: { icon: '📝', label: 'Quiz' },
  VIDEO: { icon: '🎬', label: 'Vidéo' },
  DOCUMENT: { icon: '📄', label: 'Document' },
};

export const PRIORITY_OPTIONS = [
  { value: 'HIGH' as const, label: 'Haute', color: 'text-red-600 border-red-200' },
  { value: 'MEDIUM' as const, label: 'Moyenne', color: 'text-orange-600 border-orange-200' },
  { value: 'LOW' as const, label: 'Basse', color: 'text-green-600 border-green-200' },
];

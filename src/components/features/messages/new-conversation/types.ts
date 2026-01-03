// Types pour NewConversationDialog

export type ConversationType = 'individual' | 'group' | 'class';

export interface ClassOption {
  id: string;
  name: string;
  level: string;
  studentsCount: number;
}

export interface StudentOption {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CourseOption {
  id: string;
  title: string;
}

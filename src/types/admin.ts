// Types partagés pour l'administration

export interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: Date | string;
}

export interface ClassRow {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  createdAt: Date | string;
}

export interface SubjectRow {
  id: string;
  name: string;
  courseCount: number;
  teacherCount: number;
  createdAt: Date | string;
}

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

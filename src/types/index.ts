// =====================================================
// BlaizBot V1 - Types Globaux
// =====================================================
// Ce fichier centralise tous les types réutilisables
// Import: import { Role, User, ApiResponse } from '@/types';
// =====================================================

// -----------------------------------------------------
// ÉNUMÉRATIONS
// -----------------------------------------------------

/**
 * Rôles utilisateur dans l'application
 */
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

/**
 * Statuts possibles pour les entités
 */
export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ARCHIVED';

/**
 * Types d'exercices IA
 */
export type ExerciseType = 'QCM' | 'OPEN' | 'TRUE_FALSE' | 'FILL_BLANK';

/**
 * Modes de l'assistant IA
 */
export type AIMode = 'HINT' | 'EXPLAIN' | 'QUIZ' | 'REVISION';

// -----------------------------------------------------
// UTILISATEURS
// -----------------------------------------------------

/**
 * Utilisateur de base (session)
 */
export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatar?: string;
}

/**
 * Utilisateur complet (admin)
 */
export interface UserFull extends User {
  createdAt: Date;
  updatedAt: Date;
  status: Status;
  classId?: string;
  className?: string;
}

// -----------------------------------------------------
// ENTITÉS MÉTIER
// -----------------------------------------------------

/**
 * Classe (groupe d'élèves)
 */
export interface Class {
  id: string;
  name: string;
  level: string;
  studentCount?: number;
}

/**
 * Matière
 */
export interface Subject {
  id: string;
  name: string;
  color: string; // Hex color pour badges
}

/**
 * Cours
 */
export interface Course {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  subject?: Subject;
  teacherId: string;
  teacher?: User;
  chaptersCount?: number;
  progress?: number; // 0-100 pour élève
}

/**
 * Chapitre de cours
 */
export interface Chapter {
  id: string;
  title: string;
  content: string; // Markdown
  order: number;
  courseId: string;
  isCompleted?: boolean; // Pour élève
}

// -----------------------------------------------------
// RÉPONSES API
// -----------------------------------------------------

/**
 * Réponse API standard - Succès
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * Réponse API standard - Erreur
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

/**
 * Réponse API générique
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// -----------------------------------------------------
// STATISTIQUES (KPIs)
// -----------------------------------------------------

/**
 * Stats dashboard Admin
 */
export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCourses: number;
  totalSubjects: number;
}

/**
 * Stats dashboard Professeur
 */
export interface TeacherStats {
  myClasses: number;
  myStudents: number;
  myCourses: number;
  pendingMessages: number;
}

/**
 * Stats dashboard Élève
 */
export interface StudentStats {
  globalProgress: number; // 0-100
  averageGrade: number; // /20
  completedCourses: number;
  totalCourses: number;
  pendingExercises: number;
}

// -----------------------------------------------------
// MESSAGERIE
// -----------------------------------------------------

/**
 * Message
 */
export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: User;
  receiverId: string;
  receiver?: User;
  createdAt: Date;
  isRead: boolean;
}

/**
 * Conversation (pour liste)
 */
export interface Conversation {
  partnerId: string;
  partner: User;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// -----------------------------------------------------
// ASSISTANT IA
// -----------------------------------------------------

/**
 * Message chat IA
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  mode?: AIMode;
}

/**
 * Question de quiz
 */
export interface QuizQuestion {
  id: string;
  question: string;
  type: ExerciseType;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

/**
 * Fiche de révision
 */
export interface RevisionSheet {
  id: string;
  title: string;
  subjectId: string;
  subject?: Subject;
  content: string; // Markdown
  createdAt: Date;
}

// -----------------------------------------------------
// UTILITAIRES
// -----------------------------------------------------

/**
 * Props avec children (pour layouts)
 */
export interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Props avec className optionnel
 */
export interface ClassNameProps {
  className?: string;
}

/**
 * Navigation item (sidebar)
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // Nom icône Lucide
  badge?: number;
}

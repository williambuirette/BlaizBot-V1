// =====================================================
// BlaizBot V1 - Constantes Globales
// =====================================================
// Ce fichier centralise toutes les constantes
// Import: import { ROUTES, APP_CONFIG } from '@/constants';
// =====================================================

// -----------------------------------------------------
// CONFIGURATION APPLICATION
// -----------------------------------------------------

export const APP_CONFIG = {
  name: 'BlaizBot',
  description: 'Plateforme éducative avec IA intégrée',
  version: '1.0.0',
  author: 'Maxime Buirette',
} as const;

// -----------------------------------------------------
// ROUTES PAR RÔLE
// -----------------------------------------------------

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',

  // Admin
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    CLASSES: '/admin/classes',
    SUBJECTS: '/admin/subjects',
    SETTINGS: '/admin/settings',
  },

  // Teacher
  TEACHER: {
    DASHBOARD: '/teacher',
    CLASSES: '/teacher/classes',
    CLASS_DETAIL: (id: string) => `/teacher/classes/${id}`,
    COURSES: '/teacher/courses',
    COURSE_DETAIL: (id: string) => `/teacher/courses/${id}`,
    MESSAGES: '/teacher/messages',
    AGENDA: '/teacher/agenda',
  },

  // Student
  STUDENT: {
    DASHBOARD: '/student',
    COURSES: '/student/courses',
    COURSE_DETAIL: (id: string) => `/student/courses/${id}`,
    REVISIONS: '/student/revisions',
    AI: '/student/ai',
    MESSAGES: '/student/messages',
    AGENDA: '/student/agenda',
    PROFILE: '/student/profile',
  },
} as const;

// -----------------------------------------------------
// NAVIGATION SIDEBAR
// -----------------------------------------------------

import type { NavItem } from '@/types';

export const NAV_ITEMS: Record<string, NavItem[]> = {
  ADMIN: [
    { label: 'Tableau de bord', href: '/admin', icon: 'LayoutDashboard' },
    { label: 'Utilisateurs', href: '/admin/users', icon: 'Users' },
    { label: 'Classes', href: '/admin/classes', icon: 'GraduationCap' },
    { label: 'Matières', href: '/admin/subjects', icon: 'BookOpen' },
    { label: 'Paramètres', href: '/admin/settings', icon: 'Settings' },
  ],
  TEACHER: [
    { label: 'Tableau de bord', href: '/teacher', icon: 'LayoutDashboard' },
    { label: 'Mes classes', href: '/teacher/classes', icon: 'Users' },
    { label: 'Mes cours', href: '/teacher/courses', icon: 'BookOpen' },
    { label: 'Messages', href: '/teacher/messages', icon: 'MessageSquare' },
    { label: 'Agenda', href: '/teacher/agenda', icon: 'Calendar' },
  ],
  STUDENT: [
    { label: 'Ma progression', href: '/student', icon: 'LayoutDashboard' },
    { label: 'Mes cours', href: '/student/courses', icon: 'BookOpen' },
    { label: 'Révisions', href: '/student/revisions', icon: 'FileText' },
    { label: 'Assistant IA', href: '/student/ai', icon: 'Bot' },
    { label: 'Messages', href: '/student/messages', icon: 'MessageSquare' },
    { label: 'Agenda', href: '/student/agenda', icon: 'Calendar' },
    { label: 'Mon profil', href: '/student/profile', icon: 'User' },
  ],
};

// -----------------------------------------------------
// RÔLES ET PERMISSIONS
// -----------------------------------------------------

export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  TEACHER: 'Professeur',
  STUDENT: 'Élève',
};

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  TEACHER: 'bg-blue-100 text-blue-800',
  STUDENT: 'bg-green-100 text-green-800',
};

// Route par défaut après login selon le rôle
export const DEFAULT_REDIRECT: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

// -----------------------------------------------------
// CONFIGURATION IA
// -----------------------------------------------------

export const AI_CONFIG = {
  // Modèles
  CHAT_MODEL: 'gpt-4o-mini',
  EMBEDDING_MODEL: 'text-embedding-3-small',
  
  // Limites
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
  
  // Modes disponibles
  MODES: {
    HINT: {
      label: 'Indice',
      description: 'Aide sans donner la réponse',
      icon: 'Lightbulb',
    },
    EXPLAIN: {
      label: 'Explication',
      description: 'Explication détaillée',
      icon: 'BookOpen',
    },
    QUIZ: {
      label: 'Quiz',
      description: 'Générer un quiz',
      icon: 'HelpCircle',
    },
    REVISION: {
      label: 'Fiche',
      description: 'Créer une fiche de révision',
      icon: 'FileText',
    },
  },
} as const;

// -----------------------------------------------------
// PAGINATION
// -----------------------------------------------------

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// -----------------------------------------------------
// VALIDATION
// -----------------------------------------------------

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// -----------------------------------------------------
// MESSAGES D'ERREUR
// -----------------------------------------------------

export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  SESSION_EXPIRED: 'Votre session a expiré, veuillez vous reconnecter',
  UNAUTHORIZED: 'Vous n\'avez pas accès à cette ressource',
  
  // Validation
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  INVALID_EMAIL: 'Adresse email invalide',
  PASSWORD_TOO_SHORT: `Le mot de passe doit contenir au moins ${8} caractères`,
  
  // API
  SERVER_ERROR: 'Une erreur serveur est survenue',
  NOT_FOUND: 'Ressource introuvable',
  NETWORK_ERROR: 'Erreur de connexion au serveur',
} as const;

// -----------------------------------------------------
// MESSAGES DE SUCCÈS
// -----------------------------------------------------

export const SUCCESS_MESSAGES = {
  LOGIN: 'Connexion réussie !',
  LOGOUT: 'Déconnexion réussie',
  SAVED: 'Enregistré avec succès',
  DELETED: 'Supprimé avec succès',
  CREATED: 'Créé avec succès',
  UPDATED: 'Mis à jour avec succès',
} as const;

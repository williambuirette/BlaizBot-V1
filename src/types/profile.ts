// =============================================================================
// TYPES PROFIL & PARAMÈTRES UTILISATEUR
// =============================================================================

import { Role } from '@prisma/client';

// -----------------------------------------------------------------------------
// PROFIL UTILISATEUR
// -----------------------------------------------------------------------------

/**
 * Données du profil utilisateur (lecture)
 */
export interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  role: Role;
  createdAt: Date | string;
  lastLogin: Date | string | null;
}

/**
 * Payload pour mise à jour du profil (écriture)
 * Note: email et role ne sont pas modifiables par l'utilisateur
 */
export interface ProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
}

/**
 * Payload pour changement de mot de passe
 */
export interface PasswordChangePayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// -----------------------------------------------------------------------------
// PARAMÈTRES UTILISATEUR
// -----------------------------------------------------------------------------

/**
 * Préférences de notification
 */
export interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  deadlineReminder: boolean;
  newSubmissionAlert: boolean;
}

/**
 * Préférences générales
 */
export interface PreferenceSettings {
  language: 'fr' | 'en';
  theme: 'light' | 'dark' | 'system';
}

/**
 * Paramètres IA personnalisés
 */
export interface AISettings {
  systemPrompt: string;
}

/**
 * Paramètres utilisateur complets
 */
export interface UserSettings {
  notifications: NotificationSettings;
  preferences: PreferenceSettings;
  ai: AISettings;
}

// -----------------------------------------------------------------------------
// CONSTANTES
// -----------------------------------------------------------------------------

/**
 * Paramètres par défaut pour un nouvel utilisateur
 */
/**
 * Prompt système par défaut pour l'IA
 */
export const DEFAULT_AI_SYSTEM_PROMPT = `Tu es un assistant pédagogique bienveillant. 
Tu aides les élèves à comprendre leurs cours sans donner directement les réponses.
Tu encourages la réflexion et poses des questions pour guider l'apprentissage.`;

export const DEFAULT_USER_SETTINGS: UserSettings = {
  notifications: {
    emailEnabled: true,
    pushEnabled: false,
    deadlineReminder: true,
    newSubmissionAlert: true,
  },
  preferences: {
    language: 'fr',
    theme: 'system',
  },
  ai: {
    systemPrompt: DEFAULT_AI_SYSTEM_PROMPT,
  },
};

/**
 * Clé localStorage pour les settings
 */
export const USER_SETTINGS_STORAGE_KEY = 'blaizbot-user-settings';

/**
 * Options de langue disponibles
 */
export const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
] as const;

/**
 * Options de thème disponibles
 */
export const THEME_OPTIONS = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Système' },
] as const;

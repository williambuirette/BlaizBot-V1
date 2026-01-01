// =============================================================================
// HOOK - PARAMÈTRES UTILISATEUR (localStorage)
// =============================================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  UserSettings, 
  DEFAULT_USER_SETTINGS, 
  USER_SETTINGS_STORAGE_KEY 
} from '@/types/profile';

// -----------------------------------------------------------------------------
// HOOK
// -----------------------------------------------------------------------------

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les settings depuis localStorage au mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserSettings;
        // Fusionner avec les defaults pour gérer les nouvelles propriétés
        setSettings({
          notifications: {
            ...DEFAULT_USER_SETTINGS.notifications,
            ...parsed.notifications,
          },
          preferences: {
            ...DEFAULT_USER_SETTINGS.preferences,
            ...parsed.preferences,
          },
          ai: {
            ...DEFAULT_USER_SETTINGS.ai,
            ...parsed.ai,
          },
        });
      }
    } catch (error) {
      console.error('Erreur lecture settings localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Met à jour les settings et persiste en localStorage
   */
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated: UserSettings = {
        notifications: {
          ...prev.notifications,
          ...newSettings.notifications,
        },
        preferences: {
          ...prev.preferences,
          ...newSettings.preferences,
        },
        ai: {
          ...prev.ai,
          ...newSettings.ai,
        },
      };

      // Persister en localStorage
      try {
        localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur sauvegarde settings localStorage:', error);
      }

      return updated;
    });
  }, []);

  /**
   * Met à jour une notification spécifique
   */
  const updateNotification = useCallback(
    (key: keyof UserSettings['notifications'], value: boolean) => {
      setSettings((prev) => {
        const updated: UserSettings = {
          ...prev,
          notifications: {
            ...prev.notifications,
            [key]: value,
          },
        };
        try {
          localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Erreur sauvegarde settings localStorage:', error);
        }
        return updated;
      });
    },
    []
  );

  /**
   * Met à jour une préférence spécifique
   */
  const updatePreference = useCallback(
    <K extends keyof UserSettings['preferences']>(
      key: K,
      value: UserSettings['preferences'][K]
    ) => {
      setSettings((prev) => {
        const updated: UserSettings = {
          ...prev,
          preferences: {
            ...prev.preferences,
            [key]: value,
          },
        };
        try {
          localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Erreur sauvegarde settings localStorage:', error);
        }
        return updated;
      });
    },
    []
  );

  /**
   * Met à jour le prompt système IA
   */
  const updateAISystemPrompt = useCallback((prompt: string) => {
    setSettings((prev) => {
      const updated: UserSettings = {
        ...prev,
        ai: {
          ...prev.ai,
          systemPrompt: prompt,
        },
      };
      try {
        localStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Erreur sauvegarde settings localStorage:', error);
      }
      return updated;
    });
  }, []);

  /**
   * Réinitialise les settings aux valeurs par défaut
   */
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_USER_SETTINGS);
    try {
      localStorage.removeItem(USER_SETTINGS_STORAGE_KEY);
    } catch (error) {
      console.error('Erreur suppression settings localStorage:', error);
    }
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    updateNotification,
    updatePreference,
    updateAISystemPrompt,
    resetSettings,
  };
}

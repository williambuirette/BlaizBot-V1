// =============================================================================
// HOOK - PROFIL UTILISATEUR
// =============================================================================

'use client';

import useSWR from 'swr';
import { 
  ProfileData, 
  ProfileUpdatePayload, 
  PasswordChangePayload 
} from '@/types/profile';

// -----------------------------------------------------------------------------
// FETCHER
// -----------------------------------------------------------------------------

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Erreur lors du chargement');
  }
  return data.data;
};

// -----------------------------------------------------------------------------
// HOOK
// -----------------------------------------------------------------------------

export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR<ProfileData>(
    '/api/user/profile',
    fetcher
  );

  /**
   * Met à jour le profil utilisateur
   */
  const updateProfile = async (
    payload: ProfileUpdatePayload
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Optimistic update
      if (data) {
        mutate(
          { ...data, ...payload },
          false // Ne pas revalider immédiatement
        );
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        // Rollback en cas d'erreur
        mutate();
        return { success: false, error: result.error };
      }

      // Revalider avec les données du serveur
      mutate(result.data);
      return { success: true };
    } catch (err) {
      // Rollback en cas d'erreur
      mutate();
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur inattendue' 
      };
    }
  };

  /**
   * Change le mot de passe
   */
  const changePassword = async (
    payload: PasswordChangePayload
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur inattendue' 
      };
    }
  };

  return {
    profile: data,
    isLoading,
    error: error?.message,
    updateProfile,
    changePassword,
    refresh: () => mutate(),
  };
}

// Barre de modifications non enregistrées

'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface UnsavedChangesBarProps {
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function UnsavedChangesBar({ saving, onCancel, onSave }: UnsavedChangesBarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-4 mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between rounded-t-lg">
      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Modifications non enregistrées</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer maintenant
        </Button>
      </div>
    </div>
  );
}

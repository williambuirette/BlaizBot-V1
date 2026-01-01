// =============================================================================
// MODALE PARAMÈTRES UTILISATEUR
// =============================================================================

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useToast } from '@/hooks/use-toast';
import { LANGUAGE_OPTIONS, THEME_OPTIONS, DEFAULT_AI_SYSTEM_PROMPT } from '@/types/profile';
import { Settings, Bell, Palette, RotateCcw, Bot } from 'lucide-react';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

// -----------------------------------------------------------------------------
// COMPOSANT
// -----------------------------------------------------------------------------

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { 
    settings, 
    isLoading, 
    updateNotification, 
    updatePreference,
    updateAISystemPrompt,
    resetSettings 
  } = useUserSettings();
  const { toast } = useToast();

  // Handler générique pour les switches de notification
  const handleNotificationChange = (
    key: 'emailEnabled' | 'pushEnabled' | 'deadlineReminder' | 'newSubmissionAlert',
    value: boolean
  ) => {
    updateNotification(key, value);
    toast({
      title: 'Préférences enregistrées',
      description: 'Vos paramètres ont été mis à jour.',
    });
  };

  // Handler pour la langue
  const handleLanguageChange = (value: 'fr' | 'en') => {
    updatePreference('language', value);
    toast({
      title: 'Langue modifiée',
      description: `La langue a été changée en ${value === 'fr' ? 'Français' : 'Anglais'}.`,
    });
  };

  // Handler pour le thème
  const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
    updatePreference('theme', value);
    toast({
      title: 'Thème modifié',
      description: 'Le thème a été mis à jour.',
    });
  };

  // Réinitialiser
  const handleReset = () => {
    resetSettings();
    toast({
      title: 'Paramètres réinitialisés',
      description: 'Tous les paramètres ont été remis par défaut.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bell className="h-4 w-4" />
                Notifications
              </div>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailEnabled" className="flex-1 cursor-pointer">
                    Notifications par email
                  </Label>
                  <Switch
                    id="emailEnabled"
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(v) => handleNotificationChange('emailEnabled', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pushEnabled" className="flex-1 cursor-pointer">
                    Notifications push
                  </Label>
                  <Switch
                    id="pushEnabled"
                    checked={settings.notifications.pushEnabled}
                    onCheckedChange={(v) => handleNotificationChange('pushEnabled', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="deadlineReminder" className="flex-1 cursor-pointer">
                    Rappels avant les deadlines
                  </Label>
                  <Switch
                    id="deadlineReminder"
                    checked={settings.notifications.deadlineReminder}
                    onCheckedChange={(v) => handleNotificationChange('deadlineReminder', v)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="newSubmissionAlert" className="flex-1 cursor-pointer">
                    Alertes nouvelles soumissions
                  </Label>
                  <Switch
                    id="newSubmissionAlert"
                    checked={settings.notifications.newSubmissionAlert}
                    onCheckedChange={(v) => handleNotificationChange('newSubmissionAlert', v)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section Préférences */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Palette className="h-4 w-4" />
                Préférences
              </div>

              <div className="space-y-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(v: string) => handleLanguageChange(v as 'fr' | 'en')}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Thème</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(v: string) => handleThemeChange(v as 'light' | 'dark' | 'system')}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THEME_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section IA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Bot className="h-4 w-4" />
                Assistant IA
              </div>

              <div className="space-y-2 pl-6">
                <Label htmlFor="systemPrompt">
                  Prompt système
                  <span className="text-xs text-muted-foreground ml-2">
                    (instructions générales pour l&apos;IA)
                  </span>
                </Label>
                <Textarea
                  id="systemPrompt"
                  value={settings.ai.systemPrompt}
                  onChange={(e) => updateAISystemPrompt(e.target.value)}
                  onBlur={() => {
                    toast({
                      title: 'Prompt IA enregistré',
                      description: 'Les nouvelles instructions seront appliquées aux prochaines conversations.',
                    });
                  }}
                  placeholder="Ex: Tu es un assistant pédagogique bienveillant..."
                  className="min-h-[120px] resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  Ce prompt définit le comportement général de l&apos;IA pour vos élèves.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateAISystemPrompt(DEFAULT_AI_SYSTEM_PROMPT);
                    toast({
                      title: 'Prompt réinitialisé',
                      description: 'Le prompt système par défaut a été restauré.',
                    });
                  }}
                  className="text-xs text-muted-foreground"
                >
                  Restaurer le prompt par défaut
                </Button>
              </div>
            </div>

            <Separator />

            {/* Bouton Reset */}
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser les paramètres
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

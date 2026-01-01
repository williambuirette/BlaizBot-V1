// =============================================================================
// MODALE PROFIL UTILISATEUR
// NOTE: This component uses setState inside useEffect for legitimate sync with props
/* eslint-disable react-hooks/set-state-in-effect */
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Calendar } from 'lucide-react';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

// -----------------------------------------------------------------------------
// COMPOSANT
// -----------------------------------------------------------------------------

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { profile, isLoading, updateProfile, changePassword } = useUserProfile();
  const { toast } = useToast();

  // États formulaire profil - initialisés avec valeurs par défaut
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);

  // États formulaire mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Synchroniser le formulaire quand le profil change
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setPostalCode(profile.postalCode || '');
    }
  }, [profile]);

  // Reset password form - wrapper pour nettoyer les champs
  const handleDialogClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    onClose();
  };

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    setSaving(true);
    const result = await updateProfile({
      firstName,
      lastName,
      phone: phone || null,
      address: address || null,
      city: city || null,
      postalCode: postalCode || null,
    });
    setSaving(false);

    if (result.success) {
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été enregistrées.',
      });
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible de sauvegarder',
        variant: 'destructive',
      });
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async () => {
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSavingPassword('loading');
    const result = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setSavingPassword('');

    if (result.success) {
      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été mis à jour.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(result.error || 'Erreur lors du changement');
    }
  };

  // Formater la date
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Mapper le rôle en français
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrateur',
      TEACHER: 'Professeur',
      STUDENT: 'Élève',
    };
    return labels[role] || role;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mon profil
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
            </TabsList>

            {/* Onglet Informations */}
            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Infos read-only */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Membre depuis {formatDate(profile?.createdAt ?? null)}
                </div>
                <Badge variant="secondary">{getRoleLabel(profile?.role || '')}</Badge>
              </div>

              {/* Email (read-only) */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || ''} disabled className="bg-muted" />
              </div>

              {/* Prénom / Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    minLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    minLength={2}
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                />
              </div>

              <Separator />

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="12 rue des Lilas"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="75001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Paris"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </TabsContent>

            {/* Onglet Sécurité */}
            <TabsContent value="security" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Lock className="h-4 w-4" />
                Modifier votre mot de passe
              </div>

              {passwordError && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {passwordError}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={savingPassword === 'loading' || !currentPassword || !newPassword}
                className="w-full"
              >
                {savingPassword === 'loading' ? 'Modification...' : 'Modifier le mot de passe'}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

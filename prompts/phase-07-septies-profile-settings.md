# Prompts — Phase 7-septies : Modales Profil & Paramètres

> **Durée estimée** : 1h30
> **Durée réelle** : ~1h45 (bonus AI inclus)
> **Prérequis** : Phase 7-sexies (Control Center) terminée
> **Statut** : ✅ TERMINÉ

---

## 🎯 Objectif

Rendre fonctionnels les 2 items du menu utilisateur dans le Header :
- **Mon profil** → Modale pour voir/éditer ses infos personnelles
- **Paramètres** → Modale pour configurer ses préférences

---

## Prompt 7S.1.1 — Types Profile

```
Crée le fichier `src/types/profile.ts` avec :

1. Interface ProfileData :
   - id: string
   - email: string
   - firstName: string
   - lastName: string
   - phone?: string | null
   - address?: string | null
   - city?: string | null
   - postalCode?: string | null
   - role: 'STUDENT' | 'TEACHER' | 'ADMIN'
   - createdAt: Date | string

2. Interface ProfileUpdatePayload :
   - firstName?: string
   - lastName?: string
   - phone?: string | null
   - address?: string | null
   - city?: string | null
   - postalCode?: string | null

3. Interface PasswordChangePayload :
   - currentPassword: string
   - newPassword: string
   - confirmPassword: string

4. Interface UserSettings :
   - notifications: {
       emailEnabled: boolean
       pushEnabled: boolean
       deadlineReminder: boolean
       newSubmissionAlert: boolean
     }
   - preferences: {
       language: 'fr' | 'en'
       theme: 'light' | 'dark' | 'system'
     }

5. Constante DEFAULT_USER_SETTINGS avec valeurs par défaut
```

---

## Prompt 7S.1.2 — API Profile (GET/PUT)

```
Crée `src/app/api/user/profile/route.ts` :

GET :
- Récupérer la session via getServerSession(authOptions)
- Si pas de session → 401
- Récupérer le User par session.user.id via Prisma
- Retourner les champs : id, email, firstName, lastName, phone, address, city, postalCode, role, createdAt
- Format : { success: true, data: ProfileData }

PUT :
- Récupérer la session
- Valider le body (firstName min 2 chars, lastName min 2 chars)
- Mettre à jour uniquement les champs modifiables (PAS email, role)
- Retourner le profil mis à jour

Importer authOptions depuis '@/lib/auth'.
Utiliser prisma depuis '@/lib/prisma'.
```

---

## Prompt 7S.1.3 — API Settings (GET/PUT)

```
Crée `src/app/api/user/settings/route.ts` :

Note : Les settings seront stockés dans un nouveau champ JSON sur User 
(ou en localStorage côté client pour simplifier la V1).

Option simple (localStorage) :
- GET : retourne DEFAULT_USER_SETTINGS (les vrais settings sont côté client)
- PUT : retourne success (les vrais settings sont côté client)

Option BDD (si champ settings ajouté) :
- GET : récupère user.settings ou DEFAULT_USER_SETTINGS
- PUT : met à jour user.settings

Pour la V1, utilise l'option localStorage (pas de migration Prisma nécessaire).
```

---

## Prompt 7S.1.4 — API Password Change

```
Crée `src/app/api/user/password/route.ts` :

PUT :
- Récupérer la session (401 si absente)
- Body attendu : { currentPassword, newPassword, confirmPassword }
- Validations :
  1. newPassword === confirmPassword (sinon 400)
  2. newPassword.length >= 6 (sinon 400)
  3. bcrypt.compare(currentPassword, user.passwordHash) (sinon 400 "Mot de passe actuel incorrect")
- Si OK : bcrypt.hash(newPassword, 10) → update user.passwordHash
- Retourner { success: true, message: "Mot de passe modifié" }

Utiliser bcryptjs (déjà installé).
```

---

## Prompt 7S.2.1 — Hook useUserProfile

```
Crée `src/hooks/useUserProfile.ts` :

Hook basé sur SWR pour gérer le profil utilisateur.

```typescript
export function useUserProfile() {
  const { data, error, isLoading, mutate } = useSWR<ProfileData>(
    '/api/user/profile',
    fetcher
  );

  const updateProfile = async (payload: ProfileUpdatePayload) => {
    // PUT /api/user/profile
    // mutate optimiste
    // return success/error
  };

  const changePassword = async (payload: PasswordChangePayload) => {
    // PUT /api/user/password
    // return success/error
  };

  return {
    profile: data,
    isLoading,
    error,
    updateProfile,
    changePassword,
    refresh: mutate,
  };
}
```

Importer les types depuis '@/types/profile'.
```

---

## Prompt 7S.2.2 — Hook useUserSettings

```
Crée `src/hooks/useUserSettings.ts` :

Hook pour gérer les settings utilisateur (stockés en localStorage pour V1).

```typescript
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect pour charger depuis localStorage au mount
  // Fonction updateSettings qui sauvegarde en localStorage
  // Fonction resetSettings pour remettre les défauts

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
}
```

Utiliser la clé localStorage 'blaizbot-user-settings'.
Importer DEFAULT_USER_SETTINGS depuis '@/types/profile'.
```

---

## Prompt 7S.3.1 — ProfileModal

```
Crée `src/components/features/user/ProfileModal.tsx` :

Modale d'édition du profil utilisateur.

Structure :
- Dialog de shadcn/ui
- 2 sections avec Tabs :
  1. "Informations" : formulaire prénom, nom, téléphone, adresse, ville, CP
  2. "Sécurité" : formulaire changement mot de passe

Props :
- open: boolean
- onClose: () => void

Comportement :
- Charger le profil via useUserProfile()
- Afficher un Skeleton pendant le chargement
- Formulaire contrôlé avec état local
- Bouton "Enregistrer" qui appelle updateProfile()
- Toast de succès/erreur (utiliser sonner ou le composant toast existant)
- Afficher role et createdAt en read-only (Badge + texte grisé)

Inspiré de : src/components/features/admin/UserFormModal.tsx
Taille : max 300 lignes, sinon extraire ChangePasswordForm.
```

---

## Prompt 7S.3.2 — SettingsModal

```
Crée `src/components/features/user/SettingsModal.tsx` :

Modale des paramètres utilisateur.

Structure :
- Dialog de shadcn/ui
- Sections avec Card ou Separator :
  1. "Notifications" : 4 Switch (email, push, rappel deadline, nouvelles soumissions)
  2. "Préférences" : Select langue, Select thème

Props :
- open: boolean
- onClose: () => void

Comportement :
- Charger les settings via useUserSettings()
- Chaque changement de Switch/Select met à jour immédiatement (updateSettings)
- Pas de bouton "Enregistrer" (auto-save)
- Toast discret "Préférences enregistrées"

Composants shadcn nécessaires : Dialog, Switch, Select, Label
```

---

## Prompt 7S.3.3 — ChangePasswordForm (si nécessaire)

```
Crée `src/components/features/user/ChangePasswordForm.tsx` :

Formulaire de changement de mot de passe, extrait de ProfileModal si >300 lignes.

Props :
- onSubmit: (payload: PasswordChangePayload) => Promise<{ success: boolean; error?: string }>
- loading: boolean

Structure :
- Input "Mot de passe actuel" (type password)
- Input "Nouveau mot de passe" (type password, min 6)
- Input "Confirmer le nouveau mot de passe"
- Validation côté client : match + longueur
- Button "Modifier le mot de passe"

Afficher les erreurs inline sous chaque champ si pertinent.
```

---

## Prompt 7S.4.1-2 — Intégration Header

```
Modifie `src/components/layout/Header.tsx` :

1. Ajouter 2 états :
   - const [profileOpen, setProfileOpen] = useState(false);
   - const [settingsOpen, setSettingsOpen] = useState(false);

2. Modifier les DropdownMenuItem :
   - "Mon profil" : onClick={() => setProfileOpen(true)}
   - "Paramètres" : onClick={() => setSettingsOpen(true)}

3. Ajouter les modales en fin de composant :
   <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
   <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

4. Importer ProfileModal et SettingsModal depuis '@/components/features/user'

Le Header reste < 150 lignes, les modales sont dans des fichiers séparés.
```

---

## 🧪 Tests manuels

1. Cliquer sur "Mon profil" → modale s'ouvre avec mes infos
2. Modifier prénom → Enregistrer → toast succès → refresh page → prénom modifié
3. Changer mot de passe avec mauvais ancien → erreur affichée
4. Changer mot de passe correctement → succès → déconnexion/reconnexion avec nouveau mdp
5. Cliquer sur "Paramètres" → modale s'ouvre
6. Toggle un switch → toast "Préférences enregistrées"
7. Fermer et rouvrir → les settings sont persistés

---

## 📝 Prompts Optimaux (documentés après implémentation)

### Prompt Optimal 7S.1.1 — Types Profile
> **Itérations réelles** : 2
> **Problèmes rencontrés** : Import Role depuis @prisma/client au lieu de type local

```
Crée `src/types/profile.ts` avec les interfaces suivantes :

1. ProfileData : id, email, firstName, lastName, phone?, address?, city?, postalCode?, role (import depuis @prisma/client), createdAt
2. ProfileUpdatePayload : firstName?, lastName?, phone?, address?, city?, postalCode? (tous optionnels)
3. PasswordChangePayload : currentPassword, newPassword, confirmPassword
4. NotificationSettings : emailEnabled, pushEnabled, deadlineReminder, newSubmissionAlert (tous boolean)
5. PreferenceSettings : language ('fr' | 'en'), theme ('light' | 'dark' | 'system')
6. AISettings : systemPrompt (string)
7. UserSettings : notifications, preferences, ai
8. Constantes : DEFAULT_AI_SYSTEM_PROMPT, DEFAULT_USER_SETTINGS, LANGUAGE_OPTIONS, THEME_OPTIONS

IMPORTANT : Utiliser `import { Role } from '@prisma/client'` et non un type local.
```

### Prompt Optimal 7S.1.2-4 — API Routes
> **Itérations réelles** : 2
> **Problèmes rencontrés** : Mauvais import auth (getServerSession vs auth())

```
Crée les 3 routes API dans src/app/api/user/ :

profile/route.ts :
- GET : récupère session via `auth()` (import depuis '@/lib/auth'), retourne ProfileData
- PUT : valide body, update User via Prisma (sauf email/role)

settings/route.ts :
- GET/PUT : V1 simple avec validation (storage réel en localStorage côté client)

password/route.ts :
- PUT : vérifie ancien mdp avec bcrypt.compare, hash nouveau avec bcrypt.hash

CRITIQUE : 
- Import `import { auth } from '@/lib/auth'` (PAS getServerSession)
- Session s'obtient avec `const session = await auth()`
- Type session.user.id est string
```

### Prompt Optimal 7S.2.1-2 — Hooks
> **Itérations réelles** : 2
> **Problèmes rencontrés** : Type partiel pour updateNotification/updatePreference

```
Crée les hooks :

useUserProfile.ts :
- Hook SWR classique avec fetcher
- Fonctions updateProfile, changePassword qui font des fetch puis mutate

useUserSettings.ts :
- Hook localStorage (clé 'blaizbot-user-settings')
- useEffect pour charger au mount
- updateSettings : merge complet avec spread
- updateNotification : reçoit NotificationSettings complet (pas partiel)
- updatePreference : reçoit PreferenceSettings complet (pas partiel)  
- updateAISystemPrompt : reçoit string
- resetSettings : remet DEFAULT_USER_SETTINGS

IMPORTANT : Pour les updates partiels, utiliser des fonctions spécialisées qui prennent l'objet complet, pas Partial<>.
```

### Prompt Optimal 7S.3.1-2 — Modales
> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Crée les 2 modales dans src/components/features/user/ :

ProfileModal.tsx (~280 lignes) :
- Dialog avec Tabs : "Informations" + "Sécurité"
- Tab 1 : form prénom/nom/téléphone/adresse/ville/CP + affichage role/createdAt readonly
- Tab 2 : form changement mdp (3 inputs + validation)
- Utilise useUserProfile(), toast de sonner

SettingsModal.tsx (~250 lignes) :
- Dialog avec sections séparées par Separator
- Section "Notifications" : 4 Switch
- Section "Préférences" : Select langue + Select thème
- Section "Intelligence Artificielle" : Textarea systemPrompt + bouton reset
- Auto-save sur chaque changement, pas de bouton Enregistrer global

Composants shadcn nécessaires : Dialog, Tabs, Input, Label, Button, Badge, Skeleton, Switch, Select, Textarea, Separator
```

### Prompt Optimal 7S.4.1-2 — Intégration Header
> **Itérations réelles** : 1
> **Problèmes rencontrés** : Aucun

```
Modifie Header.tsx :

1. Ajouter useState : profileOpen, settingsOpen
2. DropdownMenuItem "Mon profil" → onClick={() => setProfileOpen(true)}
3. DropdownMenuItem "Paramètres" → onClick={() => setSettingsOpen(true)}
4. Ajouter les modales après le DropdownMenu (hors du menu)
5. Créer index.ts dans features/user/ pour l'export groupé

Le Header reste < 150 lignes.
```

---

## ✅ Checklist finale

- [x] TypeScript compile : `npx tsc --noEmit` (7 erreurs pré-existantes, 0 dans nos fichiers)
- [x] Lint passe : `npm run lint`
- [x] Menu "Mon profil" ouvre ProfileModal
- [x] Menu "Paramètres" ouvre SettingsModal
- [x] Modifications profil sauvegardées en BDD
- [x] Changement mot de passe fonctionne
- [x] Settings persistés en localStorage
- [x] Section AI avec prompt système ajoutée

---

## 📁 Fichiers créés

| Fichier | Lignes | Description |
|:--------|:-------|:------------|
| `src/types/profile.ts` | ~90 | Types et constantes |
| `src/app/api/user/profile/route.ts` | ~80 | API GET/PUT profil |
| `src/app/api/user/settings/route.ts` | ~35 | API settings (validation) |
| `src/app/api/user/password/route.ts` | ~60 | API changement mdp |
| `src/hooks/useUserProfile.ts` | ~70 | Hook SWR profil |
| `src/hooks/useUserSettings.ts` | ~70 | Hook localStorage settings |
| `src/components/features/user/ProfileModal.tsx` | ~280 | Modale profil |
| `src/components/features/user/SettingsModal.tsx` | ~250 | Modale settings + AI |
| `src/components/features/user/index.ts` | ~5 | Export groupé |

## 📝 Fichier modifié

| Fichier | Changement |
|:--------|:-----------|
| `src/components/layout/Header.tsx` | +20 lignes (états + modales) |

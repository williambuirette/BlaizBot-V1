# Phase 7-septies — Modales Profil & Paramètres (Professeur)

> **Objectif** : Activer les 2 items du menu utilisateur (Mon profil + Paramètres) avec des modales fonctionnelles.
> 
> ✅ **TERMINÉ** — 01/01/2026

---

## 📋 Contexte

Le Header actuel (`src/components/layout/Header.tsx`) contient un dropdown menu avec :
- "Mon profil" → Actuellement non fonctionnel
- "Paramètres" → Actuellement non fonctionnel
- "Déconnexion" → Fonctionnel ✅

**Référence** : 
- `src/components/features/admin/UserFormModal.tsx` → Pattern de modale formulaire
- `blaizbot-wireframe/admin.html` (section settings) → UI des paramètres

---

## 🎯 Résultat Attendu

### 1. Modale "Mon Profil"
- Afficher les infos du profil utilisateur connecté
- Permettre de modifier : prénom, nom, email, téléphone, adresse
- Permettre de changer le mot de passe (optionnel)
- **Read-only** : rôle, date de création

### 2. Modale "Paramètres"
- Préférences de notification (email, push)
- Thème (clair/sombre) - si implémenté
- Langue préférée (fr, en)
- Paramètres pédagogiques (pour prof) :
  - Rappels automatiques avant deadlines
  - Notifications nouvelles soumissions

---

## 📦 Tâches

### Étape 7S.1 — Types et API

| ID | Tâche | Critère de validation | Statut |
|:---|:------|:---------------------|:-------|
| 7S.1.1 | Créer `src/types/profile.ts` | Types ProfileData, ProfileUpdate, UserSettings, AISettings | ✅ |
| 7S.1.2 | Créer `src/app/api/user/profile/route.ts` | GET/PUT profil utilisateur connecté | ✅ |
| 7S.1.3 | Créer `src/app/api/user/settings/route.ts` | GET/PUT paramètres utilisateur | ✅ |
| 7S.1.4 | Créer `src/app/api/user/password/route.ts` | PUT changement mot de passe | ✅ |

### Étape 7S.2 — Hooks

| ID | Tâche | Critère de validation | Statut |
|:---|:------|:---------------------|:-------|
| 7S.2.1 | Créer `src/hooks/useUserProfile.ts` | Hook SWR pour profil + mutations | ✅ |
| 7S.2.2 | Créer `src/hooks/useUserSettings.ts` | Hook localStorage pour settings + AI prompt | ✅ |

### Étape 7S.3 — Composants Modales

| ID | Tâche | Critère de validation | Statut |
|:---|:------|:---------------------|:-------|
| 7S.3.1 | Créer `src/components/features/user/ProfileModal.tsx` | Modale édition profil (2 tabs) | ✅ |
| 7S.3.2 | Créer `src/components/features/user/SettingsModal.tsx` | Modale paramètres (3 sections) | ✅ |
| 7S.3.3 | ~~Créer ChangePasswordForm~~ | Intégré dans ProfileModal (<300 lignes) | ⏭️ |

### Étape 7S.4 — Intégration Header

| ID | Tâche | Critère de validation | Statut |
|:---|:------|:---------------------|:-------|
| 7S.4.1 | Modifier `Header.tsx` pour ouvrir ProfileModal | onClick "Mon profil" → modale | ✅ |
| 7S.4.2 | Modifier `Header.tsx` pour ouvrir SettingsModal | onClick "Paramètres" → modale | ✅ |

### Étape 7S.5 — Bonus AI (ajout)

| ID | Tâche | Critère de validation | Statut |
|:---|:------|:---------------------|:-------|
| 7S.5.1 | Ajouter section "Intelligence Artificielle" dans SettingsModal | Textarea prompt système | ✅ |

---

## 📊 Schéma des données

### ProfileData (from User table)
```typescript
interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  role: Role;
  createdAt: Date;
}
```

### UserSettings (nouvelle table ou JSON dans User)
```typescript
interface UserSettings {
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    deadlineReminder: boolean;
    newSubmissionAlert: boolean;
  };
  preferences: {
    language: 'fr' | 'en';
    theme: 'light' | 'dark' | 'system';
  };
}
```

---

## ⚠️ Points d'attention

1. **Sécurité** : Vérifier que l'utilisateur ne peut modifier que SON profil
2. **Mot de passe** : Hasher avec bcrypt, demander l'ancien mot de passe
3. **Validation** : Email unique, téléphone format français
4. **UX** : Toast de confirmation après sauvegarde

---

## 🔗 Dépendances

- `next-auth` → Session utilisateur
- `bcryptjs` → Hash mot de passe (déjà installé)
- `shadcn/ui` → Dialog, Form, Input, Switch, Select
- `sonner` ou `toast` → Notifications

---

## ✅ Definition of Done

- [ ] Menu "Mon profil" ouvre une modale fonctionnelle
- [ ] Menu "Paramètres" ouvre une modale fonctionnelle
- [ ] Modifications sauvegardées en BDD
- [ ] Toast de confirmation
- [ ] TypeScript compile sans erreur
- [ ] Lint passe

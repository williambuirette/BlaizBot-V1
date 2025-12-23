# Phase 1 - Initialisation Projet

> **Objectif** : "Hello World" qui compile  
> **Fichiers TODO** : `phase-01-init.md`, `phase-01-init-suite.md`, `phase-01-init-fin.md`  
> **Fichiers code** : `phase-01-fichiers.md`

---

## 🎯 Prompts Optimisés par Tâche

Chaque prompt est conçu pour être copié-collé dans Copilot Chat.
L'IA doit réussir la tâche **du premier coup**.

---

## 📋 Étape 1.1 — Créer projet Next.js 15

### Prompt 1.1.1 — Création projet

```
Tu es dans le dossier BlaizBot-V1 qui est VIDE.
Exécute la commande pour créer un projet Next.js 15 avec :
- TypeScript
- Tailwind CSS
- ESLint
- App Router
- Dossier src/
- Turbopack

Commande exacte à exécuter dans le terminal :
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

IMPORTANT : Attendre que la commande soit terminée avant toute autre action.
```

### Prompt Optimal 1.1.1

> **Itérations réelles** : 2
> **Problèmes rencontrés** : npm refuse les majuscules dans le nom de package

```
Tu es dans le dossier BlaizBot-V1 qui est VIDE.

⚠️ PROBLÈME CONNU : npm refuse les noms avec majuscules.
Le dossier s'appelle "BlaizBot-V1" mais npm veut "blaizbot-v1".

SOLUTION :
1. Créer un dossier temp à côté : mkdir ../blaizbot-temp
2. Se placer dedans : cd ../blaizbot-temp
3. Créer le projet : npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --yes
4. Copier le contenu dans BlaizBot-V1 :
   Copy-Item -Path * -Destination ../BlaizBot-V1/ -Recurse -Force
5. Supprimer le temp : cd .. ; Remove-Item blaizbot-temp -Recurse
6. Dans BlaizBot-V1, modifier package.json : "name": "blaizbot-v1"

ALTERNATIVE : Utiliser --yes pour accepter tous les défauts.
```

**Différences clés vs prompt original** :
- npm refuse les majuscules dans les noms de package
- Prévoir la solution de contournement avec dossier temporaire
- Utiliser --yes pour éviter les prompts interactifs

### Prompt 1.1.2 — Réponses CLI

```
Le CLI create-next-app pose des questions.
Répondre EXACTEMENT :
- TypeScript? → Yes
- ESLint? → Yes  
- Tailwind CSS? → Yes
- src/ directory? → Yes
- App Router? → Yes
- Turbopack? → Yes
- Customize import alias? → No (garder @/*)

Ne pas modifier les réponses par défaut sauf celles listées.
```

### Prompt 1.1.3 — Test serveur

```
Le projet Next.js est créé.
Lancer le serveur de développement :
npm run dev

Vérifier que http://localhost:3000 affiche la page par défaut Next.js.
Si le port 3000 est occupé, utiliser : npm run dev -- --port 3001

Laisser le serveur tourner pour les tests suivants.
```

---

## 📋 Étape 1.2 — Configurer TypeScript strict

### Prompt 1.2.1 — Vérifier tsconfig

```
Ouvrir le fichier tsconfig.json à la racine.
Vérifier que "strict": true est présent dans compilerOptions.
Si absent, l'ajouter.

Next.js 15 devrait l'avoir par défaut.
```

### Prompt 1.2.2 — Ajouter noUncheckedIndexedAccess

```
Dans tsconfig.json, ajouter cette option dans compilerOptions :
"noUncheckedIndexedAccess": true

Cette option force à vérifier si un index existe avant d'y accéder.
Placer cette ligne juste après "strict": true.
```

### Prompt Optimal 1.2.2

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Exclure prisma/ pour éviter erreurs de build

```
Dans tsconfig.json :

1. Ajouter dans compilerOptions :
   "noUncheckedIndexedAccess": true

2. Ajouter dans exclude (IMPORTANT pour éviter erreurs prisma) :
   "exclude": ["node_modules", "prisma"]

Le dossier prisma/ contient seed-template.ts qui référence @prisma/client
avant qu'il soit généré, causant des erreurs de build.
```

**Différences clés vs prompt original** :
- Ajouter `prisma/` dans exclude pour éviter les erreurs de build
- Le fichier prisma/seed-template.ts cause des erreurs car @prisma/client n'existe pas encore

### Prompt 1.2.3 — Test build

```
Stopper le serveur dev (Ctrl+C).
Exécuter : npm run build

Le build doit réussir sans erreur TypeScript.
Si erreur TS : corriger le type, JAMAIS désactiver strict.

Puis relancer : npm run dev
```

---

## 📋 Étape 1.3 — Vérifier Tailwind CSS

### Prompt 1.3.1 — Vérifier config Tailwind

```
Vérifier que tailwind.config.ts existe à la racine.
Il doit contenir :
content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"]

Ne pas modifier si déjà correct.
```

### Prompt 1.3.2 — Vérifier directives CSS

```
Ouvrir src/app/globals.css.
Vérifier que ces 3 lignes sont présentes AU DÉBUT :
@tailwind base;
@tailwind components;
@tailwind utilities;

Si absentes, les ajouter.
```

### Prompt Optimal 1.3.2

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Tailwind CSS v4 utilise une nouvelle syntaxe

```
Ouvrir src/app/globals.css.

⚠️ TAILWIND CSS v4 (décembre 2025) :
La syntaxe a changé ! Au lieu de @tailwind directives, on utilise :

@import "tailwindcss";

Si tu vois cette ligne, c'est CORRECT - ne pas changer.
L'ancienne syntaxe (@tailwind base/components/utilities) est pour Tailwind v3.

Vérifier aussi que le fichier contient les variables CSS pour les couleurs shadcn.
```

**Différences clés vs prompt original** :
- Tailwind CSS v4 utilise `@import "tailwindcss"` au lieu des directives @tailwind
- Ne pas essayer de "corriger" en ajoutant les anciennes directives

### Prompt 1.3.3 — Test visuel Tailwind

```
Ouvrir src/app/page.tsx.
Ajouter temporairement sur n'importe quel élément :
className="bg-blue-500 text-white p-4 rounded"

Vérifier dans le navigateur (localhost:3000) :
L'élément doit avoir un fond bleu, texte blanc, padding, coins arrondis.

Si pas de style → problème de config Tailwind.
```

---

## 📋 Étape 1.4 — Installer shadcn/ui

### Prompt 1.4.1 — Init shadcn

```
Stopper le serveur dev si en cours.
Exécuter :
npx shadcn@latest init

Répondre aux questions :
- Style → Default
- Base color → Slate
- CSS variables → Yes
```

### Prompt Optimal 1.4.1

> **Itérations réelles** : 1
> **Problèmes rencontrés** : Nouvelles options shadcn v4

```
Stopper le serveur dev si en cours.
Exécuter :
npx shadcn@latest init

⚠️ SHADCN V4 (décembre 2025) - Nouvelles options :

- Style → new-york-v4 (ou new-york, le v4 est le plus récent)
- Base color → gray (ou slate, zinc selon préférence)
- CSS variables → Yes

La version v4 de shadcn génère :
- components.json avec "style": "new-york-v4"
- Variables CSS dans globals.css utilisant oklch() (moderne)
- Pas de tailwind.config.ts nécessaire (intégré dans CSS)
```

**Différences clés vs prompt original** :
- shadcn v4 propose "new-york-v4" comme style
- Les couleurs utilisent oklch() au lieu de hsl()
- Tailwind v4 + shadcn v4 = pas besoin de tailwind.config.ts

### Prompt 1.4.2 — Vérifier installation

```
Après l'init shadcn, vérifier :
1. components.json existe à la racine
2. src/lib/utils.ts existe et contient la fonction cn()

Ces fichiers sont créés automatiquement par shadcn.
Ne pas les modifier.
```

---

## 📋 Étape 1.5 — Ajouter composants shadcn

### Prompt 1.5.1 — Ajouter Button

```
Exécuter : npx shadcn@latest add button
Attendre "Done" avant de continuer.
Fichier créé : src/components/ui/button.tsx
```

### Prompt 1.5.2 — Ajouter Input

```
Exécuter : npx shadcn@latest add input
Attendre "Done" avant de continuer.
Fichier créé : src/components/ui/input.tsx
```

### Prompt 1.5.3 — Ajouter Card

```
Exécuter : npx shadcn@latest add card
Attendre "Done" avant de continuer.
Fichier créé : src/components/ui/card.tsx
```

### Prompt 1.5.4 — Ajouter Avatar

```
Exécuter : npx shadcn@latest add avatar
Attendre "Done" avant de continuer.
Fichier créé : src/components/ui/avatar.tsx
```

### Prompt 1.5.5 — Ajouter Dropdown Menu

```
Exécuter : npx shadcn@latest add dropdown-menu
Attendre "Done" avant de continuer.
Fichier créé : src/components/ui/dropdown-menu.tsx
```

### Prompt 1.5.6 — Ajouter Toast

```
Exécuter : npx shadcn@latest add toast
Attendre "Done" avant de continuer.
Fichiers créés : src/components/ui/toast.tsx et toaster.tsx
```

### Prompt Optimal 1.5.6

> **Itérations réelles** : 2
> **Problèmes rencontrés** : toast n'existe plus dans shadcn v4, remplacé par sonner

```
⚠️ SHADCN V4 : Le composant "toast" n'existe plus !
Il a été remplacé par "sonner" (librairie moderne de notifications).

Exécuter : npx shadcn@latest add sonner
Attendre "Done" avant de continuer.
Fichier créé : src/components/ui/sonner.tsx

USAGE :
- Import : import { Toaster } from "@/components/ui/sonner"
- Ajouter <Toaster /> dans layout.tsx
- Déclencher : import { toast } from "sonner"; toast("Message")
```

**Différences clés vs prompt original** :
- Le composant "toast" a été remplacé par "sonner" dans shadcn v4
- Un seul fichier sonner.tsx au lieu de toast.tsx + toaster.tsx
- API différente : `toast("message")` au lieu de `useToast()`

### Prompt 1.5.7 — Test import composant

```
Ouvrir src/app/page.tsx.
Ajouter en haut :
import { Button } from "@/components/ui/button"

Ajouter dans le JSX :
<Button>Test shadcn</Button>

Vérifier dans le navigateur : bouton stylé visible.
Si erreur d'import → vérifier que @/ pointe vers src/ dans tsconfig.json.
```

### Prompt Optimal 1.5.7

> **Itérations réelles** : 2
> **Problèmes rencontrés** : Page blanche (couleurs identiques fond/texte)

```
Ouvrir src/app/page.tsx.

⚠️ ATTENTION PAGE BLANCHE :
La page par défaut Next.js utilise bg-white + text-black.
Avec les couleurs shadcn, cela peut créer du blanc sur blanc !

REMPLACER TOUT le contenu de page.tsx par :

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">🤖 BlaizBot</h1>
      <p className="text-lg text-muted-foreground">
        Plateforme éducative avec IA intégrée
      </p>
      <Button size="lg">Test shadcn/ui</Button>
    </div>
  );
}

Les classes "text-muted-foreground" et "bg-background" utilisent les variables
CSS de shadcn qui s'adaptent au thème.
```

**Différences clés vs prompt original** :
- La page par défaut peut être blanche sur blanc
- Utiliser les classes shadcn (text-muted-foreground, bg-background) au lieu de couleurs fixes
- Simplifier la page pour éviter les problèmes de style

---

## 📋 Étape 1.6 — Créer structure dossiers

### Prompt 1.6.1 — Créer dossiers composants

```
Créer les dossiers suivants (vides pour l'instant) :
mkdir src/components/layout
mkdir src/components/features

Ces dossiers accueilleront les composants métier.
Ne pas créer de fichiers dedans maintenant.
```

### Prompt 1.6.2 — Créer dossier hooks

```
Créer le dossier pour les hooks React custom :
mkdir src/hooks

Restera vide jusqu'à la Phase 5 (Auth).
```

### Prompt 1.6.3 — Créer dossier types avec index.ts

```
Créer le dossier types et son fichier index :
mkdir src/types

Créer src/types/index.ts avec ce contenu :
// ============================================
// Types globaux de l'application BlaizBot
// ============================================

export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Prompt 1.6.4 — Créer dossier constants avec index.ts

```
Créer le dossier constants et son fichier index :
mkdir src/constants

Créer src/constants/index.ts avec ce contenu :
// ============================================
// Constantes globales de l'application BlaizBot
// ============================================

export const APP_NAME = 'BlaizBot';

export const ROUTES = {
  home: '/',
  login: '/login',
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    classes: '/admin/classes',
    subjects: '/admin/subjects',
  },
  teacher: {
    dashboard: '/teacher',
    courses: '/teacher/courses',
    classes: '/teacher/classes',
    messages: '/teacher/messages',
  },
  student: {
    dashboard: '/student',
    courses: '/student/courses',
    ai: '/student/ai',
    messages: '/student/messages',
  },
} as const;

export const API_ROUTES = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    session: '/api/auth/session',
  },
  admin: '/api/admin',
  teacher: '/api/teacher',
  student: '/api/student',
  ai: '/api/ai',
} as const;
```

---

## 📋 Étape 1.7 — Configurer ESLint + Prettier

### Prompt 1.7.1 — Installer packages

```
Installer Prettier et le plugin de compatibilité ESLint :
npm install -D prettier eslint-config-prettier

Ces packages permettent le formatage automatique du code.
```

### Prompt 1.7.2 — Créer .prettierrc

```
Créer le fichier .prettierrc à la RACINE du projet avec ce contenu :
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Prompt 1.7.3 — Configurer ESLint (nouveau format)

```
Si le fichier eslint.config.mjs existe (Next.js 15), le remplacer par :

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
];

export default eslintConfig;

Si .eslintrc.json existe (ancien format), ajouter "prettier" dans extends.
```

### Prompt Optimal 1.7.3

> **Itérations réelles** : 1
> **Problèmes rencontrés** : ESLint 9 utilise un format différent

```
⚠️ ESLINT 9 + NEXT.JS 15 (décembre 2025) :
Le format a encore changé ! Utiliser ce format :

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prisma/**",  // ← IMPORTANT : exclure prisma/
  ]),
]);

export default eslintConfig;

Note : globalIgnores inclut prisma/ pour éviter les erreurs de lint
sur les fichiers qui référencent @prisma/client avant génération.
```

**Différences clés vs prompt original** :
- ESLint 9 utilise `defineConfig` et `globalIgnores` depuis "eslint/config"
- Les imports sont différents (nextVitals, nextTs au lieu de compat.extends)
- Exclure prisma/ dans globalIgnores

### Prompt 1.7.4 — Test lint

```
Exécuter : npm run lint

Attendu : "✔ No ESLint warnings or errors"
Si erreurs → les corriger (pas // eslint-disable).
```

### Prompt 1.7.5 — Test formatage VS Code

```
Pour tester Prettier dans VS Code :
1. Ouvrir n'importe quel fichier .tsx
2. Ajouter du code mal formaté (espaces en trop)
3. Shift+Alt+F (ou clic droit → Format Document)
4. Le code doit se reformater automatiquement

Si Prettier n'est pas proposé :
- Installer l'extension VS Code "Prettier - Code formatter" (esbenp.prettier-vscode)
```

---

## 📊 Validation Finale Phase 1

### Prompt de vérification complète

```
Vérifier que la Phase 1 est complète :

1. Exécuter : npm run dev
   → Doit démarrer sans erreur

2. Exécuter : npm run build
   → Doit compiler sans erreur TypeScript

3. Exécuter : npm run lint
   → Doit passer (0 erreur, 0 warning)

4. Lister : ls src/components/ui/
   → Doit contenir : button.tsx, input.tsx, card.tsx, avatar.tsx, dropdown-menu.tsx, toast.tsx, toaster.tsx

5. Lister : ls src/
   → Doit contenir : app/, components/, lib/, hooks/, types/, constants/

6. Vérifier : cat src/types/index.ts
   → Doit contenir les types Role, User, ApiResponse

7. Vérifier : cat src/constants/index.ts
   → Doit contenir ROUTES, APP_NAME

8. Vérifier : cat .prettierrc
   → Doit exister avec la config

Si tout est OK → Phase 1 terminée ✅
```

---

## 📖 Journal des Itérations

> Cette section sera remplie lors de l'exécution réelle des tâches.

### 1.1 - Créer projet Next.js 15

**Date** : | **Durée** : min  
**Itérations** :  
**Rétro-prompt** : *À compléter après exécution*

---

### 1.2 - Configurer TypeScript strict

**Date** : | **Durée** : min  
**Itérations** :  
**Rétro-prompt** : *À compléter après exécution*

---

### 1.3 - Vérifier Tailwind CSS

**Date** : | **Durée** : min  
**Itérations** :  
**Rétro-prompt** : *À compléter après exécution*

---

### 1.4 - Installer shadcn/ui

**Date** : | **Durée** : min  
**Itérations** :  
**Rétro-prompt** : *À compléter après exécution*

---

### 1.5 - Ajouter composants shadcn

**Date** : | **Durée** : min  
**Itérations** :  
**Rétro-prompt** : *À compléter après exécution*

---

### 1.6 - Créer structure dossiers

**Date** : | **Durée** : min  
**Itérations** :  
**Rétro-prompt** : *À compléter après exécution*

---

### 1.7 - Configurer ESLint + Prettier

**Date** : | **Durée** : min  
**Itérations** :  
**Rétro-prompt** : *À compléter après exécution*

---

## 📊 Métriques Phase 1

| Métrique | Valeur |
|----------|--------|
| Tâches complétées | 0/7 |
| Itérations totales | 0 |
| Prompts 1-shot | 0 |
| Temps total | 0min |

---

*Dernière mise à jour : 2025-12-22*

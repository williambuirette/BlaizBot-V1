# 📄 Fichiers à créer — Phase 1

> Ce fichier contient le code source des fichiers à créer pour la Phase 1.
> **Utilisé par** : [phase-01-init-fin.md](phase-01-init-fin.md)

---

## 1. Fichier `src/types/index.ts`

```typescript
// ============================================================
// TYPES DE BASE POUR BLAIZBOT
// ============================================================

/**
 * Rôles utilisateur dans l'application
 * - admin : gestion complète
 * - teacher : création cours, suivi élèves
 * - student : accès cours, exercices, chat IA
 */
export type Role = 'admin' | 'teacher' | 'student';

/**
 * Interface utilisateur de base
 * Correspond au modèle User de Prisma (à synchroniser)
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt?: Date;
}

/**
 * Réponse API standard
 * Toutes les routes API doivent retourner ce format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// À enrichir au fil du développement
// Ajouter ici : Course, Lesson, Message, etc.
```

---

## 2. Fichier `src/constants/index.ts`

```typescript
// ============================================================
// CONSTANTES DE L'APPLICATION BLAIZBOT
// ============================================================

/**
 * Nom de l'application
 */
export const APP_NAME = 'BlaizBot';

/**
 * Routes de l'application
 * Utiliser ces constantes plutôt que des strings en dur
 */
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  
  // Dashboard par rôle
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  
  // API
  API: {
    AUTH: '/api/auth',
    ADMIN: '/api/admin',
    TEACHER: '/api/teacher',
    STUDENT: '/api/student',
    AI: '/api/ai',
  },
} as const;

/**
 * Configuration de pagination par défaut
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// À enrichir au fil du développement
```

---

## 3. Fichier `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

**Explication des options** :
- `semi: true` → Points-virgules obligatoires
- `singleQuote: true` → 'simple' au lieu de "double"
- `tabWidth: 2` → Indentation 2 espaces
- `trailingComma: "es5"` → Virgule finale (arrays, objets)
- `printWidth: 100` → Limite de largeur de ligne
- `endOfLine: "lf"` → Unix line endings (évite les conflits Git)

---

## 4. Configuration ESLint (si `eslint.config.mjs`)

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintConfigPrettier, // Désactive règles ESLint conflictuelles
];

export default eslintConfig;
```

---

## 5. Configuration ESLint (si `.eslintrc.json`)

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "prettier"
  ]
}
```

---

*Dernière MAJ : 2025-12-22*

# 🚀 Phase 1 (fin) — Structure & Linting

> **Pré-requis** : Avoir complété [phase-01-init-suite.md](phase-01-init-suite.md) (étape 1.5)  
> **Objectif** : Arborescence dossiers + ESLint/Prettier  
> **Statut** : 🔴 À FAIRE

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
AVANT de commencer cette partie :
1. Vérifier que les étapes 1.1 à 1.5 sont TERMINÉES
2. Les 6+ composants shadcn doivent être dans src/components/ui/
3. Le serveur dev doit toujours fonctionner

RÈGLES DE TRAVAIL :
- Créer un dossier/fichier à la fois
- Vérifier l'existence avant de créer
- Ne pas modifier les fichiers shadcn existants
```

---

## 📋 Étape 1.6 — Créer structure dossiers

### 🎯 Objectif
Créer l'arborescence de dossiers MAINTENANT pour éviter les imports cassés plus tard quand on codera les composants.

### 📝 Comment
Créer les dossiers vides et les fichiers index de base. Même vides, ces dossiers permettent de planifier les imports dès le début.

### 🔧 Par quel moyen
Utiliser le terminal (mkdir) ou l'explorateur VS Code. Les fichiers types/index.ts et constants/index.ts doivent être créés avec du contenu initial.

> **⚠️ ATTENTION** : Créer les dossiers AVANT de coder évite les problèmes d'import et de refactoring.

---

### 1.6.1 — UI (déjà créé)

| # | Tâche | Dossier | Contenu |
|:--|:------|:--------|:--------|
| 1.6.1 | UI | `src/components/ui/` | (déjà créé par shadcn) |

```
💡 INSTRUCTION 1.6.1 :
- Ce dossier existe déjà grâce à shadcn
- Vérifier qu'il contient les 6+ composants ajoutés à l'étape 1.5
- Ne PAS créer de sous-dossiers dans ui/
- UNIQUEMENT les composants shadcn vont ici
```

---

### 1.6.2 — Layout

| # | Tâche | Dossier | Contenu |
|:--|:------|:--------|:--------|
| 1.6.2 | Layout | `src/components/layout/` | Dossier vide |

```
💡 INSTRUCTION 1.6.2 :
- Commande : mkdir src/components/layout
- Ce dossier contiendra les composants de mise en page :
  - Sidebar.tsx (navigation latérale)
  - Header.tsx (barre supérieure)
  - Footer.tsx (pied de page)
  - MainLayout.tsx (wrapper principal)
- Pour l'instant : créer le dossier vide uniquement
```

---

### 1.6.3 — Features

| # | Tâche | Dossier | Contenu |
|:--|:------|:--------|:--------|
| 1.6.3 | Features | `src/components/features/` | Dossier vide |

```
💡 INSTRUCTION 1.6.3 :
- Commande : mkdir src/components/features
- Ce dossier contiendra les composants métier par domaine :
  - admin/ → gestion utilisateurs, stats
  - teacher/ → création cours, évaluations
  - student/ → dashboard élève, exercices
  - ai/ → chat IA, assistant
- Sous-dossiers créés plus tard (phases suivantes)
```

---

### 1.6.4 — Lib (déjà créé)

| # | Tâche | Dossier | Contenu |
|:--|:------|:--------|:--------|
| 1.6.4 | Lib | `src/lib/` | (déjà créé) |

```
💡 INSTRUCTION 1.6.4 :
- Ce dossier existe déjà (utils.ts de shadcn)
- Contiendra plus tard :
  - prisma.ts → client Prisma
  - auth.ts → helpers authentification
  - ai/ → clients OpenAI, helpers RAG
- Pour l'instant : ne rien ajouter
```

---

### 1.6.5 — Hooks

| # | Tâche | Dossier | Contenu |
|:--|:------|:--------|:--------|
| 1.6.5 | Hooks | `src/hooks/` | Dossier vide |

```
💡 INSTRUCTION 1.6.5 :
- Commande : mkdir src/hooks
- Ce dossier contiendra les hooks React custom :
  - useAuth.ts → état authentification
  - useToast.ts → (déjà fourni par shadcn)
  - useDebounce.ts → optimisation inputs
  - useLocalStorage.ts → persistance
- Pour l'instant : dossier vide
```

---

### 1.6.6 — Types

| # | Tâche | Dossier | Contenu |
|:--|:------|:--------|:--------|
| 1.6.6 | Types | `src/types/` | Créer avec `index.ts` |

```
💡 INSTRUCTION 1.6.6 :
1. Créer le dossier : mkdir src/types
2. Créer le fichier src/types/index.ts
3. Copier le contenu depuis phase-01-fichiers.md section 1
```

**📄 Code source** : Voir [phase-01-fichiers.md](phase-01-fichiers.md#1-fichier-srctypesindexts)

---

### 1.6.7 — Constants

| # | Tâche | Dossier | Contenu |
|:--|:------|:--------|:--------|
| 1.6.7 | Constants | `src/constants/` | Créer avec `index.ts` |

```
💡 INSTRUCTION 1.6.7 :
1. Créer le dossier : mkdir src/constants
2. Créer le fichier src/constants/index.ts
3. Copier le contenu depuis phase-01-fichiers.md section 2
```

**📄 Code source** : Voir [phase-01-fichiers.md](phase-01-fichiers.md#2-fichier-srcconstantsindexts)

**✅ Vérification structure** :
```bash
ls -la src/
# Doit montrer : app/, components/, lib/, hooks/, types/, constants/
```

---

## 📋 Étape 1.7 — Configurer ESLint + Prettier

### 🎯 Objectif
Configurer le formatage automatique pour avoir un code cohérent. ESLint détecte les erreurs, Prettier formate le code. Les deux doivent cohabiter sans conflit.

### 📝 Comment
Installer Prettier et le plugin eslint-config-prettier qui désactive les règles ESLint qui conflictent avec Prettier.

### 🔧 Par quel moyen
1. Installer les packages npm en devDependencies
2. Créer le fichier `.prettierrc` avec la config
3. Modifier ESLint pour inclure prettier

> **⚠️ ATTENTION** : Le formatage automatique évite 100% des conflits de style en équipe.

---

### 1.7.1 — Installation packages

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 1.7.1 | Install | `npm install -D prettier eslint-config-prettier` | Packages installés |

```
💡 INSTRUCTION 1.7.1 :
- Le flag -D installe en devDependencies (pas en prod)
- prettier : le formateur de code
- eslint-config-prettier : désactive les règles ESLint qui conflictent
- Vérifier dans package.json que les 2 sont dans devDependencies
```

---

### 1.7.2 — Configuration Prettier

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.7.2 | Config | Créer `.prettierrc` à la racine | Fichier créé |

```
💡 INSTRUCTION 1.7.2 :
- Créer le fichier .prettierrc à la RACINE du projet
- Copier le contenu depuis phase-01-fichiers.md section 3
```

**📄 Code source** : Voir [phase-01-fichiers.md](phase-01-fichiers.md#3-fichier-prettierrc)

---

### 1.7.3 — Configuration ESLint

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.7.3 | ESLint | Modifier config ESLint | "prettier" ajouté |

```
💡 INSTRUCTION 1.7.3 :
- Next.js 15 utilise eslint.config.mjs (nouveau format)
- OU .eslintrc.json (ancien format)
- Vérifier quel fichier existe à la racine
- Copier le bon contenu depuis phase-01-fichiers.md sections 4 ou 5
```

**📄 Code source** : Voir [phase-01-fichiers.md](phase-01-fichiers.md#4-configuration-eslint-si-eslintconfigmjs)

---

### 1.7.4 — Test lint

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 1.7.4 | Test | `npm run lint` | 0 erreur, 0 warning |

```
💡 INSTRUCTION 1.7.4 :
- Exécuter : npm run lint
- Doit afficher "✔ No ESLint warnings or errors"
- Si erreurs : les corriger (pas les ignorer avec // eslint-disable)
- Si warning "prettier" : la config n'est pas bien appliquée
```

---

### 1.7.5 — Test formatage

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.7.5 | Format | Tester formatage VS Code | Formatage appliqué |

```
💡 INSTRUCTION 1.7.5 :
1. Ouvrir n'importe quel fichier .tsx (ex: src/app/page.tsx)
2. Ajouter du code mal formaté (espaces en trop, pas de ;)
3. Clic droit → "Format Document" (ou Shift+Alt+F)
4. Le fichier doit se reformater automatiquement
5. Si VS Code demande "Select a default formatter" → choisir Prettier

Si Prettier n'apparaît pas :
- Installer l'extension VS Code "Prettier - Code formatter"
- Extension ID : esbenp.prettier-vscode
```

---

### 🧪 TEST CHECKPOINT 1.A — Validation Phase 1

> ⚠️ **OBLIGATOIRE** : Fondations critiques

| Test | Commande | Résultat attendu |
|:-----|:---------|:-----------------|
| Dev | `npm run dev` | ✅ Server starts |
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Tests manuels** :
- [ ] Page http://localhost:3000 s'affiche
- [ ] Un `<Button>` shadcn est visible et cliquable
- [ ] Console navigateur sans erreurs rouges
- [ ] Format Document (Shift+Alt+F) fonctionne

---

### 🔄 REFACTOR CHECKPOINT 1.B — Vérification structure

> 📏 **Règle** : Structure propre dès le départ

```powershell
# Vérifier que tous les dossiers existent
$folders = @('src/components/ui', 'src/components/layout', 'src/components/features', 
             'src/lib', 'src/hooks', 'src/types', 'src/constants')
$folders | ForEach-Object { if(Test-Path $_) { "✅ $_" } else { "❌ $_ MANQUANT" } }
```

**Vérifications** :
- [ ] 6+ fichiers dans `src/components/ui/`
- [ ] `src/types/index.ts` contient Role, User, ApiResponse
- [ ] `src/constants/index.ts` contient ROUTES, APP_NAME
- [ ] Pas de fichiers orphelins à la racine de `src/`

---

### 📝 EXPOSÉ CHECKPOINT 1.C — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 1.C.1 | Incrémenter `developmentHours` (+2h) | `progress.json` |
| 1.C.2 | Ajouter résumé Phase 1 | `content/08-developpement.md` |
| 1.C.3 | Capturer screenshot | `assets/screenshots/phase-01-hello.png` |
| 1.C.4 | Commit BlaizBot-projet | `git commit -m "docs: phase 1 terminée"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 1 — Initialisation (DATE)

**Durée** : 2h  
**Tâches** : 7/7 complétées

**Résumé** :
- Next.js 15 + TypeScript + Tailwind configurés
- shadcn/ui initialisé avec 6 composants de base
- Structure dossiers créée (layout, features, hooks, types, constants)
- ESLint + Prettier configurés

**Captures** : `phase-01-hello.png`
```

---

## ✅ Checklist fin de Phase 1 (COMPLÈTE)

Après avoir terminé les 3 fichiers de la Phase 1 :

- [ ] `npm run dev` fonctionne sans erreur
- [ ] `npm run build` compile sans erreur TypeScript
- [ ] `npm run lint` passe (0 erreur, 0 warning)
- [ ] 6+ composants shadcn dans `src/components/ui/`
- [ ] Dossiers créés : `layout/`, `features/`, `hooks/`, `types/`, `constants/`
- [ ] `src/types/index.ts` existe avec types Role, User, ApiResponse
- [ ] `src/constants/index.ts` existe avec ROUTES, APP_NAME
- [ ] `.prettierrc` existe à la racine
- [ ] Formatage automatique fonctionne dans VS Code

---

## 📸 Capture requise

- [ ] Screenshot "Hello World" avec :
  - Page Next.js fonctionnelle
  - Un `<Button>` shadcn visible et stylé
  - Console navigateur sans erreur

**Fichier** : `assets/screenshots/phase-01-hello.png`

---

## 🔄 Next Step

✅ **Phase 1 terminée** → Passer à [phase-02-layout.md](phase-02-layout.md)

---

## 📁 Récapitulatif Phase 1

| Fichier | Étapes | Contenu |
|:--------|:-------|:--------|
| [phase-01-init.md](phase-01-init.md) | 1.1 → 1.4 | Next.js, TypeScript, Tailwind, shadcn init |
| [phase-01-init-suite.md](phase-01-init-suite.md) | 1.5 | Composants shadcn (Button, Input, Card...) |
| **Ce fichier** | 1.6 → 1.7 | Structure dossiers, ESLint/Prettier |

---

*Lignes : ~340 | Dernière MAJ : 2025-12-22*

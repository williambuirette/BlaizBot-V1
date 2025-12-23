# 🚀 Phase 1 — Initialisation Projet

> **Objectif** : "Hello World" qui compile  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 2-3h

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
AVANT de commencer cette phase :
1. S'assurer qu'on est dans le dossier BlaizBot-V1
2. Vérifier qu'aucun node_modules n'existe (projet vierge)
3. Lire RULES.md pour les contraintes 350 lignes
4. Lire STRUCTURE.md pour savoir où créer chaque fichier

RÈGLES DE TRAVAIL :
- Exécuter UNE commande à la fois
- Attendre la validation avant de passer à la suivante
- En cas d'erreur : STOP et analyser, ne pas continuer
- Ne JAMAIS skip une étape même si elle semble triviale

🚨 FIN DE PHASE — RAPPEL OBLIGATOIRE :
Quand toutes les tâches sont terminées, l'IA DOIT :
1. Demander "Veux-tu que j'exécute les 3 checkpoints ?"
2. Si oui : TEST → REFACTOR → EXPOSÉ (dans cet ordre)
3. Mettre à jour INDEX.md avec ✅ dans les colonnes
4. NE PAS passer à la phase suivante sans validation
```

---

## 📋 Étape 1.1 — Créer projet Next.js 15

### 🎯 Objectif
Créer la fondation du projet avec Next.js 15, TypeScript et Tailwind pré-configurés.

### 📝 Comment
Utiliser le CLI officiel `create-next-app` qui génère un projet optimisé avec toutes les bonnes pratiques Next.js 15 (App Router, Server Components, etc.).

### 🔧 Par quel moyen
Exécuter la commande dans le terminal VS Code, dans le dossier `BlaizBot-V1` (qui doit être vide).

> **⚠️ ATTENTION** : C'est la fondation. Une erreur ici = tout à refaire.

| # | Tâche | Commande / Action | Validation |
|:--|:------|:------------------|:-----------|
| 1.1.1 | Créer projet | `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir` | Commande OK |

```
💡 INSTRUCTION 1.1.1 :
- Le "." signifie "dans le dossier courant"
- Si le dossier n'est pas vide, la commande échouera
- Attendre que tous les packages soient téléchargés (~2-3 min)
```

| # | Tâche | Commande / Action | Validation |
|:--|:------|:------------------|:-----------|
| 1.1.2 | Options CLI | Répondre aux prompts | Options validées |

```
💡 INSTRUCTION 1.1.2 :
Répondre exactement :
- Would you like to use TypeScript? → Yes
- Would you like to use ESLint? → Yes
- Would you like to use Tailwind CSS? → Yes
- Would you like your code inside a `src/` directory? → Yes
- Would you like to use App Router? → Yes
- Would you like to use Turbopack? → Yes
- Would you like to customize the import alias? → No (garder @/*)
```

| # | Tâche | Commande / Action | Validation |
|:--|:------|:------------------|:-----------|
| 1.1.3 | Test serveur | `npm run dev` | Page Next.js sur localhost:3000 |

```
💡 INSTRUCTION 1.1.3 :
- Ouvrir le navigateur sur http://localhost:3000
- Tu dois voir la page par défaut Next.js avec le logo Vercel
- Si erreur "port already in use" → fermer l'autre serveur ou utiliser --port 3001
- Garder le serveur lancé pour les tests suivants
```

**✅ Critère de succès** : Page par défaut Next.js visible dans le navigateur.

---

## 📋 Étape 1.2 — Configurer TypeScript strict

### 🎯 Objectif
Activer le mode strict de TypeScript pour détecter les erreurs à la compilation plutôt qu'au runtime.

### 📝 Comment
Modifier le fichier `tsconfig.json` pour ajouter les options de vérification stricte.

### 🔧 Par quel moyen
Éditer directement le fichier de configuration TypeScript à la racine du projet.

> **⚠️ ATTENTION** : Le mode strict évite 80% des bugs runtime. Ne JAMAIS le désactiver.

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.2.1 | Ouvrir config | Ouvrir `tsconfig.json` | Fichier ouvert |

```
💡 INSTRUCTION 1.2.1 :
- Le fichier est à la racine du projet
- Il a été créé par create-next-app
- Chercher la section "compilerOptions"
```

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.2.2 | Mode strict | Vérifier/Ajouter `"strict": true` | Présent dans compilerOptions |

```
💡 INSTRUCTION 1.2.2 :
- Next.js 15 met déjà "strict": true par défaut
- VÉRIFIER qu'il est bien présent, ne pas supposer
- Si absent, l'ajouter dans compilerOptions
```

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.2.3 | Index check | Ajouter `"noUncheckedIndexedAccess": true` | Présent |

```
💡 INSTRUCTION 1.2.3 :
- Cette option force à vérifier si un index existe avant d'y accéder
- Exemple : arr[0] retournera T | undefined au lieu de T
- Ajouter dans compilerOptions, à côté de "strict"
```

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.2.4 | Test build | `npm run build` | Build OK sans erreur TS |

```
💡 INSTRUCTION 1.2.4 :
- Stopper le serveur dev (Ctrl+C) avant de build
- Le build doit réussir sans erreur TypeScript
- Si erreur TS : CORRIGER le type, ne JAMAIS désactiver strict
- Relancer `npm run dev` après pour continuer
```

**⚠️ Si erreur** : Ne jamais désactiver strict pour contourner une erreur. Corriger le type.

---

## 📋 Étape 1.3 — Vérifier Tailwind CSS

### 🎯 Objectif
S'assurer que Tailwind CSS est correctement configuré et fonctionnel avant d'ajouter shadcn/ui.

### 📝 Comment
Vérifier les fichiers de configuration et tester visuellement qu'une classe Tailwind s'applique.

### 🔧 Par quel moyen
Inspecter les fichiers générés et ajouter une classe de test dans le code.

> **⚠️ ATTENTION** : Tailwind doit être prêt avant d'ajouter shadcn/ui (qui en dépend).

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.3.1 | Config existe | Vérifier `tailwind.config.ts` existe | Fichier présent |

```
💡 INSTRUCTION 1.3.1 :
- Le fichier doit être à la racine du projet
- Extension .ts (pas .js)
- Il doit contenir content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"]
```

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.3.2 | Directives CSS | Vérifier `globals.css` a les directives @tailwind | 3 directives présentes |

```
💡 INSTRUCTION 1.3.2 :
- Ouvrir src/app/globals.css
- Doit contenir au début :
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
- Si absent, les ajouter
```

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.3.3 | Test visuel | Ajouter une classe Tailwind dans `page.tsx` | Classe appliquée visuellement |

```
💡 INSTRUCTION 1.3.3 :
- Ouvrir src/app/page.tsx
- Ajouter sur n'importe quel élément : className="bg-blue-500 text-white p-4"
- Vérifier dans le navigateur : l'élément doit avoir un fond bleu
- Si pas de style → problème de config Tailwind
```

**Test rapide** : Ajouter `className="bg-blue-500 text-white p-4"` sur un div.

---

## 📋 Étape 1.4 — Installer shadcn/ui

### 🎯 Objectif
Installer shadcn/ui qui va générer des composants UI directement dans le projet (pas une dépendance npm).

### 📝 Comment
Utiliser le CLI shadcn qui va créer les fichiers de configuration et préparer le projet.

### 🔧 Par quel moyen
Exécuter `npx shadcn@latest init` et répondre aux prompts de configuration.

> **⚠️ ATTENTION** : shadcn génère des composants DANS le projet (pas node_modules). C'est voulu.

| # | Tâche | Commande / Action | Validation |
|:--|:------|:------------------|:-----------|
| 1.4.1 | Init CLI | `npx shadcn@latest init` | CLI démarre |

```
💡 INSTRUCTION 1.4.1 :
- S'assurer que le serveur dev est stoppé
- La commande va poser plusieurs questions
- Attendre que le CLI démarre avant de répondre
```

| # | Tâche | Commande / Action | Validation |
|:--|:------|:------------------|:-----------|
| 1.4.2 | Options | Répondre aux prompts | Options validées |

```
💡 INSTRUCTION 1.4.2 :
Répondre exactement :
- Which style would you like to use? → Default
- Which color would you like to use as the base color? → Slate
- Would you like to use CSS variables for theming? → Yes
```

| # | Tâche | Commande / Action | Validation |
|:--|:------|:------------------|:-----------|
| 1.4.3 | Config | Vérifier `components.json` créé | Fichier présent à la racine |

```
💡 INSTRUCTION 1.4.3 :
- Le fichier components.json doit être à la racine
- Il contient la config shadcn (paths, style, etc.)
- Ne PAS modifier ce fichier manuellement
```

| # | Tâche | Commande / Action | Validation |
|:--|:------|:------------------|:-----------|
| 1.4.4 | Utils | Vérifier `src/lib/utils.ts` créé | Fichier avec fonction `cn()` |

```
💡 INSTRUCTION 1.4.4 :
- Le fichier src/lib/utils.ts doit exister
- Il contient la fonction cn() pour merger les classes CSS
- Cette fonction est utilisée par tous les composants shadcn
```

**⚠️ Important** : Si erreur de path, vérifier que `src/` existe.

---

## ➡️ Suite de la Phase 1

Les étapes 1.5, 1.6 et 1.7 sont dans **[phase-01-init-suite.md](phase-01-init-suite.md)**

---

## 📸 Capture requise (Phase 1 complète)

- [ ] Screenshot "Hello World" avec un Button shadcn visible

---

## ✅ Checklist fin de phase (à valider après phase-01-init-suite.md)

- [ ] `npm run dev` fonctionne sans erreur
- [ ] `npm run build` réussit
- [ ] `npm run lint` passe
- [ ] 6+ composants shadcn dans `src/components/ui/`
- [ ] Dossiers `layout/`, `features/`, `hooks/`, `types/`, `constants/` créés
- [ ] TypeScript strict activé

---

## 🔄 Ordre d'exécution

1. **Ce fichier** : Étapes 1.1 → 1.4 (Next.js + TypeScript + Tailwind + shadcn init)
2. **[phase-01-init-suite.md](phase-01-init-suite.md)** : Étapes 1.5 → 1.7 (Composants + Dossiers + ESLint/Prettier)
3. **[phase-02-layout.md](phase-02-layout.md)** : Layout de base

---

*Lignes : ~250 | Dernière MAJ : 2025-12-22*

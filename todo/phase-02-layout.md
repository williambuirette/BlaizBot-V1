# 🎨 Phase 2 — Layout & Navigation (Partie 1)

> **Objectif** : Naviguer partout (pages vides mais fonctionnelles)  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 3-4h  
> **Prérequis** : Phase 1 terminée

📁 **Fichiers liés** :
- [phase-02-layout-suite.md](phase-02-layout-suite.md) — Étapes 2.4→2.7
- [phase-02-code.md](phase-02-code.md) — Code source & templates

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
AVANT de commencer :
1. Vérifier `npm run dev` fonctionne (Phase 1 OK)
2. Composants shadcn présents dans src/components/ui/
3. Consulter blaizbot-wireframe/ pour le design
4. Chaque composant < 200 lignes

RÈGLES : UN fichier → tester → suivant
```

---

## 📋 Étape 2.1 — Créer Sidebar component

### 🎯 Objectif
Créer le composant Sidebar dynamique selon le rôle (admin, teacher, student).

### 📝 Comment
Composant React réutilisable : logo + liens navigation + footer paramètres/profil.

### 🔧 Par quel moyen
Créer `Sidebar.tsx` + `SidebarItem.tsx` avec icônes `lucide-react` et `usePathname()`.

---

### 2.1.1 — Créer le fichier Sidebar

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 2.1.1 | Créer fichier | `src/components/layout/Sidebar.tsx` | Fichier créé |

💡 **INSTRUCTION** : Créer dans `src/components/layout/`

---

### 2.1.2 — Définir les types

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.1.2 | Types props | Définir `SidebarProps` | Types exportés |

💡 **INSTRUCTION** : Voir **Section 1** de [phase-02-code.md](phase-02-code.md#1-types-sidebar)

---

### 2.1.3 — Structure HTML de base

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.1.3 | Structure | Créer structure nav/ul/li | Structure valide |

💡 **INSTRUCTION** : `<aside>` > `<nav>` > `<ul>`. 3 zones : header, nav, footer

```
┌──────────────────┐
│ 🎓 BlaizBot      │ ← Logo
├──────────────────┤
│ ○ Dashboard      │ ← Nav
│ ○ Mes Cours      │
├──────────────────┤
│ ⚙️ Paramètres    │ ← Footer
└──────────────────┘
```

---

### 2.1.4 — Styles Tailwind

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.1.4 | Styles | Tailwind classes | Appliqués |

💡 **INSTRUCTION** : Classes essentielles :
- Conteneur : `w-64 h-screen bg-slate-900 text-white fixed left-0 top-0`
- Flex : `flex flex-col`
- Logo : `p-4 border-b border-slate-700`

---

### 2.1.5 — Créer SidebarItem

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 2.1.5 | SidebarItem | `src/components/layout/SidebarItem.tsx` | < 50 lignes |

💡 **INSTRUCTION** : Voir **Section 2** de [phase-02-code.md](phase-02-code.md#2-sidebaritemtsx-complet)

---

### 2.1.6 — Icônes Lucide

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.1.6 | Icônes | Importer depuis lucide-react | Visibles |

💡 **INSTRUCTION** : Voir **Section 3** de [phase-02-code.md](phase-02-code.md#3-icônes-lucide-à-importer)

---

### 2.1.7 — Gérer l'état actif

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.1.7 | Active state | Highlight item courant | Style visible |

💡 **INSTRUCTION** : `usePathname()` de `next/navigation`, comparer avec `href`

---

### 2.1.8 — Vérifier la taille

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 2.1.8 | Taille | `(Get-Content Sidebar.tsx).Count` | < 200 lignes |

---

## 📋 Étape 2.2 — Créer Header component

### 🎯 Objectif
Header avec recherche (UI only) et menu utilisateur (Avatar + Dropdown).

### 📝 Comment
Utiliser composants shadcn : Avatar, DropdownMenu, Input.

### 🔧 Par quel moyen
Layout flexbox : `logo | search | user`

---

### 2.2.1 — Créer le fichier

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 2.2.1 | Créer fichier | `src/components/layout/Header.tsx` | Fichier créé |

💡 **INSTRUCTION** : Marquer `'use client'` en haut

---

### 2.2.2 — Zone logo/titre

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.2.2 | Logo | Zone gauche | Visible |

💡 **INSTRUCTION** : Utiliser `APP_NAME` de `@/constants`

---

### 2.2.3 — Barre de recherche

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.2.3 | Search | Input au centre | Présent |

💡 **INSTRUCTION** : Voir **Section 4** de [phase-02-code.md](phase-02-code.md#4-header---zone-recherche)

---

### 2.2.4 — Avatar utilisateur

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.2.4 | Avatar | Composant shadcn | Visible |

💡 **INSTRUCTION** : `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"`

---

### 2.2.5 — Dropdown menu profil

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.2.5 | Dropdown | Menu déroulant | Fonctionne |

💡 **INSTRUCTION** : Voir **Section 5** de [phase-02-code.md](phase-02-code.md#5-header---dropdown-profil)

---

### 2.2.6 — Vérifier la taille

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 2.2.6 | Taille | `(Get-Content Header.tsx).Count` | < 150 lignes |

---

## 📋 Étape 2.3 — Créer layout dashboard

### 🎯 Objectif
Layout global pour toutes les pages dashboard (Sidebar + Header + contenu).

### 📝 Comment
Utiliser le système de layouts Next.js App Router avec route group `(dashboard)`.

### 🔧 Par quel moyen
`(dashboard)/layout.tsx` → englobe admin, teacher, student

---

### 2.3.1 — Créer le fichier layout

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 2.3.1 | Layout | `src/app/(dashboard)/layout.tsx` | Fichier créé |

💡 **INSTRUCTION** : Les parenthèses = route group (pas d'impact URL)

---

### 2.3.2 — Intégrer Sidebar

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.3.2 | Sidebar | Placer à gauche (fixed) | Visible |

💡 **INSTRUCTION** : Hardcoder `role="student"` pour l'instant

---

### 2.3.3 — Intégrer Header

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.3.3 | Header | Placer en haut zone contenu | Visible |

---

### 2.3.4 — Zone children avec offset

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.3.4 | Children | Zone contenu `ml-64` | Décalé |

💡 **INSTRUCTION** : Voir **Section 6** de [phase-02-code.md](phase-02-code.md#6-layout-dashboard-complet)

---

### 2.3.5 — Responsive (optionnel)

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.3.5 | Responsive | Sidebar `hidden md:block` | Test mobile |

💡 **INSTRUCTION** : Optionnel pour MVP, garder desktop-only

```
┌────────────────────────────────────────┐
│              HEADER                    │
├────────────┬───────────────────────────┤
│  SIDEBAR  │       {children}           │
│  (fixed)  │                            │
└───────────┴───────────────────────────┘
```

---

## 🧪 TEST CHECKPOINT 2.A — Layout intégré

> ⚠️ **STOP** : Ne pas continuer sans valider ce checkpoint

### Tests à exécuter

| # | Test | Action | Résultat attendu |
|:--|:-----|:-------|:-----------------|
| T.2A.1 | Build | `npm run build` | 0 erreur |
| T.2A.2 | Lint | `npm run lint` | 0 warning |
| T.2A.3 | Visuel | Ouvrir /student | Sidebar + Header visibles |
| T.2A.4 | Console | Ouvrir DevTools | 0 erreur JS |

💡 **INSTRUCTION TEST** :
```
1. Arrêter le serveur dev (Ctrl+C)
2. Exécuter : npm run build
3. Si erreur → corriger AVANT de continuer
4. Exécuter : npm run lint
5. Relancer : npm run dev
6. Tester visuellement /student
```

**✅ Si tous les tests passent** → Continuer vers 2.4
**❌ Si échec** → Corriger puis re-tester

---

## ➡️ Suite

Étapes 2.1→2.3 terminées → [phase-02-layout-suite.md](phase-02-layout-suite.md) pour 2.4→2.7

---

*Dernière MAJ : 2025-01-13*

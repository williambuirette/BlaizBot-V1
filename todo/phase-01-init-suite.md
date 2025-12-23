# 🚀 Phase 1 (suite) — Composants & Structure

> **Pré-requis** : Avoir complété [phase-01-init.md](phase-01-init.md) (étapes 1.1 → 1.4)  
> **Objectif** : Composants shadcn + arborescence + ESLint/Prettier  
> **Statut** : 🔴 À FAIRE

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
AVANT de commencer cette suite :
1. Vérifier que les étapes 1.1 à 1.4 sont TERMINÉES
2. Le serveur dev doit fonctionner (npm run dev)
3. shadcn/ui doit être initialisé (components.json existe)
4. src/lib/utils.ts doit contenir la fonction cn()

RÈGLES DE TRAVAIL :
- Exécuter UNE commande à la fois
- Attendre "Done" après chaque npx shadcn@latest add
- En cas d'erreur : STOP et analyser, ne pas continuer
```

---

## 📋 Étape 1.5 — Ajouter composants shadcn de base

### 🎯 Objectif
Ajouter les 6 composants UI essentiels qui couvrent 90% des besoins de base de l'application.

### 📝 Comment
Utiliser le CLI shadcn pour générer chaque composant. shadcn ne crée PAS une dépendance npm mais copie les fichiers directement dans `src/components/ui/`. Cela permet de customiser chaque composant.

### 🔧 Par quel moyen
Exécuter `npx shadcn@latest add [composant]` pour chaque composant, un par un.

> **⚠️ ATTENTION** : Exécuter UNE commande à la fois. Attendre "Done" avant la suivante.

---

### 1.5.1 — Button

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 1.5.1 | Button | `npx shadcn@latest add button` | button.tsx créé |

```
💡 INSTRUCTION 1.5.1 :
- Le fichier sera créé dans src/components/ui/button.tsx
- Attendre "Done" avant de passer à la suivante
- Ne pas modifier le fichier généré pour l'instant
- Ce composant a plusieurs variants : default, destructive, outline, secondary, ghost, link
```

---

### 1.5.2 — Input

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 1.5.2 | Input | `npx shadcn@latest add input` | input.tsx créé |

```
💡 INSTRUCTION 1.5.2 :
- Composant pour les champs de formulaire
- Utilisé dans : login, recherche, formulaires admin/teacher
- Supporte les types HTML : text, email, password, number, etc.
```

---

### 1.5.3 — Card

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 1.5.3 | Card | `npx shadcn@latest add card` | card.tsx créé |

```
💡 INSTRUCTION 1.5.3 :
- Composant conteneur avec ombre et bordures arrondies
- Utilisé pour : dashboards, listes de cours, fiches élèves
- Contient : Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
```

---

### 1.5.4 — Avatar

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 1.5.4 | Avatar | `npx shadcn@latest add avatar` | avatar.tsx créé |

```
💡 INSTRUCTION 1.5.4 :
- Composant pour afficher photo ou initiales utilisateur
- Utilisé dans : header (profil), messages chat, listes
- Contient : Avatar, AvatarImage, AvatarFallback (initiales si pas d'image)
```

---

### 1.5.5 — Dropdown Menu

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 1.5.5 | Dropdown | `npx shadcn@latest add dropdown-menu` | dropdown-menu.tsx créé |

```
💡 INSTRUCTION 1.5.5 :
- Menu déroulant pour les actions contextuelles
- Utilisé dans : header (menu profil), tables (actions par ligne)
- Ce composant installe automatiquement @radix-ui/react-dropdown-menu
- Contient : DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, etc.
```

---

### 1.5.6 — Toast

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 1.5.6 | Toast | `npx shadcn@latest add toast` | toast.tsx + toaster.tsx créés |

```
💡 INSTRUCTION 1.5.6 :
- Système de notifications (succès, erreur, info)
- Crée 2 fichiers : toast.tsx et toaster.tsx
- Le composant <Toaster /> devra être ajouté au layout root plus tard
- Utilise le hook useToast() pour déclencher les notifications
```

---

### 1.5.7 — Test d'import

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 1.5.7 | Test import | Tester import dans `page.tsx` | Pas d'erreur import |

```
💡 INSTRUCTION 1.5.7 :
1. Ouvrir src/app/page.tsx
2. Ajouter en haut du fichier :
   import { Button } from "@/components/ui/button"
3. Ajouter dans le JSX (n'importe où) :
   <Button>Test shadcn</Button>
4. Vérifier dans le navigateur : bouton stylé visible
5. Si erreur d'import → vérifier :
   - components.json existe à la racine
   - Le path "@/components" est correct dans tsconfig.json
```

**✅ Vérification finale** : 
```bash
ls src/components/ui/
# Doit montrer : button.tsx, input.tsx, card.tsx, avatar.tsx, dropdown-menu.tsx, toast.tsx, toaster.tsx
```

---

## ➡️ Suite

Étape 1.5 terminée → Passer à [phase-01-init-fin.md](phase-01-init-fin.md) pour les étapes 1.6 et 1.7

---

*Lignes : ~180 | Dernière MAJ : 2025-12-22*

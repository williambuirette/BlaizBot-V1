# 🎨 Phase 2 — Layout & Navigation (Partie 2)

> **Prérequis** : Avoir complété [phase-02-layout.md](phase-02-layout.md) (2.1→2.3)  
> **Objectif** : Créer toutes les routes et tester la navigation  
> **Statut** : 🔴 À FAIRE

📁 **Fichiers liés** :
- [phase-02-layout.md](phase-02-layout.md) — Étapes 2.1→2.3
- [phase-02-code.md](phase-02-code.md) — Code source & templates

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
AVANT de commencer :
1. Sidebar.tsx et Header.tsx existent
2. Layout dashboard créé
3. `npm run dev` affiche le layout

RÈGLES : 1 page = 1 fichier (~20 lignes). Template dans phase-02-code.md
```

---

## 📋 Étape 2.4 — Créer routes Admin

### 🎯 Objectif
Créer les 5 pages Admin (vides). Contenu réel en Phase 6.

### 📝 Comment
Next.js App Router : chemin fichier = URL.

### 🔧 Par quel moyen
Template **Section 7** de [phase-02-code.md](phase-02-code.md#7-template-page-vide-réutilisable)

---

| # | Page | Fichier | URL |
|:--|:-----|:--------|:----|
| 2.4.1 | Dashboard | `(dashboard)/admin/page.tsx` | /admin |
| 2.4.2 | Users | `(dashboard)/admin/users/page.tsx` | /admin/users |
| 2.4.3 | Classes | `(dashboard)/admin/classes/page.tsx` | /admin/classes |
| 2.4.4 | Subjects | `(dashboard)/admin/subjects/page.tsx` | /admin/subjects |
| 2.4.5 | Settings | `(dashboard)/admin/settings/page.tsx` | /admin/settings |

💡 **INSTRUCTION** : Voir **Section 8** de [phase-02-code.md](phase-02-code.md#8-liste-des-pages-à-créer) pour les titres

**✅ Vérification** : Naviguer sur les 5 URLs → pages s'affichent

---

## 📋 Étape 2.5 — Créer routes Professeur

### 🎯 Objectif
Créer les 5 pages Professeur. Développement en Phase 7.

### 📝 Comment
Même logique que Admin dans `(dashboard)/teacher/`

---

| # | Page | Fichier | URL |
|:--|:-----|:--------|:----|
| 2.5.1 | Dashboard | `(dashboard)/teacher/page.tsx` | /teacher |
| 2.5.2 | Classes | `(dashboard)/teacher/classes/page.tsx` | /teacher/classes |
| 2.5.3 | Students | `(dashboard)/teacher/students/page.tsx` | /teacher/students |
| 2.5.4 | Courses | `(dashboard)/teacher/courses/page.tsx` | /teacher/courses |
| 2.5.5 | Messages | `(dashboard)/teacher/messages/page.tsx` | /teacher/messages |

**✅ Vérification** : Naviguer sur /teacher et sous-pages → OK

---

## 📋 Étape 2.6 — Créer routes Élève

### 🎯 Objectif
Créer les 7 pages Élève (rôle principal + Assistant IA). Développement en Phase 8.

### 📝 Comment
Plus de pages car l'élève a l'assistant IA et les révisions.

---

| # | Page | Fichier | URL |
|:--|:-----|:--------|:----|
| 2.6.1 | Dashboard | `(dashboard)/student/page.tsx` | /student |
| 2.6.2 | Courses | `(dashboard)/student/courses/page.tsx` | /student/courses |
| 2.6.3 | Revisions | `(dashboard)/student/revisions/page.tsx` | /student/revisions |
| 2.6.4 | **Assistant IA** | `(dashboard)/student/assistant/page.tsx` | /student/assistant |
| 2.6.5 | Calendar | `(dashboard)/student/calendar/page.tsx` | /student/calendar |
| 2.6.6 | Messages | `(dashboard)/student/messages/page.tsx` | /student/messages |
| 2.6.7 | Profile | `(dashboard)/student/profile/page.tsx` | /student/profile |

💡 **INSTRUCTION 2.6.4** : Page clé de l'app (chat IA). Titre : "Assistant IA"

**✅ Vérification** : Naviguer sur /student et 6 sous-pages → OK

---

## 📋 Étape 2.7 — Navigation fonctionnelle

### 🎯 Objectif
Tous les liens Sidebar fonctionnent, item actif en surbrillance.

### 📝 Comment
Tester manuellement, modifier `role` temporairement dans layout.

---

### 2.7.1 — Vérifier les Links Next.js

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.7.1 | Links | Sidebar utilise `<Link>` | Links OK |

💡 **INSTRUCTION** : Vérifier `<Link>` de `next/link` (pas de `<a>`)

---

### 2.7.2 — Tester la navigation

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.7.2 | Navigation | Clic items | URL change sans reload |

---

### 2.7.3 — Vérifier l'état actif

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 2.7.3 | Active | Item actif visible | Highlight OK |

💡 **INSTRUCTION** : Sur /student/courses → "Mes cours" en surbrillance

---

### 2.7.4-6 — Tests par rôle

| # | Test | Modifier `role=` | Validation |
|:--|:-----|:-----------------|:-----------|
| 2.7.4 | Admin | `"admin"` | Nav OK |
| 2.7.5 | Teacher | `"teacher"` | Nav OK |
| 2.7.6 | Student | `"student"` | Nav OK |

💡 **INSTRUCTION** : Dans `layout.tsx`, changer `<Sidebar role="xxx" />` pour tester

---

## 📸 Captures requises

- [ ] GIF navigation entre pages
- [ ] Screenshot dashboard admin/teacher/student

---

## 🧪 TEST CHECKPOINT 2.B — Navigation complète

> ⚠️ **STOP** : Valider TOUS les tests avant de passer à Phase 3

### Tests automatiques

| # | Test | Commande | Résultat attendu |
|:--|:-----|:---------|:-----------------|
| T.2B.1 | Build | `npm run build` | 0 erreur |
| T.2B.2 | Lint | `npm run lint` | 0 warning |
| T.2B.3 | Types | `npx tsc --noEmit` | 0 erreur TS |

### Tests manuels

| # | Test | Action | Résultat attendu |
|:--|:-----|:-------|:-----------------|
| T.2B.4 | Admin nav | /admin → 5 pages | Navigation fluide |
| T.2B.5 | Teacher nav | /teacher → 5 pages | Navigation fluide |
| T.2B.6 | Student nav | /student → 7 pages | Navigation fluide |
| T.2B.7 | Active state | Chaque page | Item actif highlighté |
| T.2B.8 | Console | Toutes les pages | 0 erreur JS |

💡 **INSTRUCTION TEST** :
```
1. npm run build
2. npm run lint
3. npx tsc --noEmit
4. Si tout OK → ouvrir navigateur
5. Tester CHAQUE page manuellement
6. Vérifier console DevTools (F12)
```

---

## 🔄 REFACTOR CHECKPOINT 2.C — Vérification taille fichiers

> ⚠️ **OBLIGATOIRE** : Appliquer la règle 350 lignes

### Vérification automatique

| # | Fichier | Commande PowerShell | Limite |
|:--|:--------|:--------------------|:-------|
| R.2C.1 | Sidebar | `(Get-Content src/components/layout/Sidebar.tsx).Count` | < 200 |
| R.2C.2 | SidebarItem | `(Get-Content src/components/layout/SidebarItem.tsx).Count` | < 50 |
| R.2C.3 | Header | `(Get-Content src/components/layout/Header.tsx).Count` | < 150 |
| R.2C.4 | Layout | `(Get-Content src/app/\(dashboard\)/layout.tsx).Count` | < 100 |

### Actions si dépassement

| Problème | Solution |
|:---------|:---------|
| Sidebar > 200 | Extraire `navItems` dans un fichier séparé |
| Header > 150 | Extraire `UserMenu` en composant |
| Composant > 350 | Découper en sous-composants |

💡 **INSTRUCTION REFACTOR** :
```
1. Exécuter les commandes de comptage
2. Si dépassement : demander "@Refactor découpe ce fichier"
3. Re-tester après refactoring
4. Ne PAS continuer si > 350 lignes
```

---

### 📝 EXPOSÉ CHECKPOINT 2.D — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 2.D.1 | Incrémenter `developmentHours` (+3h) | `progress.json` |
| 2.D.2 | Ajouter résumé Phase 2 | `content/08-developpement.md` |
| 2.D.3 | Capturer screenshot layout | `assets/screenshots/phase-02-layout.png` |
| 2.D.4 | Commit BlaizBot-projet | `git commit -m "docs: phase 2 layout terminée"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 2 — Layout & Navigation (DATE)

**Durée** : 3h  
**Tâches** : 9/9 complétées

**Résumé** :
- Sidebar responsive avec navigation par rôle
- Header avec avatar et dropdown menu
- 17 pages vides créées (5 admin + 5 teacher + 7 student)
- Layout dashboard avec routing App Router

**Captures** : `phase-02-layout.png`
```

---

## ✅ Checklist fin de Phase 2

- [ ] Sidebar.tsx < 200 lignes
- [ ] SidebarItem.tsx < 50 lignes
- [ ] Header.tsx < 150 lignes
- [ ] Layout dashboard créé
- [ ] 5 pages Admin ✓
- [ ] 5 pages Teacher ✓
- [ ] 7 pages Student ✓
- [ ] Navigation 3 rôles OK
- [ ] Active state OK

---

## 🔄 Navigation

← [phase-02-layout.md](phase-02-layout.md) | [phase-02-code.md](phase-02-code.md) | → [phase-03-slice.md](phase-03-slice.md)

---

*Dernière MAJ : 2025-01-13*

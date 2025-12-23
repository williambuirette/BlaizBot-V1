# 🧪 Phase 3 — Vertical Slice (Partie 2)

> **Prérequis** : Avoir complété [phase-03-slice.md](phase-03-slice.md) (3.1→3.2)  
> **Objectif** : Interaction complète + feedback visuel  
> **Statut** : 🔴 À FAIRE

📁 **Fichiers liés** :
- [phase-03-slice.md](phase-03-slice.md) — Étapes 3.1→3.2
- [phase-03-code.md](phase-03-code.md) — Code source & templates

---

## 📋 Étape 3.3 — 1 interaction complète

### 🎯 Objectif
Valider le parcours utilisateur complet : clic sur un cours → affichage du détail → retour à la liste. C'est le "vertical slice" qui prouve que la navigation fonctionne.

### 📝 Comment
Créer une route dynamique `/student/courses/[id]` qui affiche les détails d'un cours. Utiliser les données mockées pour afficher le contenu.

### 🔧 Par quel moyen
1. Route dynamique Next.js avec `[id]`
2. Récupérer l'ID avec `useParams()` ou props serveur
3. Filtrer le cours dans mockData

---

### 3.3.1 — Créer la route dynamique

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.3.1 | Route | `src/app/(dashboard)/student/courses/[id]/page.tsx` | Route créée |

💡 **INSTRUCTION** :
- `[id]` = segment dynamique
- URL : `/student/courses/1`, `/student/courses/2`, etc.
- Next.js passe automatiquement `params.id`

```typescript
interface PageProps {
  params: { id: string };
}

export default function CoursePage({ params }: PageProps) {
  const course = courses.find(c => c.id === params.id);
  // ...
}
```

---

### 3.3.2 — Ajouter le lien depuis RecentCourses

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.3.2 | Lien | Clic cours → `/student/courses/[id]` | Navigation OK |

💡 **INSTRUCTION** :
- Dans `RecentCourses.tsx`, wrapper chaque carte avec `<Link>`
- `href={/student/courses/${course.id}}`
- Tester le clic

---

### 3.3.3 — Contenu page cours

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.3.3 | Contenu | Titre, description, chapitres | Affiché |

💡 **INSTRUCTION** :
- Récupérer le cours depuis mockData
- Afficher : titre, professeur, progression
- Ajouter des chapitres mockés
- Voir **Section 7** de [phase-03-code.md](phase-03-code.md#7-page-détail-cours)

---

### 🧪 TEST CHECKPOINT 3.A — Après interaction complète

> ⚠️ **OBLIGATOIRE** : Ne pas continuer sans validation

| Test | Commande | Résultat attendu |
|:-----|:---------|:-----------------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Tests manuels** :
- [ ] Clic sur un cours → page détail affichée
- [ ] URL = `/student/courses/[id]` avec le bon ID
- [ ] Données du cours affichées (titre, prof, etc.)
- [ ] Retour arrière navigateur fonctionne

---

### 3.3.4 — CourseHeader component

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.3.4 | Header | `src/components/courses/CourseHeader.tsx` | < 60 lignes |

💡 **INSTRUCTION** :
- Créer `src/components/courses/`
- Props : `course` object
- Afficher : titre, professeur, badge progression
- Voir **Section 8** de [phase-03-code.md](phase-03-code.md#8-courseheadertsx)

---

### 3.3.5 — ChaptersList component

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.3.5 | Chapitres | `src/components/courses/ChaptersList.tsx` | < 80 lignes |

💡 **INSTRUCTION** :
- Liste des chapitres du cours
- Icône check si complété, cercle sinon
- Voir **Section 9** de [phase-03-code.md](phase-03-code.md#9-chapterslisttsx)

---

### 3.3.6 — Bouton retour

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.3.6 | Retour | Bouton → `/student/courses` | Navigation OK |

💡 **INSTRUCTION** :
```typescript
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

<Link href="/student/courses">
  <Button variant="ghost">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Retour aux cours
  </Button>
</Link>
```

---

### Parcours à tester

```
/student → clic "Mathématiques" → /student/courses/1 → clic "Retour" → /student/courses
```

---

## 📋 Étape 3.4 — Feedback visuel

### 🎯 Objectif
Ajouter le polish UX : toasts de confirmation, spinners de chargement, états hover. L'application doit "répondre" aux actions utilisateur.

### 📝 Comment
Utiliser le système de toast de shadcn, créer un composant spinner, et ajouter les transitions CSS appropriées.

### 🔧 Par quel moyen
1. Composant `Toaster` de shadcn
2. Hook `useToast()` ou le hook shadcn
3. Composant `LoadingSpinner` custom
4. Classes Tailwind pour les transitions

---

### 3.4.1 — Ajouter Toaster global

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.4.1 | Toaster | Ajouter dans layout racine | Présent |

💡 **INSTRUCTION** :
- Ouvrir `src/app/layout.tsx`
- Importer : `import { Toaster } from '@/components/ui/toaster'`
- Ajouter `<Toaster />` après `{children}`
- Si pas installé : `npx shadcn@latest add toaster`

---

### 3.4.2 — Hook useToast

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.4.2 | Hook | Utiliser le hook shadcn | Disponible |

💡 **INSTRUCTION** :
- shadcn fournit `useToast` automatiquement
- Import : `import { useToast } from '@/hooks/use-toast'`
- Vérifier que `src/hooks/use-toast.ts` existe (créé par shadcn)

---

### 3.4.3 — Toast sur login

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.4.3 | Toast login | "Connexion réussie" | S'affiche |

💡 **INSTRUCTION** :
```typescript
const { toast } = useToast();

const loginAs = (role: Role) => {
  localStorage.setItem('mockRole', role);
  toast({
    title: 'Connexion réussie',
    description: `Bienvenue en tant que ${role}`,
  });
  router.push(`/${role}`);
};
```

---

### 3.4.4 — LoadingSpinner

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 3.4.4 | Spinner | `src/components/ui/LoadingSpinner.tsx` | < 20 lignes |

💡 **INSTRUCTION** : Voir **Section 10** de [phase-03-code.md](phase-03-code.md#10-loadingspinnertsx)

---

### 3.4.5 — Loading sur navigation

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.4.5 | Loading | Suspense + fallback | Spinner visible |

💡 **INSTRUCTION** :
- Créer `loading.tsx` dans les dossiers de routes
- Next.js affiche automatiquement pendant le chargement
- Voir **Section 11** de [phase-03-code.md](phase-03-code.md#11-loadingtsx)

---

### 3.4.6 — États hover

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 3.4.6 | Hover | Transitions sur cards/boutons | Feedback visuel |

💡 **INSTRUCTION** :
- Classes Tailwind : `transition-all hover:scale-[1.02] hover:shadow-lg`
- Appliquer sur les cards cliquables
- Durée : `duration-200`

---

## 📸 Capture requise

- [ ] Vidéo 30s : Login → Dashboard → Cours → Retour
- [ ] Screenshot toast de connexion

---

### 🧪 TEST CHECKPOINT 3.B — Validation Phase 3

> ⚠️ **OBLIGATOIRE** : Validation complète avant Phase 4

| Test | Commande | Résultat attendu |
|:-----|:---------|:-----------------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |

**Test parcours complet** :
1. [ ] Page login → clic "Élève" → Toast affiché
2. [ ] Redirect vers dashboard élève
3. [ ] Données mockées visibles (stats, cours)
4. [ ] Clic cours → page détail
5. [ ] Chapitres affichés
6. [ ] Retour → dashboard intact
7. [ ] Console sans erreurs

---

### 🔄 REFACTOR CHECKPOINT 3.C — Vérification standards

> 📏 **Règle** : Aucun fichier > 350 lignes

```powershell
# Vérifier les fichiers trop longs
Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts | `
  ForEach-Object { $lines = (Get-Content $_).Count; if($lines -gt 350) { "$($_.Name): $lines lignes" } }
```

**Si fichiers > 350 lignes** :
- [ ] Extraire composants → `components/features/`
- [ ] Extraire logique → `hooks/` ou `lib/`
- [ ] Un composant = un fichier

**Nettoyage** :
- [ ] Supprimer console.log de debug
- [ ] Supprimer imports non utilisés
- [ ] Vérifier nommage cohérent

---

### 📝 EXPOSÉ CHECKPOINT 3.D — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 3.D.1 | Incrémenter `developmentHours` (+3h) | `progress.json` |
| 3.D.2 | Ajouter résumé Phase 3 | `content/08-developpement.md` |
| 3.D.3 | Capturer screenshot dashboard | `assets/screenshots/phase-03-slice.png` |
| 3.D.4 | Commit BlaizBot-projet | `git commit -m "docs: phase 3 vertical slice"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 3 — Vertical Slice (DATE)

**Durée** : 3h  
**Tâches** : X/X complétées

**Résumé** :
- Login mock avec sélection de rôle (localStorage)
- Dashboard élève avec données mockées
- Composants WelcomeCard, StatsCards, RecentCourses
- Navigation complète jusqu'au détail cours

**Captures** : `phase-03-slice.png`
```

---

## ✅ Checklist fin de Phase 3

- [ ] Login mock avec 3 boutons de rôle
- [ ] localStorage stocke le rôle
- [ ] Dashboard élève avec données mockées
- [ ] WelcomeCard, StatsCards, RecentCourses créés
- [ ] Navigation vers détail cours fonctionnelle
- [ ] Route dynamique `/student/courses/[id]`
- [ ] CourseHeader et ChaptersList créés
- [ ] Toast sur actions
- [ ] LoadingSpinner créé
- [ ] États hover présents
- [ ] Parcours complet fluide

---

## 🔄 Navigation

← [phase-03-slice.md](phase-03-slice.md) | [phase-03-code.md](phase-03-code.md) | → [phase-04-database.md](phase-04-database.md)

---

*Dernière MAJ : 2025-01-13*

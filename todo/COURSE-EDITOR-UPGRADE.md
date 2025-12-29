# 📝 TODO — Éditeur de Cours Avancé

> **Objectif** : Transformer la création de cours en une expérience riche et professionnelle  
> **Priorité** : Enhancement (post Phase 7)  
> **Status** : ✅ TERMINÉ

---

## 🎯 Vision

Le professeur doit pouvoir créer des cours de qualité avec :
- ✅ Mise en page riche (titres, gras, listes, images)
- ✅ Upload de ressources (PDF, images)
- ✅ Organisation en onglets (Info/Contenu/Ressources/Paramètres/Aperçu)
- ✅ Prévisualisation avant publication

---

## 📋 Plan de Travail

### Phase A — Éditeur Riche TipTap ✅

| Tâche | Fichier | Status |
|-------|---------|--------|
| A.1 | `package.json` | ✅ TipTap + extensions |
| A.2 | `components/ui/rich-editor.tsx` | ✅ Créé |
| A.3 | `components/ui/editor-toolbar.tsx` | ✅ Créé |
| A.4 | Intégration | ✅ Pages new + edit |

**Extensions TipTap installées** :
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-highlight
```

**Fonctionnalités éditeur** :
- [x] Titres H1, H2, H3
- [x] **Gras**, *italique*, souligné
- [x] Listes à puces et numérotées
- [x] Liens hypertexte
- [x] Images inline
- [x] Blocs de citation
- [x] Séparateurs
- [x] Alignement texte

---

### Phase B — Upload de Fichiers ✅

| Tâche | Fichier | Status |
|-------|---------|--------|
| B.1 | - | ⏭️ Vercel Blob optionnel |
| B.2 | `api/upload/route.ts` | ✅ Endpoint local |
| B.3 | `components/ui/file-upload.tsx` | ✅ Drag & drop |
| B.4 | - | Intégré dans file-upload |
| B.5 | `prisma/schema.prisma` | ✅ CourseFile existant |

**Types de fichiers supportés** :
- ✅ PDF (cours, exercices)
- ✅ Images (PNG, JPG, GIF, SVG)

**Limite** : 10 MB par fichier

---

### Phase C — Page Dédiée Création ✅

| Tâche | Fichier | Status |
|-------|---------|--------|
| C.1 | `teacher/courses/new/page.tsx` | ✅ Créé |
| C.2 | `teacher/courses/[id]/edit/page.tsx` | ✅ Créé |
| C.3 | Navigation | ✅ Bouton "Nouveau" → /new |

**Structure page** :
```
┌──────────────────────────────────────────────────────────┐
│  ← Retour    Nouveau Cours                    [Brouillon]│
├──────────────────────────────────────────────────────────┤
│  [Informations] [Contenu] [Ressources] [Paramètres]      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Titre du cours *                                    │ │
│  │ __________________________________________________ │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Contenu du cours                                    │ │
│  │ [B] [I] [U] | [H1] [H2] | [•] [1.] | [🔗] [📷]      │ │
│  │ ─────────────────────────────────────────────────── │ │
│  │                                                     │ │
│  │  Écrivez votre cours ici...                        │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  [Enregistrer brouillon]              [Publier le cours] │
└──────────────────────────────────────────────────────────┘
```

---

### Phase D — Champs Additionnels ✅

| Tâche | Fichier | Status |
|-------|---------|--------|
| D.1 | `prisma/schema.prisma` | ✅ Difficulty enum + champs |
| D.2 | Formulaire | ✅ Onglet Paramètres |
| D.3 | API | ✅ GET/PUT supportent tous les champs |

**Champs ajoutés** :
```prisma
model Course {
  difficulty    Difficulty @default(MEDIUM)
  duration      Int?       // minutes estimées
  objectives    String[]   // objectifs pédagogiques
  tags          String[]   // mots-clés
  isDraft       Boolean    @default(true)
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

---

### Phase E — Prévisualisation ✅

| Tâche | Fichier | Status |
|-------|---------|--------|
| E.1 | `components/features/courses/course-preview.tsx` | ✅ Créé |
| E.2 | Onglet Aperçu | ✅ Ajouté aux pages new + edit |

---

## 🔧 Dépendances Installées ✅

```bash
# Éditeur TipTap
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-underline @tiptap/extension-text-align @tiptap/extension-highlight

# Upload
npm install react-dropzone

# UI components
npx shadcn add toggle popover separator tabs -y
```

---

## 📊 Implémentation Terminée

```
1. Phase A (TipTap)     ██████████ ✅ Terminé
2. Phase C (Page)       ██████████ ✅ Terminé  
3. Phase B (Upload)     ██████████ ✅ Terminé
4. Phase D (Champs)     ██████████ ✅ Terminé
5. Phase E (Preview)    ██████████ ✅ Terminé
                        ───────────────────
                        TOTAL: 100% ✅
```

---

## ✅ Critères de Validation

- [x] Éditeur riche fonctionnel avec toolbar
- [x] Upload PDF/images fonctionne
- [x] Fichiers affichés dans le cours
- [x] Page création avec onglets
- [x] Brouillon vs Publié
- [x] Prévisualisation avant publication
- [ ] Mobile responsive (à tester)
- [x] Build sans erreur

---

## 📂 Fichiers Créés

| Fichier | Description |
|---------|-------------|
| `src/components/ui/rich-editor.tsx` | Wrapper TipTap |
| `src/components/ui/editor-toolbar.tsx` | Barre d'outils |
| `src/components/ui/file-upload.tsx` | Zone drag & drop |
| `src/components/features/courses/course-preview.tsx` | Rendu aperçu |
| `src/app/api/upload/route.ts` | Endpoint upload local |
| `src/app/(dashboard)/teacher/courses/new/page.tsx` | Création cours |
| `src/app/(dashboard)/teacher/courses/[id]/edit/page.tsx` | Édition cours |

---

*Créé le : 28 décembre 2025*  
*Terminé le : 28 décembre 2025*  
*Statut : ✅ TERMINÉ*

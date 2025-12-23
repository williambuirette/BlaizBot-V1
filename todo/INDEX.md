# 📋 TODO - Index Principal

> **Point d'entrée pour l'IA** : Ce fichier indique où trouver l'information.

---

## 🎯 Phase Active

**Phase actuelle** : [phase-05-auth.md](phase-05-auth.md)  
**Étape en cours** : 5.1 — Installation NextAuth.js  
**Dernière MAJ** : 2025-12-23

---

## 📁 Structure du dossier

| Fichier | Contenu | Lignes |
|:--------|:--------|:-------|
| [INDEX.md](INDEX.md) | 🎯 Navigation (ce fichier) | ~100 |
| [RULES.md](RULES.md) | ⚠️ Règles IA obligatoires | ~190 |
| [STRUCTURE.md](STRUCTURE.md) | 🗂️ Arborescence cible | ~240 |

### Fichiers de phases

| Phase | Fichier(s) | Durée | Statut |
|:------|:-----------|:------|:-------|
| 1 | [phase-01-init.md](phase-01-init.md) → [suite](phase-01-init-suite.md) → [fin](phase-01-init-fin.md) + [code](phase-01-fichiers.md) | 2-3h | ✅ |
| 2 | [phase-02-layout.md](phase-02-layout.md) → [suite](phase-02-layout-suite.md) + [code](phase-02-code.md) | 3-4h | 🔴 |
| 3 | [phase-03-slice.md](phase-03-slice.md) → [suite](phase-03-slice-suite.md) + [code](phase-03-code.md) | 3-4h | 🔴 |
| 4 | [phase-04-database.md](phase-04-database.md) → [suite](phase-04-database-suite.md) + [code](phase-04-code.md) → [code-suite](phase-04-code-suite.md) | 3-4h | 🔴 |
| 5 | [phase-05-auth.md](phase-05-auth.md) → [suite](phase-05-auth-suite.md) + [code](phase-05-code.md) → [code-suite](phase-05-code-suite.md) | 4-5h | 🔴 |
| 6 | [phase-06-admin.md](phase-06-admin.md) → [suite](phase-06-admin-suite.md) + [code](phase-06-code.md) → [suite](phase-06-code-suite.md) → [fin](phase-06-code-fin.md) | 6-8h | 🔴 |
| 7 | [phase-07-teacher.md](phase-07-teacher.md) | 6-8h | 🔴 |
| 8 | [phase-08-student.md](phase-08-student.md) | 6-8h | 🔴 |
| 9 | [phase-09-ai.md](phase-09-ai.md) | 8-10h | 🔴 |
| 10 | [phase-10-demo.md](phase-10-demo.md) | 4-6h | 🔴 |

**Note** : Phases 1-3 divisées (350 lignes max). Code/templates dans fichiers séparés.

**Durée totale estimée** : 45-60h

---

## 📊 Progression Globale

```
Phase 0   Phase 1   Phase 2   Phase 3   Phase 4   Phase 5
  PRD  →   Init  →  Layout →  Slice →    DB   →   Auth
  ✅        ✅        ✅        ✅        ✅        🔴

Phase 6   Phase 7   Phase 8   Phase 9   Phase 10
 Admin →   Prof  →  Élève  →    IA   →   Démo
   ⬜        ⬜        ⬜        ⬜        ⬜
```

| Phase | Nom | Statut | Progression | Tests | Refactor | Exposé |
|:------|:----|:-------|:------------|:------|:---------|:-------|
| 0 | PRD & Specs | ✅ Done | 100% | — | — | — |
| 1 | Initialisation | ✅ Done | 100% | ✅ | ✅ | ✅ |
| 2 | Layout | ✅ Done | 100% | ✅ | ✅ | ✅ |
| 3 | Vertical Slice | ✅ Done | 100% | ✅ | ✅ | ✅ |
| 4 | Base de données | ✅ Done | 100% | ✅ | ✅ | ✅ |
| 5 | Authentification | 🔴 Active | 0% | ⬜ | ⬜ | ⬜ |
| 6 | Admin | ⬜ À faire | 0% | ⬜ | ⬜ | ⬜ |
| 7 | Professeur | ⬜ À faire | 0% | ⬜ | ⬜ | ⬜ |
| 8 | Élève | ⬜ À faire | 0% | ⬜ | ⬜ | ⬜ |
| 9 | IA | ⬜ À faire | 0% | ⬜ | ⬜ | ⬜ |
| 10 | Démo | ⬜ À faire | 0% | ⬜ | ⬜ | ⬜ |

**Légende** : ✅ Fait | ⬜ À faire | 🔴 En cours | — Non applicable

**Progression globale** : 45% (5/11 phases)

---

## 🔍 Comment utiliser (pour l'IA)

```
WORKFLOW OBLIGATOIRE :

1. LIRE INDEX.md     → Identifier la phase active
2. LIRE RULES.md     → Contraintes 350 lignes, secrets, etc.
3. LIRE STRUCTURE.md → Où créer chaque fichier
4. OUVRIR phase-XX.md → Tâches détaillées avec instructions
5. EXÉCUTER tâche par tâche (dans l'ordre)
6. VALIDER chaque tâche avant la suivante
7. METTRE À JOUR la progression ici
```

---

## 🚨 Rappel Critique

> **AVANT de coder**, l'IA DOIT :
> 1. Lire `RULES.md` — Contraintes obligatoires (350 lignes, secrets, etc.)
> 2. Lire `STRUCTURE.md` — Savoir où placer les fichiers
> 3. Lire `phase-XX.md` actif — Instructions détaillées

---

## 📚 Autres sources de vérité

| Document | Rôle |
|:---------|:-----|
| `../docs/03-CARTOGRAPHIE_UI.md` | Inventaire des écrans |
| `../docs/04-MODELE_DONNEES.md` | Schéma Prisma complet |
| `../docs/05-API_ENDPOINTS.md` | Routes et payloads |
| `../docs/WIREFRAME_MAPPING.md` | 🆕 Correspondance wireframe ↔ composants |
| `blaizbot-wireframe/` | QUOI coder (maquettes) |

---

## 🆕 Templates Pré-Créés

Ces fichiers sont prêts à l'emploi pour accélérer le développement :

| Fichier | Usage |
|:--------|:------|
| `../.env.example` | Copier vers `.env.local` |
| `../src/types/index.ts` | Types globaux (Role, User, ApiResponse...) |
| `../src/constants/index.ts` | Constantes (ROUTES, NAV_ITEMS, AI_CONFIG...) |
| `../src/lib/mock-data.ts` | Données mockées pour Phase 3 |
| `../prisma/seed-template.ts` | Template du script de seed |

---

*Dernière mise à jour : 23.12.2025*

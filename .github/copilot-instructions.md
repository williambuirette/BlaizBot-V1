# BlaizBot V1 - AI Instructions

## 🎯 Contexte Projet
**Application éducative full-stack** avec IA intégrée (chat, RAG, génération).

| Info | Valeur |
| :--- | :--- |
| **Type** | Web App Full-Stack |
| **Stack** | Next.js 15, TypeScript, Tailwind, Prisma, Vercel Postgres, OpenAI/Claude/Gemini |
| **Wireframe** | `blaizbot-wireframe` (QUOI coder : UI, comportements) |

## 📐 Architecture
| Dossier | Rôle |
| :--- | :--- |
| `src/app/` | Next.js App Router (pages + API routes) |
| `src/app/(auth)/` | Routes publiques (login) |
| `src/app/(dashboard)/` | Routes protégées (student, teacher, admin) |
| `src/app/api/` | API REST (auth, student, teacher, admin, ai) |
| `src/components/ui/` | Composants shadcn/ui |
| `src/components/features/` | Composants métier (chat, calendar, etc.) |
| `src/lib/` | Utilitaires (prisma, auth, ai) |
| `prisma/` | Schéma BDD + migrations |
| `docs/` | Specs techniques (API, BDD, architecture) |

## 🤖 Agents (`@NomAgent` dans Copilot Chat)
| Agent | Mission |
| :--- | :--- |
| **@Orchestrateur** | Triage → redirige vers le bon expert |
| **@PM** | Gestion `TODO.md` (Top 5 + Backlog + critères d'acceptation) |
| **@Standards** | Garde-fous (≤350 lignes, zéro secrets, structure) |
| **@Refactor** | Découpage/nettoyage sans changer le comportement |
| **@Docs** | Synchronise README/docs avec le code |
| **@Review** | Validation finale GO/NO-GO |
| **@Controleur** | Audit complet en fin de séance |

## 📚 Sources de Vérité
L'IA doit consulter ces références :
1. **`blaizbot-wireframe/`** → QUOI coder (pages, sections, modales, boutons)
2. **`docs/03-CARTOGRAPHIE_UI.md`** → Inventaire complet des écrans
3. **`docs/04-MODELE_DONNEES.md`** → Schéma Prisma
4. **`docs/05-API_ENDPOINTS.md`** → Routes et payloads

## 🛡️ Standards (CRITIQUE)
| Règle | Détail |
| :--- | :--- |
| **Taille fichiers** | ≤ 350 lignes (exceptions : configs, lock, generated) |
| **Secrets** | Zéro en dur → `.env` + `.env.example` |
| **TypeScript** | Strict, pas de `any`, types explicites |
| **Commits** | `feat:`, `fix:`, `docs:`, `refactor:`, `chore:` |
| **Composants** | 1 composant = 1 fichier, props typées |
| **API** | Réponses : `{ success: true, data }` ou `{ success: false, error }` |

## 🔄 Workflow de Développement
```
1. Analyser la demande
2. Si UI → Consulter blaizbot-wireframe + docs/03-CARTOGRAPHIE_UI.md
3. Si API → Consulter docs/05-API_ENDPOINTS.md
4. Si BDD → Consulter docs/04-MODELE_DONNEES.md
5. Coder en micro-étapes (1 fichier à la fois)
6. Lint + Tests après chaque changement
7. Commit atomique (Conventional Commits)
```

## ⛔ Interdits
- ❌ Fichiers > 350 lignes
- ❌ Secrets/tokens en dur
- ❌ `git reset --hard` → utiliser `git revert`
- ❌ Inventer des specs non documentées
- ❌ Modifier plusieurs fichiers sans lien logique
- ❌ Ignorer le wireframe pour l'UI

## ✅ Sortie Attendue
Toujours conclure par :
1. **Next step (unique)** - 1 action immédiate
2. **Checklist** - Critères d'acceptation
3. **Vérification** - Commandes safe (`npm run lint`, etc.)
4. **Rollback (1 min)** - `git checkout -- <files>` ou `git revert`

## 📝 Mise à jour de l'exposé (AUTOMATIQUE)

Après chaque **tâche TODO validée** ou **commit significatif**, l'IA doit :

1. **Identifier le chapitre concerné** dans `BlaizBot-projet/progress.json`
2. **Mettre à jour le contenu** dans `BlaizBot-projet/content/XX-*.md`
3. **Mettre à jour les métriques** dans `progress.json`
4. **Indiquer les mises à jour** :
   - Chapitre modifié
   - Contenu ajouté (résumé 1 ligne)
   - Progress global (XX% → YY%)

### Mapping Tâches → Chapitres

| Tâche BlaizBot-V1 | Chapitre exposé |
| :--- | :--- |
| Phase 1 (Fondations) | 08-phase-architecture.md |
| Phase 2 (Élève) | 09-phase-developpement.md |
| Phase 3 (Professeur) | 09-phase-developpement.md |
| Phase 4 (Admin) | 09-phase-developpement.md |
| Intégration IA | 10-collaboration-ia.md |
| Fin de projet | 11-resultats-metriques.md |

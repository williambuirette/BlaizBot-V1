# Règles pour les Agents IA - BlaizBot V1

Ce document définit les règles pour les agents IA travaillant sur ce projet.

## 🔒 Confidentialité & Sécurité (CRITIQUE)

1. **Zéro Secrets** : JAMAIS de clés API, mots de passe ou tokens en dur. Utiliser `.env`.
2. **Données Sensibles** : Pas de données clients réelles (PII). Utiliser des données mockées.
3. **Context Awareness** : Le code est envoyé aux serveurs du fournisseur (GitHub/Microsoft/Anthropic).

## 🛠 Règles de Travail

1. **Petites Itérations** : Ne pas générer 500 lignes d'un coup. Procéder par étapes.
2. **Lint & Test** : Le code doit passer `npm run lint` et les tests.
3. **Documentation** : Mettre à jour JSDoc/types si la signature change.
4. **Pas de Régression** : Ne pas supprimer de code existant sans comprendre son utilité.

## 🛑 Règle d'Arrêt (CRITIQUE)

> **UNE TÂCHE À LA FOIS — STOP APRÈS CHAQUE TÂCHE**

```
⚠️ COMPORTEMENT OBLIGATOIRE :

1. L'IA exécute UNE SEULE tâche (ex: 1.1.1)
2. L'IA S'ARRÊTE et attend la validation de l'utilisateur
3. L'IA NE PASSE PAS à la tâche suivante sans instruction explicite
4. Si l'utilisateur dit "continue" ou "suivant" → passer à la tâche suivante
5. Si l'utilisateur ne dit rien → ATTENDRE

❌ INTERDIT :
- Enchaîner plusieurs tâches sans pause
- Supposer que l'utilisateur veut continuer
- Passer à la phase suivante automatiquement

✅ CORRECT :
- "Tâche 1.1.1 terminée. Veux-tu que je passe à 1.1.2 ?"
- Attendre la réponse avant d'agir
```

## 📚 Sources de Vérité

| Priorité | Source | Contenu |
| :--- | :--- | :--- |
| 🥇 | `blaizbot-wireframe/` | **UI de référence** (HTML/JS fonctionnel) |
| 🥈 | `docs/03-CARTOGRAPHIE_UI.md` | Inventaire complet des écrans |
| 🥉 | `docs/04-MODELE_DONNEES.md` | Schéma Prisma complet |
| 4️⃣ | `docs/05-API_ENDPOINTS.md` | Routes et payloads |

### 🎨 Wireframe = Source de Vérité UI

**TOUJOURS consulter le wireframe AVANT de coder l'UI :**

| Fichier Wireframe | → | Composants React |
| :--- | :---: | :--- |
| `student.html` + `student.js` | → | Pages `(dashboard)/student/*` |
| `teacher.html` + `teacher.js` | → | Pages `(dashboard)/teacher/*` |
| `admin.html` + `admin.js` | → | Pages `(dashboard)/admin/*` |
| `js/modules/*` | → | Composants `features/*` |
| `data/mockData.js` | → | Tests et fixtures |

**Comment utiliser :**
1. Ouvrir le HTML dans un navigateur
2. Inspecter les interactions (JS console)
3. Traduire en React avec les mêmes comportements

## ✅ Definition of Done (DoD)

Une tâche est terminée quand :
- [ ] Le code est écrit et propre
- [ ] `npm run lint` passe sans erreur
- [ ] Les tests passent
- [ ] La documentation est à jour
- [ ] Fichiers < 350 lignes

## 🤖 Pack d'Agents Custom

Ce projet utilise des **agents spécialisés** dans `.github/agents/` :

| Agent | Rôle |
| :--- | :--- |
| **@Orchestrateur** | Point d'entrée. Triage et redirection vers le bon expert. |
| **@PM** | Gestion de `TODO.md`, priorités et backlog. |
| **@Standards** | Garde-fous (≤350 lignes, secrets, conventions). |
| **@Refactor** | Découpage/nettoyage sans changer le comportement. |
| **@Docs** | Synchronisation README/docs avec le code. |
| **@Review** | Validation finale avant merge (checklist QA). |
| **@Controleur** | Audit complet en fin de séance. |

**Usage** : Dans Copilot Chat, tapez `@NomAgent` ou sélectionnez dans le menu.

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

- ❌ Fichiers > 350 lignes (exceptions : configs, lock, generated)
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

# Standards check

Contrôle strict des garde-fous du repo.

## Détection repo (obligatoire)
Détermine si c'est :
- **Configuration Hub** → vérifie profiles/, TEMPLATES/, settings (pas de npm)
- **Repo applicatif** → vérifie src/, lint/tests, structure projet

## Checks (ordre fixe)
1. **Taille** : fichiers ≤ 350 lignes (exceptions : configs, lockfiles, generated, snapshots)
2. **Secrets** : patterns à risque (`sk-`, `ghp_`, `AIza`, `BEGIN PRIVATE KEY`, `.env`)
3. **Structure** : dossiers attendus selon type de repo
4. **Conventions** : duplication, god files, nommage
5. **Workflow** : lint/test/commit cohérents

## Sortie attendue
### BLOCKERS
- [ ] ...
### WARNINGS
- [ ] ...
### NITS
- [ ] ...

## Patchs proposés (diff) si correction simple

## Décision : **GO / NO-GO**

## Next step unique + Vérification + Rollback non destructif

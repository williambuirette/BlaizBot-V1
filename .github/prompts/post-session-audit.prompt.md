# Post-session audit

Fais un audit complet post-session.

## Détection repo (obligatoire)
Détermine si c'est :
- **Configuration Hub** (présence de `profiles/`, `restore.ps1`, `settings.user.json`)
- **Repo applicatif** (présence de `src/`, `package.json`, etc.)

## Exécution
Applique le protocole du "Contrôleur de session" :
1. Scan : `git status`, fichiers modifiés, scripts disponibles
2. Audit Standards : BLOCKERS / WARNINGS / NITS
3. Audit Qualité : lint/build/tests (si app) ou cohérence configs (si hub)
4. Plan Refactor (micro-commits)
5. Plan Docs (README/docs/START-HERE)
6. Plan PM/TODO

## Sortie attendue
- Ne modifie rien par défaut
- Propose des patchs (diff) seulement si petits et sûrs
- **Next step unique**
- Vérification + **Rollback non destructif** (1 min)
- Décision **GO / NO-GO**

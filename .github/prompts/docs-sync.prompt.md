# Docs sync

Synchronise la documentation avec la réalité du repo.

## Détection repo (obligatoire)
Détermine si c'est :
- **Configuration Hub** → documente profiles/, restore.ps1, TEMPLATES/, workflows config
- **Repo applicatif** → documente README/src/docs, installation, scripts, API

## Fichiers à scanner
1. `README.md` : installation, scripts, commandes, structure
2. `docs/` : architecture, décisions, workflows
3. `START-HERE.md` : garde-fous, navigation
4. `package.json` / `restore.ps1` : scripts réels
5. Fichiers modifiés récemment : repérer ce qui a changé sans être documenté

## Règles
- **Zéro invention** : si non vérifiable → "À confirmer"
- **Doc = contrat** : tout ce qui est écrit doit être vrai
- **Changements minimaux** : corriger la doc pour coller au code

## Sortie attendue
### Détection
- Points non documentés ou incohérents (3-10 bullets)

### Patch proposé (diff)
- Par fichier (README, docs/, START-HERE)

### Next step unique + Vérification + Rollback non destructif

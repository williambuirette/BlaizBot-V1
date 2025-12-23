# Guide de Contribution

## 🔒 Sécurité

*   **NE JAMAIS** commiter de secrets (`.env`, clés API, certificats).
*   Vérifier que le `.gitignore` est bien configuré avant le premier commit.

## Conventional Commits

Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/) :

*   `feat: ...` : Nouvelle fonctionnalité.
*   `fix: ...` : Correction de bug.
*   `docs: ...` : Documentation uniquement.
*   `style: ...` : Formatage, points-virgules manquants (pas de changement de logique).
*   `refactor: ...` : Refactoring (ni fix, ni feat).
*   `test: ...` : Ajout ou correction de tests.
*   `chore: ...` : Maintenance (build, dépendances, config).

## Structure des Dossiers (Standard)

```text
/
├── src/            # Code source
├── tests/          # Tests unitaires et d'intégration
├── docs/           # Documentation supplémentaire
├── .vscode/        # Config éditeur partagée
├── .gitignore      # Fichiers ignorés
└── README.md       # Point d'entrée
```

## Commandes Standard

*   `npm run dev` : Lancer en mode développement.
*   `npm run build` : Construire pour la production.
*   `npm run test` : Lancer les tests.
*   `npm run lint` : Vérifier le style du code.

## Checklist Pull Request (PR)

1.  [ ] Le code compile/s'exécute sans erreur.
2.  [ ] Les nouveaux tests passent.
3.  [ ] Pas de secrets commis par erreur.
4.  [ ] Le code est formaté (Prettier/Linter).

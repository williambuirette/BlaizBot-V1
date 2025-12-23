# Journal des Prompts - BlaizBot V1

> **Objectif** : Documenter chaque prompt, ses itérations, et le rétro-prompt parfait  
> **Usage** : Amélioration continue des compétences en prompt engineering  
> **Pour l'exposé** : Les meilleurs exemples iront dans `BlaizBot-projet/annexes/B-prompts-journal.md`

---

## � Structure

Chaque phase a son propre fichier pour faciliter la navigation :

| Phase | Fichier | Statut |
| :--- | :--- | :--- |
| Phase 1 - Initialisation | [prompts/phase-01-init.md](prompts/phase-01-init.md) | 🔴 À faire |
| Phase 2 - Layout | [prompts/phase-02-layout.md](prompts/phase-02-layout.md) | 🔴 À faire |
| Phase 3 - Vertical Slice | [prompts/phase-03-slice.md](prompts/phase-03-slice.md) | 🔴 À faire |
| Phase 4 - Database | [prompts/phase-04-database.md](prompts/phase-04-database.md) | 🔴 À faire |
| Phase 5 - Auth | [prompts/phase-05-auth.md](prompts/phase-05-auth.md) | 🔴 À faire |
| Phase 6 - Admin | [prompts/phase-06-admin.md](prompts/phase-06-admin.md) | 🔴 À faire |
| Phase 7 - Professeur | [prompts/phase-07-teacher.md](prompts/phase-07-teacher.md) | 🔴 À faire |
| Phase 8 - Élève | [prompts/phase-08-student.md](prompts/phase-08-student.md) | 🔴 À faire |
| Phase 9 - IA | [prompts/phase-09-ia.md](prompts/phase-09-ia.md) | 🔴 À faire |
| Phase 10 - Démo | [prompts/phase-10-demo.md](prompts/phase-10-demo.md) | 🔴 À faire |

---

## 🏆 Statistiques Globales

| Phase | Tâches | Itérations moy. | 1-shot | Meilleur prompt |
|-------|--------|-----------------|--------|-----------------|
| 1 | 0/7 | - | - | - |
| 2 | 0/7 | - | - | - |
| 3 | 0/4 | - | - | - |
| 4 | 0/7 | - | - | - |
| 5 | 0/7 | - | - | - |
| 6 | 0/7 | - | - | - |
| 7 | 0/7 | - | - | - |
| 8 | 0/7 | - | - | - |
| 9 | 0/7 | - | - | - |
| 10 | 0/7 | - | - | - |
| **TOTAL** | **0/67** | **-** | **0** | - |

**Objectif** : Atteindre 50% de prompts "1-shot" (résultat parfait du premier coup)

---

## 📈 Évolution des Compétences

| Semaine | Itérations moy. | Taux 1-shot | Observation |
|---------|-----------------|-------------|-------------|
| S1 | - | - | Début projet |
| S2 | - | - | - |
| S3 | - | - | - |

---

## 🎯 Patterns Efficaces (Best-of)

Les meilleurs patterns découverts pendant le projet :

### Composant UI
```
Crée un composant [Nom].tsx en TypeScript/React :
- Props : { [props typées] }
- Style : Tailwind, [specs visuelles]
- Comportement : [interactions]
- Contrainte : < [N] lignes
```

### Route API
```
Crée une route API [path] :
- Méthode : [GET/POST/...]
- Auth : [requis/optionnel]
- Input : [schema Zod]
- Output : { success: boolean, data/error }
- Gestion erreurs : [cas spécifiques]
```

### Bug Fix
```
Bug dans [fichier]:[ligne]
Comportement attendu : [X]
Comportement actuel : [Y]
Erreur : [message exact]
Contexte : [code environnant]
```

---

## ❌ Anti-Patterns à Éviter

| ❌ Mauvais | Pourquoi | ✅ Mieux |
|-----------|----------|---------|
| "Fais la page X" | Trop vague | Specs précises + contraintes |
| "Corrige ça" | Pas de contexte | Fichier + ligne + erreur |
| "Comme avant" | L'IA oublie | Redonner le contexte |
| "Fais tout" | Trop gros | 1 tâche à la fois |

---

## 🗣️ Guide de Communication avec l'IA

### Début de session (TOUJOURS)

```
"Lis todo/INDEX.md et dis-moi où on en est"
```

ou avec l'agent :
```
"@Orchestrateur reprends le développement"
```

### Pendant le développement

| Situation | Prompt recommandé |
|:----------|:------------------|
| Nouvelle tâche | "Fais la tâche X.Y de phase-XX.md" |
| Continuer | "Tâche suivante" |
| Vérifier | "Montre-moi l'état de la phase actuelle" |
| Problème | "Il y a une erreur : [message]. Corrige." |

### Fin de phase (CRITIQUE)

```
"Phase X terminée. Exécute les 3 checkpoints : TEST, REFACTOR, EXPOSÉ"
```

L'IA doit alors :
1. ✅ Exécuter TEST CHECKPOINT
2. ✅ Exécuter REFACTOR CHECKPOINT  
3. ✅ Exécuter EXPOSÉ CHECKPOINT
4. ✅ Mettre à jour INDEX.md

### Fin de session

```
"Résume ce qu'on a fait et ce qu'il reste à faire"
```

→ Tu auras un point de reprise pour la prochaine session.

### Commandes utiles

| Commande | Action |
|:---------|:-------|
| "Status" | L'IA lit INDEX.md et résume |
| "Checkpoint" | L'IA exécute les 3 checkpoints |
| "Exposé status" | L'IA lance expose-status.ps1 |
| "Prochain" | L'IA passe à la tâche suivante |

---

*Dernière mise à jour : 2025-12-22*

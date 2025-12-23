# Phase 10 - Stabilisation & Démo

> **Objectif** : Parcours principal sans bug + Plan B  
> **Fichiers TODO** : `phase-10-demo.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 10.1 — Tests Critiques

### Prompt 10.1.1 — Checklist Tests

```
Exécuter les tests manuels suivants :

### Authentification
- [ ] Login admin@blaizbot.fr / password123 → /admin
- [ ] Login prof1@blaizbot.fr / password123 → /teacher
- [ ] Login eleve1@blaizbot.fr / password123 → /student
- [ ] Logout → /login
- [ ] Accès /admin sans auth → /login

### Admin
- [ ] Dashboard avec 4 KPIs corrects
- [ ] Créer un utilisateur
- [ ] Modifier un utilisateur
- [ ] Supprimer un utilisateur

### Professeur
- [ ] Dashboard avec ses stats
- [ ] Voir ses classes
- [ ] Créer un cours
- [ ] Modifier un cours

### Élève
- [ ] Dashboard avec progression
- [ ] Voir la liste des cours
- [ ] Lire un cours
- [ ] Chat avec l'IA
- [ ] Générer un quiz

Reporter les résultats en format :
| Test | Résultat | Bug ID |
```

---

## 📋 Étape 10.2 — Fix Bugs Bloquants

### Prompt 10.2.1 — Triage Bugs

```
Catégoriser les bugs trouvés :

🔴 BLOQUANT : Crash, erreur 500, empêche le parcours
→ DOIT être fixé avant la démo

🟠 MAJEUR : UX dégradée mais fonctionnel
→ Fix si temps disponible

🟡 MINEUR : Cosmétique
→ Documenter dans KNOWN_ISSUES.md

Workflow de fix :
1. Reproduire le bug
2. Identifier la cause (logs, console)
3. Fix minimal (pas de refacto)
4. Tester le fix
5. Commit : fix: [BUG-XXX] description
```

### Prompt 10.2.2 — KNOWN_ISSUES.md

```
Créer `KNOWN_ISSUES.md` à la racine :

# Known Issues

## Bugs non corrigés

### BUG-XXX : Description
- **Gravité** : Mineur
- **Description** : ...
- **Contournement** : ...

(Documenter tous les bugs non fixés)
```

---

## 📋 Étape 10.3 — Polish UI

### Prompt 10.3.1 — Responsive Check

```
Tester chaque page sur 3 breakpoints :

375px (mobile) :
- [ ] Sidebar cachée ou hamburger
- [ ] Tables scrollables horizontalement
- [ ] Forms full-width

768px (tablette) :
- [ ] Layout 2 colonnes OK
- [ ] Modals adaptés

1280px (desktop) :
- [ ] Layout complet
- [ ] Sidebar visible
```

### Prompt 10.3.2 — Loading States

```
Vérifier les états de chargement :

- [ ] Boutons désactivés pendant submit
- [ ] Spinners sur les fetch
- [ ] Skeleton sur les pages (optionnel)
- [ ] Message d'erreur si API fail

Ajouter si manquant.
```

### Prompt 10.3.3 — Empty States

```
Vérifier les états vides :

- [ ] "Aucun utilisateur" si liste vide
- [ ] "Aucun cours" si pas de cours
- [ ] "Aucun message" si inbox vide

Avec icône et texte explicatif.
```

---

## 📋 Étape 10.4 — Préparer la Démo

### Prompt 10.4.1 — Script Démo

```
Créer `docs/DEMO_SCRIPT.md` :

# Script de Démo (5 min)

## Introduction (30s)
"BlaizBot est une plateforme éducative avec IA..."

## 1. Admin (1min)
- Login admin
- Montrer dashboard KPIs
- Créer un utilisateur
- Logout

## 2. Professeur (1min30)
- Login prof
- Voir mes classes
- Créer un cours
- Logout

## 3. Élève (2min)
- Login élève
- Dashboard progression
- Lire un cours
- Poser question à l'IA
- Générer un quiz

## Conclusion
"Merci pour votre attention..."
```

### Prompt 10.4.2 — Plan B

```
Préparer les fallbacks :

1. Si l'IA ne répond pas :
   → Message "Service temporairement indisponible"
   → Montrer les cours à la place

2. Si la DB est lente :
   → Avoir des screenshots prêts
   → "En production, c'est plus rapide"

3. Si quelque chose plante :
   → Reload la page
   → "Bug connu, fix en cours"
   → Passer à la feature suivante

4. Avoir un hotspot mobile en backup
```

### Prompt 10.4.3 — Seed Démo

```
Créer `prisma/seed-demo.ts` :

Seed avec données réalistes pour la démo :
- Admin avec avatar
- 2 profs avec noms réels
- 5 élèves
- 3 classes
- 6 cours avec contenu réel
- Messages de test
- Quiz de test

npx prisma db seed -- --demo
```

---

## 📊 Validation Finale Phase 10

```
Checklist finale :

1. [ ] Tous les tests critiques passent
2. [ ] 0 bug bloquant
3. [ ] KNOWN_ISSUES.md documenté
4. [ ] UI responsive et polie
5. [ ] Script de démo prêt
6. [ ] Plan B préparé
7. [ ] Seed démo exécuté
8. [ ] npm run build → OK
9. [ ] Déploiement Vercel (optionnel)
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 10.1 | | | | |
| 10.2 | | | | |
| 10.3 | | | | |
| 10.4 | | | | |

---

## 🎬 Résumé Projet

### Métriques Globales

| Phase | Durée | Itérations | Prompts 1-shot |
|-------|-------|------------|----------------|
| 1. Init | | | |
| 2. Layout | | | |
| 3. Slice | | | |
| 4. Database | | | |
| 5. Auth | | | |
| 6. Admin | | | |
| 7. Teacher | | | |
| 8. Student | | | |
| 9. IA | | | |
| 10. Demo | | | |
| **TOTAL** | | | |

### Leçons Apprises

*À compléter après le projet*

---

*Dernière mise à jour : 2025-01-13*

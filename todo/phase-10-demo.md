# 🎬 Phase 10 — Stabilisation & Démo

> **Objectif** : Parcours principal sans bug + Plan B  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 4-6h  
> **Prérequis** : Phase 9 terminée (IA fonctionnelle)

---

## ⚠️ Instructions IA

```
RÈGLE 350 LIGNES (rappel) :
- Phase de CONSOLIDATION, pas de nouveau code complexe
- Focus sur la QUALITÉ et la DOCUMENTATION

OBJECTIF DÉMO :
- 5 minutes maximum
- Parcours fluide sans accroc
- Plan B si quelque chose plante

MANTRA : "Si ça marche en démo, c'est bon"
```

---

## 📚 Sources de vérité

| Source | Usage |
|--------|-------|
| `docs/10-DEVLOG.md` | Journal de développement |
| `blaizbot-wireframe/` | Référence visuelle pour polish |
| Phases 1-9 | Features à tester |

---

## 📋 Étape 10.1 — Tests Critiques

### 🎯 Objectif
Valider que tous les parcours utilisateur principaux fonctionnent.

### 📝 Comment
Tests manuels systématiques sur les 3 rôles.

### 🔧 Par quel moyen
- Checklist de tests avec comptes dédiés
- Console ouverte pour traquer les erreurs
- Network tab pour vérifier les API

| # | Test | Action | Validation |
|:--|:-----|:-------|:-----------|
| 10.1.1 | Login Admin | admin@blaizbot.fr / admin123 | Redirect /admin |
| 10.1.2 | Login Prof | prof1@blaizbot.fr / prof123 | Redirect /teacher |
| 10.1.3 | Login Élève | eleve1@blaizbot.fr / eleve123 | Redirect /student |
| 10.1.4 | CRUD Users | Create, Read, Update, Delete | Toutes opérations OK |
| 10.1.5 | Créer cours | Prof crée un cours | Cours visible |
| 10.1.6 | Chat IA | Élève pose une question | Réponse streaming |
| 10.1.7 | Quiz | Générer et jouer un quiz | Quiz jouable |

### 💡 INSTRUCTION 10.1 (Tests Critiques)

```markdown
## Contexte
Tu valides que l'app est prête pour la démo.

## Ta mission
Exécuter les tests suivants et reporter les résultats :

### 1. Tests Authentification
- [ ] Login admin → redirect /admin
- [ ] Login prof → redirect /teacher
- [ ] Login élève → redirect /student
- [ ] Logout → redirect /login
- [ ] Accès route protégée sans auth → redirect /login

### 2. Tests Admin
- [ ] Dashboard affiche les KPIs corrects
- [ ] Créer un utilisateur
- [ ] Modifier un utilisateur
- [ ] Supprimer un utilisateur
- [ ] Lister les classes

### 3. Tests Professeur
- [ ] Dashboard affiche mes classes
- [ ] Créer un cours
- [ ] Ajouter un chapitre
- [ ] Envoyer un message

### 4. Tests Élève
- [ ] Dashboard affiche progression
- [ ] Voir la liste des cours
- [ ] Lire un cours
- [ ] Poser question à l'IA
- [ ] Générer un quiz

## Format du rapport
| Test | Résultat | Bug ID |
|------|----------|--------|
| Login admin | ✅ | - |
| CRUD users | ⚠️ | BUG-001 |
```

---

## 📋 Étape 10.2 — Fix Bugs Bloquants

### 🎯 Objectif
Corriger tous les bugs qui empêchent la démo.

### 📝 Comment
Trier par criticité, fixer les bloquants d'abord.

### 🔧 Par quel moyen
- Liste dans `KNOWN_ISSUES.md`
- Fix 1 bug à la fois avec commit
- Ne pas toucher aux bugs mineurs

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 10.2.1 | Lister | Lister tous les bugs trouvés | Liste créée |
| 10.2.2 | Trier | Bloquant > Majeur > Mineur | Priorités définies |
| 10.2.3 | Fix | Fix bugs bloquants (1 par 1) | 0 bug bloquant |
| 10.2.4 | Documenter | Bugs non fixés → `KNOWN_ISSUES.md` | Liste documentée |

### 💡 INSTRUCTION 10.2 (Fix Bugs)

```markdown
## Contexte
Tu corriges les bugs qui empêchent la démo.

## Catégories
- 🔴 **Bloquant** : Crash, erreur 500, empêche le parcours
- 🟠 **Majeur** : UX dégradée mais fonctionnel
- 🟡 **Mineur** : Cosmétique, peut attendre

## Workflow de fix
1. Identifier le bug (reproduire)
2. Trouver la cause (logs, console)
3. Fix minimal (pas de refacto)
4. Tester le fix
5. Commit : `fix: [BUG-XXX] description`

## Fichier KNOWN_ISSUES.md
# Known Issues

## Bugs non corrigés (mineurs)

### BUG-003 : Tooltip tronqué sur mobile
- **Gravité** : Mineur
- **Description** : Le tooltip dépasse de l'écran sur mobile
- **Contournement** : Utiliser en mode paysage

### BUG-004 : ...
```

---

## 📋 Étape 10.3 — Polish UI

### 🎯 Objectif
Rendre l'interface professionnelle et cohérente.

### 📝 Comment
Passer en revue chaque page pour les détails visuels.

### 🔧 Par quel moyen
- Checklist responsive (375px, 768px, 1280px)
- Vérifier hover states, loading states
- Cohérence des couleurs et espacements

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 10.3.1 | Responsive 375px | Test mobile | Pas de casse |
| 10.3.2 | Responsive 768px | Test tablette | Layout OK |
| 10.3.3 | Responsive 1280px | Test desktop | Layout OK |
| 10.3.4 | Hover states | Tous les boutons | Hover visible |
| 10.3.5 | Loading states | Tous les fetch | Spinners visibles |
| 10.3.6 | Validation forms | Tous les formulaires | Erreurs affichées |

### 💡 INSTRUCTION 10.3 (Polish UI)

```markdown
## Contexte
Tu améliores les détails visuels pour une démo pro.

## Checklist par page

### Login
- [ ] Logo centré
- [ ] Form centré verticalement
- [ ] Bouton avec hover
- [ ] Message erreur stylé

### Dashboard (tous rôles)
- [ ] KPI cards alignées
- [ ] Responsive 3 colonnes → 1 colonne mobile
- [ ] Hover sur cards cliquables

### Tables
- [ ] Headers sticky
- [ ] Lignes avec hover
- [ ] Pagination visible
- [ ] Empty state si 0 data

### Formulaires
- [ ] Labels clairs
- [ ] Placeholders utiles
- [ ] Validation inline
- [ ] Bouton disabled pendant submit

### Chat IA
- [ ] Scroll auto vers le bas
- [ ] Bulles user à droite, IA à gauche
- [ ] Indicator "en train d'écrire..."
- [ ] Bouton envoyer disabled si vide
```

---

## 📋 Étape 10.4 — Script de Démo

### 🎯 Objectif
Démo scriptée = moins de stress = moins d'erreurs.

### 📝 Comment
Documenter chaque clic avec timing.

### 🔧 Par quel moyen
- Fichier `docs/DEMO_SCRIPT.md`
- Timer par section
- Total < 5 minutes

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 10.4.1 | Créer fichier | `docs/DEMO_SCRIPT.md` | Fichier créé |
| 10.4.2 | Scénario Admin | Créer user + classe | ~1 min |
| 10.4.3 | Scénario Prof | Créer cours | ~1 min 30s |
| 10.4.4 | Scénario Élève | Voir cours + IA | ~2 min |
| 10.4.5 | Timer | Vérifier total < 5 min | Temps OK |
| 10.4.6 | Répéter | Répéter 2x minimum | Timing validé |

### 💡 INSTRUCTION 10.4 (Script Démo)

```markdown
## Contexte
Tu crées le script de démonstration.

## Créer docs/DEMO_SCRIPT.md

# 🎬 Script de Démonstration BlaizBot

## ⏱️ Durée totale : 5 minutes

---

## 🔧 Préparation (avant la démo)

- [ ] Terminal : `npm run dev` lancé
- [ ] BDD : `npm run seed:demo` exécuté
- [ ] Navigateur : http://localhost:3000 ouvert
- [ ] Onglet : DevTools fermé (propre)

---

## 🎭 Partie 1 : Admin (1 min)

1. **Login** : demo@blaizbot.edu / demo123
2. **Dashboard** : "Voici le tableau de bord admin avec les KPIs"
3. **Users** : Cliquer sur "Utilisateurs"
4. **Créer** : Bouton "+" → Créer "Test Élève"
5. **Montrer** : L'utilisateur apparaît dans la liste
6. **Logout** : Bouton déconnexion

---

## 🎭 Partie 2 : Professeur (1 min 30s)

1. **Login** : m.dupont@blaizbot.edu / prof123
2. **Dashboard** : "Voici mes classes et statistiques"
3. **Cours** : Cliquer sur "Mes cours"
4. **Créer** : Bouton "+" → "Les Fractions" en Maths
5. **Contenu** : Ajouter du texte markdown
6. **Sauver** : Montrer le cours créé
7. **Logout**

---

## 🎭 Partie 3 : Élève (2 min)

1. **Login** : lucas.martin@blaizbot.edu / eleve123
2. **Dashboard** : "Voici ma progression"
3. **Cours** : Voir "Les Fractions"
4. **Lire** : Scroll dans le contenu
5. **IA** : Cliquer sur "Assistant IA"
6. **Question** : "Comment additionner 1/2 + 1/4 ?"
7. **Réponse** : Montrer le streaming
8. **Quiz** : Bouton "Générer un quiz"
9. **Jouer** : Répondre à 2-3 questions
10. **Score** : Montrer le résultat

---

## 🆘 En cas de problème

| Problème | Solution |
|----------|----------|
| IA ne répond pas | "L'API est temporairement indisponible" |
| Page blanche | Refresh (F5) |
| Erreur login | Vérifier seed : `npm run seed:demo` |
```

---

## 🔄 Navigation

← [phase-09-ai.md](phase-09-ai.md) | [phase-10-demo-suite.md](phase-10-demo-suite.md) →

---

*Lignes : ~250 | Suite dans phase-10-demo-suite.md*

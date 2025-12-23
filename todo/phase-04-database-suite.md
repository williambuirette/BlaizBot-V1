# 🗄️ Phase 4 — Base de Données (Partie 2)

> **Prérequis** : Avoir complété [phase-04-database.md](phase-04-database.md) (4.1→4.3)  
> **Objectif** : Migrations, seed et tests  
> **Statut** : 🔴 À FAIRE

📁 **Fichiers liés** :
- [phase-04-database.md](phase-04-database.md) — Étapes 4.1→4.3
- [phase-04-code.md](phase-04-code.md) — Code source & templates

---

## 📋 Étape 4.4 — Première migration

### 🎯 Objectif
Appliquer le schéma Prisma à la base de données Vercel Postgres. La migration crée les tables SQL correspondant aux modèles définis.

### 📝 Comment
Exécuter `prisma migrate dev` qui génère le SQL et l'applique. Vérifier ensuite dans Vercel Postgres que les tables existent.

### 🔧 Par quel moyen
1. `npx prisma migrate dev --name init`
2. Vérifier le dossier migrations
3. `npx prisma generate`
4. Vérifier dans Vercel Dashboard

---

### 4.4.1 — Créer la migration

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.4.1 | Migrate | `npx prisma migrate dev --name init` | Migration OK |

💡 **INSTRUCTION** :
```bash
npx prisma migrate dev --name init
# --name init = nom de la migration
# Crée : prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql
```

**En cas d'erreur de connexion** :
- Vérifier DATABASE_URL dans .env.local
- Vérifier le mot de passe (caractères spéciaux à échapper)
- Vérifier que le projet Vercel Postgres est actif

---

### 4.4.2 — Vérifier les fichiers

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.4.2 | Vérifier | Check `prisma/migrations/` | Fichier SQL présent |

💡 **INSTRUCTION** :
```bash
ls prisma/migrations/
# Doit contenir un dossier avec timestamp
# Exemple : 20251222120000_init/

cat prisma/migrations/*/migration.sql
# Affiche le SQL généré (CREATE TABLE, etc.)
```

---

### 4.4.3 — Générer le client

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.4.3 | Generate | `npx prisma generate` | Client généré |

💡 **INSTRUCTION** :
```bash
npx prisma generate
# Génère le client TypeScript dans node_modules/.prisma/client
# Les types sont maintenant disponibles pour l'autocomplétion
```

---

### 4.4.4 — Vérifier dans Vercel Postgres

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.4.4 | Vercel Postgres | Vérifier tables créées | Tables visibles |

💡 **INSTRUCTION** :
- Aller sur vercel.com/storage → Ton projet
- Table Editor (menu gauche)
- Vérifier : User, Class, Subject, Course, Chapter, etc.
- Les tables doivent apparaître avec leurs colonnes

---

### 🧪 TEST CHECKPOINT 4.A — Après migration

> ⚠️ **OBLIGATOIRE** : Vérifier avant de continuer

| Test | Commande/Action | Résultat attendu |
|:-----|:----------------|:-----------------|
| Migration | `npx prisma migrate status` | ✅ All migrations applied |
| Generate | `npx prisma generate` | ✅ Client generated |
| Vercel Postgres | Table Editor | ✅ Tables visibles |

**Vérifications Vercel Postgres** :
- [ ] Table User existe avec colonnes
- [ ] Table Class existe
- [ ] Table Course existe
- [ ] Relations visibles (clefs étrangères)

---

## 📋 Étape 4.5 — Créer le script seed

### 🎯 Objectif
Créer un script qui remplit la base avec des données de démo. Le seed doit être idempotent (relançable sans erreur) et créer des données réalistes.

### 📝 Comment
Créer `prisma/seed.ts` avec la création ordonnée des entités (users, classes, subjects, courses, etc.). Utiliser bcrypt pour les mots de passe.

### 🔧 Par quel moyen
1. Installer `bcryptjs` et `ts-node`
2. Créer le fichier seed.ts
3. Configurer package.json
4. Exécuter avec `npx prisma db seed`

---

### 4.5.1 — Installer dépendances

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.5.1 | Install | `npm install bcryptjs tsx` | Packages OK |

💡 **INSTRUCTION** :
```bash
npm install bcryptjs
npm install -D @types/bcryptjs tsx
# bcryptjs = hash des mots de passe
# tsx = exécuter TypeScript directement
```

---

### 4.5.2 — Créer le fichier seed

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 4.5.2 | Fichier | `prisma/seed.ts` | Fichier créé |

💡 **INSTRUCTION** : Voir **Section 6** de [phase-04-code.md](phase-04-code.md#6-prismaseeedts-structure)

---

### 4.5.3 — Ajouter Admin

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.5.3 | Admin | Créer admin@blaizbot.fr | User admin |

💡 **INSTRUCTION** :
```typescript
await prisma.user.upsert({
  where: { email: 'admin@blaizbot.fr' },
  update: {},
  create: {
    email: 'admin@blaizbot.fr',
    password: await bcrypt.hash('admin123', 10),
    name: 'Administrateur',
    role: 'ADMIN',
  },
});
```

---

### 4.5.4 — Ajouter Professeurs

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.5.4 | Profs | Créer 2 professeurs | Users profs |

💡 **INSTRUCTION** :
- prof1@blaizbot.fr (M. Dupont - Maths)
- prof2@blaizbot.fr (Mme Bernard - Français)
- Mot de passe : `prof123`

---

### 4.5.5 — Ajouter Élèves

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.5.5 | Élèves | Créer 5 élèves | Users élèves |

💡 **INSTRUCTION** :
- lucas@example.com, emma@example.com, etc.
- Mot de passe : `student123`
- Voir **Section 7** de [phase-04-code.md](phase-04-code.md#7-seed-users-complet)

---

### 4.5.6 à 4.5.8 — Classes, Matières, Cours

| # | Entité | Quantité | Validation |
|:--|:-------|:---------|:-----------|
| 4.5.6 | Classes | 3 (3ème A, 3ème B, 4ème A) | Créées |
| 4.5.7 | Matières | 4 (Maths, Français, Histoire, SVT) | Créées |
| 4.5.8 | Cours | 6 (2 par prof) | Créés |

💡 **INSTRUCTION** : Voir **Section 8** de [phase-04-code.md](phase-04-code.md#8-seed-classes-courses)

---

### 4.5.9 — Vérifier la taille

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.5.9 | Taille | `(Get-Content prisma/seed.ts).Count` | < 300 lignes |

💡 **INSTRUCTION** : Si > 300 lignes, extraire les données dans un fichier `seedData.ts`

---

## 📋 Étape 4.6 — Exécuter le seed

### 🎯 Objectif
Configurer et exécuter le seed pour remplir la base de données avec les données de démo.

### 📝 Comment
Ajouter la configuration dans package.json, puis exécuter `prisma db seed`.

### 🔧 Par quel moyen
1. Configurer package.json
2. `npx prisma db seed`
3. Vérifier les counts

---

### 4.6.1 — Configurer package.json

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.6.1 | Config | Ajouter prisma.seed | Script ajouté |

💡 **INSTRUCTION** :
```json
// Dans package.json, ajouter :
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

### 4.6.2 — Exécuter le seed

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.6.2 | Seed | `npx prisma db seed` | Seed OK |

💡 **INSTRUCTION** :
```bash
npx prisma db seed
# Output attendu :
# 🌱 Seeding database...
# ✅ Admin created
# ✅ Teachers created
# ... etc
```

---

### 4.6.3-4 — Vérifier les counts

| # | Tâche | Count attendu | Validation |
|:--|:------|:--------------|:-----------|
| 4.6.3 | Users | 8 (1 admin + 2 profs + 5 élèves) | ✓ |
| 4.6.4 | Classes | 3 | ✓ |

💡 **INSTRUCTION** :
```bash
npx prisma studio
# Ouvrir chaque table et vérifier le count
```

---

## 📋 Étape 4.7 — Tester la connexion

### 🎯 Objectif
Vérifier que tout fonctionne avec Prisma Studio, l'interface graphique pour explorer la base.

### 📝 Comment
Lancer Prisma Studio, naviguer dans les tables, vérifier les données et les relations.

### 🔧 Par quel moyen
`npx prisma studio` → navigateur http://localhost:5555

---

### 4.7.1 — Lancer Studio

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.7.1 | Studio | `npx prisma studio` | Studio ouvert |

💡 **INSTRUCTION** :
```bash
npx prisma studio
# Ouvre automatiquement http://localhost:5555
# Interface graphique pour explorer les données
```

---

### 4.7.2-4 — Vérifications

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.7.2 | Users | Cliquer sur User | 8 users visibles |
| 4.7.3 | Classes | Cliquer sur Class | 3 classes visibles |
| 4.7.4 | Relations | Cliquer sur un User → voir ses relations | Relations OK |

---

### 4.7.5 — Screenshot

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.7.5 | Capture | Screenshot Prisma Studio | Fichier créé |

💡 **INSTRUCTION** :
- Screenshot montrant la table User avec les 8 users
- Sauvegarder dans `assets/screenshots/phase-04-prisma-studio.png`

---

### 🧪 TEST CHECKPOINT 4.B — Validation Phase 4

> ⚠️ **OBLIGATOIRE** : Validation complète avant Phase 5

| Test | Commande | Résultat attendu |
|:-----|:---------|:-----------------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |
| TypeScript | `npx tsc --noEmit` | ✅ Clean |
| Prisma | `npx prisma studio` | ✅ Données visibles |

**Comptages à vérifier dans Prisma Studio** :
- [ ] User : 8 enregistrements
- [ ] Class : 3 enregistrements
- [ ] Subject : 4 enregistrements
- [ ] Course : 6 enregistrements

**Relation test** :
- [ ] Clic sur un User → voir ses relations (class, enrollments)
- [ ] Clic sur un Course → voir teacher, subject, chapters

---

### 🔄 REFACTOR CHECKPOINT 4.C — Vérification standards

> 📏 **Règle** : Aucun fichier > 350 lignes

```powershell
# Vérifier les fichiers trop longs
Get-ChildItem -Path src,prisma -Recurse -Include *.tsx,*.ts | `
  ForEach-Object { $lines = (Get-Content $_).Count; if($lines -gt 350) { "$($_.Name): $lines lignes" } }
```

**Vérifications spécifiques Phase 4** :
- [ ] `schema.prisma` est bien structuré (sections commentées)
- [ ] `seed.ts` utilise des transactions
- [ ] `lib/prisma.ts` est un singleton correct

---

### 📝 EXPOSÉ CHECKPOINT 4.D — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 4.D.1 | Incrémenter `developmentHours` (+4h) | `progress.json` |
| 4.D.2 | Ajouter résumé Phase 4 | `content/08-developpement.md` |
| 4.D.3 | Ajouter code Prisma dans annexe | `content/annexes/B-code-samples.md` |
| 4.D.4 | Capturer Prisma Studio | `assets/screenshots/phase-04-prisma.png` |
| 4.D.5 | Commit BlaizBot-projet | `git commit -m "docs: phase 4 database"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 4 — Base de Données (DATE)

**Durée** : 4h  
**Tâches** : X/X complétées

**Résumé** :
- Vercel Postgres configuré
- Prisma ORM avec 8 modèles (User, Class, Subject, Course, etc.)
- Migration initiale appliquée
- Seed avec données de test (8 users, 3 classes, 4 matières)

**Difficultés** :
- [Décrire si problème de connexion, etc.]

**Captures** : `phase-04-prisma.png`
```

---

## 📸 Capture requise

- [ ] Screenshot Prisma Studio avec données seed

---

## ✅ Checklist fin de Phase 4

- [ ] Vercel Postgres projet créé
- [ ] `.env.local` configuré (non commité)
- [ ] Prisma installé et configuré
- [ ] Singleton `lib/prisma.ts` créé
- [ ] Tous les modèles définis dans schema.prisma
- [ ] Migration appliquée sans erreur
- [ ] Seed créé et exécuté
- [ ] Données vérifiées :
  - [ ] 8 users (1 admin, 2 profs, 5 élèves)
  - [ ] 3 classes
  - [ ] 4 matières
  - [ ] 6 cours

---

## 🔄 Navigation

← [phase-04-database.md](phase-04-database.md) | [phase-04-code.md](phase-04-code.md) | → [phase-05-auth.md](phase-05-auth.md)

---

*Dernière MAJ : 2025-01-13*

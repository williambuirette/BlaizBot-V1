# 🗄️ Phase 4 — Base de Données (Partie 1)

> **Objectif** : Données persistantes et reproductibles  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 3-4h  
> **Prérequis** : Phase 3 terminée

📁 **Fichiers liés** :
- [phase-04-database-suite.md](phase-04-database-suite.md) — Étapes 4.4→4.7
- [phase-04-code.md](phase-04-code.md) — Code source & templates

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
AVANT de commencer :
1. Créer un compte Vercel Postgres si pas encore fait
2. Consulter docs/04-MODELE_DONNEES.md pour le schéma complet
3. JAMAIS mettre les clés en dur dans le code
4. Le seed doit être IDEMPOTENT (relançable sans erreur)

SÉCURITÉ CRITIQUE :
- .env.local JAMAIS commité
- Mots de passe hashés (bcrypt)
- DATABASE_URL = secret absolu
```

---

## 📋 Étape 4.1 — Créer projet Vercel Postgres

### 🎯 Objectif
Créer un projet Vercel Postgres qui servira de backend PostgreSQL hébergé. C'est une base PostgreSQL serverless powered by Neon.

### 📝 Comment
Créer un compte sur vercel.com/storage, créer un projet, récupérer les clés de connexion, et les stocker localement dans `.env.local`.

### 🔧 Par quel moyen
1. Site Vercel Postgres → Dashboard
2. New Project → Configurer
3. Settings → Database → Connection strings

---

### 4.1.1 — Accéder à Vercel Postgres

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.1.1 | Site | Aller sur vercel.com/storage | Site ouvert |

💡 **INSTRUCTION** :
- URL : https://vercel.com/storage
- Créer un compte gratuit (GitHub login recommandé)
- Le tier gratuit suffit pour le développement

---

### 4.1.2 — Créer le projet

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.1.2 | Projet | Créer projet "blaizbot-v1" | Projet créé |

💡 **INSTRUCTION** :
- Cliquer "New Project"
- Nom : `blaizbot-v1`
- Database Password : générer un mot de passe FORT
- **NOTER CE MOT DE PASSE** (non récupérable après)

---

### 4.1.3 — Choisir la région

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.1.3 | Région | Choisir Europe (Paris) | Région OK |

💡 **INSTRUCTION** :
- Région : `West EU (Paris)` ou la plus proche
- Cliquer "Create new project"
- Attendre ~2 minutes que le projet se crée

---

### 4.1.4 — Récupérer les clés

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.1.4 | Clés | Copier URL + anon key | Clés notées |

💡 **INSTRUCTION** :
- Aller dans Project Settings → API
- Copier `Project URL` (commence par https://)
- Copier `anon public` key (commence par eyJ)
- Aller dans Project Settings → Database
- Copier `Connection string` (URI mode)

---

### 4.1.5 — Créer .env.local

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 4.1.5 | Env local | `.env.local` | Fichier créé |

💡 **INSTRUCTION** :
- Créer le fichier à la RACINE du projet (pas dans src/)
- Voir **Section 1** de [phase-04-code.md](phase-04-code.md#1-template-envlocal)

---

### 4.1.6 — DATABASE_URL

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.1.6 | DATABASE_URL | Ajouter connection string | Variable présente |

💡 **INSTRUCTION** :
- Format avec pgbouncer (pooling) pour les requêtes normales
- Remplacer `[YOUR-PASSWORD]` par le mot de passe noté
- Remplacer `[PROJECT_REF]` par l'ID du projet (visible dans l'URL)

---

### 4.1.7 — DIRECT_URL

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.1.7 | DIRECT_URL | Ajouter direct URL | Variable présente |

💡 **INSTRUCTION** :
- DIRECT_URL = connexion directe (sans pooling)
- Utilisé par Prisma pour les migrations
- Même format mais port 5432 direct

---

### 4.1.8 — Gitignore

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.1.8 | Gitignore | Vérifier `.env.local` ignoré | Ignoré |

💡 **INSTRUCTION** :
```bash
# Vérifier que .gitignore contient :
.env*.local

# Tester :
git status
# .env.local NE DOIT PAS apparaître
```

---

## 📋 Étape 4.2 — Configurer Prisma

### 🎯 Objectif
Installer et configurer Prisma, l'ORM TypeScript qui génère des types automatiquement à partir du schéma. C'est la couche d'accès aux données.

### 📝 Comment
Installer les packages npm, initialiser Prisma, configurer le provider PostgreSQL, et créer le singleton client.

### 🔧 Par quel moyen
1. `npm install prisma @prisma/client`
2. `npx prisma init`
3. Configurer `schema.prisma`
4. Créer `lib/prisma.ts`

---

### 4.2.1 — Installer Prisma

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.2.1 | Install | `npm install prisma @prisma/client` | Packages OK |

💡 **INSTRUCTION** :
```bash
npm install prisma @prisma/client
# prisma = CLI pour migrations
# @prisma/client = client pour les requêtes
```

---

### 4.2.2 — Initialiser Prisma

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.2.2 | Init | `npx prisma init` | Dossier créé |

💡 **INSTRUCTION** :
```bash
npx prisma init
# Crée :
# - prisma/schema.prisma
# - .env (à ignorer, on utilise .env.local)
```

---

### 4.2.3 — Configurer le provider

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.2.3 | Provider | Configurer PostgreSQL | Provider OK |

💡 **INSTRUCTION** : Voir **Section 2** de [phase-04-code.md](phase-04-code.md#2-schemaprisma-datasource)

---

### 4.2.4 — Créer le singleton

| # | Tâche | Fichier | Validation |
|:--|:------|:--------|:-----------|
| 4.2.4 | Singleton | `src/lib/prisma.ts` | < 20 lignes |

💡 **INSTRUCTION** :
- Évite les multiples connexions en dev (hot reload)
- Voir **Section 3** de [phase-04-code.md](phase-04-code.md#3-srclibprismats)

---

### 4.2.5 — Exporter

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.2.5 | Export | Exporter instance | Export OK |

💡 **INSTRUCTION** :
```typescript
// Dans n'importe quel fichier :
import { prisma } from '@/lib/prisma';

// Utilisation :
const users = await prisma.user.findMany();
```

---

## 📋 Étape 4.3 — Définir les modèles

### 🎯 Objectif
Définir tous les modèles de données dans le schéma Prisma. Ces modèles correspondent aux tables PostgreSQL et génèrent les types TypeScript.

### 📝 Comment
Ajouter chaque modèle dans `schema.prisma` avec ses champs et relations. Respecter exactement le schéma défini dans `docs/04-MODELE_DONNEES.md`.

### 🔧 Par quel moyen
1. Consulter la doc du modèle de données
2. Ajouter chaque modèle un par un
3. Définir les relations (1:N, N:N)
4. Valider avec `npx prisma validate`

---

### 4.3.1 — Modèle User

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.3.1 | User | Définir modèle User | Modèle ajouté |

💡 **INSTRUCTION** :
- Champs : id, email, password, name, role, createdAt, updatedAt
- Role = enum (ADMIN, TEACHER, STUDENT)
- Voir **Section 4** de [phase-04-code.md](phase-04-code.md#4-modèle-user)

---

### 4.3.2 — Modèle Class

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.3.2 | Class | Définir modèle Class | Modèle ajouté |

💡 **INSTRUCTION** : id, name, level, year + relation students

---

### 4.3.3 — Modèle Subject

| # | Tâche | Action | Validation |
|:--|:------|:-------|:-----------|
| 4.3.3 | Subject | Définir modèle Subject | Modèle ajouté |

💡 **INSTRUCTION** : id, name, color + relation courses

---

### 4.3.4 à 4.3.8 — Autres modèles

| # | Modèle | Champs principaux | Validation |
|:--|:-------|:------------------|:-----------|
| 4.3.4 | Course | title, description, subjectId, teacherId | OK |
| 4.3.5 | Chapter | title, content, order, courseId | OK |
| 4.3.6 | Enrollment | userId, classId (N:N) | OK |
| 4.3.7 | TeacherAssignment | userId, classId, subjectId | OK |
| 4.3.8 | Message | content, senderId, receiverId | OK |

💡 **INSTRUCTION** : Voir **Section 5** de [phase-04-code.md](phase-04-code.md#5-schéma-prisma-complet)

---

### 4.3.9 — Valider le schéma

| # | Tâche | Commande | Validation |
|:--|:------|:---------|:-----------|
| 4.3.9 | Validate | `npx prisma validate` | Aucune erreur |

💡 **INSTRUCTION** :
```bash
npx prisma validate
# Si erreur : corriger les relations ou les types
# Si OK : "The schema at prisma/schema.prisma is valid"
```

---

## ➡️ Suite

Étapes 4.1→4.3 terminées → [phase-04-database-suite.md](phase-04-database-suite.md) pour 4.4→4.7

---

*Dernière MAJ : 2025-01-13*

# TODO - BlaizBot V1

> **⚠️ Ce fichier est un POINTEUR vers le dossier `todo/`**  
> **La source de vérité se trouve dans `todo/INDEX.md`**

---

## 🎯 Navigation Rapide

| Action | Fichier |
|:-------|:--------|
| **Où en suis-je ?** | [todo/INDEX.md](todo/INDEX.md) |
| **Règles obligatoires** | [todo/RULES.md](todo/RULES.md) |
| **Arborescence projet** | [todo/STRUCTURE.md](todo/STRUCTURE.md) |

---

## 📊 Vue d'Ensemble

```
PHASE 0   PHASE 1   PHASE 2   PHASE 3   PHASE 4   PHASE 5
  PRD  →   Init  →  Layout →  Slice →    DB   →   Auth
  ✅        ✅        ✅        ✅        ✅        ✅

PHASE 6   PHASE 7   PHASE 8   PHASE 9   PHASE 10
 Admin →   Prof  →  Élève  →    IA   →   Démo
   ✅        🔴        ⬜        ⬜        ⬜
```

**Phase active** : Phase 7 Quinquies — Assignations & Calendrier (CORRECTIONS)  
**Progression** : 72% (7.5/11 phases)

### Phase 7 — Sous-étapes
- ✅ 7 : Dashboard, Classes, Cours, Messagerie, TipTap, IA, Fiche Élève
- ✅ 7bis : TipTap + IA Chat
- ✅ 7ter : Évaluation Automatique IA
- ✅ 7quater : Blocs Dépliables (Chapitres/Sections accordéon)
- 🔴 7quinquies : Assignations & Calendrier (CORRECTIONS EN COURS)

### ✅ Tâches Terminées (7 Quinquies)

| Tâche | Description | Statut |
|:------|:------------|:-------|
| AS-FIX1 | Corriger parsing API filtres | ✅ |
| AS-FIX2 | Ajouter filtres Matières + Sections (cohérence Modal) | ⬜ |
| AS-FIX3 | Vue liste par défaut → calendrier si filtres | ✅ |
| AS-FIX4 | Sidebar filtres collapsible (mobile) | ✅ |
| AS-FIX5 | Fixer boutons mois/semaine/agenda (CSS) | ✅ |
| AS-REF1 | Refactorer NewAssignmentModal (1039L → 281L) | ✅ |
| AS-REF2 | Refactorer AssignDialog (881L → 10 fichiers <250L) | ✅ |
| AS-FIX6 | Uniformiser cartes assignations (prof/élève) | ✅ |
| AS-FIX7 | Fix dueDate null + afficher nom élève | ✅ |
| AS-FIX8 | Fix seed assignations (dates manquantes) | ✅ |
| AS-FIX9 | Click titre carte → navigation vers cours | ✅ |
| AS-FIX10 | Menu déroulant liste élèves sur cartes | ✅ |
| AS-FIX6 | Uniformiser cartes assignations (prof/élève) | ✅ |
| AS-FIX7 | Fix dueDate null + afficher nom élève | ✅ |
| AS-FIX8 | Fix seed assignations (dates manquantes) | ✅ |
| AS-FIX9 | Click titre carte → navigation vers cours | ✅ |

---

## 📁 Structure du dossier todo/

```
todo/
├── INDEX.md              # 🎯 Point d'entrée (navigation)
├── RULES.md              # ⚠️ Règles obligatoires (350 lignes, etc.)
├── STRUCTURE.md          # 🗂️ Arborescence cible du projet
│
├── phase-01-init.md      # 🚀 Initialisation Next.js
├── phase-02-layout.md    # 🎨 Layout & Navigation
├── phase-03-slice.md     # 🧪 Vertical Slice (démo mock)
├── phase-04-database.md  # 🗜️ Vercel Postgres + Prisma
├── phase-05-auth.md      # 🔐 Authentification
├── phase-06-admin.md     # 👔 Interface Admin
├── phase-07-teacher.md   # 👨‍🏫 Interface Professeur
├── phase-08-student.md   # 🎓 Interface Élève
├── phase-09-ai.md        # 🤖 Intégration IA
└── phase-10-demo.md      # 🎬 Stabilisation & Démo
```

---

## 🔍 Pour l'IA : Comment travailler

```
1. OUVRIR  todo/INDEX.md     → Connaître la phase active
2. LIRE    todo/RULES.md     → Règles AVANT de coder
3. LIRE    todo/STRUCTURE.md → Où placer les fichiers
4. OUVRIR  todo/phase-XX.md  → Tâches détaillées
5. SUIVRE  les instructions entre chaque tâche
6. VALIDER chaque tâche avant la suivante
```

---

## 🛡️ Rappel des Règles Critiques

| Règle | Description |
|:------|:------------|
| **Max 350 lignes** | Aucun fichier > 350-400 lignes |
| **Zéro secrets** | Jamais de clés API en dur → `.env` |
| **TypeScript strict** | Pas de `any`, types explicites |
| **1 composant = 1 fichier** | Pas de multi-composants |

---

## 📚 Sources de Vérité

| Document | Contenu |
|:---------|:--------|
| `todo/INDEX.md` | Progression et navigation |
| `docs/03-CARTOGRAPHIE_UI.md` | Inventaire des écrans |
| `docs/04-MODELE_DONNEES.md` | Schéma Prisma |
| `docs/05-API_ENDPOINTS.md` | Routes et payloads |
| `blaizbot-wireframe/` | Maquettes (QUOI coder) |

---

*Dernière mise à jour : 2025-01-01*
| 1.5.5 | `npx shadcn@latest add dropdown-menu` | DropdownMenu.tsx créé |
| 1.5.6 | `npx shadcn@latest add toast` | Toast + Toaster créés |
| 1.5.7 | Tester import dans `page.tsx` | Pas d'erreur import |

### Étape 1.6 — Créer structure dossiers
| Tâche | Dossier à créer | Contenu initial |
| :--- | :--- | :--- |
| 1.6.1 | `src/components/ui/` | (déjà créé par shadcn) |
| 1.6.2 | `src/components/layout/` | Créer dossier vide |
| 1.6.3 | `src/components/features/` | Créer dossier vide |
| 1.6.4 | `src/lib/` | (déjà créé) |
| 1.6.5 | `src/hooks/` | Créer dossier vide |
| 1.6.6 | `src/types/` | Créer `index.ts` avec types de base |
| 1.6.7 | `src/constants/` | Créer `index.ts` avec constantes app |

### Étape 1.7 — Configurer ESLint + Prettier
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 1.7.1 | `npm install -D prettier eslint-config-prettier` | Packages installés |
| 1.7.2 | Créer `.prettierrc` | Fichier avec config |
| 1.7.3 | Ajouter `"prettier"` dans extends de `.eslintrc.json` | Ajouté |
| 1.7.4 | `npm run lint` | 0 erreur |
| 1.7.5 | Tester formatage d'un fichier | Formatage OK |

### Capture requise Phase 1
- [ ] Screenshot "Hello World" avec un Button shadcn

---

## 🎨 PHASE 2 — Layout & Navigation (Squelette)

> **Objectif** : Naviguer partout (pages vides)  
> **Statut** : 🔴 À FAIRE

### Étape 2.1 — Créer Sidebar component
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 2.1.1 | Créer `src/components/layout/Sidebar.tsx` | Fichier créé |
| 2.1.2 | Définir types `SidebarProps` (role, currentPath) | Types exportés |
| 2.1.3 | Créer structure HTML (nav, ul, li) | Structure valide |
| 2.1.4 | Ajouter styles Tailwind (w-64, bg-slate-900, fixed) | Styles appliqués |
| 2.1.5 | Créer `SidebarItem.tsx` sous-composant | < 50 lignes |
| 2.1.6 | Importer icônes Lucide (Home, Book, Users...) | Icônes visibles |
| 2.1.7 | Gérer état actif (highlight item courant) | Item actif stylé |
| 2.1.8 | Vérifier < 200 lignes total | `wc -l` < 200 |

### Étape 2.2 — Créer Header component
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 2.2.1 | Créer `src/components/layout/Header.tsx` | Fichier créé |
| 2.2.2 | Ajouter logo/titre à gauche | Visible |
| 2.2.3 | Ajouter recherche au centre (UI only) | Input présent |
| 2.2.4 | Ajouter avatar + dropdown à droite | Avatar + menu |
| 2.2.5 | Utiliser `DropdownMenu` de shadcn | Composant utilisé |
| 2.2.6 | Vérifier < 150 lignes | `wc -l` < 150 |

### Étape 2.3 — Créer layout dashboard
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 2.3.1 | Créer `src/app/(dashboard)/layout.tsx` | Fichier créé |
| 2.3.2 | Intégrer `<Sidebar />` | Sidebar visible |
| 2.3.3 | Intégrer `<Header />` | Header visible |
| 2.3.4 | Zone `{children}` avec padding-left pour sidebar | Contenu décalé |
| 2.3.5 | Vérifier responsive (mobile : sidebar cachée) | Test mobile OK |

### Étape 2.4 — Créer routes Admin
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 2.4.1 | Créer `src/app/(dashboard)/admin/page.tsx` | Page dashboard admin |
| 2.4.2 | Créer `src/app/(dashboard)/admin/users/page.tsx` | Page users vide |
| 2.4.3 | Créer `src/app/(dashboard)/admin/classes/page.tsx` | Page classes vide |
| 2.4.4 | Créer `src/app/(dashboard)/admin/subjects/page.tsx` | Page matières vide |
| 2.4.5 | Créer `src/app/(dashboard)/admin/settings/page.tsx` | Page settings vide |
| 2.4.6 | Chaque page affiche son titre | Titres visibles |

### Étape 2.5 — Créer routes Professeur
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 2.5.1 | Créer `src/app/(dashboard)/teacher/page.tsx` | Page dashboard prof |
| 2.5.2 | Créer `src/app/(dashboard)/teacher/classes/page.tsx` | Page mes classes |
| 2.5.3 | Créer `src/app/(dashboard)/teacher/students/page.tsx` | Page mes élèves |
| 2.5.4 | Créer `src/app/(dashboard)/teacher/courses/page.tsx` | Page cours |
| 2.5.5 | Créer `src/app/(dashboard)/teacher/messages/page.tsx` | Page messages |
| 2.5.6 | Chaque page affiche son titre | Titres visibles |

### Étape 2.6 — Créer routes Élève
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 2.6.1 | Créer `src/app/(dashboard)/student/page.tsx` | Page dashboard élève |
| 2.6.2 | Créer `src/app/(dashboard)/student/courses/page.tsx` | Page mes cours |
| 2.6.3 | Créer `src/app/(dashboard)/student/revisions/page.tsx` | Page révisions |
| 2.6.4 | Créer `src/app/(dashboard)/student/assistant/page.tsx` | Page assistant IA |
| 2.6.5 | Créer `src/app/(dashboard)/student/calendar/page.tsx` | Page agenda |
| 2.6.6 | Créer `src/app/(dashboard)/student/messages/page.tsx` | Page messages |
| 2.6.7 | Créer `src/app/(dashboard)/student/profile/page.tsx` | Page profil |
| 2.6.8 | Chaque page affiche son titre | Titres visibles |

### Étape 2.7 — Navigation fonctionnelle
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 2.7.1 | Sidebar utilise `<Link>` de Next.js | Links corrects |
| 2.7.2 | Clic sur item → navigation fonctionne | URL change |
| 2.7.3 | Item actif se met à jour | Highlight correct |
| 2.7.4 | Tester navigation Admin complète | Toutes pages OK |
| 2.7.5 | Tester navigation Prof complète | Toutes pages OK |
| 2.7.6 | Tester navigation Élève complète | Toutes pages OK |

### Capture requise Phase 2
- [ ] GIF navigation entre les 3 dashboards

---

## 🧪 PHASE 3 — Vertical Slice (Démo Mock)

> **Objectif** : Montrer quelque chose SANS vraie DB  
> **Statut** : 🔴 À FAIRE

### Pourquoi cette phase ?
> On valide l'UX et le flux AVANT d'investir dans la DB.  
> Si quelque chose ne "vibe" pas, on le voit maintenant.

### Étape 3.1 — Page login mockée
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 3.1.1 | Créer `src/app/(auth)/login/page.tsx` | Page créée |
| 3.1.2 | Créer `LoginForm.tsx` avec Input email/password | Formulaire visible |
| 3.1.3 | Ajouter boutons "Connexion Élève/Prof/Admin" (mock) | 3 boutons visibles |
| 3.1.4 | Clic bouton → stocke rôle dans state/localStorage | Rôle stocké |
| 3.1.5 | Redirect vers `/student`, `/teacher` ou `/admin` | Navigation OK |
| 3.1.6 | Style card centré + logo BlaizBot | UI propre |

### Étape 3.2 — Dashboard élève mock
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 3.2.1 | Créer `src/data/mockData.ts` | Fichier mock |
| 3.2.2 | Ajouter mock : `currentUser` (élève) | Objet user |
| 3.2.3 | Ajouter mock : `courses[]` (3 cours) | Array cours |
| 3.2.4 | Ajouter mock : `progress` (stats) | Objet progression |
| 3.2.5 | Créer `WelcomeCard.tsx` ("Bonjour, prénom") | Composant < 50 lignes |
| 3.2.6 | Créer `StatsCards.tsx` (4 KPIs en grid) | Composant < 80 lignes |
| 3.2.7 | Créer `RecentCourses.tsx` (liste 3 cours) | Composant < 100 lignes |
| 3.2.8 | Assembler dans `student/page.tsx` | Dashboard complet |

### Étape 3.3 — 1 interaction complète
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 3.3.1 | Créer `src/app/(dashboard)/student/courses/[id]/page.tsx` | Route dynamique |
| 3.3.2 | Clic sur cours dans RecentCourses → `/courses/[id]` | Navigation OK |
| 3.3.3 | Page cours affiche : titre, description, chapitres | Contenu mock |
| 3.3.4 | Créer `CourseHeader.tsx` | < 60 lignes |
| 3.3.5 | Créer `ChaptersList.tsx` | < 80 lignes |
| 3.3.6 | Bouton "Retour" → `/student/courses` | Navigation retour OK |

### Étape 3.4 — Feedback visuel
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 3.4.1 | Ajouter `<Toaster />` dans layout racine | Toaster présent |
| 3.4.2 | Créer `src/hooks/useToast.ts` (ou utiliser shadcn) | Hook disponible |
| 3.4.3 | Toast sur login "Connexion réussie" | Toast s'affiche |
| 3.4.4 | Créer `LoadingSpinner.tsx` | Composant < 20 lignes |
| 3.4.5 | Ajouter loading sur navigation (Suspense) | Spinner visible |
| 3.4.6 | États hover sur cards et boutons | Feedback visuel |

### Capture requise Phase 3
- [ ] Vidéo 30s : Login → Dashboard → Cours → Retour

---

## 🗄️ PHASE 4 — Base de Données

> **Objectif** : Données persistantes et reproductibles  
> **Statut** : 🔴 À FAIRE

### Étape 4.1 — Créer Vercel Postgres
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 4.1.1 | Aller sur vercel.com/storage | Site ouvert |
| 4.1.2 | Créer Postgres database "blaizbot-v1" | DB créée |
| 4.1.3 | Choisir région Europe (fra1) | Région OK |
| 4.1.4 | Copier les variables auto-générées | Variables notées |
| 4.1.5 | Créer `.env.local` | Fichier créé |
| 4.1.6 | Ajouter `DATABASE_URL` (connection string) | Variable présente |
| 4.1.7 | Ajouter `DIRECT_URL` (pour migrations) | Variable présente |
| 4.1.8 | Ajouter `.env.local` au `.gitignore` | Ignoré |

### Étape 4.2 — Configurer Prisma
| Tâche | Commande / Action | Validation |
| :--- | :--- | :--- |
| 4.2.1 | `npm install prisma @prisma/client` | Packages installés |
| 4.2.2 | `npx prisma init` | Dossier `prisma/` créé |
| 4.2.3 | Configurer `datasource db` avec PostgreSQL | Provider postgresql |
| 4.2.4 | Créer `src/lib/prisma.ts` (singleton) | < 20 lignes |
| 4.2.5 | Exporter instance Prisma | Export OK |

### Étape 4.3 — Définir modèles
| Tâche | Modèle | Champs principaux |
| :--- | :--- | :--- |
| 4.3.1 | `User` | id, email, password, name, role, createdAt |
| 4.3.2 | `Class` | id, name, level, year |
| 4.3.3 | `Subject` | id, name, color |
| 4.3.4 | `Course` | id, title, description, subjectId, teacherId |
| 4.3.5 | `Chapter` | id, title, content, order, courseId |
| 4.3.6 | `Enrollment` | userId, classId (relation many-to-many) |
| 4.3.7 | `TeacherAssignment` | userId, classId, subjectId |
| 4.3.8 | `Message` | id, content, senderId, receiverId, createdAt |
| 4.3.9 | Vérifier cohérence avec `04-MODELE_DONNEES.md` | Schéma conforme |

### Étape 4.4 — Première migration
| Tâche | Commande | Validation |
| :--- | :--- | :--- |
| 4.4.1 | `npx prisma migrate dev --name init` | Migration créée |
| 4.4.2 | Vérifier dossier `prisma/migrations/` | Fichier SQL présent |
| 4.4.3 | `npx prisma generate` | Client généré |
| 4.4.4 | Vérifier dans Vercel Dashboard : tables créées | Tables visibles |

### Étape 4.5 — Créer script seed
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 4.5.1 | Créer `prisma/seed.ts` | Fichier créé |
| 4.5.2 | Ajouter 1 Admin (admin@blaizbot.fr) | User admin |
| 4.5.3 | Ajouter 2 Profs | Users profs |
| 4.5.4 | Ajouter 5 Élèves | Users élèves |
| 4.5.5 | Ajouter 3 Classes | Classes créées |
| 4.5.6 | Ajouter 4 Matières | Matières créées |
| 4.5.7 | Ajouter 6 Cours (2 par prof) | Cours créés |
| 4.5.8 | Ajouter des Enrollments | Élèves → Classes |
| 4.5.9 | Vérifier < 300 lignes | `wc -l` < 300 |

### Étape 4.6 — Exécuter seed
| Tâche | Commande / Action | Validation |
| :--- | :--- | :--- |
| 4.6.1 | Ajouter script dans `package.json` : `"prisma": { "seed": "..." }` | Script ajouté |
| 4.6.2 | `npx prisma db seed` | Seed OK |
| 4.6.3 | Vérifier : 8 users créés | Count = 8 |
| 4.6.4 | Vérifier : 3 classes créées | Count = 3 |

### Étape 4.7 — Tester connexion
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 4.7.1 | `npx prisma studio` | Studio ouvert |
| 4.7.2 | Vérifier table Users | 8 users visibles |
| 4.7.3 | Vérifier table Classes | 3 classes visibles |
| 4.7.4 | Vérifier relations (clic sur User → Class) | Relations OK |
| 4.7.5 | Screenshot Prisma Studio | Capture faite |

### Capture requise Phase 4
- [ ] Screenshot Prisma Studio avec données seed

---

## 🔐 PHASE 5 — Authentification & Rôles

> **Objectif** : Chaque rôle voit son espace  
> **Statut** : 🔴 À FAIRE

### Étape 5.1 — Installer NextAuth v5
| Tâche | Commande / Action | Validation |
| :--- | :--- | :--- |
| 5.1.1 | `npm install next-auth@beta` | Package installé |
| 5.1.2 | Créer `src/lib/auth.ts` | Fichier créé |
| 5.1.3 | Configurer `authOptions` de base | Config OK |
| 5.1.4 | Ajouter `AUTH_SECRET` dans `.env.local` | Secret généré |
| 5.1.5 | Créer `src/app/api/auth/[...nextauth]/route.ts` | Route créée |
| 5.1.6 | Exporter GET et POST handlers | Exports OK |

### Étape 5.2 — Créer page login réelle
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 5.2.1 | Modifier `LoginForm.tsx` : enlever mocks | Form propre |
| 5.2.2 | Utiliser `signIn("credentials", ...)` de NextAuth | Fonction appelée |
| 5.2.3 | Champs : email, password | 2 inputs |
| 5.2.4 | Bouton submit avec loading state | Loading visible |
| 5.2.5 | Afficher erreurs (credentials invalides) | Message erreur |
| 5.2.6 | Redirect vers dashboard après login | Navigation OK |

### Étape 5.3 — Configurer Credentials provider
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 5.3.1 | Ajouter `CredentialsProvider` dans auth.ts | Provider ajouté |
| 5.3.2 | Fonction `authorize` : cherche user par email | Query Prisma |
| 5.3.3 | Vérifier password (bcrypt compare) | `npm install bcryptjs` |
| 5.3.4 | Retourner user avec id, email, name, role | Objet user |
| 5.3.5 | Ajouter `PrismaAdapter` (optionnel) | Adapter configuré |
| 5.3.6 | Tester login avec user seed | Login OK |

### Étape 5.4 — Créer middleware auth
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 5.4.1 | Créer `src/middleware.ts` | Fichier créé |
| 5.4.2 | Importer `auth` de NextAuth | Import OK |
| 5.4.3 | Définir `matcher` : `/admin/:path*`, `/teacher/:path*`, `/student/:path*` | Matcher correct |
| 5.4.4 | Si pas de session → redirect `/login` | Redirect fonctionne |
| 5.4.5 | Exporter `{ auth as middleware }` | Export OK |
| 5.4.6 | Tester accès /student sans login | Redirect vers /login |

### Étape 5.5 — Implémenter RBAC
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 5.5.1 | Ajouter `role` dans session (callbacks jwt/session) | Role dans session |
| 5.5.2 | Créer `src/lib/auth-utils.ts` | Fichier utilitaires |
| 5.5.3 | Fonction `checkRole(session, allowedRoles[])` | Fonction créée |
| 5.5.4 | Dans middleware : vérifier rôle vs route | Logique RBAC |
| 5.5.5 | Admin accède à /admin/* | ✅ |
| 5.5.6 | Prof accède à /teacher/* mais pas /admin/* | ✅ |
| 5.5.7 | Élève accède à /student/* mais pas /teacher/* | ✅ |
| 5.5.8 | Accès interdit → redirect /unauthorized | Redirect OK |

### Étape 5.6 — Page unauthorized
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 5.6.1 | Créer `src/app/unauthorized/page.tsx` | Page créée |
| 5.6.2 | Message "Accès non autorisé" | Message visible |
| 5.6.3 | Bouton "Retour au dashboard" | Lien vers dashboard du rôle |
| 5.6.4 | Style cohérent avec le reste | UI propre |

### Étape 5.7 — Logout fonctionnel
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 5.7.1 | Ajouter bouton "Déconnexion" dans Header dropdown | Bouton visible |
| 5.7.2 | Clic → `signOut({ callbackUrl: "/login" })` | Fonction appelée |
| 5.7.3 | Session détruite | Plus de session |
| 5.7.4 | Redirect vers /login | Navigation OK |
| 5.7.5 | Toast "Déconnexion réussie" | Toast visible |

### Capture requise Phase 5
- [ ] Screenshot login + GIF redirection par rôle

---

## 👔 PHASE 6 — Interface Admin

> **Objectif** : L'Admin peut créer toutes les données  
> **Statut** : 🔴 À FAIRE

### Règle 350 lignes (rappel)
- Chaque page CRUD : 1 fichier page + 1 composant table + 1 composant form
- Ex: `users/page.tsx` < 100, `UsersTable.tsx` < 200, `UserForm.tsx` < 150

### Étape 6.1 — Dashboard Admin
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 6.1.1 | Créer `AdminStatsCard.tsx` | < 50 lignes |
| 6.1.2 | KPI : Nombre total d'utilisateurs | Compteur affiché |
| 6.1.3 | KPI : Nombre de classes | Compteur affiché |
| 6.1.4 | KPI : Nombre de cours | Compteur affiché |
| 6.1.5 | KPI : Nombre de matières | Compteur affiché |
| 6.1.6 | Créer API `GET /api/admin/stats` | Route créée |
| 6.1.7 | Assembler dans `admin/page.tsx` | Dashboard complet |

### Étape 6.2 — CRUD Utilisateurs
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 6.2.1 | Créer API `GET /api/admin/users` | Liste users |
| 6.2.2 | Créer API `POST /api/admin/users` | Créer user |
| 6.2.3 | Créer API `PUT /api/admin/users/[id]` | Modifier user |
| 6.2.4 | Créer API `DELETE /api/admin/users/[id]` | Supprimer user |
| 6.2.5 | Créer `UsersTable.tsx` | < 200 lignes |
| 6.2.6 | Colonnes : Nom, Email, Rôle, Actions | 4 colonnes |
| 6.2.7 | Boutons : Modifier, Supprimer | Actions visibles |
| 6.2.8 | Créer `UserFormModal.tsx` | < 150 lignes |
| 6.2.9 | Champs : nom, email, password, rôle | 4 champs |
| 6.2.10 | Validation Zod | Erreurs affichées |
| 6.2.11 | Assembler dans `admin/users/page.tsx` | Page complète |

### Étape 6.3 — CRUD Classes
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 6.3.1 | Créer API `GET /api/admin/classes` | Liste classes |
| 6.3.2 | Créer API `POST /api/admin/classes` | Créer classe |
| 6.3.3 | Créer API `PUT /api/admin/classes/[id]` | Modifier |
| 6.3.4 | Créer API `DELETE /api/admin/classes/[id]` | Supprimer |
| 6.3.5 | Créer `ClassesTable.tsx` | < 150 lignes |
| 6.3.6 | Créer `ClassFormModal.tsx` | < 100 lignes |
| 6.3.7 | Assembler dans `admin/classes/page.tsx` | Page complète |

### Étape 6.4 — CRUD Matières
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 6.4.1 | Créer API `GET /api/admin/subjects` | Liste matières |
| 6.4.2 | Créer API `POST /api/admin/subjects` | Créer |
| 6.4.3 | Créer API `PUT /api/admin/subjects/[id]` | Modifier |
| 6.4.4 | Créer API `DELETE /api/admin/subjects/[id]` | Supprimer |
| 6.4.5 | Créer `SubjectsTable.tsx` | < 150 lignes |
| 6.4.6 | Créer `SubjectFormModal.tsx` (avec color picker) | < 120 lignes |
| 6.4.7 | Assembler dans `admin/subjects/page.tsx` | Page complète |

### Étape 6.5 — Affectations Prof → Classe
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 6.5.1 | Créer API `GET /api/admin/assignments` | Liste affectations |
| 6.5.2 | Créer API `POST /api/admin/assignments` | Créer affectation |
| 6.5.3 | Créer API `DELETE /api/admin/assignments/[id]` | Supprimer |
| 6.5.4 | Créer `AssignmentsTable.tsx` | < 150 lignes |
| 6.5.5 | Select Prof + Select Classe + Select Matière | 3 selects |
| 6.5.6 | Bouton "Affecter" | Affectation créée |

### Étape 6.6 — Affectations Élève → Classe
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 6.6.1 | Créer API `GET /api/admin/enrollments` | Liste inscriptions |
| 6.6.2 | Créer API `POST /api/admin/enrollments` | Inscrire élève |
| 6.6.3 | Créer API `DELETE /api/admin/enrollments/[id]` | Désinscrire |
| 6.6.4 | Créer `EnrollmentsTable.tsx` | < 150 lignes |
| 6.6.5 | Vue par classe avec liste élèves | Liste visible |
| 6.6.6 | Bouton "Ajouter élève" avec select | Modal select |

### Étape 6.7 — Page Paramètres Admin
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 6.7.1 | Créer `admin/settings/page.tsx` | Page créée |
| 6.7.2 | Section : Infos établissement (mock) | Formulaire |
| 6.7.3 | Section : Config IA (placeholder pour Phase 9) | Placeholder |
| 6.7.4 | Bouton "Sauvegarder" (mock pour l'instant) | Bouton visible |

### Capture requise Phase 6
- [ ] Screenshot CRUD utilisateurs (liste + modal)

---

## 👨‍🏫 PHASE 7 — Interface Professeur

> **Objectif** : Le Prof peut créer et gérer ses cours  
> **Statut** : 🔴 À FAIRE

### Règle 350 lignes (rappel)
- Chaque composant feature dans `src/components/features/teacher/`
- Page orchestrateur < 100 lignes, composants < 250 lignes

### Étape 7.1 — Dashboard Professeur
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7.1.1 | Créer `TeacherStatsCard.tsx` | < 50 lignes |
| 7.1.2 | KPI : Mes classes (count) | Compteur affiché |
| 7.1.3 | KPI : Mes cours (count) | Compteur affiché |
| 7.1.4 | KPI : Messages non lus | Compteur affiché |
| 7.1.5 | Créer API `GET /api/teacher/stats` | Route + session |
| 7.1.6 | Widget "Prochains cours" (liste 3) | Liste visible |
| 7.1.7 | Assembler dans `teacher/page.tsx` | Dashboard complet |

### Étape 7.2 — Vue Mes Classes
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7.2.1 | Créer API `GET /api/teacher/classes` | Filtré par session |
| 7.2.2 | Créer `TeacherClassCard.tsx` | < 80 lignes |
| 7.2.3 | Afficher : Nom classe, matière, nb élèves | 3 infos |
| 7.2.4 | Bouton "Voir détails" | Lien vers classe |
| 7.2.5 | Assembler dans `teacher/classes/page.tsx` | Liste cartes |

### Étape 7.3 — Vue Mes Élèves
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7.3.1 | Créer `teacher/classes/[id]/page.tsx` | Route dynamique |
| 7.3.2 | Créer API `GET /api/teacher/classes/[id]` | Détails classe |
| 7.3.3 | Section liste élèves | Tableau élèves |
| 7.3.4 | Section liste cours de cette classe | Tableau cours |
| 7.3.5 | Créer `ClassStudentsList.tsx` | < 100 lignes |
| 7.3.6 | Créer `ClassCoursesList.tsx` | < 150 lignes |

### Étape 7.4 — Gestion Cours (CRUD)
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7.4.1 | Créer API `GET /api/teacher/lessons` | Liste cours prof |
| 7.4.2 | Créer API `POST /api/teacher/lessons` | Créer cours |
| 7.4.3 | Créer API `PUT /api/teacher/lessons/[id]` | Modifier |
| 7.4.4 | Créer API `DELETE /api/teacher/lessons/[id]` | Supprimer |
| 7.4.5 | Créer `LessonsTable.tsx` | < 200 lignes |
| 7.4.6 | Colonnes : Titre, Classe, Matière, Date, Status | 5 colonnes |
| 7.4.7 | Créer `LessonFormModal.tsx` | < 200 lignes |
| 7.4.8 | Champs : titre, description, classe, matière, date | 5 champs |
| 7.4.9 | Validation Zod côté client | Erreurs affichées |

### Étape 7.5 — Upload Documents
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7.5.1 | Créer `DocumentUploader.tsx` | < 100 lignes |
| 7.5.2 | Drag & drop zone | Zone visible |
| 7.5.3 | Types acceptés : PDF, DOCX, TXT | Validation type |
| 7.5.4 | Créer API `POST /api/teacher/documents` | Upload (Vercel Blob) |
| 7.5.5 | Créer `DocumentsList.tsx` | < 80 lignes |
| 7.5.6 | Afficher liste docs attachés au cours | Liste visible |
| 7.5.7 | Bouton "Supprimer" document | Action delete |

### Étape 7.6 — Affectation Cours → Classe
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7.6.1 | Dans `LessonFormModal.tsx` : Select classe | Select visible |
| 7.6.2 | Dans `LessonFormModal.tsx` : Select matière | Select visible |
| 7.6.3 | Vérifier prof assigné à la classe | Validation serveur |
| 7.6.4 | Cours lié à classe + matière | Relation créée |

### Étape 7.7 — Messagerie Basique
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 7.7.1 | Créer `teacher/messages/page.tsx` | Page messages |
| 7.7.2 | Créer API `GET /api/teacher/messages` | Liste conversations |
| 7.7.3 | Créer API `POST /api/teacher/messages` | Envoyer message |
| 7.7.4 | Créer `ConversationList.tsx` | < 150 lignes |
| 7.7.5 | Créer `MessageThread.tsx` | < 200 lignes |
| 7.7.6 | Créer `MessageInput.tsx` | < 80 lignes |
| 7.7.7 | Filtre par élève | Select élève |
| 7.7.8 | Badge messages non lus | Badge visible |

### Capture requise Phase 7
- [ ] Screenshot création de cours + upload

---

## 🎓 PHASE 8 — Interface Élève

> **Objectif** : L'Élève consomme le contenu  
> **Statut** : 🔴 À FAIRE

### Règle 350 lignes (rappel)
- Chaque composant feature dans `src/components/features/student/`
- Page orchestrateur < 100 lignes, composants < 250 lignes

### Étape 8.1 — Dashboard Élève
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 8.1.1 | Créer `StudentStatsCard.tsx` | < 50 lignes |
| 8.1.2 | KPI : Cours en cours | Compteur |
| 8.1.3 | KPI : Progression globale (%) | Barre ou % |
| 8.1.4 | KPI : Quiz complétés | Compteur |
| 8.1.5 | Créer API `GET /api/student/stats` | Route + session |
| 8.1.6 | Widget "Prochains cours" | Liste 3 items |
| 8.1.7 | Widget "Cours récents" | Liste 3 items |
| 8.1.8 | Assembler dans `student/page.tsx` | Dashboard complet |

### Étape 8.2 — Mes Cours
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 8.2.1 | Créer `student/courses/page.tsx` | Page liste |
| 8.2.2 | Créer API `GET /api/student/courses` | Cours de l'élève |
| 8.2.3 | Créer `StudentCourseCard.tsx` | < 100 lignes |
| 8.2.4 | Afficher : Titre, Prof, Matière, Progression | 4 infos |
| 8.2.5 | Barre de progression par cours | Barre visible |
| 8.2.6 | Bouton "Voir le cours" | Lien détail |
| 8.2.7 | Filtres : par matière, par état | 2 filtres |

### Étape 8.3 — Vue Cours Détail
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 8.3.1 | Créer `student/courses/[id]/page.tsx` | Route dynamique |
| 8.3.2 | Créer API `GET /api/student/courses/[id]` | Détails cours |
| 8.3.3 | Section contenu (texte markdown) | Contenu affiché |
| 8.3.4 | Créer `CourseContentViewer.tsx` | < 150 lignes |
| 8.3.5 | Section documents attachés | Liste PDF |
| 8.3.6 | Créer `CourseDocuments.tsx` | < 80 lignes |
| 8.3.7 | Bouton "Télécharger" par document | Téléchargement |
| 8.3.8 | Bouton "Marquer comme terminé" | Progression MAJ |
| 8.3.9 | Créer API `POST /api/student/progress` | Sauver progression |

### Étape 8.4 — Mes Révisions
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 8.4.1 | Créer `student/revisions/page.tsx` | Page révisions |
| 8.4.2 | Créer API `GET /api/student/revisions` | Liste fiches |
| 8.4.3 | Créer `RevisionCard.tsx` | < 80 lignes |
| 8.4.4 | Afficher : Titre, Matière, Date création | 3 infos |
| 8.4.5 | Vue fiche complète (modal ou page) | Contenu visible |
| 8.4.6 | Créer `RevisionViewer.tsx` | < 150 lignes |
| 8.4.7 | Note : Génération IA en Phase 9 | Placeholder bouton |

### Étape 8.5 — Agenda
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 8.5.1 | Créer `student/agenda/page.tsx` | Page agenda |
| 8.5.2 | Créer API `GET /api/student/agenda` | Événements élève |
| 8.5.3 | Réutiliser `AgendaCalendar.tsx` (Phase 7) | Composant partagé |
| 8.5.4 | Vue mois avec cours et devoirs | Vue calendrier |
| 8.5.5 | Click jour → détails du jour | Liste événements |
| 8.5.6 | Couleur par type (cours, devoir, exam) | Légende couleurs |

### Étape 8.6 — Messages
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 8.6.1 | Créer `student/messages/page.tsx` | Page messages |
| 8.6.2 | Créer API `GET /api/student/messages` | Conversations élève |
| 8.6.3 | Créer API `POST /api/student/messages` | Envoyer message |
| 8.6.4 | Réutiliser `ConversationList.tsx` | Composant partagé |
| 8.6.5 | Réutiliser `MessageThread.tsx` | Composant partagé |
| 8.6.6 | Liste des profs contactables | Liste visible |
| 8.6.7 | Badge messages non lus | Badge visible |

### Étape 8.7 — Mon Profil
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 8.7.1 | Créer `student/profile/page.tsx` | Page profil |
| 8.7.2 | Afficher : Nom, Email, Classe | Infos visibles |
| 8.7.3 | Créer `ProfileInfoCard.tsx` | < 80 lignes |
| 8.7.4 | Section "Modifier mot de passe" | Formulaire |
| 8.7.5 | Créer API `PUT /api/student/profile` | MAJ profil |
| 8.7.6 | Bouton "Sauvegarder" | Toast succès |

### Capture requise Phase 8
- [ ] Screenshot dashboard élève complet

---

## 🤖 PHASE 9 — Intégration IA

> **Objectif** : IA utile, contrôlée, stable en démo  
> **Statut** : 🔴 À FAIRE

### Règle 350 lignes (rappel)
- Lib IA dans `src/lib/ai/` — chaque fonction isolée
- API routes IA dans `src/app/api/ai/` — une route par feature
- Composants chat dans `src/components/features/ai/`

### Étape 9.1 — Config API OpenAI
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 9.1.1 | Ajouter `OPENAI_API_KEY` dans `.env` | Variable présente |
| 9.1.2 | Ajouter dans `.env.example` | Documenté |
| 9.1.3 | Créer `src/lib/ai/openai.ts` | < 50 lignes |
| 9.1.4 | Initialiser client OpenAI | Export client |
| 9.1.5 | Créer API `GET /api/ai/test` | Test connexion |
| 9.1.6 | Vérifier réponse 200 | Console OK |

### Étape 9.2 — Chat IA Basique
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 9.2.1 | Créer `src/lib/ai/chat.ts` | < 100 lignes |
| 9.2.2 | Fonction `streamChat(messages)` | Export fonction |
| 9.2.3 | Créer API `POST /api/ai/chat` | Route streaming |
| 9.2.4 | Utiliser `ai` SDK (Vercel) pour streaming | Import SDK |
| 9.2.5 | Créer `ChatContainer.tsx` | < 150 lignes |
| 9.2.6 | Créer `ChatMessageList.tsx` | < 100 lignes |
| 9.2.7 | Créer `ChatMessage.tsx` | < 50 lignes |
| 9.2.8 | Créer `ChatInput.tsx` | < 80 lignes |
| 9.2.9 | Streaming affiché en temps réel | Texte progressif |
| 9.2.10 | Intégrer dans `student/ai/page.tsx` | Page accessible |

### Étape 9.3 — Règles Pédagogiques
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 9.3.1 | Créer `src/lib/ai/prompts.ts` | < 100 lignes |
| 9.3.2 | System prompt "tuteur bienveillant" | Prompt défini |
| 9.3.3 | Mode "hint" : Ne pas donner la réponse directe | Règle ajoutée |
| 9.3.4 | Mode "explication" : Réponse complète | Règle ajoutée |
| 9.3.5 | Bouton toggle mode (hint/full) | Toggle visible |
| 9.3.6 | Adapter system prompt selon mode | Prompt dynamique |
| 9.3.7 | Test : demander résolution équation | Hint donné |

### Étape 9.4 — RAG Setup
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 9.4.1 | Activer extension `pgvector` (via migration Prisma) | Extension active |
| 9.4.2 | Ajouter colonne `embedding vector(1536)` dans Documents | Migration |
| 9.4.3 | Créer `src/lib/ai/embeddings.ts` | < 80 lignes |
| 9.4.4 | Fonction `generateEmbedding(text)` | Export fonction |
| 9.4.5 | Créer API `POST /api/ai/embed` | Route embed |
| 9.4.6 | Créer `src/lib/ai/rag.ts` | < 100 lignes |
| 9.4.7 | Fonction `searchSimilar(embedding, limit)` | Export fonction |
| 9.4.8 | Test : embed un document, rechercher | Résultat trouvé |

### Étape 9.5 — Chat avec Contexte Cours
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 9.5.1 | Modifier `streamChat` pour accepter `courseId` | Param ajouté |
| 9.5.2 | Récupérer documents du cours | Query Prisma |
| 9.5.3 | Embed la question utilisateur | Embedding généré |
| 9.5.4 | Chercher chunks similaires | Top 3 chunks |
| 9.5.5 | Injecter contexte dans system prompt | Prompt enrichi |
| 9.5.6 | IA répond avec référence au cours | Citation visible |
| 9.5.7 | Afficher source : "D'après le chapitre X..." | Source affichée |

### Étape 9.6 — Génération Quiz
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 9.6.1 | Créer `src/lib/ai/quiz.ts` | < 120 lignes |
| 9.6.2 | Fonction `generateQuiz(courseContent)` | Export fonction |
| 9.6.3 | Prompt : générer 5 QCM avec 4 options | Prompt défini |
| 9.6.4 | Parser la réponse JSON | Quiz typé |
| 9.6.5 | Créer API `POST /api/ai/quiz` | Route génération |
| 9.6.6 | Bouton "Générer quiz" dans page cours | Bouton visible |
| 9.6.7 | Créer `QuizViewer.tsx` | < 200 lignes |
| 9.6.8 | Afficher questions, options, correction | Quiz jouable |
| 9.6.9 | Score final affiché | Score visible |

### Étape 9.7 — Génération Fiches
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 9.7.1 | Créer `src/lib/ai/revision.ts` | < 100 lignes |
| 9.7.2 | Fonction `generateRevisionSheet(courseContent)` | Export fonction |
| 9.7.3 | Prompt : résumé structuré + points clés | Prompt défini |
| 9.7.4 | Créer API `POST /api/ai/revision` | Route génération |
| 9.7.5 | Bouton "Générer fiche" dans page cours | Bouton visible |
| 9.7.6 | Sauvegarder fiche en BDD | Fiche créée |
| 9.7.7 | Fiche visible dans "Mes Révisions" | Liste mise à jour |

### Capture requise Phase 9
- [ ] Vidéo chat IA avec réponse contextuelle

---

## 🎬 PHASE 10 — Stabilisation & Démo

> **Objectif** : Parcours principal sans bug + Plan B  
> **Statut** : 🔴 À FAIRE

### Règle 350 lignes (rappel)
- Phase de consolidation, pas de nouveau code complexe
- Focus sur la qualité et la documentation

### Étape 10.1 — Tests Critiques
| Tâche | Test | Validation |
| :--- | :--- | :--- |
| 10.1.1 | Test login Admin | Redirect vers /admin |
| 10.1.2 | Test login Prof | Redirect vers /teacher |
| 10.1.3 | Test login Élève | Redirect vers /student |
| 10.1.4 | Test CRUD utilisateurs | Create, Read, Update, Delete |
| 10.1.5 | Test création cours | Cours visible par élève |
| 10.1.6 | Test upload document | Fichier accessible |
| 10.1.7 | Test chat IA | Réponse reçue |
| 10.1.8 | Test génération quiz | Quiz jouable |

### Étape 10.2 — Fix Bugs Bloquants
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 10.2.1 | Lister tous les bugs connus | Liste créée |
| 10.2.2 | Trier par criticité (bloquant/majeur/mineur) | Priorités définies |
| 10.2.3 | Fix bugs bloquants (1 par 1) | 0 bug bloquant |
| 10.2.4 | Fix bugs majeurs (si temps) | Liste réduite |
| 10.2.5 | Documenter bugs mineurs non fixés | Liste `KNOWN_ISSUES.md` |

### Étape 10.3 — Polish UI
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 10.3.1 | Vérifier cohérence couleurs | Palette respectée |
| 10.3.2 | Vérifier cohérence espacements | Spacing uniforme |
| 10.3.3 | Vérifier tous les boutons ont hover state | Hover visible |
| 10.3.4 | Vérifier tous les forms ont validation | Erreurs affichées |
| 10.3.5 | Test responsive mobile (375px) | Pas de casse |
| 10.3.6 | Test responsive tablette (768px) | Layout OK |
| 10.3.7 | Test responsive desktop (1280px) | Layout OK |
| 10.3.8 | Ajouter loading states manquants | Spinners visibles |

### Étape 10.4 — Script de Démo
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 10.4.1 | Créer `docs/DEMO_SCRIPT.md` | Fichier créé |
| 10.4.2 | Scénario Admin : créer utilisateur + classe | Étapes documentées |
| 10.4.3 | Scénario Prof : créer cours + upload | Étapes documentées |
| 10.4.4 | Scénario Élève : voir cours + poser question IA | Étapes documentées |
| 10.4.5 | Scénario IA : générer quiz + fiche | Étapes documentées |
| 10.4.6 | Timer chaque section (total < 5min) | Temps notés |
| 10.4.7 | Répéter la démo 2x | Timing validé |

### Étape 10.5 — Plan B (Mode Dégradé)
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 10.5.1 | Si OpenAI down → message d'erreur gracieux | Message affiché |
| 10.5.2 | Si BDD down → page maintenance | Page créée |
| 10.5.3 | Créer `FallbackError.tsx` | < 50 lignes |
| 10.5.4 | Créer `MaintenancePage.tsx` | < 50 lignes |
| 10.5.5 | Documenter procédure fallback | Dans README |

### Étape 10.6 — Seed Démo Final
| Tâche | Action | Validation |
| :--- | :--- | :--- |
| 10.6.1 | Créer 1 Admin "demo@blaizbot.edu" | User créé |
| 10.6.2 | Créer 2 Profs avec noms réalistes | Users créés |
| 10.6.3 | Créer 5 Élèves avec noms réalistes | Users créés |
| 10.6.4 | Créer 3 Classes (6ème A, 5ème B, 4ème C) | Classes créées |
| 10.6.5 | Créer 4 Matières (Maths, Français, Histoire, SVT) | Matières créées |
| 10.6.6 | Créer 3 Cours avec contenu réel | Cours créés |
| 10.6.7 | Vérifier données cohérentes | Parcours fluide |
| 10.6.8 | Commande `npm run seed:demo` | Script prêt |

### Étape 10.7 — Documentation Finale
| Tâche | Fichier | Validation |
| :--- | :--- | :--- |
| 10.7.1 | Mettre à jour `README.md` | Instructions claires |
| 10.7.2 | Section "Installation" complète | 5 étapes max |
| 10.7.3 | Section "Variables d'environnement" | Toutes listées |
| 10.7.4 | Section "Démarrage" | `npm run dev` |
| 10.7.5 | Section "Comptes de test" | Credentials démo |
| 10.7.6 | Créer `CHANGELOG.md` | Liste des features |
| 10.7.7 | Mettre à jour `docs/10-DEVLOG.md` | Session finale |

### Capture requise Phase 10
- [ ] Vidéo démo complète 5 min

---

## 📈 Progression

| Phase | Nom | Statut | Progression |
| :--- | :--- | :--- | :--- |
| 0 | PRD & Specs | ✅ Done | 100% |
| 1 | Initialisation | 🔴 À faire | 0% |
| 2 | Layout | 🔴 À faire | 0% |
| 3 | Vertical Slice | 🔴 À faire | 0% |
| 4 | Base de données | 🔴 À faire | 0% |
| 5 | Authentification | 🔴 À faire | 0% |
| 6 | Admin | 🔴 À faire | 0% |
| 7 | Professeur | 🔴 À faire | 0% |
| 8 | Élève | 🔴 À faire | 0% |
| 9 | IA | 🔴 À faire | 0% |
| 10 | Démo | 🔴 À faire | 0% |

---

## 📝 Règles pour l'IA (Context Engineering)

```markdown
AVANT de générer du code, l'IA doit vérifier :
1. Le fichier fait-il < 350 lignes ? Si non → découper
2. Le composant est-il unique dans son fichier ? Si non → extraire
3. Les props sont-elles typées ? Si non → ajouter types
4. Le code est-il testable ? Si non → refactorer

STRUCTURE CIBLE par composant :
- Imports (10-20 lignes)
- Types/Interfaces (10-30 lignes)
- Composant principal (100-200 lignes)
- Sous-fonctions extraites (50-100 lignes)
- Export (1 ligne)
TOTAL < 350 lignes
```

---

*Dernière mise à jour : 2025-12-22*

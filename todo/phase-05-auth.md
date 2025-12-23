# 🔐 Phase 5 — Authentification & Rôles (Partie 1)

> **Objectif** : Chaque rôle voit son espace (RBAC)  
> **Statut** : 🔴 À FAIRE  
> **Durée estimée** : 4-5h  
> **Prérequis** : Phase 4 terminée (BDD avec users seedés)
> **Suite** : [phase-05-auth-suite.md](phase-05-auth-suite.md)

---

## ⚠️ Instructions IA — LIRE EN PREMIER

```
AVANT de commencer cette phase :
1. Vérifier que le seed a créé les users avec passwords hashés
2. Consulter docs/08-AUTHENTIFICATION.md pour les specs
3. NextAuth v5 (beta) = syntaxe différente de v4 !
4. Le middleware est CRITIQUE pour la sécurité

RÈGLES RBAC STRICTES :
- Admin    → /admin/*   UNIQUEMENT
- Teacher  → /teacher/* UNIQUEMENT  
- Student  → /student/* UNIQUEMENT
- Accès croisé = redirect /unauthorized

ATTENTION NextAuth v5 :
- Import depuis next-auth (pas next-auth/react pour certains)
- auth() remplace getServerSession()
- Fichier auth.ts exporte { auth, signIn, signOut, handlers }
```

---

## 📋 Étape 5.1 — Installer NextAuth v5

### 🎯 Objectif
Installer NextAuth v5 (beta) et configurer la structure de base pour l'authentification.

### 📝 Comment
1. Installer le package `next-auth@beta`
2. Créer le fichier de configuration `src/lib/auth.ts`
3. Générer un secret sécurisé pour les tokens
4. Créer la route API handler

### 🔧 Par quel moyen
- Package : `next-auth@beta` (v5, syntaxe différente de v4)
- Secret : `openssl rand -base64 32`
- Route handler : `src/app/api/auth/[...nextauth]/route.ts`

---

### Tâche 5.1.1 — Installer NextAuth

| Critère | Attendu |
| :--- | :--- |
| Commande | `npm install next-auth@beta` |
| Package.json | `"next-auth": "^5.x.x"` |
| Node_modules | `next-auth` présent |

💡 **INSTRUCTION pour l'IA** :
```
1. EXÉCUTER: npm install next-auth@beta
2. VÉRIFIER: package.json contient "next-auth": "^5.x.x"
3. NOTE: La version beta est stable pour Next.js 15
```

---

### Tâche 5.1.2 — Générer AUTH_SECRET

| Critère | Attendu |
| :--- | :--- |
| Commande | `openssl rand -base64 32` |
| Format | String 32 bytes base64 |
| Fichier | `.env.local` |

💡 **INSTRUCTION pour l'IA** :
```
1. EXÉCUTER: openssl rand -base64 32
2. COPIER le résultat (ex: "kJ9x2mP5qR7tY1wE3uI6oA8sD0fG4hL2")
3. AJOUTER dans .env.local:
   AUTH_SECRET="[valeur générée]"
   AUTH_URL="http://localhost:3000"
4. NE PAS committer le secret réel
```

---

### Tâche 5.1.3 — Créer src/lib/auth.ts

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/lib/auth.ts` |
| Export | `{ auth, signIn, signOut, handlers }` |
| Provider | `CredentialsProvider` configuré |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/lib/auth.ts
2. UTILISER le template de [phase-05-code.md](phase-05-code.md) section 1
3. CONFIGURER:
   - CredentialsProvider avec authorize()
   - Callbacks jwt et session (pour inclure role)
   - Pages personnalisées (login: "/login")
4. EXPORTER: { auth, signIn, signOut, handlers }
```

**Structure attendue** :
```typescript
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// ... voir phase-05-code.md section 1
```

---

### Tâche 5.1.4 — Créer route handler

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/api/auth/[...nextauth]/route.ts` |
| Exports | `GET` et `POST` |
| Source | Import depuis `@/lib/auth` |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/api/auth/[...nextauth]/route.ts
2. CONTENU (très court) :
   export { handlers as GET, handlers as POST } from '@/lib/auth';
   // OU selon version:
   import { handlers } from '@/lib/auth';
   export const { GET, POST } = handlers;
3. TESTER: Accéder à /api/auth/providers (doit retourner JSON)
```

---

### Tâche 5.1.5 — Tester la configuration

| Critère | Attendu |
| :--- | :--- |
| URL | `http://localhost:3000/api/auth/providers` |
| Réponse | JSON avec "credentials" provider |
| Erreur | Aucune erreur console |

💡 **INSTRUCTION pour l'IA** :
```
1. DÉMARRER: npm run dev
2. OUVRIR: http://localhost:3000/api/auth/providers
3. VÉRIFIER réponse JSON:
   { "credentials": { "id": "credentials", ... } }
4. SI ERREUR: Vérifier AUTH_SECRET dans .env.local
```

---

## 📋 Étape 5.2 — Configurer Credentials Provider

### 🎯 Objectif
Permettre l'authentification par email/password avec vérification bcrypt.

### 📝 Comment
1. Implémenter la fonction `authorize` dans le provider
2. Chercher l'utilisateur par email dans Prisma
3. Comparer le password avec bcrypt
4. Retourner l'objet user avec le rôle

### 🔧 Par quel moyen
- Prisma : `prisma.user.findUnique({ where: { email } })`
- Bcrypt : `bcrypt.compare(password, user.password)`
- Return : `{ id, email, name, role }`

---

### Tâche 5.2.1 — Installer bcryptjs

| Critère | Attendu |
| :--- | :--- |
| Commande | `npm install bcryptjs` |
| Types | `npm install -D @types/bcryptjs` |
| Import | `import bcrypt from 'bcryptjs'` |

💡 **INSTRUCTION pour l'IA** :
```
1. EXÉCUTER: npm install bcryptjs
2. EXÉCUTER: npm install -D @types/bcryptjs
3. VÉRIFIER: package.json contient les deux
```

---

### Tâche 5.2.2 — Implémenter authorize()

| Critère | Attendu |
| :--- | :--- |
| Input | `credentials: { email, password }` |
| Query | `prisma.user.findUnique` |
| Compare | `bcrypt.compare` |
| Return | `{ id, email, name, role }` ou `null` |

💡 **INSTRUCTION pour l'IA** :
```
1. DANS src/lib/auth.ts, fonction authorize:
2. VÉRIFIER que credentials.email et credentials.password existent
3. QUERY Prisma:
   const user = await prisma.user.findUnique({
     where: { email: credentials.email }
   });
4. SI user null → return null
5. COMPARER:
   const isValid = await bcrypt.compare(credentials.password, user.password);
6. SI !isValid → return null
7. RETURN: { id: user.id, email: user.email, name: user.name, role: user.role }
```

**Code complet** : Voir [phase-05-code.md](phase-05-code.md) section 2

---

### Tâche 5.2.3 — Configurer callbacks JWT/Session

| Critère | Attendu |
| :--- | :--- |
| JWT callback | Ajoute `role` au token |
| Session callback | Ajoute `role` à la session |
| TypeScript | Types étendus pour `role` |

💡 **INSTRUCTION pour l'IA** :
```
1. DANS auth.ts, ajouter callbacks:
   callbacks: {
     async jwt({ token, user }) {
       if (user) token.role = user.role;
       return token;
     },
     async session({ session, token }) {
       if (session.user) session.user.role = token.role;
       return session;
     },
   }
2. CRÉER src/types/next-auth.d.ts pour étendre les types
3. VOIR [phase-05-code.md](phase-05-code.md) section 3
```

---

### Tâche 5.2.4 — Tester login avec user seed

| Critère | Attendu |
| :--- | :--- |
| Email | `admin@blaizbot.fr` |
| Password | `password123` |
| Résultat | Session créée avec role=ADMIN |

💡 **INSTRUCTION pour l'IA** :
```
1. UTILISER les credentials du seed:
   - admin@blaizbot.fr / password123
   - dupont@blaizbot.fr / password123 (TEACHER)
   - lucas@example.com / password123 (STUDENT)
2. TESTER via /api/auth/signin ou form custom
3. VÉRIFIER session contient le role
```

---

## 📋 Étape 5.3 — Modifier LoginForm

### 🎯 Objectif
Remplacer les boutons mock par un vrai formulaire d'authentification.

### 📝 Comment
1. Supprimer les boutons "Connexion Admin/Prof/Élève"
2. Créer un formulaire avec email + password
3. Utiliser `signIn("credentials", ...)` de NextAuth
4. Gérer loading state et erreurs

### 🔧 Par quel moyen
- Form : `<form onSubmit={handleSubmit}>`
- SignIn : `signIn("credentials", { email, password, redirect: false })`
- État : `useState` pour loading et error

---

### Tâche 5.3.1 — Nettoyer LoginForm.tsx

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/auth/LoginForm.tsx` |
| Supprimer | Boutons mock (Admin/Prof/Élève) |
| Garder | Structure Card |

💡 **INSTRUCTION pour l'IA** :
```
1. OUVRIR: src/components/features/auth/LoginForm.tsx
2. SUPPRIMER: Les 3 boutons mock et leurs handlers
3. GARDER: Card, CardHeader, CardContent structure
4. PRÉPARER: Espace pour le formulaire
```

---

### Tâche 5.3.2 — Créer le formulaire

| Critère | Attendu |
| :--- | :--- |
| Inputs | Email (type="email"), Password (type="password") |
| Button | Submit avec loading state |
| Labels | Labels accessibles |

💡 **INSTRUCTION pour l'IA** :
```
1. AJOUTER useState:
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [loading, setLoading] = useState(false);

2. CRÉER form avec:
   - Label + Input email (required)
   - Label + Input password (required)
   - Button type="submit" disabled={loading}
   
3. UTILISER composants shadcn/ui: Input, Button, Label
```

**Code complet** : Voir [phase-05-code.md](phase-05-code.md) section 4

---

### Tâche 5.3.3 — Implémenter handleSubmit

| Critère | Attendu |
| :--- | :--- |
| Prevent default | `e.preventDefault()` |
| Loading | Set true au début, false à la fin |
| SignIn | `signIn("credentials", { redirect: false, ... })` |
| Redirect | Si succès → router.push selon rôle |

💡 **INSTRUCTION pour l'IA** :
```
1. FONCTION handleSubmit:
   async function handleSubmit(e: React.FormEvent) {
     e.preventDefault();
     setLoading(true);
     setError('');
     
     const result = await signIn('credentials', {
       email,
       password,
       redirect: false,
     });
     
     if (result?.error) {
       setError('Email ou mot de passe incorrect');
       setLoading(false);
       return;
     }
     
     // Récupérer session pour connaître le rôle
     // Redirect vers dashboard approprié
   }
```

---

## 🔄 Navigation

← [phase-04-database-suite.md](phase-04-database-suite.md) | [phase-05-auth-suite.md](phase-05-auth-suite.md) →

---

*Lignes : ~310 | Dernière MAJ : 2025-12-22*

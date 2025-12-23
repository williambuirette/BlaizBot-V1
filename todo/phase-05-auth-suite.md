# 🔐 Phase 5 — Authentification & Rôles (Partie 2)

> **Suite de** : [phase-05-auth.md](phase-05-auth.md) (étapes 5.1→5.3)
> **Ce fichier** : Étapes 5.4→5.7 (Middleware, RBAC, Logout)
> **Code** : [phase-05-code.md](phase-05-code.md)

---

## 📋 Étape 5.4 — Créer Middleware Auth

### 🎯 Objectif
Protéger les routes dashboard AVANT le rendu (pas de flash de contenu).

### 📝 Comment
1. Créer `src/middleware.ts` à la racine de src
2. Exporter `auth` comme middleware
3. Configurer le matcher pour les routes protégées
4. Rediriger vers /login si pas de session

### 🔧 Par quel moyen
- Middleware NextAuth v5 : `export { auth as middleware }`
- Matcher : `/admin/:path*`, `/teacher/:path*`, `/student/:path*`
- Config : `export const config = { matcher: [...] }`

---

### Tâche 5.4.1 — Créer middleware.ts

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/middleware.ts` |
| Export | `auth as middleware` |
| Matcher | 3 routes dashboard |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/middleware.ts (à la racine de src, pas dans app)
2. CONTENU de base:
   export { auth as middleware } from '@/lib/auth';
   
   export const config = {
     matcher: [
       '/admin/:path*',
       '/teacher/:path*',
       '/student/:path*',
     ],
   };
3. TESTER: Accéder à /student sans login → redirect /login
```

---

### Tâche 5.4.2 — Tester protection basique

| Critère | Attendu |
| :--- | :--- |
| Sans session | Redirect vers /login |
| Avec session | Accès autorisé |
| URL préservée | Callback URL après login |

💡 **INSTRUCTION pour l'IA** :
```
1. DÉMARRER: npm run dev
2. OUVRIR: http://localhost:3000/student (sans login)
3. VÉRIFIER: Redirect vers /login?callbackUrl=/student
4. SE CONNECTER avec lucas@example.com
5. VÉRIFIER: Retour vers /student
```

---

## 📋 Étape 5.5 — Implémenter RBAC

### 🎯 Objectif
Chaque rôle accède UNIQUEMENT à son espace (Admin→/admin, etc.).

### 📝 Comment
1. Enrichir le middleware avec logique RBAC
2. Vérifier que le rôle correspond à la route
3. Rediriger vers /unauthorized si mismatch
4. Créer page /unauthorized

### 🔧 Par quel moyen
- Check : `session.user.role` vs `pathname.startsWith('/admin')`
- Redirect : `NextResponse.redirect(new URL('/unauthorized', req.url))`
- Mapping : `{ ADMIN: '/admin', TEACHER: '/teacher', STUDENT: '/student' }`

---

### Tâche 5.5.1 — Middleware avec RBAC

| Critère | Attendu |
| :--- | :--- |
| Admin | /admin/* OK, /teacher/* NON |
| Teacher | /teacher/* OK, /admin/* NON |
| Student | /student/* OK, /teacher/* NON |
| Redirect | → /unauthorized |

💡 **INSTRUCTION pour l'IA** :
```
1. REMPLACER le middleware simple par version RBAC complète
2. LOGIQUE:
   - Récupérer session via auth()
   - Si pas de session → redirect /login
   - Si session.user.role ne correspond pas à la route → redirect /unauthorized
3. MAPPING:
   const roleRouteMap = {
     ADMIN: '/admin',
     TEACHER: '/teacher', 
     STUDENT: '/student',
   };
4. CHECK:
   const allowedRoute = roleRouteMap[session.user.role];
   if (!pathname.startsWith(allowedRoute)) {
     return NextResponse.redirect(new URL('/unauthorized', req.url));
   }
```

**Code complet** : Voir [phase-05-code.md](phase-05-code.md) section 5

---

### Tâche 5.5.2 — Créer page /unauthorized

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/app/unauthorized/page.tsx` |
| Message | "Accès non autorisé" |
| Bouton | Retour vers dashboard du rôle |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/app/unauthorized/page.tsx
2. CONTENU:
   - Icône ShieldX ou Lock
   - Titre "Accès non autorisé"
   - Message "Vous n'avez pas les droits pour cette page"
   - Bouton "Retour au tableau de bord"
3. LOGIQUE bouton:
   - Récupérer session côté server
   - Lien vers /admin, /teacher ou /student selon rôle
   - Si pas de session → lien vers /login
```

**Code complet** : Voir [phase-05-code.md](phase-05-code.md) section 6

---

### Tâche 5.5.3 — Tester tous les cas RBAC

| Test | Action | Résultat attendu |
| :--- | :--- | :--- |
| Admin → /admin | Login admin, aller /admin | ✅ Accès OK |
| Admin → /teacher | Login admin, aller /teacher | 🚫 Redirect /unauthorized |
| Teacher → /teacher | Login prof, aller /teacher | ✅ Accès OK |
| Teacher → /admin | Login prof, aller /admin | 🚫 Redirect /unauthorized |
| Student → /student | Login élève, aller /student | ✅ Accès OK |
| Student → /admin | Login élève, aller /admin | 🚫 Redirect /unauthorized |

💡 **INSTRUCTION pour l'IA** :
```
1. TESTER avec chaque user du seed:
   - admin@blaizbot.fr (ADMIN)
   - dupont@blaizbot.fr (TEACHER)
   - lucas@example.com (STUDENT)
2. POUR CHAQUE user, tester accès aux 3 dashboards
3. VÉRIFIER les redirects corrects
```

---

## 📋 Étape 5.6 — Redirect intelligent après login

### 🎯 Objectif
Après login, rediriger vers le dashboard du rôle de l'utilisateur.

### 📝 Comment
1. Après signIn réussi, récupérer la session
2. Extraire le rôle de l'utilisateur
3. Rediriger vers /admin, /teacher ou /student
4. Respecter callbackUrl si présent

### 🔧 Par quel moyen
- Session : `await getSession()` ou fetch session après signIn
- Router : `router.push(dashboardUrl)`
- Callback : `searchParams.get('callbackUrl')`

---

### Tâche 5.6.1 — Modifier handleSubmit dans LoginForm

| Critère | Attendu |
| :--- | :--- |
| Après signIn | Fetch session |
| Extraire role | `session.user.role` |
| Redirect | Vers dashboard du rôle |

💡 **INSTRUCTION pour l'IA** :
```
1. APRÈS signIn réussi dans LoginForm:
   // Récupérer la session mise à jour
   const session = await getSession();
   
   // Déterminer le dashboard
   const dashboardRoutes = {
     ADMIN: '/admin',
     TEACHER: '/teacher',
     STUDENT: '/student',
   };
   
   const dashboardUrl = dashboardRoutes[session?.user?.role] || '/';
   
   // Vérifier callbackUrl (prioritaire)
   const callbackUrl = searchParams.get('callbackUrl');
   router.push(callbackUrl || dashboardUrl);

2. IMPORTER getSession depuis next-auth/react
```

---

### Tâche 5.6.2 — Tester redirections

| Login | Attendu |
| :--- | :--- |
| admin@blaizbot.fr | → /admin |
| dupont@blaizbot.fr | → /teacher |
| lucas@example.com | → /student |
| Avec callbackUrl | → callbackUrl |

---

## 📋 Étape 5.7 — Logout fonctionnel

### 🎯 Objectif
Permettre à l'utilisateur de se déconnecter proprement.

### 📝 Comment
1. Ajouter bouton "Déconnexion" dans le header
2. Appeler `signOut()` de NextAuth
3. Détruire la session
4. Rediriger vers /login

### 🔧 Par quel moyen
- SignOut : `signOut({ callbackUrl: '/login' })`
- Bouton : Dans dropdown du header (UserNav)
- Toast : Notification de déconnexion

---

### Tâche 5.7.1 — Ajouter bouton logout dans Header

| Critère | Attendu |
| :--- | :--- |
| Position | Dropdown utilisateur ou footer sidebar |
| Label | "Déconnexion" avec icône LogOut |
| Action | Appelle signOut |

💡 **INSTRUCTION pour l'IA** :
```
1. LOCALISER le composant Header ou UserNav
2. AJOUTER un bouton/lien:
   <Button 
     variant="ghost" 
     onClick={() => signOut({ callbackUrl: '/login' })}
   >
     <LogOut className="mr-2 h-4 w-4" />
     Déconnexion
   </Button>
3. IMPORTER signOut depuis next-auth/react
4. IMPORTER LogOut depuis lucide-react
```

---

### Tâche 5.7.2 — Créer composant LogoutButton

| Critère | Attendu |
| :--- | :--- |
| Fichier | `src/components/features/auth/LogoutButton.tsx` |
| Props | `className?` pour styling |
| Action | signOut avec redirect |

💡 **INSTRUCTION pour l'IA** :
```
1. CRÉER: src/components/features/auth/LogoutButton.tsx
2. CONTENU:
   'use client';
   
   import { signOut } from 'next-auth/react';
   import { Button } from '@/components/ui/button';
   import { LogOut } from 'lucide-react';
   
   export function LogoutButton({ className }: { className?: string }) {
     return (
       <Button
         variant="ghost"
         className={className}
         onClick={() => signOut({ callbackUrl: '/login' })}
       >
         <LogOut className="mr-2 h-4 w-4" />
         Déconnexion
       </Button>
     );
   }
3. UTILISER ce composant dans Sidebar et/ou Header
```

---

### Tâche 5.7.3 — Tester logout

| Critère | Attendu |
| :--- | :--- |
| Clic logout | Session détruite |
| Redirect | Vers /login |
| Retour dashboard | Redirect /login (pas de session) |

---

### 🧪 TEST CHECKPOINT 5.A — Après RBAC complet

> ⚠️ **OBLIGATOIRE** : Sécurité critique

| Test | Action | Résultat attendu |
|:-----|:-------|:-----------------|
| Build | `npm run build` | ✅ No errors |
| Lint | `npm run lint` | ✅ No warnings |

**Tests de sécurité CRITIQUES** :
- [ ] Sans login → `/student` redirect vers `/login`
- [ ] Admin → `/teacher` redirect vers `/unauthorized`
- [ ] Teacher → `/admin` redirect vers `/unauthorized`
- [ ] Student → `/admin` redirect vers `/unauthorized`
- [ ] Login admin → redirect auto vers `/admin`
- [ ] Login teacher → redirect auto vers `/teacher`
- [ ] Login student → redirect auto vers `/student`

**Tests session** :
- [ ] Déconnexion → session détruite
- [ ] Retour arrière après logout → redirect `/login`

---

### 🔄 REFACTOR CHECKPOINT 5.B — Vérification standards

> 📏 **Règle** : Aucun fichier > 350 lignes

```powershell
# Vérifier les fichiers trop longs
Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts | `
  ForEach-Object { $lines = (Get-Content $_).Count; if($lines -gt 350) { "$($_.Name): $lines lignes" } }
```

**Vérifications spécifiques Auth** :
- [ ] `middleware.ts` < 50 lignes (simple et efficace)
- [ ] `auth.ts` < 150 lignes
- [ ] Pas de secrets hardcodés (`grep -r "password" src/`)
- [ ] Erreurs d'auth bien typées

---

### 📝 EXPOSÉ CHECKPOINT 5.C — Mise à jour BlaizBot-projet

> 📚 **OBLIGATOIRE** : Documenter l'avancement après chaque phase

| Tâche | Action | Fichier cible |
|:------|:-------|:--------------|
| 5.C.1 | Incrémenter `developmentHours` (+5h) | `progress.json` |
| 5.C.2 | Ajouter résumé Phase 5 | `content/08-developpement.md` |
| 5.C.3 | Documenter le RBAC | `content/annexes/B-code-samples.md` |
| 5.C.4 | Capturer login + redirections | `assets/screenshots/phase-05-auth.png` |
| 5.C.5 | Commit BlaizBot-projet | `git commit -m "docs: phase 5 auth RBAC"` |

**Template à ajouter dans 08-developpement.md** :
```markdown
### Phase 5 — Authentification (DATE)

**Durée** : 5h  
**Tâches** : X/X complétées

**Résumé** :
- NextAuth.js v5 configuré avec Credentials Provider
- Session JWT avec rôle utilisateur
- Middleware de protection des routes
- RBAC : admin/teacher/student séparés
- Page /unauthorized pour accès refusé

**Point clé sécurité** :
- [Expliquer le flow d'auth]

**Captures** : `phase-05-auth.png`
```

---

## 📸 Captures requises

- [ ] Screenshot formulaire login avec erreur
- [ ] Screenshot page /unauthorized
- [ ] GIF : Login admin → redirect /admin
- [ ] GIF : Admin tente /teacher → redirect /unauthorized

---

## ✅ Checklist fin de phase

| Critère | Vérifié |
| :--- | :--- |
| NextAuth v5 installé et configuré | ⬜ |
| AUTH_SECRET dans .env.local | ⬜ |
| Login fonctionnel (email/password) | ⬜ |
| Session contient le rôle | ⬜ |
| Middleware protège toutes les routes | ⬜ |
| RBAC : chaque rôle = son espace | ⬜ |
| Page /unauthorized créée | ⬜ |
| Redirect intelligent après login | ⬜ |
| Logout fonctionnel | ⬜ |
| `npm run lint` OK | ⬜ |
| `npm run build` OK | ⬜ |

---

## 🔄 Navigation

← [phase-05-auth.md](phase-05-auth.md) | [phase-06-admin.md](phase-06-admin.md) →

---

*Lignes : ~290 | Dernière MAJ : 2025-12-22*

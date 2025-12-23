# 📄 Code & Templates — Phase 5 (Partie 2)

> Suite du code pour la Phase 5 (Authentification).
> **Précédent** : [phase-05-code.md](phase-05-code.md)
> **Utilisé par** : [phase-05-auth-suite.md](phase-05-auth-suite.md)

---

## 6. src/middleware.ts — Middleware RBAC complet

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Mapping rôle → route autorisée
const roleRouteMap: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Routes publiques (pas de protection)
  const publicRoutes = ['/login', '/api/auth'];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Pas de session → redirect login
  if (!session?.user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Vérifier RBAC pour les routes dashboard
  const userRole = session.user.role;
  const allowedRoute = roleRouteMap[userRole];

  // Si on est sur une route dashboard
  const dashboardRoutes = ['/admin', '/teacher', '/student'];
  const isOnDashboard = dashboardRoutes.some((r) => pathname.startsWith(r));

  if (isOnDashboard && allowedRoute && !pathname.startsWith(allowedRoute)) {
    // Tentative d'accès à un dashboard non autorisé
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Routes protégées
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    // Exclure les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 7. src/app/unauthorized/page.tsx

```tsx
// src/app/unauthorized/page.tsx
import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth';

export default async function UnauthorizedPage() {
  const session = await auth();
  
  // Déterminer le dashboard de retour selon le rôle
  const dashboardRoutes: Record<string, string> = {
    ADMIN: '/admin',
    TEACHER: '/teacher',
    STUDENT: '/student',
  };
  
  const returnUrl = session?.user?.role 
    ? dashboardRoutes[session.user.role] 
    : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className="p-4 bg-red-100 rounded-full">
            <ShieldX className="h-12 w-12 text-red-600" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Accès non autorisé
          </h1>
          <p className="text-muted-foreground max-w-md">
            Vous n'avez pas les droits nécessaires pour accéder à cette page.
            Veuillez retourner à votre tableau de bord.
          </p>
        </div>
        
        <Button asChild>
          <Link href={returnUrl}>
            Retour au tableau de bord
          </Link>
        </Button>
      </div>
    </div>
  );
}
```

---

## 8. src/components/features/auth/LogoutButton.tsx

```tsx
// src/components/features/auth/LogoutButton.tsx
'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline' | 'destructive';
  showIcon?: boolean;
  showText?: boolean;
}

export function LogoutButton({
  className,
  variant = 'ghost',
  showIcon = true,
  showText = true,
}: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <Button
      variant={variant}
      className={cn('justify-start', className)}
      onClick={handleLogout}
    >
      {showIcon && <LogOut className={cn('h-4 w-4', showText && 'mr-2')} />}
      {showText && 'Déconnexion'}
    </Button>
  );
}
```

---

## 9. src/lib/auth-utils.ts — Utilitaires Auth

```typescript
// src/lib/auth-utils.ts
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

/**
 * Vérifie que l'utilisateur est connecté et a un des rôles autorisés
 * Redirige vers /unauthorized si non autorisé
 * Redirige vers /login si pas connecté
 */
export async function requireAuth(allowedRoles?: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as Role)) {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * Récupère la session sans redirection
 * Utile pour les pages qui affichent du contenu différent selon l'auth
 */
export async function getOptionalAuth() {
  return await auth();
}

/**
 * Vérifie si un rôle peut accéder à une route
 */
export function canAccessRoute(role: Role, route: string): boolean {
  const roleRouteMap: Record<Role, string> = {
    ADMIN: '/admin',
    TEACHER: '/teacher',
    STUDENT: '/student',
  };

  const allowedRoute = roleRouteMap[role];
  return route.startsWith(allowedRoute);
}

/**
 * Retourne l'URL du dashboard pour un rôle donné
 */
export function getDashboardUrl(role: Role): string {
  const dashboardRoutes: Record<Role, string> = {
    ADMIN: '/admin',
    TEACHER: '/teacher',
    STUDENT: '/student',
  };

  return dashboardRoutes[role] || '/';
}
```

---

## 10. Intégration Logout dans Sidebar

```tsx
// Modification dans src/components/features/shared/Sidebar.tsx
// Ajouter en bas de la sidebar :

import { LogoutButton } from '@/components/features/auth/LogoutButton';

// Dans le JSX, avant la fermeture de la sidebar :
<div className="mt-auto p-4 border-t">
  <LogoutButton className="w-full" />
</div>
```

---

## 11. Provider SessionProvider (si nécessaire)

```tsx
// src/app/providers.tsx (si vous utilisez des hooks client)
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// Puis dans layout.tsx :
// import { Providers } from './providers';
// <Providers>{children}</Providers>
```

**Note** : Le `SessionProvider` n'est nécessaire que si vous utilisez des hooks comme `useSession()` côté client. Pour les Server Components, utilisez `auth()` directement.

---

## 12. Commandes de test

```bash
# Vérifier que tout compile
npm run build

# Lancer en dev
npm run dev

# Test credentials seed :
# admin@blaizbot.fr / password123 → /admin
# dupont@blaizbot.fr / password123 → /teacher  
# lucas@example.com / password123 → /student

# Tester RBAC :
# 1. Login admin, tenter /teacher → /unauthorized
# 2. Login student, tenter /admin → /unauthorized
```

---

## 13. Troubleshooting

| Erreur | Cause | Solution |
| :--- | :--- | :--- |
| `AUTH_SECRET` missing | Variable non définie | Ajouter dans `.env.local` |
| `Cannot read role of undefined` | Types non étendus | Créer `src/types/next-auth.d.ts` |
| Redirect loop | Middleware mal configuré | Vérifier matcher config |
| Session null après signIn | Callback pas configuré | Ajouter callbacks jwt/session |
| `Module not found: bcryptjs` | Package manquant | `npm install bcryptjs` |

---

*Dernière MAJ : 2025-12-22*

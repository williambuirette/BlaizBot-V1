# Phase 5 - Authentification & Rôles

> **Objectif** : Chaque rôle voit son espace (RBAC)  
> **Fichiers TODO** : `phase-05-auth.md`, `phase-05-auth-suite.md`  
> **Fichiers code** : `phase-05-code.md`

---

## 🎯 Prompts Optimisés par Tâche

---

## 📋 Étape 5.1 — Installer NextAuth v5

### Prompt 5.1.1 — Installation

```
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs

Ajouter dans .env.local :
AUTH_SECRET="[openssl rand -base64 32]"
AUTH_URL="http://localhost:3000"
```

### Prompt 5.1.2 — Fichier auth.ts

```
Créer `src/lib/auth.ts` :

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        
        if (!user) return null;
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (!isValid) return null;
        
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: '/login' },
});
```

### Prompt 5.1.3 — Route Handler

```
Créer `src/app/api/auth/[...nextauth]/route.ts` :

import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

---

## 📋 Étape 5.2 — Types NextAuth

### Prompt 5.2.1 — Augmenter les types

```
Créer `src/types/next-auth.d.ts` :

import { Role } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: Role;
  }
  interface Session {
    user: User & { role: Role };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
  }
}
```

---

## 📋 Étape 5.3 — Middleware RBAC

### Prompt 5.3.1 — Middleware

```
Créer `src/middleware.ts` (à la racine de src/) :

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Routes publiques
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Non connecté → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // RBAC
  if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  if (pathname.startsWith('/teacher') && user.role !== 'TEACHER') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  if (pathname.startsWith('/student') && user.role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 📋 Étape 5.4 — Page Login réelle

### Prompt 5.4.1 — Modifier LoginForm

```
Modifier `src/components/auth/LoginForm.tsx` :

1. Remplacer localStorage par signIn de next-auth
2. Ajouter gestion d'erreur
3. Garder les boutons dev (optionnel en prod)

const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await signIn('credentials', {
    email, password,
    redirect: false,
  });
  
  if (result?.error) {
    setError('Email ou mot de passe incorrect');
  } else {
    router.push('/'); // Le middleware redirigera
  }
};
```

---

## 📋 Étape 5.5 — Sidebar dynamique

### Prompt 5.5.1 — Sidebar avec session

```
Modifier le layout dashboard pour passer le rôle dynamiquement :

import { auth } from '@/lib/auth';

export default async function DashboardLayout({ children }) {
  const session = await auth();
  const role = session.user.role as Role; // MAJUSCULES: ADMIN | TEACHER | STUDENT

  return (
    <div>
      <Sidebar role={role} />
      <div className="ml-64">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

---

## 📊 Validation Finale Phase 5

```
Checklist :
1. Login admin@blaizbot.edu / admin123 → /admin
2. Login m.dupont@blaizbot.edu / prof123 → /teacher
3. Login lucas.martin@blaizbot.edu / eleve123 → /student
4. Accès /admin sans être admin → /unauthorized
5. Logout → /login
6. Sidebar affiche les bons liens selon le rôle
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 5.1 | 23.12.25 | 15min | 1 | Installation OK |
| 5.2 | 23.12.25 | 10min | 1 | Types OK |
| 5.3 | 23.12.25 | 45min | 3 | Middleware Next.js 16 incompatible avec auth wrapper → getToken |
| 5.4 | 23.12.25 | 30min | 2 | Redirect vers role dashboard au lieu de "/" |
| 5.5 | 23.12.25 | 20min | 1 | Layout async avec auth() |

---

## 🔧 Prompts Optimisés (Rétro)

### Prompt Optimal 5.1 — Installation

```
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs

Ajouter dans .env.local :
AUTH_SECRET="[généré avec: openssl rand -base64 32]"

⚠️ Note Next.js 16 : Le pattern "export { auth as middleware }" ne fonctionne plus.
Utiliser getToken de next-auth/jwt dans middleware.ts à la place.
```

### Prompt Optimal 5.3 — Middleware RBAC (Next.js 16)

```
Créer src/middleware.ts :

⚠️ IMPORTANT Next.js 16 : Ne PAS utiliser "export default auth((req) => {...})"
→ Utiliser "export async function middleware()" avec getToken

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes publiques
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Récupérer le token JWT
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Non connecté → login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = token.role as string;

  // RBAC - vérifier l'accès
  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  if (pathname.startsWith('/teacher') && role !== 'TEACHER') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  if (pathname.startsWith('/student') && role !== 'STUDENT') {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Prompt Optimal 5.4 — LoginForm avec redirect direct

```
Modifier LoginForm.tsx :

⚠️ Après signIn réussi, rediriger DIRECTEMENT vers /${role} au lieu de "/"
→ Évite un round-trip inutile via le middleware

const handleLogin = async (email: string, password: string, targetRole?: string) => {
  const result = await signIn('credentials', { email, password, redirect: false });
  
  if (result?.error) {
    setError('Email ou mot de passe incorrect');
  } else {
    const redirectPath = targetRole ? `/${targetRole}` : '/';
    router.push(redirectPath);
    router.refresh(); // Force le refresh de la session côté client
  }
};
```

### Prompt Optimal 5.5 — Layout Dashboard (Server Component)

```
Convertir (dashboard)/layout.tsx en Server Component async :

⚠️ IMPORTANT :
- Retirer 'use client'
- Utiliser auth() de @/lib/auth (pas useSession)
- Role en MAJUSCULES (ADMIN | TEACHER | STUDENT)
- Rediriger si pas de session

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Role } from '@/types';

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role as Role; // MAJUSCULES

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="ml-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

*Dernière mise à jour : 2025-01-13*

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
  const role = session?.user?.role?.toLowerCase() as 'admin' | 'teacher' | 'student';

  return (
    <div>
      <Sidebar role={role} />
      <div className="ml-64">
        <Header user={session?.user} />
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
1. Login admin@blaizbot.fr / password123 → /admin
2. Login prof1@blaizbot.fr / password123 → /teacher
3. Login eleve1@blaizbot.fr / password123 → /student
4. Accès /admin sans être admin → /unauthorized
5. Logout → /login
6. Sidebar affiche les bons liens selon le rôle
```

---

## 📖 Journal des Itérations

| Étape | Date | Durée | Itérations | Rétro-prompt |
|-------|------|-------|------------|--------------|
| 5.1 | | | | |
| 5.2 | | | | |
| 5.3 | | | | |
| 5.4 | | | | |
| 5.5 | | | | |

---

*Dernière mise à jour : 2025-01-13*

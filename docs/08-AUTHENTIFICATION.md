# 08 - Authentification & Autorisation

> **Objectif** : Spécifier le système d'authentification et les permissions
> **Stack** : NextAuth.js v5 + JWT + Prisma

---

## 🔐 Vue d'ensemble

| Aspect | Choix |
| :--- | :--- |
| **Librairie** | NextAuth.js v5 (Auth.js) |
| **Stratégie** | JWT (stateless) |
| **Providers** | Credentials (email/password) |
| **Stockage** | Prisma Adapter (PostgreSQL) |
| **Middleware** | Next.js middleware.ts |

---

## 👥 Rôles

| Rôle | Code | Description |
| :--- | :--- | :--- |
| Admin | `ADMIN` | Gestion établissement, utilisateurs, système |
| Professeur | `TEACHER` | Gestion classes, contenus, élèves |
| Élève | `STUDENT` | Accès assistant, lab, révisions |

### Hiérarchie

```
ADMIN
  └── Peut tout faire
  └── Peut créer/modifier TEACHER et STUDENT
  
TEACHER
  └── Gère ses classes et élèves assignés
  └── Crée contenus pédagogiques
  └── Consulte progressions
  
STUDENT
  └── Accès à ses propres données
  └── Utilise assistant et lab
  └── Consulte ses progressions
```

---

## 📦 Configuration NextAuth

### Installation

```bash
npm install next-auth@beta @auth/prisma-adapter
```

### Configuration (src/lib/auth/config.ts)

```typescript
import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.schoolId = user.schoolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.schoolId = token.schoolId as string;
      }
      return session;
    },
  },
};
```

### Export (src/lib/auth/index.ts)

```typescript
import NextAuth from 'next-auth';
import { authConfig } from './config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
```

### Types étendus (src/types/next-auth.d.ts)

```typescript
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'TEACHER' | 'STUDENT';
      schoolId?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    schoolId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
    schoolId?: string;
  }
}
```

---

## 🛡️ Middleware

### Configuration (middleware.ts)

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const publicRoutes = ['/', '/login', '/api/auth'];

const roleRoutes = {
  ADMIN: ['/admin', '/api/admin'],
  TEACHER: ['/teacher', '/api/teacher'],
  STUDENT: ['/student', '/api/student'],
};

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const path = nextUrl.pathname;

  // Routes publiques
  if (publicRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Non authentifié → login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  const userRole = session.user.role;

  // Vérification des routes par rôle
  for (const [role, routes] of Object.entries(roleRoutes)) {
    if (routes.some(route => path.startsWith(route))) {
      if (userRole !== role && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', nextUrl));
      }
    }
  }

  // Routes API communes
  if (path.startsWith('/api/ai')) {
    // Tous les utilisateurs authentifiés peuvent utiliser l'IA
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 🔒 Protection des Routes

### Route API protégée

```typescript
// src/app/api/student/progress/route.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Non authentifié' },
      { status: 401 }
    );
  }

  if (session.user.role !== 'STUDENT' && session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Non autorisé' },
      { status: 403 }
    );
  }

  // ... logique métier
}
```

### Server Component protégé

```typescript
// src/app/(dashboard)/student/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function StudentPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/unauthorized');
  }

  return (
    <div>
      <h1>Bienvenue, {session.user.name}</h1>
    </div>
  );
}
```

### Hook client

```typescript
// src/hooks/use-auth.ts
'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isStudent: session?.user?.role === 'STUDENT',
    isTeacher: session?.user?.role === 'TEACHER',
    isAdmin: session?.user?.role === 'ADMIN',
  };
}
```

---

## 📋 Permissions détaillées

### Matrice des permissions

| Ressource | Action | STUDENT | TEACHER | ADMIN |
| :--- | :--- | :--- | :--- | :--- |
| **User** | Read self | ✅ | ✅ | ✅ |
| **User** | Update self | ✅ | ✅ | ✅ |
| **User** | Read others | ❌ | Classe | ✅ |
| **User** | Create | ❌ | ❌ | ✅ |
| **User** | Delete | ❌ | ❌ | ✅ |
| **Class** | Read | Sienne | Siennes | ✅ |
| **Class** | Create | ❌ | ❌ | ✅ |
| **Subject** | Read | ✅ | ✅ | ✅ |
| **Subject** | Create | ❌ | ❌ | ✅ |
| **Document** | Read | Partagés | Siens + classe | ✅ |
| **Document** | Upload | Perso | ✅ | ✅ |
| **Document** | Delete | Siens | Siens | ✅ |
| **Progress** | Read | Sien | Classe | ✅ |
| **Progress** | Update | ❌ | ✅ | ✅ |
| **AI Chat** | Use | ✅ | ✅ | ✅ |
| **AI Generate** | Use | ✅ | ✅ | ✅ |
| **Settings** | School | ❌ | ❌ | ✅ |

### Helper de permissions

```typescript
// src/lib/auth/permissions.ts
type Resource = 'user' | 'class' | 'subject' | 'document' | 'progress';
type Action = 'read' | 'create' | 'update' | 'delete';

export function canAccess(
  role: 'ADMIN' | 'TEACHER' | 'STUDENT',
  resource: Resource,
  action: Action,
  context?: { ownerId?: string; userId?: string }
): boolean {
  // Admin peut tout faire
  if (role === 'ADMIN') return true;

  // Logique par ressource
  switch (resource) {
    case 'user':
      if (action === 'read' || action === 'update') {
        return context?.ownerId === context?.userId;
      }
      return false;

    case 'document':
      if (action === 'read') return true;
      if (action === 'create') return role === 'TEACHER';
      if (action === 'delete') {
        return context?.ownerId === context?.userId;
      }
      return false;

    // ... autres cas
    default:
      return false;
  }
}
```

---

## 🔑 Gestion des mots de passe

### Hashage

```typescript
// src/lib/auth/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Règles de validation

```typescript
// src/lib/validations/password.ts
import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Minimum 8 caractères')
  .regex(/[A-Z]/, 'Au moins une majuscule')
  .regex(/[a-z]/, 'Au moins une minuscule')
  .regex(/[0-9]/, 'Au moins un chiffre');
```

---

## 🚀 Flux d'authentification

### Login

```
1. User → POST /api/auth/callback/credentials
2. NextAuth valide credentials
3. JWT créé avec role + schoolId
4. Session stockée côté client
5. Redirect → /{role}/dashboard
```

### Logout

```
1. User → POST /api/auth/signout
2. JWT invalidé
3. Session supprimée
4. Redirect → /login
```

---

## ✅ Checklist

- [ ] NextAuth v5 configuré
- [ ] Prisma adapter connecté
- [ ] Types TypeScript étendus
- [ ] Middleware de protection
- [ ] Routes API sécurisées
- [ ] Helpers de permissions
- [ ] Hashage bcrypt
- [ ] Page login créée
- [ ] Page unauthorized créée
- [ ] SessionProvider dans layout

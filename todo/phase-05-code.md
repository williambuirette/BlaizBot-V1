# 📄 Code & Templates — Phase 5 (Partie 1)

> Code source pour la Phase 5 (Authentification).
> **Utilisé par** : [phase-05-auth.md](phase-05-auth.md) et [phase-05-auth-suite.md](phase-05-auth-suite.md)
> **Suite** : [phase-05-code-suite.md](phase-05-code-suite.md)

---

## 1. src/lib/auth.ts — Configuration NextAuth v5

```typescript
// src/lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    CredentialsProvider({
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});
```

---

## 2. src/types/next-auth.d.ts — Extension des types

```typescript
// src/types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    id: string;
  }
}
```

**Note** : Ce fichier étend les types TypeScript de NextAuth pour inclure `role` et `id`.

---

## 3. src/app/api/auth/[...nextauth]/route.ts

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
```

**C'est tout !** NextAuth v5 simplifie énormément ce fichier.

---

## 4. .env.local — Variables Auth

```bash
# === AUTH (NextAuth v5) ===
AUTH_SECRET="REMPLACER_PAR_VALEUR_GENEREE"
AUTH_URL="http://localhost:3000"

# Générer AUTH_SECRET avec:
# openssl rand -base64 32
```

**⚠️ IMPORTANT** :
- Générer une vraie valeur pour `AUTH_SECRET`
- Ne jamais committer de secrets réels
- En production, utiliser variables d'environnement du hosting

---

## 5. src/components/features/auth/LoginForm.tsx

```tsx
// src/components/features/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dashboardRoutes: Record<string, string> = {
    ADMIN: '/admin',
    TEACHER: '/teacher',
    STUDENT: '/student',
  };

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

    // Récupérer la session pour connaître le rôle
    const session = await getSession();
    const role = session?.user?.role || 'STUDENT';
    const dashboardUrl = dashboardRoutes[role] || '/';

    // Callback URL prioritaire
    const callbackUrl = searchParams.get('callbackUrl');
    router.push(callbackUrl || dashboardUrl);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>
          Entrez vos identifiants pour accéder à votre espace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@blaizbot.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        {/* Aide pour les tests */}
        <div className="mt-6 p-3 bg-muted rounded-md text-sm">
          <p className="font-medium mb-2">Comptes de test :</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>Admin: admin@blaizbot.fr</li>
            <li>Prof: dupont@blaizbot.fr</li>
            <li>Élève: lucas@example.com</li>
            <li className="text-xs">(mot de passe: password123)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

> **Suite** : [phase-05-code-suite.md](phase-05-code-suite.md) (Middleware RBAC, Logout, Unauthorized)

---

*Dernière MAJ : 2025-12-22*

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Comptes de test (seed.ts)
const DEV_ACCOUNTS = {
  student: { email: 'lucas.martin@blaizbot.edu', password: 'eleve123' },
  teacher: { email: 'm.dupont@blaizbot.edu', password: 'prof123' },
  admin: { email: 'admin@blaizbot.edu', password: 'admin123' },
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (emailValue: string, passwordValue: string, targetRole?: string) => {
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: emailValue,
      password: passwordValue,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Email ou mot de passe incorrect');
    } else {
      // Redirection directe vers le dashboard selon le rôle
      const redirectPath = targetRole ? `/${targetRole}` : '/';
      router.push(redirectPath);
      router.refresh();
    }
  };

  const loginAs = (role: 'student' | 'teacher' | 'admin') => {
    const account = DEV_ACCOUNTS[role];
    handleLogin(account.email, account.password, role);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <span className="text-5xl">🤖</span>
        </div>
        <CardTitle className="text-2xl">BlaizBot</CardTitle>
        <CardDescription>Plateforme éducative avec IA intégrée</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Formulaire de connexion */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        {/* Section DEV - Connexion rapide */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground text-center mb-3">
            🛠️ Connexion rapide (DEV)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={() => loginAs('student')}
              disabled={loading}
            >
              Élève
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => loginAs('teacher')}
              disabled={loading}
            >
              Professeur
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
              onClick={() => loginAs('admin')}
              disabled={loading}
            >
              Admin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

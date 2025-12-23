'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginAs = (role: 'student' | 'teacher' | 'admin') => {
    localStorage.setItem('mockRole', role);
    router.push(`/${role}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pour la démo, on redirige vers student par défaut
    loginAs('student');
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
        {/* Formulaire décoratif */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            />
          </div>
          <Button type="submit" className="w-full">
            Se connecter
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
            >
              Élève
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => loginAs('teacher')}
            >
              Professeur
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
              onClick={() => loginAs('admin')}
            >
              Admin
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ShieldX, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Déterminer le dashboard selon le rôle
  const getDashboardUrl = () => {
    const role = session?.user?.role;
    if (role === 'ADMIN') return '/admin';
    if (role === 'TEACHER') return '/teacher';
    if (role === 'STUDENT') return '/student';
    return '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        {/* Icône */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <ShieldX className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-gray-900">Accès non autorisé</h1>

        {/* Message */}
        <p className="text-gray-600 max-w-md">
          Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
          Veuillez contacter un administrateur si vous pensez qu&apos;il s&apos;agit
          d&apos;une erreur.
        </p>

        {/* Boutons */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            Retour
          </Button>
          {session ? (
            <Button onClick={() => router.push(getDashboardUrl())}>
              <Home className="mr-2 h-4 w-4" />
              Mon tableau de bord
            </Button>
          ) : (
            <Button onClick={() => router.push('/login')}>
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

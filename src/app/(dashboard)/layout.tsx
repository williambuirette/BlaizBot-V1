import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Role } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Si pas de session, rediriger vers login
  if (!session?.user) {
    redirect('/login');
  }

  const role = session.user.role as Role;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar fixe à gauche */}
      <Sidebar role={role} />

      {/* Zone principale décalée de 64 (w-64 de la sidebar) */}
      <div className="ml-64">
        {/* Header sticky */}
        <Header user={session.user} />

        {/* Contenu des pages */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

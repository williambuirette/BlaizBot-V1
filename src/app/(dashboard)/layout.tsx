'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Role } from '@/types';

function getRoleFromPathname(pathname: string): Role {
  if (pathname.startsWith('/admin')) return 'ADMIN';
  if (pathname.startsWith('/teacher')) return 'TEACHER';
  return 'STUDENT';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const role = getRoleFromPathname(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar fixe à gauche */}
      <Sidebar role={role} />

      {/* Zone principale décalée de 64 (w-64 de la sidebar) */}
      <div className="ml-64">
        {/* Header sticky */}
        <Header />

        {/* Contenu des pages */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

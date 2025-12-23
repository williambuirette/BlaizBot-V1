import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar fixe à gauche */}
      <Sidebar role="STUDENT" />

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

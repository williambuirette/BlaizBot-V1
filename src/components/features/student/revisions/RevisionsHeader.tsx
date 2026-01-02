/**
 * Header de la page Révisions avec stats et bouton création
 */

'use client';

import Link from 'next/link';
import { Book, FileText, Brain, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RevisionsHeaderProps {
  stats: {
    totalSupplements: number;
    linkedToCourse: number;
    personalCourses: number;
    totalCards: number;
  } | null;
}

export function RevisionsHeader({ stats }: RevisionsHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Titre + Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📚 Mes Révisions</h1>
          <p className="text-muted-foreground">
            Vos notes personnelles et cours privés
          </p>
        </div>
        <Link href="/student/revisions/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        </Link>
      </div>

      {/* Stats rapides */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<Book className="h-5 w-5 text-blue-500" />}
            label="Suppléments"
            value={stats.totalSupplements}
          />
          <StatCard
            icon={<FileText className="h-5 w-5 text-green-500" />}
            label="Liés aux cours"
            value={stats.linkedToCourse}
          />
          <StatCard
            icon={<Brain className="h-5 w-5 text-purple-500" />}
            label="Cours perso"
            value={stats.personalCourses}
          />
          <StatCard
            icon={<FileText className="h-5 w-5 text-orange-500" />}
            label="Total cartes"
            value={stats.totalCards}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

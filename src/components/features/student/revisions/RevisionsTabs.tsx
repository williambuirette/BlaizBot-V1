/**
 * Onglets de filtrage des révisions (Tous / Liés aux cours / Perso)
 */

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupplementCard } from './SupplementCard';
import { BookOpen, Link2, User } from 'lucide-react';

interface Supplement {
  id: string;
  title: string;
  description: string | null;
  courseId: string | null;
  course: {
    id: string;
    title: string;
    teacher: string | null;
  } | null;
  chapterCount: number;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RevisionsTabsProps {
  supplements: Supplement[];
}

export function RevisionsTabs({ supplements }: RevisionsTabsProps) {
  const [activeTab, setActiveTab] = useState('all');

  const linkedSupplements = supplements.filter((s) => s.courseId);
  const personalSupplements = supplements.filter((s) => !s.courseId);

  const getFilteredSupplements = () => {
    switch (activeTab) {
      case 'linked':
        return linkedSupplements;
      case 'personal':
        return personalSupplements;
      default:
        return supplements;
    }
  };

  const filtered = getFilteredSupplements();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="all" className="gap-2">
          <BookOpen className="h-4 w-4" />
          Tous ({supplements.length})
        </TabsTrigger>
        <TabsTrigger value="linked" className="gap-2">
          <Link2 className="h-4 w-4" />
          Liés aux cours ({linkedSupplements.length})
        </TabsTrigger>
        <TabsTrigger value="personal" className="gap-2">
          <User className="h-4 w-4" />
          Cours perso ({personalSupplements.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((supplement) => (
              <SupplementCard key={supplement.id} supplement={supplement} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ tab }: { tab: string }) {
  const messages = {
    all: {
      title: 'Aucune révision',
      description: 'Créez votre premier supplément pour commencer !',
    },
    linked: {
      title: 'Aucun supplément lié',
      description: 'Ajoutez des notes à vos cours pour les retrouver ici.',
    },
    personal: {
      title: 'Aucun cours personnel',
      description: 'Créez un cours perso pour organiser vos révisions.',
    },
  };

  const defaultMessage = messages.all;
  const message = (tab === 'linked' ? messages.linked : tab === 'personal' ? messages.personal : defaultMessage);

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium">{message.title}</h3>
      <p className="text-sm text-muted-foreground">{message.description}</p>
    </div>
  );
}

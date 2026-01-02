'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, BookOpen, FolderTree, Send, File, Download, ExternalLink } from 'lucide-react';
import { ChaptersManager } from '@/components/features/courses/ChaptersManager';
import { ThemeAIMetrics } from '@/components/features/teacher/ThemeAIMetrics';
import { CourseResourcesUploader } from '@/components/features/courses/CourseResourcesUploader';

interface CourseFile {
  id: string;
  filename: string;
  url: string;
  fileType: string;
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  isDraft: boolean;
  subject: { id: string; name: string } | null;
  files?: CourseFile[];
  _count?: {
    chapters: number;
    resources: number;
    assignments: number;
  };
}

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Onglet actif depuis URL ou défaut (cours = vue cartes par défaut)
  const activeTab = searchParams.get('tab') || 'cours';

  // Résoudre les params async
  useEffect(() => {
    params.then(({ id }) => setCourseId(id));
  }, [params]);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`);
      if (!res.ok) {
        if (res.status === 404 || res.status === 403) {
          router.push('/teacher/courses');
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${res.status}`);
      }
      const data = await res.json();
      setCourse(data.course);
    } catch (error) {
      console.error('Erreur fetch course:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, router]);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId, fetchCourse]);

  // Changer d'onglet avec URL
  const handleTabChange = (value: string) => {
    const newUrl = `/teacher/courses/${courseId}?tab=${value}`;
    router.push(newUrl, { scroll: false });
  };

  // Publier / Dépublier le cours
  const handleTogglePublish = async () => {
    if (!course) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/teacher/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDraft: !course.isDraft }),
      });
      if (res.ok) {
        setCourse((prev) => (prev ? { ...prev, isDraft: !prev.isDraft } : null));
      }
    } catch (error) {
      console.error('Erreur publication:', error);
    } finally {
      setPublishing(false);
    }
  };

  if (loading || !courseId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center text-muted-foreground">Cours introuvable</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <Badge variant={course.isDraft ? 'secondary' : 'default'}>
                {course.isDraft ? 'Brouillon' : 'Publié'}
              </Badge>
            </div>
            {course.subject && (
              <p className="text-sm text-muted-foreground">{course.subject.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleTogglePublish}
            disabled={publishing}
            variant={course.isDraft ? 'default' : 'secondary'}
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {course.isDraft ? 'Publier' : 'Dépublier'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="informations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="cours" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Cours</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="informations">
          <CourseInfoTab course={course} courseId={courseId} onUpdate={fetchCourse} />
        </TabsContent>

        {/* Onglet Cours (anciennement Structure) */}
        <TabsContent value="cours">
          <ChaptersManager courseId={courseId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// Composant Onglet Informations
// ============================================

interface CourseInfoTabProps {
  course: CourseData;
  courseId: string;
  onUpdate: () => void;
}

function CourseInfoTab({ course, courseId, onUpdate }: CourseInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Métriques IA */}
      <ThemeAIMetrics courseId={courseId} />

      <div className="grid gap-6 md:grid-cols-2">
      {/* Info générales */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
          <CardDescription>Détails du cours</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Titre</p>
            <p className="text-lg">{course.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-sm">{course.description || 'Aucune description'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Matière</p>
            <p className="text-sm">{course.subject?.name || 'Non définie'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Statut</p>
            <Badge variant={course.isDraft ? 'secondary' : 'default'}>
              {course.isDraft ? 'Brouillon' : 'Publié'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques</CardTitle>
          <CardDescription>Vue d&apos;ensemble du contenu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold">{course._count?.chapters || 0}</p>
              <p className="text-sm text-muted-foreground">Chapitres</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{course._count?.resources || 0}</p>
              <p className="text-sm text-muted-foreground">Ressources</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{course._count?.assignments || 0}</p>
              <p className="text-sm text-muted-foreground">Assignations</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Ressources du cours - Composant interactif */}
      <CourseResourcesUploader
        courseId={courseId}
        files={course.files || []}
        onUpdate={onUpdate}
      />
    </div>
  );
}

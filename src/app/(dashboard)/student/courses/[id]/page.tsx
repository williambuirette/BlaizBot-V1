'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, BookOpen, FolderTree, File, Download, ExternalLink, User } from 'lucide-react';
import { StudentChaptersViewer } from '@/components/features/student/StudentChaptersViewer';

interface CourseFile {
  id: string;
  filename: string;
  url: string;
  fileType: string;
}

interface SectionFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  size?: number;
  textContent?: string | null;
}

interface Section {
  id: string;
  title: string;
  type: string;
  order: number;
  content: string | null;
  files?: SectionFile[];
}

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isCompleted: boolean;
  sections: Section[];
}

interface CourseData {
  id: string;
  title: string;
  description: string | null;
  subject: { id: string; name: string };
  teacher: { id: string; firstName: string; lastName: string };
  chapters: Chapter[];
  files: CourseFile[];
  stats: {
    totalChapters: number;
    completedChapters: number;
    progressPercent: number;
  };
}

interface StudentCourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StudentCourseDetailPage({ params }: StudentCourseDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  // Onglet actif depuis URL ou défaut "cours"
  const activeTab = searchParams.get('tab') || 'cours';

  // Résoudre les params async
  useEffect(() => {
    params.then(({ id }) => setCourseId(id));
  }, [params]);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/student/courses/${courseId}`);
      if (!res.ok) {
        if (res.status === 404 || res.status === 403) {
          router.push('/student/courses');
          return;
        }
        throw new Error('Erreur fetch');
      }
      const data = await res.json();
      if (data.success && data.data) {
        setCourse(data.data.course);
      }
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
    const newUrl = `/student/courses/${courseId}?tab=${value}`;
    router.push(newUrl, { scroll: false });
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

  // Compter les sections
  const totalSections = course.chapters.reduce((acc, ch) => acc + ch.sections.length, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/student/courses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <Badge variant="secondary">{course.subject.name}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Par {course.teacher.firstName} {course.teacher.lastName}
            </p>
          </div>
        </div>
      </div>

      {/* Barre de progression globale */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Ma progression</span>
            <span className="text-sm font-bold text-primary">{course.stats.progressPercent}%</span>
          </div>
          <Progress value={course.stats.progressPercent} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{course.stats.completedChapters} / {course.stats.totalChapters} chapitres terminés</span>
            <span>{totalSections} sections au total</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs comme l'interface professeur */}
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
          <CourseInfoTab course={course} />
        </TabsContent>

        {/* Onglet Cours (contenu) */}
        <TabsContent value="cours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Contenu du cours
              </CardTitle>
              <CardDescription>
                Parcourez les chapitres et réalisez les exercices pour progresser
              </CardDescription>
            </CardHeader>
            <CardContent>
              {course.chapters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun chapitre disponible pour ce cours.</p>
                  <p className="text-sm mt-1">Le professeur n&apos;a pas encore ajouté de contenu.</p>
                </div>
              ) : (
                <StudentChaptersViewer 
                  chapters={course.chapters} 
                  courseId={courseId}
                  onProgressUpdate={fetchCourse}
                />
              )}
            </CardContent>
          </Card>
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
}

function CourseInfoTab({ course }: CourseInfoTabProps) {
  // Compter les sections par type
  const totalSections = course.chapters.reduce((acc, ch) => acc + ch.sections.length, 0);
  const exerciseSections = course.chapters.reduce(
    (acc, ch) => acc + ch.sections.filter(s => s.type === 'EXERCISE').length, 0
  );
  const lessonSections = totalSections - exerciseSections;

  return (
    <div className="space-y-6">
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
              <Badge variant="secondary">{course.subject.name}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">
                <span className="text-muted-foreground">Professeur : </span>
                {course.teacher.firstName} {course.teacher.lastName}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques du cours */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>Vue d&apos;ensemble du contenu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">{course.stats.totalChapters}</p>
                <p className="text-sm text-muted-foreground">Chapitres</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-green-600">{course.stats.completedChapters}</p>
                <p className="text-sm text-muted-foreground">Terminés</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{lessonSections}</p>
                <p className="text-sm text-muted-foreground">Leçons</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-orange-600">{exerciseSections}</p>
                <p className="text-sm text-muted-foreground">Exercices</p>
              </div>
            </div>
            
            {/* Progression détaillée */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression globale</span>
                <span className="font-medium">{course.stats.progressPercent}%</span>
              </div>
              <Progress value={course.stats.progressPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Fichiers / Ressources */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Ressources du cours {course.files?.length ? `(${course.files.length})` : ''}
            </CardTitle>
            <CardDescription>
              Documents et fichiers fournis par le professeur
            </CardDescription>
          </CardHeader>
          <CardContent>
            {course.files && course.files.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {course.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50"
                  >
                    <File className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" title={file.filename}>
                        {file.filename}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {file.fileType}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer" title="Ouvrir">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={file.url} download={file.filename} title="Télécharger">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <File className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Aucune ressource disponible pour ce cours.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

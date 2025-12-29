'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, BookOpen, FolderTree, FileBox, PenTool, ClipboardList, Send, File, Download, ExternalLink } from 'lucide-react';
import { ChaptersManager } from '@/components/features/courses/ChaptersManager';
import { ResourcesManager } from '@/components/features/courses/ResourcesManager';
import { ExercisesManager } from '@/components/features/courses/ExercisesManager';
import { AssignmentsManager } from '@/components/features/courses/AssignmentsManager';
import { QuizEditor } from '@/components/features/courses/QuizEditor';
import { ExerciseEditor } from '@/components/features/courses/ExerciseEditor';

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

interface SectionForEdit {
  id: string;
  title: string;
  type: 'QUIZ' | 'EXERCISE';
  content: string | null;
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

  // État pour les éditeurs Quiz/Exercise
  const [quizEditorOpen, setQuizEditorOpen] = useState(false);
  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionForEdit | null>(null);

  // Onglet actif depuis URL ou défaut
  const activeTab = searchParams.get('tab') || 'informations';

  // Résoudre les params async
  useEffect(() => {
    params.then(({ id }) => setCourseId(id));
  }, [params]);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      const res = await fetch(`/api/teacher/courses/${courseId}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/teacher/courses');
          return;
        }
        throw new Error('Erreur fetch');
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

  // Ouvrir l'éditeur de section (Quiz ou Exercice)
  const handleEditSection = async (sectionId: string) => {
    try {
      const res = await fetch(`/api/teacher/sections/${sectionId}`);
      if (res.ok) {
        const section = await res.json();
        setEditingSection({
          id: section.id,
          title: section.title,
          type: section.type,
          content: section.content,
        });
        if (section.type === 'QUIZ') {
          setQuizEditorOpen(true);
        } else if (section.type === 'EXERCISE') {
          setExerciseEditorOpen(true);
        }
      }
    } catch (error) {
      console.error('Erreur fetch section:', error);
    }
  };

  // Sauvegarder le contenu d'une section
  const handleSaveContent = async (content: unknown) => {
    if (!editingSection) return;
    const res = await fetch(`/api/teacher/sections/${editingSection.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: JSON.stringify(content) }),
    });
    if (!res.ok) throw new Error('Erreur sauvegarde');
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
          <Button variant="outline" asChild>
            <Link href={`/teacher/courses/${courseId}/edit`}>Modifier infos</Link>
          </Button>
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="informations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="structure" className="flex items-center gap-2">
            <FolderTree className="h-4 w-4" />
            <span className="hidden sm:inline">Structure</span>
          </TabsTrigger>
          <TabsTrigger value="ressources" className="flex items-center gap-2">
            <FileBox className="h-4 w-4" />
            <span className="hidden sm:inline">Ressources</span>
          </TabsTrigger>
          <TabsTrigger value="exercices" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Exercices</span>
          </TabsTrigger>
          <TabsTrigger value="assignations" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Assignations</span>
          </TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="informations">
          <CourseInfoTab course={course} onUpdate={fetchCourse} />
        </TabsContent>

        {/* Onglet Structure (Chapitres) */}
        <TabsContent value="structure">
          <ChaptersManager courseId={courseId} />
        </TabsContent>

        {/* Onglet Ressources */}
        <TabsContent value="ressources">
          <ResourcesManager courseId={courseId} />
        </TabsContent>

        {/* Onglet Exercices */}
        <TabsContent value="exercices">
          <ExercisesManager 
            courseId={courseId} 
            onViewSection={(sectionId) => handleEditSection(sectionId)}
            onEditSection={(sectionId) => handleEditSection(sectionId)}
            onAssignSection={() => {
              handleTabChange('assignations');
            }}
          />
        </TabsContent>

        {/* Onglet Assignations */}
        <TabsContent value="assignations">
          <AssignmentsManager courseId={courseId} />
        </TabsContent>
      </Tabs>

      {/* Quiz Editor Modal */}
      {editingSection && editingSection.type === 'QUIZ' && (
        <QuizEditor
          open={quizEditorOpen}
          onOpenChange={(open) => {
            setQuizEditorOpen(open);
            if (!open) setEditingSection(null);
          }}
          sectionId={editingSection.id}
          sectionTitle={editingSection.title}
          initialContent={editingSection.content ? JSON.parse(editingSection.content) : null}
          onSave={handleSaveContent}
        />
      )}

      {/* Exercise Editor Modal */}
      {editingSection && editingSection.type === 'EXERCISE' && (
        <ExerciseEditor
          open={exerciseEditorOpen}
          onOpenChange={(open) => {
            setExerciseEditorOpen(open);
            if (!open) setEditingSection(null);
          }}
          sectionId={editingSection.id}
          sectionTitle={editingSection.title}
          initialContent={editingSection.content ? JSON.parse(editingSection.content) : null}
          onSave={handleSaveContent}
        />
      )}
    </div>
  );
}

// ============================================
// Composant Onglet Informations
// ============================================

interface CourseInfoTabProps {
  course: CourseData;
  onUpdate: () => void;
}

function CourseInfoTab({ course }: CourseInfoTabProps) {
  return (
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

      {/* Actions rapides */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={`/teacher/courses/${course.id}/edit`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Modifier le contenu
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/teacher/courses/${course.id}?tab=structure`}>
                <FolderTree className="h-4 w-4 mr-2" />
                Gérer les chapitres
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/teacher/courses/${course.id}?tab=assignations`}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Créer une assignation
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fichiers uploadés */}
      {course.files && course.files.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Fichiers du cours ({course.files.length})
            </CardTitle>
            <CardDescription>
              Documents uploadés pour ce cours - disponibles aussi dans l&apos;onglet Ressources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {course.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

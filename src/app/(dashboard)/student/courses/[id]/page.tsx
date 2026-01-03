'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Loader2, 
  ArrowLeft, 
  BookOpen, 
  FolderTree, 
  File, 
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  Video,
  Music,
  Download, 
  ExternalLink, 
  User 
} from 'lucide-react';
import { StudentChaptersViewer } from '@/components/features/student/StudentChaptersViewer';
import { CourseScoreKPIs } from '@/components/shared/CourseScoreKPIs';
import type { CourseScoreData } from '@/types/course-score';
import { Plus, Layers, FileText as NoteIcon, BookOpen as LessonIcon, Video as VideoIcon, Dumbbell as ExerciseIcon, HelpCircle as QuizIcon, ChevronRight } from 'lucide-react';

// Viewers pour les différents types de cartes
import { VideoViewer } from '@/components/features/student/viewers/VideoViewer';
import { QuizViewer } from '@/components/features/student/viewers/QuizViewer';
import { ExerciseViewer } from '@/components/features/student/viewers/ExerciseViewer';

interface CourseFile {
  id: string;
  filename: string;
  url: string;
  fileType: string;
}

// Icône colorée selon le type de fichier
function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />;
    case 'word':
      return <FileText className="h-8 w-8 text-blue-500" />;
    case 'excel':
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    case 'powerpoint':
      return <Presentation className="h-8 w-8 text-orange-500" />;
    case 'image':
      return <Image className="h-8 w-8 text-purple-500" />;
    case 'video':
      return <Video className="h-8 w-8 text-pink-500" />;
    case 'audio':
      return <Music className="h-8 w-8 text-yellow-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
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

// Carte d'un supplément
interface SupplementCard {
  id: string;
  title: string;
  cardType: string;
  content: string | null;
}

// Chapitre d'un supplément
interface SupplementChapter {
  id: string;
  title: string;
  cards: SupplementCard[];
}

// Supplément lié au cours
interface LinkedSupplement {
  id: string;
  title: string;
  description: string | null;
  chapterCount: number;
  cardCount: number;
  chapters: SupplementChapter[];
  updatedAt: string;
}

interface StudentCourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StudentCourseDetailPage({ params }: StudentCourseDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [scores, setScores] = useState<CourseScoreData | null>(null);
  const [supplements, setSupplements] = useState<LinkedSupplement[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal pour visualiser une carte de supplément
  const [selectedCard, setSelectedCard] = useState<SupplementCard | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);

  // Onglet actif depuis URL ou défaut "cours"
  const activeTab = searchParams.get('tab') || 'cours';

  // Résoudre les params async
  useEffect(() => {
    params.then(({ id }) => setCourseId(id));
  }, [params]);

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      // Fetch cours, scores et suppléments en parallèle
      const [courseRes, scoresRes, supplementsRes] = await Promise.all([
        fetch(`/api/student/courses/${courseId}`),
        fetch(`/api/student/courses/${courseId}/scores`),
        fetch(`/api/student/courses/${courseId}/supplements`)
      ]);

      if (!courseRes.ok) {
        if (courseRes.status === 404 || courseRes.status === 403) {
          router.push('/student/courses');
          return;
        }
        throw new Error('Erreur fetch course');
      }

      const courseData = await courseRes.json();
      if (courseData.success && courseData.data) {
        setCourse(courseData.data.course);
      }

      // Scores (optionnel - pas d'erreur si absent)
      if (scoresRes.ok) {
        const scoresData = await scoresRes.json();
        if (scoresData.success && scoresData.data?.score) {
          setScores(scoresData.data.score);
        }
      }

      // Suppléments liés à ce cours
      if (supplementsRes.ok) {
        const supplementsData = await supplementsRes.json();
        if (supplementsData.success && supplementsData.data) {
          setSupplements(supplementsData.data);
        }
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

      {/* Barre de progression + KPIs en un coup d'œil */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Progression */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Ma progression</span>
              <span className="text-sm font-bold text-primary">{course.stats.progressPercent}%</span>
            </div>
            <Progress value={course.stats.progressPercent} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{course.stats.completedChapters} / {course.stats.totalChapters} chapitres terminés</span>
              <span>{totalSections} sections au total</span>
            </div>
          </div>

          {/* KPIs compacts - visible en un coup d'œil */}
          {scores && (
            <>
              <div className="border-t pt-4" />
              <CourseScoreKPIs score={scores} compact={true} />
            </>
          )}
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

          {/* Section Suppléments de l'élève */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-purple-500" />
                    Mes suppléments
                  </CardTitle>
                  <CardDescription>
                    Vos notes et ressources personnelles liées à ce cours
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/student/revisions?linkTo=${courseId}`}>
                    <Plus className="h-4 w-4 mr-1" />
                    Créer
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {supplements.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Layers className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>Aucun supplément lié à ce cours.</p>
                  <p className="text-sm mt-1">
                    Créez des notes personnelles pour enrichir votre apprentissage.
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="space-y-2">
                  {supplements.map((supp, index) => (
                    <AccordionItem
                      key={supp.id}
                      value={supp.id}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Numéro comme les chapitres */}
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm shrink-0">
                            {index + 1}
                          </div>

                          {/* Icône et titre */}
                          <Layers className="h-4 w-4 text-purple-500 shrink-0" />
                          <span className="font-medium text-left flex-1 truncate">{supp.title}</span>

                          {/* Stats */}
                          <Badge variant="outline" className="mr-2 text-xs">
                            {supp.cardCount} carte{supp.cardCount > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="pb-4">
                        {/* Lien vers la page d'édition */}
                        <div className="flex justify-end mb-3">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/student/revisions/${supp.id}`}>
                              Modifier ce supplément →
                            </Link>
                          </Button>
                        </div>

                        {/* Liste des cartes par chapitre */}
                        {supp.chapters.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Aucune carte dans ce supplément.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {supp.chapters.map((chapter) => (
                              <div key={chapter.id} className="space-y-2">
                                {/* Titre du chapitre si plusieurs */}
                                {supp.chapters.length > 1 && (
                                  <h4 className="text-sm font-medium text-muted-foreground pl-2 border-l-2 border-purple-300">
                                    {chapter.title}
                                  </h4>
                                )}
                                {/* Cartes */}
                                <div className="space-y-1 pl-4">
                                  {chapter.cards.map((card) => (
                                    <div
                                      key={card.id}
                                      onClick={() => {
                                        setSelectedCard(card);
                                        setCardModalOpen(true);
                                      }}
                                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-colors cursor-pointer group"
                                    >
                                      {getCardIcon(card.cardType)}
                                      <span className="text-sm flex-1 group-hover:text-primary transition-colors">{card.title}</span>
                                      {getCardTypeBadge(card.cardType)}
                                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal pour visualiser une carte de supplément */}
      <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCard && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {getCardIcon(selectedCard.cardType)}
                  <div className="flex-1">
                    <DialogTitle>{selectedCard.title}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2 mt-1">
                      {getCardTypeBadge(selectedCard.cardType)}
                      <span className="text-xs text-muted-foreground">Supplément personnel</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="mt-4">
                {renderCardContent(selectedCard)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Helpers pour les cartes
// ============================================

// Parse le contenu JSON des cartes (stocké en {"html": "..."} pour NOTE/LESSON)
function parseCardContent(content: string | null): string {
  if (!content) return '';
  try {
    const parsed = JSON.parse(content);
    return parsed.html || content;
  } catch {
    return content;
  }
}

// Rend le contenu approprié selon le type de carte
function renderCardContent(card: SupplementCard) {
  if (!card.content) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Cette carte n&apos;a pas encore de contenu.
      </p>
    );
  }

  switch (card.cardType) {
    case 'NOTE':
    case 'LESSON':
      return (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: parseCardContent(card.content) }}
        />
      );
    
    case 'VIDEO':
      // VideoViewer gère le parsing du JSON vidéo
      return <VideoViewer content={card.content} />;
    
    case 'QUIZ':
      // QuizViewer avec props optionnelles pour les suppléments
      return <QuizViewer content={card.content} sectionId={card.id} />;
    
    case 'EXERCISE':
      // ExerciseViewer avec sectionId/sectionTitle pour les suppléments
      return (
        <ExerciseViewer 
          content={card.content} 
          sectionId={card.id}
          sectionTitle={card.title}
        />
      );
    
    default:
      return (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: parseCardContent(card.content) }}
        />
      );
  }
}

// ============================================
// Helpers pour les icônes de cartes
// ============================================

function getCardIcon(cardType: string) {
  switch (cardType) {
    case 'NOTE':
      return <NoteIcon className="h-4 w-4 text-gray-500" />;
    case 'LESSON':
      return <LessonIcon className="h-4 w-4 text-blue-500" />;
    case 'VIDEO':
      return <VideoIcon className="h-4 w-4 text-red-500" />;
    case 'EXERCISE':
      return <ExerciseIcon className="h-4 w-4 text-orange-500" />;
    case 'QUIZ':
      return <QuizIcon className="h-4 w-4 text-purple-500" />;
    default:
      return <NoteIcon className="h-4 w-4 text-gray-500" />;
  }
}

function getCardTypeBadge(cardType: string) {
  switch (cardType) {
    case 'NOTE':
      return <Badge variant="outline" className="text-xs">Note</Badge>;
    case 'LESSON':
      return <Badge className="bg-blue-100 text-blue-700 text-xs hover:bg-blue-100">Leçon</Badge>;
    case 'VIDEO':
      return <Badge className="bg-red-100 text-red-700 text-xs hover:bg-red-100">Vidéo</Badge>;
    case 'EXERCISE':
      return <Badge className="bg-orange-100 text-orange-700 text-xs hover:bg-orange-100">Exercice</Badge>;
    case 'QUIZ':
      return <Badge className="bg-purple-100 text-purple-700 text-xs hover:bg-purple-100">Quiz</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{cardType}</Badge>;
  }
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
                    <div className="shrink-0">{getFileIcon(file.fileType)}</div>
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

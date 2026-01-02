/**
 * Page client pour l'édition d'une carte de révision étudiant
 * Réutilise les éditeurs inline du système professeur
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, FileText, BookOpen, HelpCircle, PenTool, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Éditeurs inline réutilisés
import { RichEditor } from '@/components/ui/rich-editor';
import { StudentQuizEditor } from './StudentQuizEditor';
import { StudentFilesManager } from './StudentFilesManager';

// Types alignés sur le professeur + NOTE spécifique élève
type CardType = 'NOTE' | 'LESSON' | 'VIDEO' | 'EXERCISE' | 'QUIZ';

interface CardFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
}

interface CardQuiz {
  id: string;
  questions: Record<string, unknown>[];
  aiGenerated: boolean;
}

interface CardData {
  id: string;
  title: string;
  content: string | null;
  cardType: CardType;
  files: CardFile[];
  quiz: CardQuiz | null;
  chapter: {
    id: string;
    title: string;
  };
  supplement: {
    id: string;
    title: string;
    courseId: string | null;
  };
}

interface StudentCardEditorPageProps {
  card: CardData;
}

// Configuration alignée sur le professeur + NOTE spécifique élève
const cardTypeConfig = {
  NOTE: { icon: FileText, label: 'Note', color: 'bg-blue-100 text-blue-700' },
  LESSON: { icon: BookOpen, label: 'Leçon', color: 'bg-green-100 text-green-700' },
  VIDEO: { icon: Video, label: 'Vidéo', color: 'bg-red-100 text-red-700' },
  EXERCISE: { icon: PenTool, label: 'Exercice', color: 'bg-orange-100 text-orange-700' },
  QUIZ: { icon: HelpCircle, label: 'Quiz', color: 'bg-purple-100 text-purple-700' },
};

export function StudentCardEditorPage({ card }: StudentCardEditorPageProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // État du formulaire
  const [title, setTitle] = useState(card.title);
  const [cardType, setCardType] = useState<CardType>(card.cardType);
  const [content, setContent] = useState(card.content || '');
  const [files, setFiles] = useState<CardFile[]>(card.files);
  const [quiz, setQuiz] = useState(card.quiz);

  const config = cardTypeConfig[cardType];
  const Icon = config.icon;

  // Sauvegarde
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/student/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          cardType,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur sauvegarde');
      }

      router.push(`/student/revisions/${card.supplement.id}`);
      router.refresh();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Callback après upload fichier
  const handleFileUploaded = (file: CardFile) => {
    setFiles(prev => [...prev, file]);
  };

  // Callback après suppression fichier
  const handleFileDeleted = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/student/revisions/${card.supplement.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              <h1 className="text-xl font-bold">Éditer la carte</h1>
              <Badge className={config.color}>{config.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {card.supplement.title} › {card.chapter.title}
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </div>

      {/* Formulaire */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la carte"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={cardType} onValueChange={(v) => setCardType(v as CardType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cardTypeConfig).map(([value, cfg]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <cfg.icon className="h-4 w-4" />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu selon le type */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="files">Fichiers ({files.length})</TabsTrigger>
              {cardType === 'QUIZ' && (
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="content">
              {cardType === 'QUIZ' ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Pour les Quiz, utilisez l&apos;onglet &quot;Quiz&quot;</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <RichEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Rédigez vos notes ici..."
                    className="min-h-100"
                  />
                  <p className="text-xs text-muted-foreground">
                    ~{Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 200)} min de lecture
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files">
              <StudentFilesManager
                cardId={card.id}
                files={files}
                onFileUploaded={handleFileUploaded}
                onFileDeleted={handleFileDeleted}
              />
            </TabsContent>

            {cardType === 'QUIZ' && (
              <TabsContent value="quiz">
                <StudentQuizEditor
                  cardId={card.id}
                  quiz={quiz}
                  courseId={card.supplement.courseId}
                  onQuizChange={setQuiz}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

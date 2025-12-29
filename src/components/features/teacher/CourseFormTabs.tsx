'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import { RichEditor } from '@/components/ui/rich-editor';
import { FileUpload } from '@/components/ui/file-upload';
import { UploadedFile } from '@/hooks/teacher/useCourseForm';

// ============== INFO TAB ==============

interface InfoTabProps {
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  subjectId: string;
  setSubjectId: (v: string) => void;
  subjects: { id: string; name: string }[];
  loadingSubjects: boolean;
  objectives: string;
  setObjectives: (v: string) => void;
}

export function CourseFormInfoTab({
  title,
  setTitle,
  description,
  setDescription,
  subjectId,
  setSubjectId,
  subjects,
  loadingSubjects,
  objectives,
  setObjectives,
}: InfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Titre du cours *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Introduction à la photosynthèse"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Matière *</label>
          <Select value={subjectId} onValueChange={setSubjectId}>
            <SelectTrigger>
              <SelectValue placeholder={loadingSubjects ? 'Chargement...' : 'Sélectionner'} />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez brièvement le cours..."
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Objectifs pédagogiques</label>
          <Textarea
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            placeholder="Un objectif par ligne..."
            rows={4}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Entrez un objectif par ligne
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============== CONTENT TAB ==============

interface ContentTabProps {
  content: string;
  setContent: (v: string) => void;
  aiInstructions: string;
  setAiInstructions: (v: string) => void;
  generating: boolean;
  handleGenerateWithAI: () => void;
  title: string;
}

export function CourseFormContentTab({
  content,
  setContent,
  aiInstructions,
  setAiInstructions,
  generating,
  handleGenerateWithAI,
  title,
}: ContentTabProps) {
  return (
    <div className="space-y-4">
      {/* AI Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Assistant IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="Instructions pour l'IA (ex: focus sur les exemples pratiques, niveau lycée...)"
            rows={2}
          />
          <Button onClick={handleGenerateWithAI} disabled={generating || !title.trim()}>
            <Sparkles className="mr-2 h-4 w-4" />
            {generating ? 'Génération en cours...' : 'Générer avec IA'}
          </Button>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Contenu du cours</CardTitle>
        </CardHeader>
        <CardContent>
          <RichEditor content={content} onChange={setContent} />
        </CardContent>
      </Card>
    </div>
  );
}

// ============== FILES TAB ==============

interface FilesTabProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export function CourseFormFilesTab({ files, onFilesChange }: FilesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fichiers et ressources</CardTitle>
      </CardHeader>
      <CardContent>
        <FileUpload files={files} onFilesChange={onFilesChange} />
      </CardContent>
    </Card>
  );
}

// ============== SETTINGS TAB ==============

interface SettingsTabProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  setDifficulty: (v: 'EASY' | 'MEDIUM' | 'HARD') => void;
  duration: string;
  setDuration: (v: string) => void;
  tags: string;
  setTags: (v: string) => void;
}

export function CourseFormSettingsTab({
  difficulty,
  setDifficulty,
  duration,
  setDuration,
  tags,
  setTags,
}: SettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres du cours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Niveau de difficulté</label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EASY">Facile</SelectItem>
              <SelectItem value="MEDIUM">Intermédiaire</SelectItem>
              <SelectItem value="HARD">Avancé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Durée estimée (minutes)</label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Ex: 45"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tags</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ex: biologie, photosynthèse, végétaux"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Séparez les tags par des virgules
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============== PREVIEW TAB ==============

interface PreviewTabProps {
  title: string;
  description: string;
  content: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: string;
  subjectName?: string;
}

const difficultyLabels: Record<string, string> = {
  EASY: 'Facile',
  MEDIUM: 'Intermédiaire',
  HARD: 'Avancé',
};

const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
};

export function CourseFormPreviewTab({
  title,
  description,
  content,
  difficulty,
  duration,
  subjectName,
}: PreviewTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{title || 'Sans titre'}</CardTitle>
            {subjectName && (
              <p className="mt-1 text-sm text-muted-foreground">{subjectName}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={difficultyColors[difficulty]}>
              {difficultyLabels[difficulty]}
            </Badge>
            {duration && <Badge variant="outline">{duration} min</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="mb-4 text-muted-foreground">{description}</p>
        )}
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: content || '<p>Aucun contenu</p>' }}
        />
      </CardContent>
    </Card>
  );
}

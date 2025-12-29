'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Info,
  FileText,
  Settings,
  Upload,
} from 'lucide-react';
import {
  useCourseForm,
  CourseFormInitialData,
} from '@/hooks/teacher/useCourseForm';
import {
  CourseFormInfoTab,
  CourseFormContentTab,
  CourseFormFilesTab,
  CourseFormSettingsTab,
  CourseFormPreviewTab,
} from './CourseFormTabs';

interface CourseFormProps {
  initialData?: CourseFormInitialData;
}

export function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');

  const {
    isEditMode,
    subjects,
    loadingSubjects,
    title,
    setTitle,
    description,
    setDescription,
    subjectId,
    setSubjectId,
    content,
    setContent,
    difficulty,
    setDifficulty,
    duration,
    setDuration,
    objectives,
    setObjectives,
    tags,
    setTags,
    files,
    handleFilesChange,
    aiInstructions,
    setAiInstructions,
    generating,
    handleGenerateWithAI,
    saving,
    deleting,
    handleSave,
    handleDelete,
    getSubjectName,
  } = useCourseForm({
    initialData,
    onSuccess: () => router.push('/teacher/courses'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/teacher/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditMode ? 'Modifier le cours' : 'Nouveau cours'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode
                ? 'Modifiez les informations du cours'
                : 'Créez un nouveau cours pour vos élèves'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          )}
          <Button variant="outline" disabled={saving} onClick={() => handleSave(true)}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Enregistrement...' : 'Brouillon'}
          </Button>
          <Button disabled={saving} onClick={() => handleSave(false)}>
            {saving ? 'Publication...' : 'Publier'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">
            <Info className="mr-2 h-4 w-4" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="mr-2 h-4 w-4" />
            Contenu
          </TabsTrigger>
          <TabsTrigger value="files">
            <Upload className="mr-2 h-4 w-4" />
            Fichiers
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        {/* Tab: Info */}
        <TabsContent value="info">
          <CourseFormInfoTab
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            subjectId={subjectId}
            setSubjectId={setSubjectId}
            subjects={subjects}
            loadingSubjects={loadingSubjects}
            objectives={objectives}
            setObjectives={setObjectives}
          />
        </TabsContent>

        {/* Tab: Content */}
        <TabsContent value="content">
          <CourseFormContentTab
            content={content}
            setContent={setContent}
            aiInstructions={aiInstructions}
            setAiInstructions={setAiInstructions}
            generating={generating}
            handleGenerateWithAI={handleGenerateWithAI}
            title={title}
          />
        </TabsContent>

        {/* Tab: Files */}
        <TabsContent value="files">
          <CourseFormFilesTab files={files} onFilesChange={handleFilesChange} />
        </TabsContent>

        {/* Tab: Settings */}
        <TabsContent value="settings">
          <CourseFormSettingsTab
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            duration={duration}
            setDuration={setDuration}
            tags={tags}
            setTags={setTags}
          />
        </TabsContent>

        {/* Tab: Preview */}
        <TabsContent value="preview">
          <CourseFormPreviewTab
            title={title}
            description={description}
            content={content}
            difficulty={difficulty}
            duration={duration}
            subjectName={getSubjectName(subjectId)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// NewConversationDialog - Refactorisé
// 557 lignes → ~180 lignes (sous-composants extraits)

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, School } from 'lucide-react';
import { toast } from 'sonner';

import {
  ConversationType,
  useClasses,
  useStudents,
  useCourses,
  TypeSelector,
  StudentList,
  ContextSection,
} from './new-conversation';

interface NewConversationDialogProps {
  onConversationCreated?: () => void;
}

export function NewConversationDialog({ onConversationCreated }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ConversationType>('individual');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [topicName, setTopicName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { classes, loading: loadingClasses } = useClasses(open);
  const { students, loading: loadingStudents } = useStudents(selectedClass);
  const { courses, loading: loadingCourses } = useCourses(open);

  // Reset students selection when type changes
  useEffect(() => {
    setSelectedStudents([]);
  }, [type]);

  function handleStudentToggle(userId: string) {
    if (type === 'individual') {
      setSelectedStudents([userId]);
    } else {
      setSelectedStudents((prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId)
          : [...prev, userId]
      );
    }
  }

  async function handleSubmit() {
    if (!message.trim()) {
      toast.error('Le message est requis');
      return;
    }

    const recipientIds = type === 'class' 
      ? students.map((s) => s.userId) 
      : selectedStudents;

    if (recipientIds.length === 0) {
      toast.error('Sélectionnez au moins un destinataire');
      return;
    }

    setSubmitting(true);
    try {
      const classData = classes.find((c) => c.id === selectedClass);
      const courseData = courses.find((c) => c.id === selectedCourse);
      
      let finalTopicName = topicName;
      if (!finalTopicName) {
        if (type === 'class') finalTopicName = `Classe ${classData?.name || ''}`;
        else if (type === 'group') finalTopicName = `Groupe - ${selectedStudents.length} élèves`;
      }
      if (courseData) {
        finalTopicName = finalTopicName 
          ? `${finalTopicName} - ${courseData.title}`
          : courseData.title;
      }

      const res = await fetch('/api/teacher/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: recipientIds[0],
          content: message,
          topicName: finalTopicName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur envoi message');
      }

      toast.success(
        type === 'individual'
          ? 'Message envoyé'
          : `Message envoyé à ${recipientIds.length} destinataire(s)`
      );

      setOpen(false);
      resetForm();
      onConversationCreated?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur envoi message');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setType('individual');
    setSelectedClass('');
    setSelectedCourse('');
    setSelectedStudents([]);
    setMessage('');
    setTopicName('');
  }

  const canSubmit = message.trim() && 
    selectedClass && 
    (type === 'class' || selectedStudents.length > 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
          <DialogDescription>
            Envoyez un message à un élève, un groupe ou une classe entière.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4">
          <TypeSelector value={type} onChange={setType} />

          {/* Sélection de la classe */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <School className="h-4 w-4" />
              Classe <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une classe" />
              </SelectTrigger>
              <SelectContent>
                {loadingClasses ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : classes.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Aucune classe assignée
                  </div>
                ) : (
                  classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {cls.level} ({cls.studentsCount} élèves)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Liste des élèves */}
          {type !== 'class' && selectedClass && (
            <StudentList
              type={type}
              students={students}
              selectedStudents={selectedStudents}
              loading={loadingStudents}
              onToggle={handleStudentToggle}
              onSelectAll={() => setSelectedStudents(students.map((s) => s.userId))}
              onDeselectAll={() => setSelectedStudents([])}
            />
          )}

          {/* Info classe entière */}
          {type === 'class' && selectedClass && (
            <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <School className="h-5 w-5" />
                <span className="font-medium">Message à toute la classe</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                {loadingStudents ? 'Chargement...' : `${students.length} élève${students.length > 1 ? 's' : ''} recevront ce message`}
              </p>
            </div>
          )}

          <ContextSection
            courses={courses}
            loadingCourses={loadingCourses}
            selectedCourse={selectedCourse}
            topicName={topicName}
            onCourseChange={setSelectedCourse}
            onTopicChange={setTopicName}
          />

          {/* Message */}
          <div className="space-y-2">
            <Label>Message <span className="text-red-500">*</span></Label>
            <Textarea
              placeholder="Écrivez votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Envoyer
            {type !== 'individual' && selectedClass && !submitting && (
              <span className="ml-1">
                ({type === 'class' ? students.length : selectedStudents.length})
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

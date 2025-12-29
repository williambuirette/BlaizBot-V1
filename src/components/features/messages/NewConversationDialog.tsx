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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Loader2, Users, User, School, BookOpen, Tag } from 'lucide-react';
import { toast } from 'sonner';

type ConversationType = 'individual' | 'group' | 'class';

interface ClassOption {
  id: string;
  name: string;
  level: string;
  studentsCount: number;
}

interface StudentOption {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface CourseOption {
  id: string;
  title: string;
}

interface NewConversationDialogProps {
  onConversationCreated?: () => void;
}

function getCurrentSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 8) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export function NewConversationDialog({ onConversationCreated }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ConversationType>('individual');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [topicName, setTopicName] = useState('');

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchClasses();
      fetchCourses();
    }
  }, [open]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    } else {
      setStudents([]);
      setSelectedStudents([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    setSelectedStudents([]);
  }, [type]);

  async function fetchClasses() {
    setLoadingClasses(true);
    try {
      const res = await fetch('/api/teacher/classes');
      if (!res.ok) throw new Error('Erreur chargement classes');
      const data = await res.json();
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des classes');
    } finally {
      setLoadingClasses(false);
    }
  }

  async function fetchStudents(classId: string) {
    setLoadingStudents(true);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/students`);
      if (!res.ok) throw new Error('Erreur chargement élèves');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des élèves');
    } finally {
      setLoadingStudents(false);
    }
  }

  async function fetchCourses() {
    setLoadingCourses(true);
    try {
      const res = await fetch('/api/teacher/courses');
      if (!res.ok) throw new Error('Erreur chargement cours');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingCourses(false);
    }
  }

  function handleStudentToggle(userId: string) {
    if (type === 'individual') {
      setSelectedStudents([userId]);
    } else {
      setSelectedStudents((prev) =>
        prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
      );
    }
  }

  function selectAllStudents() {
    setSelectedStudents(students.map((s) => s.userId));
  }

  function deselectAllStudents() {
    setSelectedStudents([]);
  }

  async function handleSubmit() {
    if (!message.trim()) {
      toast.error('Le message est requis');
      return;
    }

    let recipientIds: string[] = [];
    if (type === 'class') {
      recipientIds = students.map((s) => s.userId);
    } else {
      recipientIds = selectedStudents;
    }

    if (recipientIds.length === 0) {
      toast.error('Sélectionnez au moins un destinataire');
      return;
    }

    setSubmitting(true);
    try {
      const classData = classes.find((c) => c.id === selectedClass);
      const courseData = courses.find((c) => c.id === selectedCourse);
      const firstRecipient = recipientIds[0];

      let finalTopicName = topicName;
      if (!finalTopicName) {
        if (type === 'class') {
          finalTopicName = `Classe ${classData?.name || ''}`;
        } else if (type === 'group') {
          finalTopicName = `Groupe - ${selectedStudents.length} élèves`;
        }
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
          receiverId: firstRecipient,
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
      console.error('Erreur:', error);
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
          {/* Type de conversation - Cartes visuelles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type de message</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as ConversationType)}
              className="grid grid-cols-3 gap-3"
            >
              <Label
                htmlFor="individual"
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  type === 'individual' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="individual" id="individual" className="sr-only" />
                <User className={`h-8 w-8 ${type === 'individual' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${type === 'individual' ? 'text-primary' : ''}`}>
                  Un élève
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  Message privé
                </span>
              </Label>
              <Label
                htmlFor="group"
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  type === 'group' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="group" id="group" className="sr-only" />
                <Users className={`h-8 w-8 ${type === 'group' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${type === 'group' ? 'text-primary' : ''}`}>
                  Plusieurs élèves
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  Groupe personnalisé
                </span>
              </Label>
              <Label
                htmlFor="class"
                className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  type === 'class' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-muted-foreground/50'
                }`}
              >
                <RadioGroupItem value="class" id="class" className="sr-only" />
                <School className={`h-8 w-8 ${type === 'class' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`font-medium ${type === 'class' ? 'text-primary' : ''}`}>
                  Classe entière
                </span>
                <span className="text-xs text-muted-foreground text-center">
                  Tous les élèves
                </span>
              </Label>
            </RadioGroup>
          </div>

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

          {/* Sélection des élèves (sauf type 'class') */}
          {type !== 'class' && selectedClass && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {type === 'individual' ? 'Élève' : 'Élèves'} 
                  <span className="text-red-500">*</span>
                  {type === 'group' && selectedStudents.length > 0 && (
                    <span className="text-muted-foreground text-sm">
                      ({selectedStudents.length} sélectionné{selectedStudents.length > 1 ? 's' : ''})
                    </span>
                  )}
                </Label>
                {type === 'group' && students.length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={selectAllStudents}
                      disabled={selectedStudents.length === students.length}
                    >
                      Tout sélectionner
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm" 
                      onClick={deselectAllStudents}
                      disabled={selectedStudents.length === 0}
                    >
                      Désélectionner
                    </Button>
                  </div>
                )}
              </div>
              <ScrollArea className="h-40 border rounded-md">
                {loadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : students.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Aucun élève dans cette classe
                  </p>
                ) : (
                  <div className="p-2 space-y-1">
                    {students.map((student) => {
                      const isSelected = selectedStudents.includes(student.userId);
                      return (
                        <div
                          key={student.id}
                          className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                          }`}
                          onClick={() => handleStudentToggle(student.userId)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleStudentToggle(student.userId)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {student.lastName} {student.firstName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Info si type 'class' */}
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

          {/* Section Contexte (Cours + Thématique) */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Contexte (optionnel)
            </h4>
            
            {/* Cours lié */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4" />
                Lié au cours
              </Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucun cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun cours</SelectItem>
                  {loadingCourses ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Thématique */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4" />
                Thématique / Sujet
              </Label>
              <Input
                placeholder="Ex: Rappel devoirs, Questions sur le cours, Sortie scolaire..."
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Aide à organiser vos conversations par thème
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Message <span className="text-red-500">*</span>
            </Label>
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

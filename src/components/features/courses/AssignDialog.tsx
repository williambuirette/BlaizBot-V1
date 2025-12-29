// src/components/features/courses/AssignDialog.tsx
// Dialog wizard pour créer une nouvelle assignation

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  Users,
  User,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Plus,
  X,
  UserPlus,
} from 'lucide-react';

// Types
type ContentType = 'course' | 'chapter' | 'section';
type TargetType = 'CLASS' | 'TEAM' | 'STUDENT';

interface Chapter {
  id: string;
  title: string;
  sections: { id: string; title: string; type: string }[];
}

interface ClassData {
  id: string;
  name: string;
  teams?: { id: string; name: string }[];
  students?: { id: string; firstName: string; lastName: string }[];
}

interface StudentSelection {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
  className: string;
}

interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onSuccess: () => void;
}

export function AssignDialog({
  open,
  onOpenChange,
  courseId,
  onSuccess,
}: AssignDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: What to assign
  const [contentType, setContentType] = useState<ContentType>('course');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Step 2: Who to assign to
  const [targetType, setTargetType] = useState<TargetType>('CLASS');
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]); // Multiple classes
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [loadingStudents, setLoadingStudents] = useState<Record<string, boolean>>({});
  
  // Pour la sélection multiple d'élèves (équipe ad-hoc)
  const [selectedStudents, setSelectedStudents] = useState<StudentSelection[]>([]);
  const [teamName, setTeamName] = useState('');

  // Step 3: Details
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep(1);
      setContentType('course');
      setSelectedChapterId('');
      setSelectedSectionId('');
      setTargetType('CLASS');
      setSelectedClassIds([]);
      setSelectedClassId('');
      setSelectedTeamId('');
      setSelectedStudentId('');
      setSelectedStudents([]);
      setTeamName('');
      setTitle('');
      setInstructions('');
      setDueDate('');
    }
  }, [open]);

  // Fetch chapters
  useEffect(() => {
    if (open) {
      fetch(`/api/teacher/courses/${courseId}/chapters`)
        .then((res) => res.json())
        .then(setChapters)
        .catch(console.error);
    }
  }, [open, courseId]);

  // Fetch classes when on step 2
  useEffect(() => {
    if (open && step === 2 && classes.length === 0) {
      setLoading(true);
      fetch('/api/teacher/classes')
        .then((res) => res.json())
        .then((data) => setClasses(data.classes || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, step, classes.length]);

  // Fetch teams/students when class selected
  useEffect(() => {
    // Pour TEAM, charger les élèves de toutes les classes sélectionnées
    if (targetType === 'TEAM' && selectedClassIds.length > 0) {
      selectedClassIds.forEach(async (classId) => {
        const cls = classes.find(c => c.id === classId);
        if (cls?.students) return; // Déjà chargé
        
        setLoadingStudents(prev => ({ ...prev, [classId]: true }));
        try {
          const res = await fetch(`/api/teacher/classes/${classId}/students`);
          const data = await res.json();
          const students = Array.isArray(data) ? data : data.students || [];
          setClasses((prev) =>
            prev.map((c) =>
              c.id === classId ? { ...c, students } : c
            )
          );
        } catch (error) {
          console.error(error);
        }
        setLoadingStudents(prev => ({ ...prev, [classId]: false }));
      });
    }
    
    // Pour STUDENT, charger les élèves de la classe sélectionnée
    if (targetType === 'STUDENT' && selectedClassId) {
      const cls = classes.find(c => c.id === selectedClassId);
      if (cls?.students) return;
      
      setLoading(true);
      fetch(`/api/teacher/classes/${selectedClassId}/students`)
        .then(res => res.json())
        .then(data => {
          const students = Array.isArray(data) ? data : data.students || [];
          setClasses((prev) =>
            prev.map((c) =>
              c.id === selectedClassId ? { ...c, students } : c
            )
          );
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedClassIds, selectedClassId, targetType, classes]);

  // Toggle student selection pour équipe ad-hoc
  const toggleStudentSelection = (student: { id: string; firstName: string; lastName: string }) => {
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (!selectedClass) return;
    
    setSelectedStudents(prev => {
      const exists = prev.find(s => s.id === student.id);
      if (exists) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, {
          ...student,
          classId: selectedClassId,
          className: selectedClass.name
        }];
      }
    });
  };

  // Supprimer un élève de la sélection
  const removeStudent = (studentId: string) => {
    setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
  };

  // Sélectionner/désélectionner tous les élèves d'une classe
  const toggleAllStudents = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls?.students) return;
    
    const allSelected = cls.students.every(s => 
      selectedStudents.some(sel => sel.id === s.id)
    );
    
    if (allSelected) {
      // Désélectionner tous
      setSelectedStudents(prev => 
        prev.filter(s => s.classId !== classId)
      );
    } else {
      // Sélectionner tous
      const newStudents = cls.students
        .filter(s => !selectedStudents.some(sel => sel.id === s.id))
        .map(s => ({
          ...s,
          classId,
          className: cls.name
        }));
      setSelectedStudents(prev => [...prev, ...newStudents]);
    }
  };

  // Auto-generate title
  useEffect(() => {
    if (step === 3 && !title) {
      let autoTitle = '';
      if (contentType === 'course') {
        autoTitle = 'Assignation du cours';
      } else if (contentType === 'chapter') {
        const chapter = chapters.find((c) => c.id === selectedChapterId);
        autoTitle = chapter ? `Chapitre : ${chapter.title}` : 'Assignation chapitre';
      } else if (contentType === 'section') {
        const chapter = chapters.find((c) => c.id === selectedChapterId);
        const section = chapter?.sections.find((s) => s.id === selectedSectionId);
        autoTitle = section ? `Section : ${section.title}` : 'Assignation section';
      }
      setTitle(autoTitle);
    }
  }, [step, contentType, selectedChapterId, selectedSectionId, chapters, title]);

  // Validation
  const canProceedStep1 = () => {
    if (contentType === 'course') return true;
    if (contentType === 'chapter') return !!selectedChapterId;
    if (contentType === 'section') return !!selectedChapterId && !!selectedSectionId;
    return false;
  };

  const canProceedStep2 = () => {
    if (targetType === 'CLASS') return selectedClassIds.length >= 1;
    if (targetType === 'TEAM') return selectedStudents.length >= 1;
    if (targetType === 'STUDENT') return !!selectedClassId && !!selectedStudentId;
    return false;
  };

  const canProceedStep3 = () => {
    return !!title.trim();
  };

  // Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        instructions: instructions.trim() || undefined,
        dueDate: dueDate || undefined,
        targetType,
      };

      // What
      if (contentType === 'course') {
        body.courseId = courseId;
      } else if (contentType === 'chapter') {
        body.chapterId = selectedChapterId;
      } else {
        body.sectionId = selectedSectionId;
      }

      // Who
      if (targetType === 'CLASS') {
        body.classIds = selectedClassIds; // Multiple classes
      } else if (targetType === 'TEAM') {
        // Envoyer la liste des IDs d'élèves sélectionnés
        body.studentIds = selectedStudents.map(s => s.id);
      } else {
        body.studentId = selectedStudentId;
      }

      const res = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur création assignation:', error);
    }
    setSubmitting(false);
  };

  // Get selected class data
  const selectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Nouvelle assignation</DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s === step
                    ? 'bg-primary text-primary-foreground'
                    : s < step
                    ? 'bg-green-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-1 mx-1 ${
                    s < step ? 'bg-green-600' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[350px] flex-1 overflow-auto">
          {/* Step 1: What to assign */}
          {step === 1 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Quoi assigner ?</Label>
              <RadioGroup value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="course" id="course" />
                  <Label htmlFor="course" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Tout le cours
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Assigner l&apos;intégralité du cours
                    </p>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="chapter" id="chapter" />
                  <Label htmlFor="chapter" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Un chapitre
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Assigner un chapitre spécifique
                    </p>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="section" id="section" />
                  <Label htmlFor="section" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Une section
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Assigner une section spécifique (exercice, quiz...)
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              {/* Chapter select */}
              {(contentType === 'chapter' || contentType === 'section') && (
                <div className="space-y-2 pt-2">
                  <Label>Chapitre</Label>
                  <Select value={selectedChapterId} onValueChange={setSelectedChapterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un chapitre" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters.map((chapter) => (
                        <SelectItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Section select */}
              {contentType === 'section' && selectedChapterId && (
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une section" />
                    </SelectTrigger>
                    <SelectContent>
                      {chapters
                        .find((c) => c.id === selectedChapterId)
                        ?.sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {section.type}
                              </Badge>
                              {section.title}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Who to assign to */}
          {step === 2 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">À qui assigner ?</Label>
              <RadioGroup value={targetType} onValueChange={(v) => {
                setTargetType(v as TargetType);
                setSelectedClassIds([]);
                setSelectedStudents([]);
              }}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="CLASS" id="class" />
                  <Label htmlFor="class" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Une ou plusieurs classes entières
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="TEAM" id="team" />
                  <Label htmlFor="team" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Sélection d&apos;élèves (équipe)
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="STUDENT" id="student" />
                  <Label htmlFor="student" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Un élève unique
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* CLASS - Sélection multiple de classes */}
              {targetType === 'CLASS' && (
                <div className="space-y-3 pt-2">
                  <Label>Sélectionner les classes</Label>
                  <ScrollArea className="h-40 border rounded-lg">
                    <div className="p-2 space-y-1">
                      {classes.map((cls) => {
                        const isSelected = selectedClassIds.includes(cls.id);
                        return (
                          <div
                            key={cls.id}
                            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                              isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              setSelectedClassIds(prev =>
                                isSelected
                                  ? prev.filter(id => id !== cls.id)
                                  : [...prev, cls.id]
                              );
                            }}
                          >
                            <Checkbox checked={isSelected} />
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{cls.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  {selectedClassIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedClassIds.length} classe(s) sélectionnée(s)
                    </p>
                  )}
                </div>
              )}

              {/* TEAM - Sélection de classes puis élèves */}
              {targetType === 'TEAM' && (
                <div className="space-y-3 pt-2">
                  {/* Élèves déjà sélectionnés */}
                  {selectedStudents.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">
                        Élèves sélectionnés ({selectedStudents.length})
                      </Label>
                      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/30 max-h-20 overflow-auto">
                        {selectedStudents.map((student) => (
                          <Badge
                            key={student.id}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            {student.firstName} {student.lastName}
                            <span className="text-xs text-muted-foreground ml-1">({student.className})</span>
                            <button
                              type="button"
                              onClick={() => removeStudent(student.id)}
                              className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sélection des classes */}
                  <div className="space-y-2">
                    <Label>Ajouter des élèves depuis une classe</Label>
                    <div className="flex flex-wrap gap-2">
                      {classes.map((cls) => {
                        const isExpanded = selectedClassIds.includes(cls.id);
                        return (
                          <Button
                            key={cls.id}
                            type="button"
                            variant={isExpanded ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (isExpanded) {
                                setSelectedClassIds(prev => prev.filter(id => id !== cls.id));
                              } else {
                                setSelectedClassIds(prev => [...prev, cls.id]);
                              }
                            }}
                          >
                            {cls.name}
                            {isExpanded && <X className="h-3 w-3 ml-1" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Liste des élèves par classe sélectionnée */}
                  {selectedClassIds.length > 0 && (
                    <ScrollArea className="h-48 border rounded-lg">
                      <div className="p-2 space-y-4">
                        {selectedClassIds.map((classId) => {
                          const cls = classes.find(c => c.id === classId);
                          if (!cls) return null;
                          const isLoading = loadingStudents[classId];
                          
                          return (
                            <div key={classId} className="space-y-2">
                              <div className="flex items-center justify-between sticky top-0 bg-background py-1">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  {cls.name}
                                </Label>
                                {cls.students && cls.students.length > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleAllStudents(classId)}
                                    className="h-6 text-xs"
                                  >
                                    {cls.students.every(s => 
                                      selectedStudents.some(sel => sel.id === s.id)
                                    ) ? 'Aucun' : 'Tous'}
                                  </Button>
                                )}
                              </div>
                              
                              {isLoading ? (
                                <div className="flex items-center gap-2 text-muted-foreground p-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Chargement...
                                </div>
                              ) : cls.students && cls.students.length > 0 ? (
                                <div className="space-y-1 pl-2">
                                  {cls.students.map((student) => {
                                    const isSelected = selectedStudents.some(s => s.id === student.id);
                                    return (
                                      <div
                                        key={student.id}
                                        className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer transition-colors ${
                                          isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                                        }`}
                                        onClick={() => {
                                          if (isSelected) {
                                            removeStudent(student.id);
                                          } else {
                                            setSelectedStudents(prev => [...prev, {
                                              ...student,
                                              classId,
                                              className: cls.name
                                            }]);
                                          }
                                        }}
                                      >
                                        <Checkbox checked={isSelected} />
                                        <span className="text-sm">
                                          {student.firstName} {student.lastName}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground pl-2">
                                  Aucun élève
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              )}

              {/* STUDENT - Un seul élève */}
              {targetType === 'STUDENT' && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label>Classe</Label>
                    <Select value={selectedClassId} onValueChange={(v) => {
                      setSelectedClassId(v);
                      setSelectedStudentId('');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedClassId && (
                    <div className="space-y-2">
                      <Label>Élève</Label>
                      {loading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Chargement...
                        </div>
                      ) : (
                        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un élève" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedClass?.students?.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.firstName} {student.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Détails</Label>

              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l'assignation"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions pour les élèves..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Date limite</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Récapitulatif</Label>

              <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contenu :</span>
                  <span className="font-medium">
                    {contentType === 'course' && 'Tout le cours'}
                    {contentType === 'chapter' &&
                      chapters.find((c) => c.id === selectedChapterId)?.title}
                    {contentType === 'section' &&
                      chapters
                        .find((c) => c.id === selectedChapterId)
                        ?.sections.find((s) => s.id === selectedSectionId)?.title}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cible :</span>
                  <span className="font-medium text-right">
                    {targetType === 'CLASS' && (
                      <span className="flex flex-col items-end">
                        <span>{selectedClassIds.length} classe(s)</span>
                        <span className="text-xs text-muted-foreground">
                          {selectedClassIds.map(id => classes.find(c => c.id === id)?.name).join(', ')}
                        </span>
                      </span>
                    )}
                    {targetType === 'TEAM' && (
                      <span className="flex flex-col items-end">
                        <span>{selectedStudents.length} élève(s)</span>
                        {selectedStudents.length <= 3 ? (
                          <span className="text-xs text-muted-foreground">
                            {selectedStudents.map(s => `${s.firstName} ${s.lastName}`).join(', ')}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {selectedStudents.slice(0, 2).map(s => `${s.firstName}`).join(', ')} et {selectedStudents.length - 2} autres
                          </span>
                        )}
                      </span>
                    )}
                    {targetType === 'STUDENT' &&
                      (() => {
                        const student = selectedClass?.students?.find(
                          (s) => s.id === selectedStudentId
                        );
                        return student
                          ? `${student.firstName} ${student.lastName}`
                          : '';
                      })()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titre :</span>
                  <span className="font-medium">{title}</span>
                </div>

                {dueDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date limite :</span>
                    <span className="font-medium">
                      {new Date(dueDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !canProceedStep1()) ||
                (step === 2 && !canProceedStep2()) ||
                (step === 3 && !canProceedStep3())
              }
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Assigner
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

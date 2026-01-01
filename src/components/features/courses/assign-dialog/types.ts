// src/components/features/courses/assign-dialog/types.ts
// Types partagés pour AssignDialog

export type ContentType = 'course' | 'chapter' | 'section';
export type TargetType = 'CLASS' | 'TEAM' | 'STUDENT';

export interface Chapter {
  id: string;
  title: string;
  sections: { id: string; title: string; type: string }[];
}

export interface ClassData {
  id: string;
  name: string;
  teams?: { id: string; name: string }[];
  students?: StudentData[];
}

export interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
}

export interface StudentSelection extends StudentData {
  classId: string;
  className: string;
}

export interface AssignDialogState {
  step: number;
  loading: boolean;
  submitting: boolean;
  
  // Step 1: What to assign
  contentType: ContentType;
  chapters: Chapter[];
  selectedChapterId: string;
  selectedSectionId: string;
  
  // Step 2: Who to assign to
  targetType: TargetType;
  classes: ClassData[];
  selectedClassIds: string[];
  selectedClassId: string;
  selectedTeamId: string;
  selectedStudentId: string;
  loadingStudents: Record<string, boolean>;
  selectedStudents: StudentSelection[];
  teamName: string;
  
  // Step 3: Details
  title: string;
  instructions: string;
  dueDate: string;
}

export interface AssignDialogActions {
  setStep: (step: number) => void;
  setContentType: (type: ContentType) => void;
  setSelectedChapterId: (id: string) => void;
  setSelectedSectionId: (id: string) => void;
  setTargetType: (type: TargetType) => void;
  setSelectedClassIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedClassId: (id: string) => void;
  setSelectedStudentId: (id: string) => void;
  setSelectedStudents: React.Dispatch<React.SetStateAction<StudentSelection[]>>;
  setTitle: (title: string) => void;
  setInstructions: (instructions: string) => void;
  setDueDate: (date: string) => void;
  toggleStudentSelection: (student: StudentData) => void;
  removeStudent: (studentId: string) => void;
  toggleAllStudents: (classId: string) => void;
  canProceedStep1: () => boolean;
  canProceedStep2: () => boolean;
  canProceedStep3: () => boolean;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export interface AssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onSuccess: () => void;
}

// Types et constantes pour AssignmentCard

// Types
export interface AssignmentCardData {
  id: string;
  title: string;
  instructions: string | null;
  targetType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  startDate: string | null;
  dueDate: string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  courseId?: string | null;
  Course: { id: string; title: string };
  Chapter?: { id: string; title: string } | null;
  Section?: { id: string; title: string } | null;
  Class?: { id: string; name: string; color?: string } | null;
  Team?: { id: string; name: string } | null;
  User_CourseAssignment_studentIdToUser?: { 
    id: string; 
    firstName: string; 
    lastName: string 
  } | null;
  StudentProgress?: Array<{
    id: string;
    studentId: string;
    status: string;
    User?: { id: string; firstName: string; lastName: string };
  }>;
  // KPI scores de l'élève
  kpi?: {
    continuous: number;
    ai: number;
    exam: number | null;
    final: number | null;
  } | null;
  stats?: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    completionRate: number;
  };
}

export interface AssignmentCardProps {
  assignment: AssignmentCardData;
  studentId?: string;
  onEdit?: (assignment: AssignmentCardData) => void;
  onDelete?: (assignmentId: string) => Promise<void>;
  onExamGradeUpdated?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

// Constantes
export const PRIORITY_CONFIG = {
  HIGH: { label: 'Haute', color: 'bg-red-100 text-red-700 border-red-200' },
  MEDIUM: { label: 'Moyenne', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  LOW: { label: 'Basse', color: 'bg-green-100 text-green-700 border-green-200' },
} as const;

export const TARGET_TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  CLASS: { label: 'Classe', icon: '👥' },
  TEAM: { label: 'Équipe', icon: '👤' },
  STUDENT: { label: 'Élève', icon: '🎓' },
};

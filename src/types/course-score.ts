/**
 * Types partagés pour les scores de cours
 * Utilisés par l'interface élève ET professeur
 */

/**
 * Données de score d'un élève sur un cours
 * Source: modèle Prisma StudentScore
 */
export interface CourseScoreData {
  // Moyennes par type d'activité (en %)
  quizAvg: number;
  exerciseAvg: number;
  aiComprehension: number;
  
  // Score continu calculé (en %)
  continuousScore: number;
  
  // Compteurs d'activités réalisées
  quizCount: number;
  exerciseCount: number;
  aiSessionCount: number;
  
  // Notes finales (optionnelles, saisies par le prof)
  examGrade: number | null; // Note /6
  examDate: string | null;
  examComment: string | null;
  finalGrade: number | null; // Note finale /6
}

/**
 * Score par section (quiz/exercice individuel)
 */
export interface SectionScoreData {
  sectionId: string;
  sectionTitle: string;
  sectionType: 'QUIZ' | 'EXERCISE' | 'LESSON' | 'VIDEO';
  score: number | null; // % si complété, null sinon
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt: string | null;
  timeSpent: number | null; // en secondes
}

/**
 * Activité IA (chat avec évaluation)
 */
export interface AIActivityData {
  id: string;
  activityType: string;
  themeId: string | null;
  comprehensionScore: number;
  accuracyScore: number;
  autonomyScore: number;
  finalScore: number;
  duration: number;
  messageCount: number;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string | null;
  createdAt: string;
}

/**
 * Réponse API complète pour les scores d'un cours
 */
export interface CourseScoresResponse {
  courseId: string;
  studentId: string;
  score: CourseScoreData | null;
  sectionScores: SectionScoreData[];
  aiActivities: AIActivityData[];
}

/**
 * Props pour le composant CourseScoreKPIs
 * Partagé entre élève et professeur
 */
export interface CourseScoreKPIsProps {
  score: CourseScoreData | null;
  /** Afficher le compteur de sessions IA (5ème KPI) */
  showAISessions?: boolean;
  /** Afficher en mode compact (mobile) */
  compact?: boolean;
}

/**
 * Couleurs pour les KPIs
 */
export type KPIColor = 'blue' | 'purple' | 'amber' | 'green' | 'slate' | 'orange';

/**
 * Configuration d'un KPI
 */
export interface KPIConfig {
  key: string;
  label: string;
  value: string;
  subLabel?: string;
  color: KPIColor;
  icon: 'TrendingUp' | 'Bot' | 'ClipboardCheck' | 'Award' | 'BookOpen' | 'Dumbbell';
}

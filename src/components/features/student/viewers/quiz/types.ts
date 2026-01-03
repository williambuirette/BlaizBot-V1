// src/components/features/student/viewers/quiz/types.ts
// Types partagés pour le QuizViewer

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[] | string[]; // Support both formats
  correctOptionId?: string;
  correctAnswers?: number[]; // Alternative format from editor
  explanation?: string;
}

export interface QuizContent {
  questions: QuizQuestion[];
  passingScore?: number;
  shuffleQuestions?: boolean;
}

// Normalize options to always have id and text
export function normalizeOptions(options: QuizOption[] | string[]): QuizOption[] {
  if (!options || options.length === 0) return [];
  
  // If first item is a string, convert all to QuizOption format
  if (typeof options[0] === 'string') {
    return (options as string[]).map((text, index) => ({
      id: `opt-${index}`,
      text: text || '',
    }));
  }
  
  // Already in QuizOption format
  return options as QuizOption[];
}

// Get correct option ID from question
export function getCorrectOptionId(question: QuizQuestion, normalizedOptions: QuizOption[]): string {
  // If correctOptionId is provided, use it
  if (question.correctOptionId) return question.correctOptionId;
  
  // Otherwise, use correctAnswers array (first correct answer)
  if (question.correctAnswers && question.correctAnswers.length > 0) {
    const correctIndex = question.correctAnswers[0];
    if (correctIndex !== undefined && normalizedOptions[correctIndex]) {
      return normalizedOptions[correctIndex].id;
    }
  }
  
  return '';
}

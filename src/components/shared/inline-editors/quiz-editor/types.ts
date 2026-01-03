// src/components/shared/inline-editors/quiz-editor/types.ts
// Types partagés pour l'éditeur de quiz

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

export interface QuizContent {
  questions: QuizQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showExplanation?: boolean;
}

export interface QuizEditorInlineProps {
  sectionId: string;
  sectionTitle: string;
  initialContent: QuizContent | null;
  aiInstructions?: string;
  onContentChange: (content: QuizContent) => void;
  onAiInstructionsChange?: (instructions: string) => void;
}

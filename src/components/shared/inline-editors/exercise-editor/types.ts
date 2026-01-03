// Types partagés pour ExerciseEditorInline

export interface ExerciseItem {
  id: string;
  question: string;
  answer: string;
  points?: number;
  hint?: string;
}

export interface ExerciseContent {
  instructions: string;
  items: ExerciseItem[];
  totalPoints?: number;
  timeLimit?: number;
}

export interface ExerciseEditorInlineProps {
  sectionId: string;
  sectionTitle: string;
  initialContent: ExerciseContent | null;
  aiInstructions?: string;
  onContentChange: (content: ExerciseContent) => void;
  onAiInstructionsChange?: (instructions: string) => void;
}

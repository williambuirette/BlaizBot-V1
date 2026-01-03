// Types pour StudentCardExpanded

import { BookOpen, Video, FileQuestion, PenTool, FileText } from 'lucide-react';

export interface StudentCardData {
  id: string;
  title: string;
  content: string | null;
  cardType: 'NOTE' | 'LESSON' | 'VIDEO' | 'EXERCISE' | 'QUIZ';
  orderIndex: number;
  files?: Array<{
    id: string;
    filename: string;
    fileType: string;
    url: string;
  }>;
  quiz?: {
    id: string;
    aiGenerated: boolean;
    attemptCount: number;
  } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentCardFile {
  id: string;
  filename: string;
  fileType: string;
  url: string;
}

// Mapping des icônes par type de carte
export const cardTypeIcons = {
  NOTE: FileText,
  LESSON: BookOpen,
  VIDEO: Video,
  QUIZ: FileQuestion,
  EXERCISE: PenTool,
};

export const cardTypeLabels = {
  NOTE: 'Note',
  LESSON: 'Leçon',
  VIDEO: 'Vidéo',
  QUIZ: 'Quiz',
  EXERCISE: 'Exercice',
};

export const cardTypeColors = {
  NOTE: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  LESSON: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  VIDEO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  QUIZ: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  EXERCISE: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export const cardTypeIconColors = {
  NOTE: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  LESSON: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  VIDEO: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
  QUIZ: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  EXERCISE: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
};

/**
 * Éditeurs inline pour les cartes de révision étudiant
 * Types alignés sur le professeur : NOTE (spécifique), LESSON, VIDEO, EXERCISE, QUIZ
 * VideoEditorInline, ExerciseEditorInline et QuizEditorInline sont partagés depuis shared/
 */

export { LessonEditorInline } from './LessonEditorInline';
export { VideoEditorInline } from '@/components/shared/inline-editors/video-editor';
export { ExerciseEditorInline } from '@/components/shared/inline-editors/exercise-editor';
export { QuizEditorInline } from '@/components/shared/inline-editors/quiz-editor';
export { NoteEditorInline } from './NoteEditorInline';

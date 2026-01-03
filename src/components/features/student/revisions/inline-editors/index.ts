/**
 * Éditeurs inline pour les cartes de révision étudiant
 * Types alignés sur le professeur : NOTE (spécifique), LESSON, VIDEO, EXERCISE, QUIZ
 * VideoEditorInline et ExerciseEditorInline sont partagés depuis shared/
 */

export { LessonEditorInline } from './LessonEditorInline';
export { VideoEditorInline } from '@/components/shared/inline-editors/video-editor';
export { ExerciseEditorInline } from '@/components/shared/inline-editors/exercise-editor';
export { QuizEditorInline } from './QuizEditorInline';
export { NoteEditorInline } from './NoteEditorInline';

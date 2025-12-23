// =====================================================
// BlaizBot V1 - Données Mockées
// =====================================================
// Utilisé en Phase 3 (Vertical Slice) avant la vraie BDD
// Import: import { mockUsers, mockCourses } from '@/lib/mock-data';
// =====================================================

import type {
  User,
  Class,
  Subject,
  Course,
  Chapter,
  StudentStats,
  TeacherStats,
  AdminStats,
  Message,
  QuizQuestion,
} from '@/types';

// -----------------------------------------------------
// UTILISATEURS
// -----------------------------------------------------

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@blaizbot.edu',
    role: 'ADMIN',
    firstName: 'Admin',
    lastName: 'SYSTÈME',
  },
  {
    id: 'teacher-1',
    email: 'm.dupont@blaizbot.edu',
    role: 'TEACHER',
    firstName: 'Marc',
    lastName: 'DUPONT',
  },
  {
    id: 'teacher-2',
    email: 's.bernard@blaizbot.edu',
    role: 'TEACHER',
    firstName: 'Sophie',
    lastName: 'BERNARD',
  },
  {
    id: 'student-1',
    email: 'lucas.martin@blaizbot.edu',
    role: 'STUDENT',
    firstName: 'Lucas',
    lastName: 'MARTIN',
  },
  {
    id: 'student-2',
    email: 'emma.durand@blaizbot.edu',
    role: 'STUDENT',
    firstName: 'Emma',
    lastName: 'DURAND',
  },
  {
    id: 'student-3',
    email: 'noah.petit@blaizbot.edu',
    role: 'STUDENT',
    firstName: 'Noah',
    lastName: 'PETIT',
  },
];

// -----------------------------------------------------
// CLASSES
// -----------------------------------------------------

export const mockClasses: Class[] = [
  { id: 'class-1', name: '3ème A', level: '3ème', studentCount: 28 },
  { id: 'class-2', name: '3ème B', level: '3ème', studentCount: 26 },
  { id: 'class-3', name: '4ème A', level: '4ème', studentCount: 30 },
];

// -----------------------------------------------------
// MATIÈRES
// -----------------------------------------------------

export const mockSubjects: Subject[] = [
  { id: 'subject-1', name: 'Mathématiques', color: '#3B82F6' },
  { id: 'subject-2', name: 'Français', color: '#EF4444' },
  { id: 'subject-3', name: 'Histoire-Géo', color: '#F59E0B' },
  { id: 'subject-4', name: 'SVT', color: '#10B981' },
  { id: 'subject-5', name: 'Physique-Chimie', color: '#8B5CF6' },
  { id: 'subject-6', name: 'Anglais', color: '#EC4899' },
];

// -----------------------------------------------------
// COURS
// -----------------------------------------------------

export const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Les Fractions',
    description: 'Maîtriser les opérations sur les fractions',
    subjectId: 'subject-1',
    subject: mockSubjects[0],
    teacherId: 'teacher-1',
    teacher: mockUsers[1],
    chaptersCount: 4,
    progress: 75,
  },
  {
    id: 'course-2',
    title: 'La Révolution Française',
    description: 'De 1789 à 1799 : causes, événements et conséquences',
    subjectId: 'subject-3',
    subject: mockSubjects[2],
    teacherId: 'teacher-2',
    teacher: mockUsers[2],
    chaptersCount: 6,
    progress: 50,
  },
  {
    id: 'course-3',
    title: 'La Photosynthèse',
    description: 'Comment les plantes produisent leur énergie',
    subjectId: 'subject-4',
    subject: mockSubjects[3],
    teacherId: 'teacher-1',
    teacher: mockUsers[1],
    chaptersCount: 3,
    progress: 33,
  },
  {
    id: 'course-4',
    title: 'Le Théorème de Pythagore',
    description: 'Applications dans les triangles rectangles',
    subjectId: 'subject-1',
    subject: mockSubjects[0],
    teacherId: 'teacher-1',
    teacher: mockUsers[1],
    chaptersCount: 5,
    progress: 0,
  },
];

// -----------------------------------------------------
// CHAPITRES
// -----------------------------------------------------

export const mockChapters: Chapter[] = [
  {
    id: 'chapter-1-1',
    title: 'Introduction aux fractions',
    content: `# Introduction aux fractions

## Qu'est-ce qu'une fraction ?

Une **fraction** représente une partie d'un tout. Elle s'écrit sous la forme :

$$\\frac{a}{b}$$

Où :
- **a** est le **numérateur** (ce qu'on prend)
- **b** est le **dénominateur** (en combien de parts on divise)

## Exemples concrets

- 🍕 1/4 de pizza = 1 part sur 4
- 📏 3/4 d'heure = 45 minutes
- 💯 1/2 = 50%

## À retenir

> Une fraction est toujours une **division** : 3/4 = 3 ÷ 4 = 0,75`,
    order: 1,
    courseId: 'course-1',
    isCompleted: true,
  },
  {
    id: 'chapter-1-2',
    title: 'Addition de fractions',
    content: `# Addition de fractions

## Même dénominateur

Quand les fractions ont le **même dénominateur**, on additionne les numérateurs :

$$\\frac{2}{5} + \\frac{1}{5} = \\frac{2+1}{5} = \\frac{3}{5}$$

## Dénominateurs différents

Il faut d'abord les **réduire au même dénominateur** :

$$\\frac{1}{2} + \\frac{1}{4} = \\frac{2}{4} + \\frac{1}{4} = \\frac{3}{4}$$

## Méthode

1. Trouver le PPCM des dénominateurs
2. Convertir chaque fraction
3. Additionner les numérateurs`,
    order: 2,
    courseId: 'course-1',
    isCompleted: true,
  },
  {
    id: 'chapter-1-3',
    title: 'Multiplication de fractions',
    content: `# Multiplication de fractions

## La règle simple

Pour multiplier deux fractions, on multiplie :
- Les numérateurs entre eux
- Les dénominateurs entre eux

$$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$

## Exemple

$$\\frac{2}{3} \\times \\frac{4}{5} = \\frac{2 \\times 4}{3 \\times 5} = \\frac{8}{15}$$

## Simplification

Toujours simplifier le résultat si possible !`,
    order: 3,
    courseId: 'course-1',
    isCompleted: true,
  },
  {
    id: 'chapter-1-4',
    title: 'Division de fractions',
    content: `# Division de fractions

## La règle d'or

Diviser par une fraction = **multiplier par son inverse**

$$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$$

## Exemple

$$\\frac{3}{4} \\div \\frac{2}{5} = \\frac{3}{4} \\times \\frac{5}{2} = \\frac{15}{8}$$

## Astuce mnémotechnique

"Diviser c'est multiplier par l'inverse" 🔄`,
    order: 4,
    courseId: 'course-1',
    isCompleted: false,
  },
];

// -----------------------------------------------------
// STATISTIQUES
// -----------------------------------------------------

export const mockStudentStats: StudentStats = {
  globalProgress: 68,
  averageGrade: 14.5,
  completedCourses: 2,
  totalCourses: 4,
  pendingExercises: 3,
};

export const mockTeacherStats: TeacherStats = {
  myClasses: 2,
  myStudents: 54,
  myCourses: 3,
  pendingMessages: 5,
};

export const mockAdminStats: AdminStats = {
  totalUsers: 6,
  totalStudents: 3,
  totalTeachers: 2,
  totalClasses: 3,
  totalCourses: 4,
  totalSubjects: 6,
};

// -----------------------------------------------------
// MESSAGES
// -----------------------------------------------------

export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    content: 'Bonjour M. Dupont, je ne comprends pas l\'exercice 3.',
    senderId: 'student-1',
    sender: mockUsers[3],
    receiverId: 'teacher-1',
    receiver: mockUsers[1],
    createdAt: new Date('2025-12-21T14:30:00'),
    isRead: true,
  },
  {
    id: 'msg-2',
    content: 'Bonjour Lucas, regarde bien la méthode du chapitre 2.',
    senderId: 'teacher-1',
    sender: mockUsers[1],
    receiverId: 'student-1',
    receiver: mockUsers[3],
    createdAt: new Date('2025-12-21T15:45:00'),
    isRead: false,
  },
];

// -----------------------------------------------------
// QUIZ (IA)
// -----------------------------------------------------

export const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Quel est le résultat de 1/2 + 1/4 ?',
    type: 'QCM',
    options: ['1/6', '2/6', '3/4', '2/4'],
    correctAnswer: '3/4',
    explanation: 'On met au même dénominateur : 2/4 + 1/4 = 3/4',
  },
  {
    id: 'q2',
    question: 'Pour multiplier deux fractions, on multiplie...',
    type: 'QCM',
    options: [
      'Les numérateurs et on garde un dénominateur',
      'Les numérateurs entre eux et les dénominateurs entre eux',
      'On additionne tout',
    ],
    correctAnswer: 'Les numérateurs entre eux et les dénominateurs entre eux',
  },
  {
    id: 'q3',
    question: 'Diviser par une fraction revient à multiplier par son inverse.',
    type: 'TRUE_FALSE',
    correctAnswer: 'true',
    explanation: 'C\'est la règle fondamentale de la division de fractions.',
  },
];

// -----------------------------------------------------
// HELPERS
// -----------------------------------------------------

/**
 * Récupère un utilisateur par ID
 */
export function getMockUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.id === id);
}

/**
 * Récupère les cours d'un professeur
 */
export function getMockCoursesByTeacher(teacherId: string): Course[] {
  return mockCourses.filter((c) => c.teacherId === teacherId);
}

/**
 * Récupère les chapitres d'un cours
 */
export function getMockChaptersByCourse(courseId: string): Chapter[] {
  return mockChapters.filter((c) => c.courseId === courseId);
}

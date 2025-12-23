// -----------------------------------------------------
// DONNÉES MOCK - Student
// -----------------------------------------------------

export const currentUser = {
  id: '1',
  name: 'Lucas Martin',
  email: 'lucas@example.com',
  role: 'student' as const,
  class: '3ème A',
};

export const courses = [
  { id: '1', title: 'Algèbre', teacher: 'M. Dupont', progress: 75 },
  { id: '2', title: 'La Révolution', teacher: 'Mme Bernard', progress: 40 },
  { id: '3', title: 'Photosynthèse', teacher: 'M. Martin', progress: 90 },
];

export const studentProgress = {
  coursesCompleted: 4,
  totalCourses: 6,
  averageScore: 85,
  hoursSpent: 12,
};

// -----------------------------------------------------
// DONNÉES MOCK - Teacher
// -----------------------------------------------------

export const teacherUser = {
  id: '2',
  name: 'Marie Dupont',
  email: 'marie.dupont@example.com',
  role: 'teacher' as const,
  subject: 'Mathématiques',
};

export const teacherStats = {
  totalStudents: 87,
  totalClasses: 4,
  coursesCreated: 12,
  averageClassScore: 78,
};

export const teacherClasses = [
  { id: '1', name: '3ème A', students: 24, averageScore: 82 },
  { id: '2', name: '3ème B', students: 22, averageScore: 75 },
  { id: '3', name: '4ème A', students: 26, averageScore: 79 },
  { id: '4', name: '4ème C', students: 15, averageScore: 76 },
];

// -----------------------------------------------------
// DONNÉES MOCK - Admin
// -----------------------------------------------------

export const adminStats = {
  totalUsers: 312,
  totalStudents: 280,
  totalTeachers: 28,
  totalAdmins: 4,
  totalClasses: 12,
  totalCourses: 45,
  activeSessionsToday: 156,
  averagePlatformScore: 76,
};

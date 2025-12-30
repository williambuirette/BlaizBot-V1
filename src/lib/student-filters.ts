/**
 * Fonctions de filtrage et tri des élèves
 * @module student-filters
 */

import type { StudentFilters, StudentStats, StudentAlertLevel } from '@/types/student-filters';

/**
 * Type générique pour un élève avec stats
 */
interface FilterableStudent {
  id: string;
  firstName: string;
  lastName: string;
  classIds?: string[];
  stats?: StudentStats;
}

/**
 * Filtre les élèves selon les critères
 */
export function filterStudents<T extends FilterableStudent>(
  students: T[],
  filters: StudentFilters
): T[] {
  return students.filter(student => {
    // Filtre par classe
    if (filters.classId && student.classIds) {
      if (!student.classIds.includes(filters.classId)) {
        return false;
      }
    }

    // Filtre par niveau d'alerte
    if (filters.alertLevel !== 'all') {
      const studentAlert = student.stats?.alertLevel ?? 'no-data';
      if (studentAlert !== filters.alertLevel) {
        return false;
      }
    }

    // NOTE: La sélection ne filtre PAS la liste visible
    // Elle sert uniquement pour les stats de groupe
    // Les élèves sélectionnés restent visibles avec les autres

    // Filtre par recherche (nom ou prénom)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const reverseName = `${student.lastName} ${student.firstName}`.toLowerCase();
      if (!fullName.includes(searchLower) && !reverseName.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Trie les élèves selon le champ et la direction
 */
export function sortStudents<T extends FilterableStudent & { classes?: string[] }>(
  students: T[],
  field: 'lastName' | 'averageGrade' | 'coursesCount' | 'className',
  direction: 'asc' | 'desc'
): T[] {
  const sorted = [...students].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'lastName':
        comparison = a.lastName.localeCompare(b.lastName);
        break;
      
      case 'averageGrade':
        const gradeA = a.stats?.averageGrade ?? -1;
        const gradeB = b.stats?.averageGrade ?? -1;
        comparison = gradeA - gradeB;
        break;
      
      case 'coursesCount':
        const countA = a.stats?.totalCourses ?? 0;
        const countB = b.stats?.totalCourses ?? 0;
        comparison = countA - countB;
        break;
      
      case 'className':
        const classA = a.classes?.[0] ?? '';
        const classB = b.classes?.[0] ?? '';
        comparison = classA.localeCompare(classB);
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Compte les élèves par niveau d'alerte
 */
export function countByAlertLevel<T extends FilterableStudent>(
  students: T[]
): Record<StudentAlertLevel, number> {
  const counts: Record<StudentAlertLevel, number> = {
    all: students.length,
    success: 0,
    warning: 0,
    danger: 0,
    'no-data': 0,
  };

  students.forEach(student => {
    const level = student.stats?.alertLevel ?? 'no-data';
    if (level in counts) {
      counts[level]++;
    }
  });

  return counts;
}

/**
 * Extrait la liste unique des classes depuis les élèves
 */
export function extractClassesFromStudents<T extends { classes: string[]; classIds?: string[] }>(
  students: T[]
): { id: string; name: string }[] {
  const classMap = new Map<string, string>();

  students.forEach(student => {
    student.classes.forEach((className, index) => {
      const classId = student.classIds?.[index] ?? className;
      if (!classMap.has(classId)) {
        classMap.set(classId, className);
      }
    });
  });

  return Array.from(classMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// STATISTIQUES DE GROUPE
// ============================================================================

/**
 * Statistiques agrégées pour un groupe d'élèves
 */
export interface GroupStats {
  /** Nombre total d'élèves dans le groupe */
  total: number;
  /** Nombre d'élèves en réussite (🟢 ≥4.5) */
  successCount: number;
  /** Nombre d'élèves à surveiller (🟡 3.5-4.4) */
  warningCount: number;
  /** Nombre d'élèves en difficulté (🔴 <3.5) */
  dangerCount: number;
  /** Nombre d'élèves sans notes (⚪) */
  noDataCount: number;
  /** Moyenne générale du groupe (/6), null si aucune note */
  averageGrade: number | null;
}

/**
 * Calcule les statistiques agrégées d'un groupe d'élèves
 */
export function calculateGroupStats<T extends FilterableStudent>(
  students: T[]
): GroupStats {
  const stats: GroupStats = {
    total: students.length,
    successCount: 0,
    warningCount: 0,
    dangerCount: 0,
    noDataCount: 0,
    averageGrade: null,
  };

  let gradeSum = 0;
  let gradeCount = 0;

  students.forEach(student => {
    const alertLevel = student.stats?.alertLevel ?? 'no-data';
    const grade = student.stats?.averageGrade;

    // Compter par niveau d'alerte
    switch (alertLevel) {
      case 'success':
        stats.successCount++;
        break;
      case 'warning':
        stats.warningCount++;
        break;
      case 'danger':
        stats.dangerCount++;
        break;
      default:
        stats.noDataCount++;
    }

    // Accumuler pour la moyenne
    if (grade !== null && grade !== undefined) {
      gradeSum += grade;
      gradeCount++;
    }
  });

  // Calculer la moyenne
  if (gradeCount > 0) {
    stats.averageGrade = gradeSum / gradeCount;
  }

  return stats;
}

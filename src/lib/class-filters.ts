/**
 * Fonctions de filtrage et calcul de stats pour les classes
 * @module class-filters
 */

import type { ClassFilters, ClassGroupStats, ClassWithStats, ClassAlertLevel } from '@/types/class-filters';

/**
 * Filtre les classes selon les critères
 */
export function filterClasses(
  classes: ClassWithStats[],
  filters: ClassFilters
): ClassWithStats[] {
  return classes.filter(classItem => {
    // Filtre par matière(s) (multi-select)
    if (filters.subjectIds.length > 0) {
      const hasMatchingSubject = classItem.subjects.some(subject =>
        filters.subjectIds.includes(subject.id)
      );
      if (!hasMatchingSubject) {
        return false;
      }
    }

    // Filtre par niveau
    if (filters.level !== null) {
      if (classItem.level !== filters.level) {
        return false;
      }
    }

    // Filtre par recherche (nom de classe)
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim();
      const className = classItem.name.toLowerCase();
      if (!className.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Trie les classes selon le champ et la direction
 */
export function sortClasses(
  classes: ClassWithStats[],
  field: 'name' | 'level' | 'studentsCount' | 'averageGrade',
  direction: 'asc' | 'desc'
): ClassWithStats[] {
  const sorted = [...classes].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      
      case 'level':
        comparison = a.level.localeCompare(b.level);
        break;
      
      case 'studentsCount':
        comparison = a.studentsCount - b.studentsCount;
        break;
      
      case 'averageGrade':
        const gradeA = a.stats.averageGrade ?? -1;
        const gradeB = b.stats.averageGrade ?? -1;
        comparison = gradeA - gradeB;
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Compte les classes par niveau d'alerte
 */
export function countByAlertLevel(
  classes: ClassWithStats[]
): Record<ClassAlertLevel | 'all', number> {
  const counts: Record<ClassAlertLevel | 'all', number> = {
    all: classes.length,
    success: 0,
    warning: 0,
    danger: 0,
    'no-data': 0,
  };

  classes.forEach(classItem => {
    const level = classItem.stats.alertLevel;
    if (level in counts) {
      counts[level]++;
    }
  });

  return counts;
}

/**
 * Extrait la liste unique des niveaux depuis les classes
 */
export function extractLevelsFromClasses(
  classes: ClassWithStats[]
): string[] {
  const levels = new Set<string>();

  classes.forEach(classItem => {
    levels.add(classItem.level);
  });

  return Array.from(levels).sort((a, b) => a.localeCompare(b));
}

/**
 * Extrait la liste unique des matières depuis les classes
 */
export function extractSubjectsFromClasses(
  classes: ClassWithStats[]
): { id: string; name: string }[] {
  const subjectMap = new Map<string, string>();

  classes.forEach(classItem => {
    classItem.subjects.forEach(subject => {
      if (!subjectMap.has(subject.id)) {
        subjectMap.set(subject.id, subject.name);
      }
    });
  });

  return Array.from(subjectMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// STATISTIQUES DE GROUPE
// ============================================================================

/**
 * Calcule les statistiques agrégées d'un groupe de classes
 * @param classes - Liste des classes (toutes ou sélectionnées)
 * @returns Stats globales du groupe
 */
export function calculateClassGroupStats(
  classes: ClassWithStats[]
): ClassGroupStats {
  const stats: ClassGroupStats = {
    totalStudents: 0,
    successCount: 0,
    warningCount: 0,
    dangerCount: 0,
    noDataCount: 0,
    averageGrade: null,
    averageAI: null,
  };

  let gradeSum = 0;
  let gradeCount = 0;
  let aiSum = 0;
  let aiCount = 0;

  classes.forEach(classItem => {
    // Agréger les compteurs
    stats.totalStudents += classItem.studentsCount;
    stats.successCount += classItem.stats.successCount;
    stats.warningCount += classItem.stats.warningCount;
    stats.dangerCount += classItem.stats.dangerCount;
    
    // Les élèves sans notes = total - (success + warning + danger)
    const classNoData = classItem.studentsCount - (
      classItem.stats.successCount +
      classItem.stats.warningCount +
      classItem.stats.dangerCount
    );
    stats.noDataCount += classNoData;

    // Accumuler pour la moyenne pondérée
    if (classItem.stats.averageGrade !== null) {
      gradeSum += classItem.stats.averageGrade * classItem.studentsCount;
      gradeCount += classItem.studentsCount;
    }

    // Accumuler pour la moyenne IA pondérée
    if (classItem.stats.aiAverageScore !== null) {
      aiSum += classItem.stats.aiAverageScore * classItem.studentsCount;
      aiCount += classItem.studentsCount;
    }
  });

  // Calculer la moyenne pondérée par nombre d'élèves
  if (gradeCount > 0) {
    stats.averageGrade = gradeSum / gradeCount;
  }

  // Calculer la moyenne IA pondérée
  if (aiCount > 0) {
    stats.averageAI = aiSum / aiCount;
  }

  return stats;
}

/**
 * Détermine le niveau d'alerte d'une classe selon sa moyenne
 * @param averageGrade - Moyenne de la classe (/6)
 * @returns Niveau d'alerte (success, warning, danger, no-data)
 */
export function getClassAlertLevel(averageGrade: number | null): ClassAlertLevel {
  if (averageGrade === null) return 'no-data';
  if (averageGrade >= 4.5) return 'success';
  if (averageGrade >= 3.5) return 'warning';
  return 'danger';
}

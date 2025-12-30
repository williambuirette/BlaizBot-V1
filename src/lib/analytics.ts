import { StudentProgress, CourseAssignment, User } from "@prisma/client";

export interface ClassStats {
  averageScore: number;
  completionRate: number;
  totalStudents: number;
  submittedCount: number;
  atRiskCount: number; // Score < 10
  topPerformersCount: number; // Score >= 16
  distribution: {
    low: number; // 0-9
    medium: number; // 10-15
    high: number; // 16-20
  };
}

export const analyticsService = {
  calculateClassStats(
    progressData: (StudentProgress & { student: User; assignment: CourseAssignment })[]
  ): ClassStats {
    const totalStudents = new Set(progressData.map((p) => p.studentId)).size;
    const submitted = progressData.filter((p) => p.status === "COMPLETED" || p.status === "GRADED");
    const submittedCount = submitted.length;

    // Calcul des scores (uniquement pour ceux qui ont une note)
    const scoredProgress = submitted.filter((p) => p.score !== null);
    const scores = scoredProgress.map((p) => p.score || 0);

    const averageScore =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

    // Élèves à risque (moyenne < 50% si score sur 100, ou < 10 si sur 20)
    // On assume ici que le score est normalisé sur 100 dans la BDD (float)
    // Mais affiché souvent sur 20.
    // Si score > 20, c'est probablement sur 100.
    // Convention BlaizBot: score stocké sur 100.
    const atRiskCount = scores.filter((s) => s < 50).length;
    const topPerformersCount = scores.filter((s) => s >= 80).length;

    const distribution = {
      low: scores.filter((s) => s < 50).length,
      medium: scores.filter((s) => s >= 50 && s < 80).length,
      high: scores.filter((s) => s >= 80).length,
    };

    const completionRate =
      progressData.length > 0 ? (submittedCount / progressData.length) * 100 : 0;

    return {
      averageScore,
      completionRate,
      totalStudents,
      submittedCount,
      atRiskCount,
      topPerformersCount,
      distribution,
    };
  },

  formatStatsForAI(stats: ClassStats): string {
    return `
      STATISTIQUES DE LA CLASSE:
      - Moyenne générale : ${stats.averageScore.toFixed(1)}/100
      - Taux de complétion : ${stats.completionRate.toFixed(1)}%
      - Élèves en difficulté (<50%) : ${stats.atRiskCount}
      - Élèves performants (>80%) : ${stats.topPerformersCount}
      - Distribution : Faible (${stats.distribution.low}), Moyen (${stats.distribution.medium}), Fort (${stats.distribution.high})
    `;
  }
};

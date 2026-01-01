import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/student/ai-progress
 * Récupère les données de progression IA de l'élève connecté
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer le profil élève
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 });
    }

    // Récupérer toutes les activités IA de l'élève
    const aiActivities = await prisma.aIActivityScore.findMany({
      where: { studentId: studentProfile.id },
      orderBy: { createdAt: 'desc' },
    });

    // Récupérer les scores de compréhension IA
    const studentScores = await prisma.studentScore.findMany({
      where: { 
        studentId: studentProfile.id,
        aiComprehension: { not: undefined }
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculer les métriques
    const totalSessions = aiActivities.length;
    
    // Sessions de la semaine (7 derniers jours)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSessions = aiActivities.filter(a => new Date(a.createdAt) >= weekAgo).length;

    // Scores actuels et précédents
    const aiScores = studentScores
      .map(s => s.aiComprehension as number)
      .filter(s => s !== null);

    const currentScore = aiScores[0] || null;
    const previousScore = aiScores[1] || null;
    const bestScore = aiScores.length > 0 ? Math.max(...aiScores) : null;
    const averageScore = aiScores.length > 0 
      ? Math.round(aiScores.reduce((a, b) => a + b, 0) / aiScores.length)
      : null;

    // Dernière session
    const lastSessionDate = aiActivities[0]?.createdAt || null;

    // Objectif de progression (par défaut 70, peut être personnalisé plus tard)
    const progressGoal = 70;

    return NextResponse.json({
      currentScore,
      previousScore,
      totalSessions,
      weekSessions,
      bestScore,
      averageScore,
      lastSessionDate,
      progressGoal,
    });
  } catch (error) {
    console.error('Erreur API ai-progress:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
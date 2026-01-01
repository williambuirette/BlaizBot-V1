import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { 
  CourseWithStats, 
  CoursesOverview, 
  CoursePerformance, 
  calculateGrade 
} from '@/types/course-stats';

// Helper : Calculer le début de l'année scolaire
function getSchoolYearStart(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  // Si on est après septembre, l'année scolaire a commencé cette année
  // Sinon, elle a commencé l'année précédente
  return new Date(now.getMonth() >= 8 ? currentYear : currentYear - 1, 8, 1);
}

// Schéma de validation pour création de cours (version enrichie)
const createCourseSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().optional(),
  subjectId: z.string().min(1, 'La matière est requise'),
  content: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  duration: z.number().int().positive().optional().nullable(),
  objectives: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isDraft: z.boolean().optional(),
  files: z.array(z.object({
    filename: z.string(),
    url: z.string(),
  })).optional(),
});

// GET : Liste des cours du professeur avec stats de performance
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Récupérer le TeacherProfile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    const schoolYearStart = getSchoolYearStart();

    // Récupérer les cours avec StudentScore et AIActivityScore
    const courses = await prisma.course.findMany({
      where: { teacherId: teacherProfile.id },
      include: {
        Subject: true,
        StudentScore: {
          where: { createdAt: { gte: schoolYearStart } },
          select: { 
            studentId: true, 
            finalScore: true,      // Score final si disponible
            quizAvg: true,         // Moyenne quiz
            exerciseAvg: true,     // Moyenne exercices
            aiComprehension: true  // Score IA existant
          },
        },
        AIActivityScore: {
          where: { createdAt: { gte: schoolYearStart } },
          select: { 
            studentId: true, 
            finalScore: true 
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Set pour compter les élèves uniques globalement
    const allStudentIds = new Set<string>();
    let totalGlobalScore = 0;
    let coursesWithData = 0;

    // Transformer les cours avec les stats de performance
    const coursesWithStats: CourseWithStats[] = courses.map((course) => {
      // Élèves uniques pour ce cours
      const courseStudentIds = new Set<string>();
      course.StudentScore.forEach(s => courseStudentIds.add(s.studentId));
      course.AIActivityScore.forEach(s => courseStudentIds.add(s.studentId));
      
      // Ajouter aux élèves globaux
      courseStudentIds.forEach(id => allStudentIds.add(id));

      // Calculer score étudiant (utiliser finalScore ou moyenne quiz+exercices)
      const studentScores = course.StudentScore.map(s => {
        if (s.finalScore !== null) return s.finalScore;
        // Sinon calculer moyenne des quiz et exercices
        return ((s.quizAvg || 0) + (s.exerciseAvg || 0)) / 2;
      });
      const studentScoreAvg = studentScores.length > 0
        ? studentScores.reduce((sum, score) => sum + score, 0) / studentScores.length
        : 0;

      // Calculer moyennes AIActivityScore
      const aiScores = course.AIActivityScore.filter(s => s.finalScore !== null);
      const aiScoreAvg = aiScores.length > 0
        ? aiScores.reduce((sum, s) => sum + (s.finalScore || 0), 0) / aiScores.length
        : 0;

      // Score IA existant (aiComprehension moyenne)
      const aiCompScores = course.StudentScore
        .filter(s => s.aiComprehension !== null)
        .map(s => s.aiComprehension as number);
      const aiComprehensionAvg = aiCompScores.length > 0
        ? Math.round(aiCompScores.reduce((a, b) => a + b, 0) / aiCompScores.length)
        : null;

      // Performance globale (minimum 1 élève)
      let performance: CoursePerformance | null = null;
      if (courseStudentIds.size >= 1) {
        const globalScore = (studentScoreAvg * 0.6) + (aiScoreAvg * 0.4);
        performance = {
          studentScoreAvg: Math.round(studentScoreAvg),
          aiScoreAvg: Math.round(aiScoreAvg),
          globalScore: Math.round(globalScore),
          grade: calculateGrade(globalScore),
          enrolledCount: courseStudentIds.size,
          activeCount: course.StudentScore.length,
        };
        totalGlobalScore += globalScore;
        coursesWithData++;
      }

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        subject: { id: course.Subject.id, name: course.Subject.name },
        performance,
        aiComprehensionAvg,
      };
    });

    // Overview global
    const overview: CoursesOverview = {
      totalCourses: courses.length,
      totalStudents: allStudentIds.size,
      averagePerformance: coursesWithData > 0 
        ? Math.round(totalGlobalScore / coursesWithData) 
        : 0,
      coursesWithData,
    };

    return NextResponse.json({ 
      success: true,
      data: {
        courses: coursesWithStats,
        overview,
      }
    });
  } catch (error) {
    console.error('Erreur API GET /api/teacher/courses:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer un nouveau cours
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Récupérer le TeacherProfile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json({ error: 'Profil professeur non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const validation = createCourseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, subjectId, content, difficulty, duration, objectives, tags, isDraft, files } = validation.data;

    // Vérifier que la matière existe
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Matière non trouvée' }, { status: 404 });
    }

    // Créer le cours avec tous les champs
    const now = new Date();
    const course = await prisma.course.create({
      data: {
        id: randomUUID(),
        title,
        description,
        subjectId,
        teacherId: teacherProfile.id,
        content: content || null,
        difficulty: difficulty || 'MEDIUM',
        duration: duration || null,
        objectives: objectives || [],
        tags: tags || [],
        isDraft: isDraft ?? true,
        updatedAt: now,
        // Créer les fichiers associés si fournis
        CourseFile: files && files.length > 0 ? {
          create: files.map((f) => ({
            id: randomUUID(),
            filename: f.filename,
            fileType: f.filename.split('.').pop() || 'unknown',
            url: f.url,
            uploadedAt: now,
          })),
        } : undefined,
      },
      include: {
        Subject: true,
        CourseFile: true,
      },
    });

    return NextResponse.json({
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        subjectId: course.subjectId,
        subjectName: course.Subject?.name ?? subject.name,
        chaptersCount: 0,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur API POST /api/teacher/courses:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

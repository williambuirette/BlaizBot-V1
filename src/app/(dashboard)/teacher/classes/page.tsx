import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { ClassesList } from '@/components/features/teacher/ClassesList';
import type { ClassWithStats } from '@/types/class-filters';
import { statsService } from '@/lib/stats-service';
import { getClassAlertLevel } from '@/lib/class-filters';

/**
 * Calcule les statistiques d'une classe à partir de ses élèves
 */
async function calculateClassStats(classId: string) {
  // Récupérer les élèves de cette classe avec leurs scores
  const students = await prisma.studentProfile.findMany({
    where: {
      classId,
    },
    include: {
      User: {
        select: {
          id: true,
          StudentScore: {
            select: {
              continuousScore: true,
              finalGrade: true,
            },
          },
        },
      },
    },
  });

  if (students.length === 0) {
    return {
      successCount: 0,
      warningCount: 0,
      dangerCount: 0,
      averageGrade: null,
      alertLevel: 'no-data' as const,
    };
  }

  // Calculer la moyenne de chaque élève
  const studentGrades: number[] = [];

  students.forEach((student) => {
    const scores = student.User.StudentScore;
    if (scores.length === 0) return;

    const gradesWithFinal = scores.filter((s: { continuousScore: number; finalGrade: number | null }) => s.finalGrade !== null);
    let avgGrade: number;

    if (gradesWithFinal.length > 0) {
      avgGrade = gradesWithFinal.reduce((acc: number, s: { continuousScore: number; finalGrade: number | null }) => acc + (s.finalGrade ?? 0), 0) / gradesWithFinal.length;
    } else {
      const avgContinuous = scores.reduce((acc: number, s: { continuousScore: number; finalGrade: number | null }) => acc + s.continuousScore, 0) / scores.length;
      avgGrade = (avgContinuous / 100) * 6;
    }

    studentGrades.push(avgGrade);
  });

  // Compter par niveau d'alerte
  let successCount = 0;
  let warningCount = 0;
  let dangerCount = 0;

  studentGrades.forEach((grade) => {
    const alertLevel = statsService.getAlertLevel(grade);

    switch (alertLevel) {
      case 'success':
        successCount++;
        break;
      case 'warning':
        warningCount++;
        break;
      case 'danger':
        dangerCount++;
        break;
    }
  });

  const averageGrade = studentGrades.length > 0
    ? studentGrades.reduce((acc, g) => acc + g, 0) / studentGrades.length
    : null;

  return {
    successCount,
    warningCount,
    dangerCount,
    averageGrade,
    alertLevel: getClassAlertLevel(averageGrade),
  };
}

async function getTeacherClassesWithStats(userId: string): Promise<ClassWithStats[]> {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
    include: {
      Class: {
        include: {
          StudentProfile: {
            select: { id: true },
          },
        },
      },
      Subject: true,
    },
  });

  if (!teacherProfile) return [];

  const classesWithStats = await Promise.all(
    teacherProfile.Class.map(async (cls) => {
      const stats = await calculateClassStats(cls.id);
      const subjects = teacherProfile.Subject.map((s) => ({
        id: s.id,
        name: s.name,
      }));

      return {
        id: cls.id,
        name: cls.name,
        level: cls.level,
        studentsCount: cls.StudentProfile.length,
        subjects,
        stats,
      };
    })
  );

  return classesWithStats;
}

export default async function TeacherClassesPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  const classes = await getTeacherClassesWithStats(session.user.id);

  // Extraire les matières uniques pour les filtres
  const subjects = Array.from(
    new Map(
      classes.flatMap(cls => cls.subjects.map(s => [s.id, s]))
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes Classes</h1>
        <p className="text-muted-foreground">
          {classes.length} classe{classes.length > 1 ? 's' : ''} assignée{classes.length > 1 ? 's' : ''}
        </p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucune classe assignée</h3>
            <p className="text-sm text-muted-foreground">
              Contactez l&apos;administrateur pour être assigné à une classe.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ClassesList classes={classes} subjects={subjects} />
      )}
    </div>
  );
}

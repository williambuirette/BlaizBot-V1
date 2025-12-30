import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { StudentsList } from '@/components/features/teacher/StudentsList';
import type { StudentWithStats, StudentStats } from '@/types/student-filters';
import { statsService } from '@/lib/stats-service';

/**
 * Calcule les statistiques d'un élève à partir de ses scores
 */
function calculateStudentStats(scores: { continuousScore: number; finalGrade: number | null }[]): StudentStats {
  if (scores.length === 0) {
    return {
      averageGrade: null,
      coursesWithGrades: 0,
      totalCourses: 0,
      alertLevel: 'no-data',
    };
  }

  // Calcul de la moyenne des notes finales (si examen passé) ou note continue convertie
  const gradesWithFinal = scores.filter(s => s.finalGrade !== null);
  const coursesWithGrades = gradesWithFinal.length;
  
  let averageGrade: number | null = null;
  
  if (coursesWithGrades > 0) {
    // Moyenne des notes finales /6
    const sum = gradesWithFinal.reduce((acc, s) => acc + (s.finalGrade ?? 0), 0);
    averageGrade = sum / coursesWithGrades;
  } else {
    // Pas d'examen : moyenne des scores continus convertie en /6
    const avgContinuous = scores.reduce((acc, s) => acc + s.continuousScore, 0) / scores.length;
    averageGrade = (avgContinuous / 100) * 6;
  }

  return {
    averageGrade,
    coursesWithGrades,
    totalCourses: scores.length,
    alertLevel: statsService.getAlertLevel(averageGrade),
  };
}

export default async function TeacherStudentsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    redirect('/login');
  }

  // Récupérer le TeacherProfile avec ses classes et toutes les infos des élèves
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      classes: {
        include: {
          students: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  address: true,
                  city: true,
                  postalCode: true,
                  isActive: true,
                  // Récupérer les scores pour calculer les stats
                  studentScores: {
                    select: {
                      continuousScore: true,
                      finalGrade: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!teacherProfile) {
    redirect('/login');
  }

  // Collecter tous les élèves uniques avec leur classe, infos et stats
  const studentsMap = new Map<string, StudentWithStats & {
    classes: string[];
    classIds: string[];
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    postalCode?: string | null;
    parentEmail?: string | null;
    isActive?: boolean;
    scores: { continuousScore: number; finalGrade: number | null }[];
  }>();

  teacherProfile.classes.forEach((cls) => {
    cls.students.forEach((student) => {
      const existing = studentsMap.get(student.user.id);
      if (existing) {
        existing.classes.push(cls.name);
        existing.classIds.push(cls.id);
      } else {
        const scores = student.user.studentScores.map(s => ({
          continuousScore: s.continuousScore,
          finalGrade: s.finalGrade,
        }));
        studentsMap.set(student.user.id, {
          id: student.user.id,
          firstName: student.user.firstName,
          lastName: student.user.lastName,
          email: student.user.email,
          phone: student.user.phone,
          address: student.user.address,
          city: student.user.city,
          postalCode: student.user.postalCode,
          parentEmail: student.parentEmail,
          classes: [cls.name],
          classIds: [cls.id],
          isActive: student.user.isActive,
          studentProfile: student,
          class: cls,
          scores,
          stats: calculateStudentStats(scores),
        });
      }
    });
  });

  // Transformer en tableau et trier par nom
  const students = Array.from(studentsMap.values())
    .map(({ scores, ...rest }) => rest) // Retirer les scores bruts
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  // Liste des classes pour le filtre
  const classes = teacherProfile.classes.map(cls => ({
    id: cls.id,
    name: cls.name,
    level: cls.level,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes Élèves</h1>
        <p className="text-muted-foreground">
          {students.length} élève{students.length > 1 ? 's' : ''} dans vos classes
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucun élève</h3>
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas encore d&apos;élèves dans vos classes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <StudentsList students={students} classes={classes} />
      )}
    </div>
  );
}

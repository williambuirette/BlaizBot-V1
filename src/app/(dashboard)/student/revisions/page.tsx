/**
 * Page Révisions Élève - Liste des suppléments et cours personnels
 * /student/revisions
 */

import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { RevisionsHeader } from '@/components/features/student/revisions/RevisionsHeader';
import { RevisionsTabs } from '@/components/features/student/revisions/RevisionsTabs';
import { Skeleton } from '@/components/ui/skeleton';

async function getStudentSupplements(userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) return { supplements: [], stats: null };

  const supplements = await prisma.studentSupplement.findMany({
    where: { studentId: student.id },
    include: {
      // Many-to-many: récupérer tous les cours liés
      Courses: {
        select: {
          Course: {
            select: {
              id: true,
              title: true,
              TeacherProfile: {
                select: {
                  User: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      },
      Chapters: {
        select: {
          id: true,
          _count: { select: { Cards: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Stats agrégées
  const totalCards = supplements.reduce(
    (acc, s) => acc + s.Chapters.reduce((a, ch) => a + ch._count.Cards, 0),
    0
  );

  return {
    supplements: supplements.map((s) => {
      // Extraire les cours liés (many-to-many)
      const linkedCourses = s.Courses.map((sc) => ({
        id: sc.Course.id,
        title: sc.Course.title,
        teacher: sc.Course.TeacherProfile?.User
          ? `${sc.Course.TeacherProfile.User.firstName} ${sc.Course.TeacherProfile.User.lastName}`
          : null,
      }));

      return {
        id: s.id,
        title: s.title,
        description: s.description,
        // Many-to-many: tableau de cours
        courseIds: linkedCourses.map((c) => c.id),
        courses: linkedCourses,
        // Backward compat: premier cours
        courseId: linkedCourses[0]?.id || null,
        course: linkedCourses[0] || null,
        chapterCount: s.Chapters.length,
        cardCount: s.Chapters.reduce((a, ch) => a + ch._count.Cards, 0),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    }),
    stats: {
      totalSupplements: supplements.length,
      linkedToCourse: supplements.filter((s) => s.Courses.length > 0).length,
      personalCourses: supplements.filter((s) => s.Courses.length === 0).length,
      totalCards,
    },
  };
}

export default async function RevisionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { supplements, stats } = await getStudentSupplements(session.user.id);

  return (
    <div className="space-y-6">
      <RevisionsHeader stats={stats} />
      <Suspense fallback={<RevisionsSkeleton />}>
        <RevisionsTabs supplements={supplements} />
      </Suspense>
    </div>
  );
}

function RevisionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

/**
 * Page détail d'un supplément élève
 * /student/revisions/[id]
 */

import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SupplementDetailHeader } from '@/components/features/student/revisions/SupplementDetailHeader';
import { StudentChapterManager } from '@/components/features/student/revisions/StudentChapterManager';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getSupplement(supplementId: string, userId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) return null;

  const supplement = await prisma.studentSupplement.findFirst({
    where: {
      id: supplementId,
      studentId: student.id,
    },
    include: {
      // Many-to-many: récupérer tous les cours liés
      Courses: {
        include: {
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
        orderBy: { orderIndex: 'asc' },
        include: {
          Cards: {
            orderBy: { orderIndex: 'asc' },
            include: {
              Files: {
                select: { id: true, filename: true, fileType: true, url: true },
              },
              Quiz: {
                select: {
                  id: true,
                  aiGenerated: true,
                  _count: { select: { Attempts: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!supplement) return null;

  // Extraire les cours liés (many-to-many)
  const linkedCourses = supplement.Courses.map((sc) => ({
    id: sc.Course.id,
    title: sc.Course.title,
    teacher: sc.Course.TeacherProfile?.User
      ? `${sc.Course.TeacherProfile.User.firstName} ${sc.Course.TeacherProfile.User.lastName}`
      : null,
  }));

  return {
    id: supplement.id,
    title: supplement.title,
    description: supplement.description,
    // Many-to-many
    courseIds: linkedCourses.map((c) => c.id),
    courses: linkedCourses,
    // Backward compat
    courseId: linkedCourses[0]?.id || null,
    course: linkedCourses[0] || null,
    chapters: supplement.Chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      orderIndex: ch.orderIndex,
      cards: ch.Cards.map((card) => ({
        id: card.id,
        title: card.title,
        content: card.content,
        cardType: card.cardType,
        orderIndex: card.orderIndex,
        files: card.Files,
        quiz: card.Quiz
          ? {
              id: card.Quiz.id,
              aiGenerated: card.Quiz.aiGenerated,
              attemptCount: card.Quiz._count.Attempts,
            }
          : null,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      })),
    })),
    createdAt: supplement.createdAt,
    updatedAt: supplement.updatedAt,
  };
}

export default async function SupplementDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const supplement = await getSupplement(id, session.user.id);
  if (!supplement) notFound();

  return (
    <div className="space-y-6">
      <SupplementDetailHeader supplement={supplement} />
      <StudentChapterManager
        supplementId={supplement.id}
        chapters={supplement.chapters}
      />
    </div>
  );
}

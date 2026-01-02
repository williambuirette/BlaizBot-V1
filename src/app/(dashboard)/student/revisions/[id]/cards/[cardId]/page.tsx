/**
 * Page d'édition d'une carte de révision étudiant
 * Réutilise les éditeurs inline du système professeur
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StudentCardEditorPage } from '@/components/features/student/revisions/StudentCardEditorPage';

interface PageProps {
  params: Promise<{ id: string; cardId: string }>;
}

export default async function EditStudentCardPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { id: supplementId, cardId } = await params;

  // Récupérer le profil étudiant
  const studentProfile = await prisma.studentProfile.findFirst({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!studentProfile) {
    redirect('/student');
  }

  // Récupérer la carte avec vérification ownership
  const card = await prisma.studentCard.findFirst({
    where: {
      id: cardId,
      Chapter: {
        Supplement: {
          id: supplementId,
          studentId: studentProfile.id,
        },
      },
    },
    include: {
      Files: {
        select: {
          id: true,
          filename: true,
          fileType: true,
          url: true,
        },
      },
      Quiz: {
        select: {
          id: true,
          questions: true,
          aiGenerated: true,
        },
      },
      Chapter: {
        select: {
          id: true,
          title: true,
          Supplement: {
            select: {
              id: true,
              title: true,
              courseId: true,
            },
          },
        },
      },
    },
  });

  if (!card) {
    redirect(`/student/revisions/${supplementId}`);
  }

  // Préparer les données pour le composant
  const cardData = {
    id: card.id,
    title: card.title,
    content: card.content,
    cardType: card.cardType,
    files: card.Files,
    quiz: card.Quiz ? {
      id: card.Quiz.id,
      questions: card.Quiz.questions as Record<string, unknown>[],
      aiGenerated: card.Quiz.aiGenerated,
    } : null,
    chapter: {
      id: card.Chapter.id,
      title: card.Chapter.title,
    },
    supplement: {
      id: card.Chapter.Supplement.id,
      title: card.Chapter.Supplement.title,
      courseId: card.Chapter.Supplement.courseId,
    },
  };

  return <StudentCardEditorPage card={cardData} />;
}

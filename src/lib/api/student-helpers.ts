/**
 * Helpers pour les APIs élève (révisions privées)
 */

import { prisma } from '@/lib/prisma';

/**
 * Récupère l'ID du StudentProfile à partir de l'userId
 */
export async function getStudentProfileId(userId: string): Promise<string | null> {
  const student = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return student?.id ?? null;
}

/**
 * Vérifie qu'un supplément appartient à l'élève
 */
export async function verifySupplementOwnership(
  supplementId: string,
  studentId: string
): Promise<boolean> {
  const supplement = await prisma.studentSupplement.findFirst({
    where: {
      id: supplementId,
      studentId,
    },
    select: { id: true },
  });
  return supplement !== null;
}

/**
 * Vérifie qu'un chapitre appartient à l'élève (via son supplément)
 */
export async function verifyChapterOwnership(
  chapterId: string,
  studentId: string
): Promise<boolean> {
  const chapter = await prisma.studentChapter.findFirst({
    where: {
      id: chapterId,
      Supplement: { studentId },
    },
    select: { id: true },
  });
  return chapter !== null;
}

/**
 * Vérifie qu'une carte appartient à l'élève (via chapitre → supplément)
 */
export async function verifyCardOwnership(
  cardId: string,
  studentId: string
): Promise<boolean> {
  const card = await prisma.studentCard.findFirst({
    where: {
      id: cardId,
      Chapter: { Supplement: { studentId } },
    },
    select: { id: true },
  });
  return card !== null;
}

/**
 * Génère un ID unique avec préfixe
 */
export function generateStudentId(prefix: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

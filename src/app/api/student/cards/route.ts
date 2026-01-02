/**
 * API Cartes Élève - Création
 * POST /api/student/cards - Créer une nouvelle carte
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getStudentProfileId,
  verifyChapterOwnership,
  generateStudentId,
} from '@/lib/api/student-helpers';
import { StudentCardType } from '@prisma/client';

// ============================================================================
// POST - Créer une nouvelle carte
// ============================================================================
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const studentId = await getStudentProfileId(session.user.id);
    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Profil élève non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { chapterId, title, content, cardType } = body;

    // Validation
    if (!chapterId) {
      return NextResponse.json(
        { success: false, error: 'chapterId requis' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Le titre doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    // Vérifier ownership du chapitre
    const isOwner = await verifyChapterOwnership(chapterId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Chapitre non trouvé' },
        { status: 404 }
      );
    }

    // Valider le cardType (aligné sur les types professeur + NOTE)
    const validTypes: StudentCardType[] = ['NOTE', 'LESSON', 'VIDEO', 'EXERCISE', 'QUIZ'];
    const type = validTypes.includes(cardType) ? cardType : 'NOTE';

    // Calculer le prochain orderIndex
    const lastCard = await prisma.studentCard.findFirst({
      where: { chapterId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    const nextOrderIndex = (lastCard?.orderIndex ?? -1) + 1;

    const card = await prisma.studentCard.create({
      data: {
        id: generateStudentId('scard'),
        chapterId,
        title: title.trim(),
        content: content || '',
        cardType: type,
        orderIndex: nextOrderIndex,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: card.id,
        title: card.title,
        content: card.content,
        cardType: card.cardType,
        orderIndex: card.orderIndex,
        files: [],
        quiz: null,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      },
    });
  } catch (error) {
    console.error('[POST /api/student/cards] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

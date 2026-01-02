/**
 * API Carte Élève - CRUD individuel
 * GET    /api/student/cards/[id] - Détail d'une carte
 * PUT    /api/student/cards/[id] - Modifier une carte
 * DELETE /api/student/cards/[id] - Supprimer une carte
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getStudentProfileId,
  verifyCardOwnership,
} from '@/lib/api/student-helpers';
import { StudentCardType } from '@prisma/client';

type RouteParams = { params: Promise<{ id: string }> };

// ============================================================================
// GET - Détail d'une carte avec fichiers et quiz
// ============================================================================
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: cardId } = await params;
    
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

    // Vérifier ownership
    const isOwner = await verifyCardOwnership(cardId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Carte non trouvée' },
        { status: 404 }
      );
    }

    const card = await prisma.studentCard.findUnique({
      where: { id: cardId },
      include: {
        Files: {
          select: {
            id: true,
            filename: true,
            fileType: true,
            url: true,
            createdAt: true,
          },
        },
        Quiz: {
          include: {
            Attempts: {
              orderBy: { completedAt: 'desc' },
              take: 5,
              select: {
                id: true,
                score: true,
                completedAt: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Carte non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: card.id,
        title: card.title,
        content: card.content,
        cardType: card.cardType,
        orderIndex: card.orderIndex,
        files: card.Files,
        quiz: card.Quiz
          ? {
              id: card.Quiz.id,
              questions: card.Quiz.questions,
              aiGenerated: card.Quiz.aiGenerated,
              attempts: card.Quiz.Attempts,
              createdAt: card.Quiz.createdAt,
            }
          : null,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      },
    });
  } catch (error) {
    console.error('[GET /api/student/cards/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Modifier une carte
// ============================================================================
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id: cardId } = await params;
    
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

    // Vérifier ownership
    const isOwner = await verifyCardOwnership(cardId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Carte non trouvée' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content, cardType, orderIndex } = body;

    // Validation
    if (title !== undefined && title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Le titre doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    // Valider le cardType si fourni (aligné sur les types professeur + NOTE)
    const validTypes: StudentCardType[] = ['NOTE', 'LESSON', 'VIDEO', 'EXERCISE', 'QUIZ'];
    if (cardType !== undefined && !validTypes.includes(cardType)) {
      return NextResponse.json(
        { success: false, error: 'Type de carte invalide' },
        { status: 400 }
      );
    }

    const updated = await prisma.studentCard.update({
      where: { id: cardId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(cardType !== undefined && { cardType }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        cardType: updated.cardType,
        orderIndex: updated.orderIndex,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error('[PUT /api/student/cards/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Supprimer une carte (cascade fichiers et quiz)
// ============================================================================
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: cardId } = await params;
    
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

    // Vérifier ownership
    const isOwner = await verifyCardOwnership(cardId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Carte non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer (cascade défini dans le schéma Prisma)
    await prisma.studentCard.delete({
      where: { id: cardId },
    });

    return NextResponse.json({
      success: true,
      message: 'Carte supprimée',
    });
  } catch (error) {
    console.error('[DELETE /api/student/cards/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

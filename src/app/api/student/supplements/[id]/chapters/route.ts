/**
 * API Chapitres Élève - Liste et création
 * GET  /api/student/supplements/[id]/chapters - Liste les chapitres d'un supplément
 * POST /api/student/supplements/[id]/chapters - Créer un nouveau chapitre
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getStudentProfileId,
  verifySupplementOwnership,
  generateStudentId,
} from '@/lib/api/student-helpers';

type RouteParams = { params: Promise<{ id: string }> };

// ============================================================================
// GET - Liste des chapitres d'un supplément
// ============================================================================
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: supplementId } = await params;
    
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

    // Vérifier ownership du supplément
    const isOwner = await verifySupplementOwnership(supplementId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Supplément non trouvé' },
        { status: 404 }
      );
    }

    const chapters = await prisma.studentChapter.findMany({
      where: { supplementId },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: { select: { Cards: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        description: ch.description,
        orderIndex: ch.orderIndex,
        cardCount: ch._count.Cards,
        createdAt: ch.createdAt,
      })),
    });
  } catch (error) {
    console.error('[GET /api/student/supplements/[id]/chapters] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Créer un nouveau chapitre
// ============================================================================
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: supplementId } = await params;
    
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

    // Vérifier ownership du supplément
    const isOwner = await verifySupplementOwnership(supplementId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Supplément non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    // Validation
    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Le titre doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    // Calculer le prochain orderIndex
    const lastChapter = await prisma.studentChapter.findFirst({
      where: { supplementId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    const nextOrderIndex = (lastChapter?.orderIndex ?? -1) + 1;

    const chapter = await prisma.studentChapter.create({
      data: {
        id: generateStudentId('sch'),
        supplementId,
        title: title.trim(),
        description: description?.trim() || null,
        orderIndex: nextOrderIndex,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex,
        cardCount: 0,
        createdAt: chapter.createdAt,
      },
    });
  } catch (error) {
    console.error('[POST /api/student/supplements/[id]/chapters] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

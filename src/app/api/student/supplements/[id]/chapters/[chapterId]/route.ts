/**
 * API Chapitre Élève - CRUD individuel
 * PUT    /api/student/supplements/[id]/chapters/[chapterId] - Modifier
 * DELETE /api/student/supplements/[id]/chapters/[chapterId] - Supprimer
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getStudentProfileId,
  verifySupplementOwnership,
} from '@/lib/api/student-helpers';

type RouteParams = { params: Promise<{ id: string; chapterId: string }> };

// ============================================================================
// PUT - Modifier un chapitre
// ============================================================================
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id: supplementId, chapterId } = await params;
    
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

    // Vérifier que le chapitre appartient bien au supplément
    const chapter = await prisma.studentChapter.findFirst({
      where: { id: chapterId, supplementId },
      select: { id: true },
    });
    if (!chapter) {
      return NextResponse.json(
        { success: false, error: 'Chapitre non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, orderIndex } = body;

    // Validation
    if (title !== undefined && title.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Le titre doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    const updated = await prisma.studentChapter.update({
      where: { id: chapterId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        orderIndex: updated.orderIndex,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error('[PUT /api/student/supplements/[id]/chapters/[chapterId]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE - Supprimer un chapitre (cascade les cartes)
// ============================================================================
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: supplementId, chapterId } = await params;
    
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

    // Vérifier que le chapitre appartient bien au supplément
    const chapter = await prisma.studentChapter.findFirst({
      where: { id: chapterId, supplementId },
      select: { id: true },
    });
    if (!chapter) {
      return NextResponse.json(
        { success: false, error: 'Chapitre non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer (cascade défini dans le schéma Prisma)
    await prisma.studentChapter.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({
      success: true,
      message: 'Chapitre supprimé',
    });
  } catch (error) {
    console.error('[DELETE /api/student/supplements/[id]/chapters/[chapterId]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

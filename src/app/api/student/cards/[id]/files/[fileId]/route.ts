/**
 * API File Élève - Suppression d'un fichier
 * DELETE /api/student/cards/[id]/files/[fileId] - Supprimer un fichier
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getStudentProfileId,
  verifyCardOwnership,
} from '@/lib/api/student-helpers';
import { unlink } from 'fs/promises';
import path from 'path';

type RouteParams = { params: Promise<{ id: string; fileId: string }> };

// ============================================================================
// DELETE - Supprimer un fichier
// ============================================================================
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id: cardId, fileId } = await params;
    
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

    // Vérifier ownership de la carte
    const isOwner = await verifyCardOwnership(cardId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Carte non trouvée' },
        { status: 404 }
      );
    }

    // Récupérer le fichier
    const file = await prisma.studentFile.findFirst({
      where: { id: fileId, cardId },
      select: { id: true, url: true },
    });

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Fichier non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer le fichier physique
    try {
      const filePath = path.join(process.cwd(), 'public', file.url);
      await unlink(filePath);
    } catch {
      // Ignorer si le fichier n'existe pas physiquement
      console.warn(`[DELETE file] Fichier physique non trouvé: ${file.url}`);
    }

    // Supprimer l'entrée en base
    await prisma.studentFile.delete({
      where: { id: fileId },
    });

    return NextResponse.json({
      success: true,
      message: 'Fichier supprimé',
    });
  } catch (error) {
    console.error('[DELETE /api/student/cards/[id]/files/[fileId]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

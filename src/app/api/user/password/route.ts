// =============================================================================
// API CHANGEMENT MOT DE PASSE
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PasswordChangePayload } from '@/types/profile';

// -----------------------------------------------------------------------------
// PUT /api/user/password - Changer le mot de passe
// -----------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body: PasswordChangePayload = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validation des champs requis
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Les nouveaux mots de passe ne correspondent pas' },
        { status: 400 }
      );
    }

    // Vérifier la longueur du nouveau mot de passe
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec son hash actuel
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe actuel incorrect' },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Mot de passe modifié avec succès' 
    });
  } catch (error) {
    console.error('[API] PUT /api/user/password error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

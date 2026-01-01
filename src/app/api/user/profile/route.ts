// =============================================================================
// API PROFIL UTILISATEUR - GET / PUT
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileData, ProfileUpdatePayload } from '@/types/profile';

// -----------------------------------------------------------------------------
// GET /api/user/profile - Récupérer le profil de l'utilisateur connecté
// -----------------------------------------------------------------------------

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const profileData: ProfileData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };

    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error('[API] GET /api/user/profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// PUT /api/user/profile - Mettre à jour le profil
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

    const body: ProfileUpdatePayload = await request.json();

    // Validation basique
    if (body.firstName !== undefined && body.firstName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Le prénom doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    if (body.lastName !== undefined && body.lastName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Le nom doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    // Construire l'objet de mise à jour (seulement les champs modifiables)
    const updateData: Partial<ProfileUpdatePayload> = {};
    
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.phone !== undefined) updateData.phone = body.phone || null;
    if (body.address !== undefined) updateData.address = body.address || null;
    if (body.city !== undefined) updateData.city = body.city || null;
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode || null;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    const profileData: ProfileData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      postalCode: updatedUser.postalCode,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      lastLogin: updatedUser.lastLogin,
    };

    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error('[API] PUT /api/user/profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

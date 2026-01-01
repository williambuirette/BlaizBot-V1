// =============================================================================
// API PARAMÈTRES UTILISATEUR - GET / PUT
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { DEFAULT_USER_SETTINGS, UserSettings } from '@/types/profile';

// -----------------------------------------------------------------------------
// GET /api/user/settings - Récupérer les paramètres
// Note: Pour la V1, les settings sont stockés côté client (localStorage)
// Cette route retourne les valeurs par défaut
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

    // V1: Retourne les settings par défaut
    // Les vrais settings sont gérés côté client via localStorage
    return NextResponse.json({ 
      success: true, 
      data: DEFAULT_USER_SETTINGS 
    });
  } catch (error) {
    console.error('[API] GET /api/user/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// PUT /api/user/settings - Mettre à jour les paramètres
// Note: Pour la V1, cette route valide simplement le format
// Les vrais settings sont persistés côté client via localStorage
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

    const body: UserSettings = await request.json();

    // Validation basique de la structure
    if (!body.notifications || !body.preferences) {
      return NextResponse.json(
        { success: false, error: 'Format de paramètres invalide' },
        { status: 400 }
      );
    }

    // Validation des valeurs
    const validLanguages = ['fr', 'en'];
    const validThemes = ['light', 'dark', 'system'];

    if (!validLanguages.includes(body.preferences.language)) {
      return NextResponse.json(
        { success: false, error: 'Langue non supportée' },
        { status: 400 }
      );
    }

    if (!validThemes.includes(body.preferences.theme)) {
      return NextResponse.json(
        { success: false, error: 'Thème non supporté' },
        { status: 400 }
      );
    }

    // V1: On retourne simplement success
    // Les vrais settings sont persistés côté client
    return NextResponse.json({ 
      success: true, 
      data: body,
      message: 'Paramètres enregistrés' 
    });
  } catch (error) {
    console.error('[API] PUT /api/user/settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

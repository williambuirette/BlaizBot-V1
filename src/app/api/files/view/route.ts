// src/app/api/files/view/route.ts
// API pour servir les fichiers avec Content-Disposition: inline (affichage)

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Path requis' }, { status: 400 });
    }

    // Sécurité : vérifier que le chemin est dans /uploads/
    if (!filePath.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Construire le chemin complet
    const fullPath = join(process.cwd(), 'public', filePath);

    // Vérifier que le fichier existe
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
    }

    // Lire le fichier
    const fileBuffer = await readFile(fullPath);

    // Déterminer le type MIME
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'json': 'application/json',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };

    const contentType = mimeTypes[extension] || 'application/octet-stream';

    // Retourner le fichier avec Content-Disposition: inline
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Erreur lecture fichier:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

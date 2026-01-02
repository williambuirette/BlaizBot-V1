import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { extractTextFromBuffer, isTextExtractable } from '@/lib/text-extractor';

// Configuration
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB pour documents
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB pour vidéos
const ALLOWED_TYPES = [
  // PDF
  'application/pdf',
  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  // Word
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  // Excel
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  // PowerPoint
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  // Texte
  'text/plain', // .txt
  'text/csv', // .csv
  // Vidéos
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  // Audio (pour podcasts NotebookLM)
  'audio/mpeg', // .mp3
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  // Fallback pour certains navigateurs
  'application/octet-stream',
  'application/x-msexcel',
  'application/x-excel',
];

// Types vidéo/audio
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
const AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

// Helper pour sanitize le nom de fichier
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

// Helper pour générer un ID unique
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que c'est un teacher ou admin
    if (!['TEACHER', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Déterminer la limite de taille selon le type
    const isVideo = VIDEO_TYPES.includes(file.type);
    const isAudio = AUDIO_TYPES.includes(file.type);
    const maxSize = (isVideo || isAudio) ? MAX_VIDEO_SIZE : MAX_SIZE;

    // Vérifier la taille
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Fichier trop volumineux. Maximum: ${maxSize / 1024 / 1024} MB` },
        { status: 400 }
      );
    }

    // Vérifier le type MIME
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé' },
        { status: 400 }
      );
    }

    // Créer le dossier uploads s'il n'existe pas
    const userUploadDir = join(UPLOAD_DIR, session.user.id);
    if (!existsSync(userUploadDir)) {
      await mkdir(userUploadDir, { recursive: true });
    }

    // Générer un nom unique
    const fileId = generateId();
    const ext = file.name.split('.').pop() || '';
    const sanitizedName = sanitizeFilename(file.name.replace(`.${ext}`, ''));
    const finalFilename = `${sanitizedName}-${fileId}.${ext}`;

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(userUploadDir, finalFilename);
    await writeFile(filePath, buffer);

    // Extraire le texte pour l'IA (RAG)
    let textContent: string | null = null;
    if (isTextExtractable(file.type)) {
      textContent = await extractTextFromBuffer(buffer, file.type, file.name);
      if (textContent) {
        console.log(`Texte extrait de ${file.name}: ${textContent.length} caractères`);
      }
    }

    // Déterminer le type de média
    const mediaType = isVideo ? 'video' : isAudio ? 'audio' : 'document';

    // URL publique
    const publicUrl = `/uploads/${session.user.id}/${finalFilename}`;

    return NextResponse.json({
      id: fileId,
      filename: file.name,
      url: publicUrl,
      size: file.size,
      type: file.type,
      mediaType, // 'video', 'audio' ou 'document'
      textContent: textContent, // Texte extrait pour l'IA
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 });
  }
}

// GET : Lister les fichiers de l'utilisateur (optionnel)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Pour l'instant, retourner une liste vide
    // On pourrait scanner le dossier ou utiliser la BDD
    return NextResponse.json({ files: [] });
  } catch (error) {
    console.error('Erreur GET upload:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

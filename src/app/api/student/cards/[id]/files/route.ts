/**
 * API Files Élève - Upload de fichiers pour une carte
 * POST /api/student/cards/[id]/files - Upload un fichier
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  getStudentProfileId,
  verifyCardOwnership,
  generateStudentId,
} from '@/lib/api/student-helpers';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

type RouteParams = { params: Promise<{ id: string }> };

// Types de fichiers supportés
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.mp4', '.webm', '.mov', '.avi',
  '.mp3', '.wav', '.ogg',
  '.txt', '.md', '.json',
];

function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (['.pdf'].includes(ext)) return 'pdf';
  if (['.doc', '.docx'].includes(ext)) return 'word';
  if (['.xls', '.xlsx'].includes(ext)) return 'excel';
  if (['.ppt', '.pptx'].includes(ext)) return 'powerpoint';
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext)) return 'image';
  if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg'].includes(ext)) return 'audio';
  return 'other';
}

// ============================================================================
// POST - Upload un fichier pour une carte
// ============================================================================
export async function POST(request: Request, { params }: RouteParams) {
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

    // Vérifier ownership de la carte
    const isOwner = await verifyCardOwnership(cardId, studentId);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Carte non trouvée' },
        { status: 404 }
      );
    }

    // Parser le FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier l'extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { success: false, error: `Extension non autorisée: ${ext}` },
        { status: 400 }
      );
    }

    // Vérifier la taille (100 MB max)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Fichier trop volumineux (max 100 MB)' },
        { status: 400 }
      );
    }

    // Créer le dossier de destination
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'student',
      studentId,
      cardId
    );
    await mkdir(uploadDir, { recursive: true });

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFilename = `${timestamp}-${safeFilename}`;
    const filePath = path.join(uploadDir, finalFilename);

    // Écrire le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // URL relative pour l'accès public
    const url = `/uploads/student/${studentId}/${cardId}/${finalFilename}`;

    // Créer l'entrée en base
    const studentFile = await prisma.studentFile.create({
      data: {
        id: generateStudentId('sfile'),
        cardId,
        filename: file.name,
        fileType: getFileType(file.name),
        url,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: studentFile.id,
        filename: studentFile.filename,
        fileType: studentFile.fileType,
        url: studentFile.url,
        createdAt: studentFile.createdAt,
      },
    });
  } catch (error) {
    console.error('[POST /api/student/cards/[id]/files] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// src/app/api/teacher/courses/[id]/files/route.ts
// API CRUD pour les fichiers globaux d'un cours (CourseFile)

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Configuration
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'courses');
const MAX_SIZE = 100 * 1024 * 1024; // 100 MB max

const ALLOWED_TYPES = [
  // PDF
  'application/pdf',
  // Images
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  // Word
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // PowerPoint
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Texte
  'text/plain', 'text/csv',
  // Vidéo
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  // Audio
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  // Fallback
  'application/octet-stream',
];

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

// Helper pour extraire le type de fichier
function getFileType(mimeType: string, filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || ext === 'doc' || ext === 'docx') return 'word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || ext === 'xls' || ext === 'xlsx') return 'excel';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || ext === 'ppt' || ext === 'pptx') return 'powerpoint';
  if (mimeType.includes('text') || ext === 'txt' || ext === 'csv') return 'text';
  
  return 'other';
}

// Helper pour vérifier ownership du cours
async function verifyCourseOwnership(courseId: string, userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
  });
  if (!teacherProfile) return null;

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId: teacherProfile.id,
    },
  });
  return course;
}

// GET - Lister les fichiers du cours
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Vérifier que le prof possède ce cours
    const course = await verifyCourseOwnership(courseId, session.user.id);
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Récupérer les fichiers
    const files = await prisma.courseFile.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, files });
  } catch (error) {
    console.error('Erreur GET course files:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Uploader un fichier
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { id: courseId } = await params;

    // Vérifier que le prof possède ce cours
    const course = await verifyCourseOwnership(courseId, session.user.id);
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Vérifier le type
    if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
      return NextResponse.json(
        { error: `Type de fichier non autorisé: ${file.type}` },
        { status: 400 }
      );
    }

    // Vérifier la taille
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux (max 100 MB)' },
        { status: 400 }
      );
    }

    // Créer le dossier si nécessaire
    const courseUploadDir = join(UPLOAD_DIR, courseId);
    if (!existsSync(courseUploadDir)) {
      await mkdir(courseUploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const sanitizedName = sanitizeFilename(file.name);
    const uniqueFilename = `${generateId()}-${sanitizedName}`;
    const filePath = join(courseUploadDir, uniqueFilename);

    // Sauvegarder le fichier
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // URL publique
    const publicUrl = `/uploads/courses/${courseId}/${uniqueFilename}`;

    // Créer l'entrée en BDD
    const courseFile = await prisma.courseFile.create({
      data: {
        id: `file-${generateId()}`,
        courseId,
        filename: file.name,
        fileType: getFileType(file.type, file.name),
        url: publicUrl,
      },
    });

    return NextResponse.json({ success: true, file: courseFile });
  } catch (error) {
    console.error('Erreur POST course file:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un fichier
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: courseId } = await params;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'fileId requis' }, { status: 400 });
    }

    // Vérifier que le prof possède ce cours
    const course = await verifyCourseOwnership(courseId, session.user.id);
    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Récupérer le fichier
    const courseFile = await prisma.courseFile.findFirst({
      where: { id: fileId, courseId },
    });

    if (!courseFile) {
      return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
    }

    // Supprimer le fichier physique
    try {
      const filePath = join(process.cwd(), 'public', courseFile.url);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch {
      console.warn('Impossible de supprimer le fichier physique');
    }

    // Supprimer l'entrée BDD
    await prisma.courseFile.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE course file:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

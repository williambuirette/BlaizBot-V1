// src/app/api/teacher/courses/[id]/resources/route.ts
// API CRUD pour les ressources d'un cours (base de connaissances)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ResourceType } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Vérifier que le cours appartient au prof
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

// GET : Liste les ressources d'un cours
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: courseId } = await context.params;
    const course = await verifyCourseOwnership(courseId, userId);

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé ou accès non autorisé' }, { status: 404 });
    }

    // Filtrage optionnel par type
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type') as ResourceType | null;

    const whereClause: { courseId: string; type?: ResourceType } = { courseId };
    if (typeFilter && ['LINK', 'YOUTUBE', 'PDF', 'DOCUMENT', 'EXCEL', 'POWERPOINT', 'IMAGE'].includes(typeFilter)) {
      whereClause.type = typeFilter;
    }

    const resources = await prisma.resource.findMany({
      where: whereClause,
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Erreur GET resources:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST : Créer une ressource
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: courseId } = await context.params;
    const course = await verifyCourseOwnership(courseId, userId);

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, type, url, fileUrl } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 });
    }

    // Valider le type
    const validTypes: ResourceType[] = ['LINK', 'YOUTUBE', 'PDF', 'DOCUMENT', 'EXCEL', 'POWERPOINT', 'IMAGE'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Type de ressource invalide' }, { status: 400 });
    }

    // Valider url/fileUrl selon le type
    if (['LINK', 'YOUTUBE'].includes(type) && !url?.trim()) {
      return NextResponse.json({ error: 'URL requise pour ce type de ressource' }, { status: 400 });
    }

    if (['PDF', 'DOCUMENT', 'EXCEL', 'POWERPOINT', 'IMAGE'].includes(type) && !fileUrl?.trim()) {
      return NextResponse.json({ error: 'Fichier requis pour ce type de ressource' }, { status: 400 });
    }

    // Calculer l'ordre (max + 1 pour ce type)
    const maxOrder = await prisma.resource.aggregate({
      where: { courseId, type },
      _max: { order: true },
    });

    const newOrder = (maxOrder._max.order ?? -1) + 1;

    const resource = await prisma.resource.create({
      data: {
        id: crypto.randomUUID(),
        courseId,
        title: title.trim(),
        description: description?.trim() || null,
        type,
        url: url?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        order: newOrder,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Erreur POST resource:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

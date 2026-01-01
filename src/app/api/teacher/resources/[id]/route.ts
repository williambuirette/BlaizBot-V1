// src/app/api/teacher/resources/[id]/route.ts
// API pour une ressource spécifique (GET, PUT, DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ResourceType } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Vérifier que la ressource appartient au prof
async function verifyResourceOwnership(resourceId: string, userId: string) {
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId },
  });

  if (!teacherProfile) return null;

  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      Course: {
        teacherId: teacherProfile.id,
      },
    },
    include: {
      Course: {
        select: { id: true, title: true },
      },
    },
  });

  return resource;
}

// GET : Détails d'une ressource
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

    const { id: resourceId } = await context.params;
    const resource = await verifyResourceOwnership(resourceId, userId);

    if (!resource) {
      return NextResponse.json({ error: 'Ressource non trouvée ou accès non autorisé' }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Erreur GET resource:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier une ressource
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: resourceId } = await context.params;
    const resource = await verifyResourceOwnership(resourceId, userId);

    if (!resource) {
      return NextResponse.json({ error: 'Ressource non trouvée ou accès non autorisé' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, type, url, fileUrl, order } = body;

    // Construire les données à mettre à jour
    const updateData: {
      title?: string;
      description?: string | null;
      type?: ResourceType;
      url?: string | null;
      fileUrl?: string | null;
      order?: number;
    } = {};

    if (title !== undefined) {
      if (!title?.trim()) {
        return NextResponse.json({ error: 'Le titre ne peut pas être vide' }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (type !== undefined) {
      const validTypes: ResourceType[] = ['LINK', 'YOUTUBE', 'PDF', 'IMAGE'];
      if (validTypes.includes(type)) {
        updateData.type = type;
      }
    }

    if (url !== undefined) {
      updateData.url = url?.trim() || null;
    }

    if (fileUrl !== undefined) {
      updateData.fileUrl = fileUrl?.trim() || null;
    }

    if (order !== undefined && typeof order === 'number') {
      updateData.order = order;
    }

    const updatedResource = await prisma.resource.update({
      where: { id: resourceId },
      data: updateData,
      include: {
        Course: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    console.error('Erreur PUT resource:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer une ressource
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }

    const { id: resourceId } = await context.params;
    const resource = await verifyResourceOwnership(resourceId, userId);

    if (!resource) {
      return NextResponse.json({ error: 'Ressource non trouvée ou accès non autorisé' }, { status: 404 });
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });

    return NextResponse.json({ success: true, message: 'Ressource supprimée' });
  } catch (error) {
    console.error('Erreur DELETE resource:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

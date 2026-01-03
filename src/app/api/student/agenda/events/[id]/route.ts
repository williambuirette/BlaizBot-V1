// src/app/api/student/agenda/events/[id]/route.ts
// API GET/PUT/DELETE - Gestion d'un événement personnel

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET : Détail d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    // Vérifier propriété
    if (event.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Erreur GET /api/student/agenda/events/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT : Modifier un événement personnel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Vérifier propriété
    const existing = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // Vérifier que c'est bien un événement personnel (pas du prof)
    if (existing.isTeacherEvent) {
      return NextResponse.json({ error: 'Impossible de modifier un événement professeur' }, { status: 403 });
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.title !== undefined) {
      if (!body.title?.trim()) {
        return NextResponse.json({ error: 'Le titre est obligatoire' }, { status: 400 });
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.startDate !== undefined) {
      const start = new Date(body.startDate);
      if (isNaN(start.getTime())) {
        return NextResponse.json({ error: 'Date de début invalide' }, { status: 400 });
      }
      updateData.startDate = start;
    }

    if (body.endDate !== undefined) {
      const end = new Date(body.endDate);
      if (isNaN(end.getTime())) {
        return NextResponse.json({ error: 'Date de fin invalide' }, { status: 400 });
      }
      updateData.endDate = end;
    }

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erreur PUT /api/student/agenda/events/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE : Supprimer un événement personnel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier propriété
    const existing = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    if (existing.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }

    // Vérifier que c'est bien un événement personnel
    if (existing.isTeacherEvent) {
      return NextResponse.json({ error: 'Impossible de supprimer un événement professeur' }, { status: 403 });
    }

    await prisma.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/student/agenda/events/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

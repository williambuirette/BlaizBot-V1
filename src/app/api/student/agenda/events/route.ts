// src/app/api/student/agenda/events/route.ts
// API POST - Créer un événement personnel

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, startDate, endDate } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Le titre est obligatoire' }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Les dates sont obligatoires' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Dates invalides' }, { status: 400 });
    }

    if (end < start) {
      return NextResponse.json({ error: 'La date de fin doit être après la date de début' }, { status: 400 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        id: randomUUID(),
        ownerId: session.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        startDate: start,
        endDate: end,
        isTeacherEvent: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    console.error('Erreur POST /api/student/agenda/events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

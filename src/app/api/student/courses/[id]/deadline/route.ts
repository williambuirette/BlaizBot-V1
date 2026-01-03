// src/app/api/student/courses/[id]/deadline/route.ts
// API pour gérer la deadline personnelle d'un cours pour l'élève

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Récupérer la deadline personnelle du cours
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id: courseId } = await params;

    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Chercher un CalendarEvent lié à ce cours (via title pattern)
    const personalDeadline = await prisma.calendarEvent.findFirst({
      where: {
        ownerId: userId,
        isTeacherEvent: false,
        title: { startsWith: `[COURS:${courseId}]` },
      },
    });

    // Chercher aussi la deadline du prof (CourseAssignment)
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { classId: true },
    });

    const teacherAssignment = await prisma.courseAssignment.findFirst({
      where: {
        courseId,
        OR: [
          { classId: studentProfile?.classId },
          { studentId: userId },
        ],
        dueDate: { not: null },
      },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        title: true,
        dueDate: true,
        startDate: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        personal: personalDeadline
          ? {
              id: personalDeadline.id,
              startDate: personalDeadline.startDate.toISOString(),
              endDate: personalDeadline.endDate.toISOString(),
              description: personalDeadline.description,
            }
          : null,
        teacher: teacherAssignment
          ? {
              id: teacherAssignment.id,
              title: teacherAssignment.title,
              startDate: teacherAssignment.startDate?.toISOString() || null,
              dueDate: teacherAssignment.dueDate?.toISOString() || null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Erreur GET deadline:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT - Créer ou modifier la deadline personnelle
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id: courseId } = await params;

    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { startDate, endDate, description } = body;

    if (!endDate) {
      return NextResponse.json({ error: 'Date de fin requise' }, { status: 400 });
    }

    // Récupérer le cours pour le titre
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Cours non trouvé' }, { status: 404 });
    }

    // Chercher si une deadline existe déjà
    const existingDeadline = await prisma.calendarEvent.findFirst({
      where: {
        ownerId: userId,
        isTeacherEvent: false,
        title: { startsWith: `[COURS:${courseId}]` },
      },
    });

    const eventTitle = `[COURS:${courseId}] ${course.title}`;
    const eventData = {
      title: eventTitle,
      description: description || `Deadline personnelle pour ${course.title}`,
      startDate: startDate ? new Date(startDate) : new Date(endDate),
      endDate: new Date(endDate),
      updatedAt: new Date(),
    };

    let deadline;

    if (existingDeadline) {
      // Mise à jour
      deadline = await prisma.calendarEvent.update({
        where: { id: existingDeadline.id },
        data: eventData,
      });
    } else {
      // Création
      deadline = await prisma.calendarEvent.create({
        data: {
          id: `deadline-${courseId}-${userId}`,
          ownerId: userId,
          isTeacherEvent: false,
          ...eventData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: deadline.id,
        startDate: deadline.startDate.toISOString(),
        endDate: deadline.endDate.toISOString(),
        description: deadline.description,
      },
    });
  } catch (error) {
    console.error('Erreur PUT deadline:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer la deadline personnelle
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id: courseId } = await params;

    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Chercher et supprimer
    const existingDeadline = await prisma.calendarEvent.findFirst({
      where: {
        ownerId: userId,
        isTeacherEvent: false,
        title: { startsWith: `[COURS:${courseId}]` },
      },
    });

    if (existingDeadline) {
      await prisma.calendarEvent.delete({
        where: { id: existingDeadline.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE deadline:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

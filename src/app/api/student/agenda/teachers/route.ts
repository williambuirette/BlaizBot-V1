// src/app/api/student/agenda/teachers/route.ts
// API GET - Liste des profs assignés à la classe de l'élève

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = session.user.id;

    // Trouver le profil élève pour avoir la classId
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { classId: true },
    });

    if (!studentProfile?.classId) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Récupérer la classe avec ses profs assignés (relation TeacherClasses)
    const classWithTeachers = await prisma.class.findUnique({
      where: { id: studentProfile.classId },
      select: {
        TeacherProfile: {
          select: {
            id: true,
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!classWithTeachers?.TeacherProfile?.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({
      success: true,
      data: classWithTeachers.TeacherProfile.map((tp) => ({
        id: tp.id,
        firstName: tp.User.firstName || 'Prof',
        lastName: tp.User.lastName || '',
      })),
    });
  } catch (error) {
    console.error('Erreur GET /api/student/agenda/teachers:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    );
  }
}
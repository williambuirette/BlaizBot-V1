/**
 * API Cours disponibles pour l'élève
 * GET /api/student/available-courses - Liste des cours assignés à la classe de l'élève
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, classId: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Profil élève non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les cours assignés à la classe de l'élève
    const assignments = await prisma.courseAssignment.findMany({
      where: {
        classId: student.classId,
      },
      select: {
        Course: {
          select: {
            id: true,
            title: true,
            subjectId: true,
            Subject: { select: { id: true, name: true } },
            TeacherProfile: {
              select: {
                id: true,
                User: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
      distinct: ['courseId'],
    });

    const courses = assignments
      .filter((a) => a.Course)
      .map((a) => ({
        id: a.Course!.id,
        title: a.Course!.title,
        subject: a.Course!.Subject ? {
          id: a.Course!.Subject.id,
          name: a.Course!.Subject.name,
        } : null,
        teacherId: a.Course!.TeacherProfile?.id || null,
        teacher: a.Course!.TeacherProfile?.User
          ? `${a.Course!.TeacherProfile.User.firstName} ${a.Course!.TeacherProfile.User.lastName}`
          : null,
      }));

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('[GET /api/student/available-courses] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

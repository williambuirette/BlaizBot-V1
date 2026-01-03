// src/app/api/student/agenda/filter-options/route.ts
// API GET - Options de filtrage pour l'agenda élève (profs, matières, cours)

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

    // Trouver la classe de l'élève
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
      select: { classId: true },
    });

    if (!studentProfile?.classId) {
      return NextResponse.json({ success: true, data: { teachers: [], subjects: [], courses: [] } });
    }

    // Récupérer les profs de la classe avec leurs matières et cours
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
            // Matières enseignées par ce prof
            Subject: {
              select: {
                id: true,
                name: true,
              },
            },
            // Cours créés par ce prof
            Course: {
              select: {
                id: true,
                title: true,
                subjectId: true,
              },
            },
          },
        },
      },
    });

    if (!classWithTeachers?.TeacherProfile?.length) {
      return NextResponse.json({ success: true, data: { teachers: [], subjects: [], courses: [] } });
    }

    // Structurer les données
    const teachers = classWithTeachers.TeacherProfile.map((tp) => ({
      id: tp.id,
      firstName: tp.User.firstName || 'Prof',
      lastName: tp.User.lastName || '',
      // Matières enseignées par ce prof
      subjectIds: tp.Subject.map((s) => s.id),
      // Cours de ce prof
      courseIds: tp.Course.map((c) => c.id),
    }));

    // Extraire toutes les matières uniques
    const subjectsMap = new Map<string, { id: string; name: string; teacherIds: string[] }>();
    for (const tp of classWithTeachers.TeacherProfile) {
      for (const s of tp.Subject) {
        if (!subjectsMap.has(s.id)) {
          subjectsMap.set(s.id, { id: s.id, name: s.name, teacherIds: [] });
        }
        subjectsMap.get(s.id)!.teacherIds.push(tp.id);
      }
    }
    const subjects = Array.from(subjectsMap.values());

    // Extraire tous les cours uniques
    const coursesMap = new Map<string, { id: string; title: string; subjectId: string; teacherId: string }>();
    for (const tp of classWithTeachers.TeacherProfile) {
      for (const c of tp.Course) {
        if (!coursesMap.has(c.id)) {
          coursesMap.set(c.id, {
            id: c.id,
            title: c.title,
            subjectId: c.subjectId,
            teacherId: tp.id,
          });
        }
      }
    }
    const courses = Array.from(coursesMap.values());

    return NextResponse.json({
      success: true,
      data: {
        teachers,
        subjects,
        courses,
      },
    });
  } catch (error) {
    console.error('Erreur GET /api/student/agenda/filter-options:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(error) },
      { status: 500 }
    );
  }
}

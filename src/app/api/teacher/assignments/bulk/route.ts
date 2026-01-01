import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

interface BulkAssignment {
  courseId: string;
  sectionId?: string;
  studentId: string;
  classId?: string;
  targetType: 'CLASS' | 'TEAM' | 'STUDENT';
  title: string;
  instructions?: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le profil enseignant
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { success: false, error: 'Profil enseignant non trouvé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { assignments } = body as { assignments: BulkAssignment[] };

    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune assignation fournie' },
        { status: 400 }
      );
    }

    // Créer les assignations et progressions en transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdAssignments = [];
      
      for (const assignment of assignments) {
        const assignmentId = randomUUID();
        
        // 1. Créer l'assignation
        const created = await tx.courseAssignment.create({
          data: {
            id: assignmentId,
            teacherId: teacherProfile.id,
            courseId: assignment.courseId || null,
            sectionId: assignment.sectionId || null,
            studentId: assignment.studentId,
            classId: assignment.classId || null,
            targetType: assignment.targetType,
            title: assignment.title,
            instructions: assignment.instructions || null,
            dueDate: new Date(assignment.dueDate),
            priority: assignment.priority,
            updatedAt: new Date(),
          },
        });
        
        // 2. Créer le StudentProgress associé (pour que l'assignation apparaisse chez l'élève)
        await tx.studentProgress.create({
          data: {
            id: randomUUID(),
            studentId: assignment.studentId,
            sectionId: assignment.sectionId || null,
            assignmentId: assignmentId,
            status: 'NOT_STARTED',
            timeSpent: 0,
            updatedAt: new Date(),
          },
        });
        
        createdAssignments.push(created);
      }
      
      return createdAssignments;
    });

    return NextResponse.json({
      success: true,
      data: {
        count: result.length,
        assignments: result,
      },
    });
  } catch (error) {
    console.error('Erreur création bulk assignations:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création des assignations' },
      { status: 500 }
    );
  }
}

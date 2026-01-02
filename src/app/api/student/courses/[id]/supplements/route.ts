/**
 * API pour récupérer les suppléments d'un élève liés à un cours spécifique
 * GET /api/student/courses/[id]/supplements
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { id: courseId } = await params;

    // Récupérer le profil étudiant
    const student = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Profil étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les suppléments liés à ce cours (via table de jonction many-to-many)
    const supplements = await prisma.studentSupplement.findMany({
      where: {
        studentId: student.id,
        Courses: {
          some: {
            courseId: courseId,
          },
        },
      },
      include: {
        Chapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            Cards: {
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                cardType: true,
                content: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Formater la réponse avec chapitres et cartes
    const formattedSupplements = supplements.map((supp) => ({
      id: supp.id,
      title: supp.title,
      description: supp.description,
      chapterCount: supp.Chapters.length,
      cardCount: supp.Chapters.reduce((acc, ch) => acc + ch.Cards.length, 0),
      chapters: supp.Chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        cards: ch.Cards.map((card) => ({
          id: card.id,
          title: card.title,
          cardType: card.cardType,
          content: card.content,
        })),
      })),
      updatedAt: supp.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedSupplements,
    });
  } catch (error) {
    console.error('Erreur GET supplements pour cours:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

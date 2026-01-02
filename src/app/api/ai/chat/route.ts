// src/app/api/ai/chat/route.ts
// API de chat avec l'assistant IA - Supporte RAG avec les fichiers du cours

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { randomUUID } from 'crypto';

// Types
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  sessionId?: string | null;
  courseId?: string;       // Pour récupérer les fichiers du cours
  sectionId?: string;      // Pour contexte plus précis
  contextType?: 'QUIZ' | 'EXERCISE' | 'REVISION' | 'GENERAL';
}

// Récupérer le contenu des fichiers d'un cours pour RAG
async function getCourseFilesContent(courseId: string): Promise<string> {
  const files = await prisma.sectionFile.findMany({
    where: {
      textContent: { not: null },
      Section: {
        Chapter: {
          courseId: courseId,
        },
      },
    },
    select: {
      filename: true,
      textContent: true,
      Section: {
        select: {
          title: true,
          Chapter: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    take: 10, // Limiter pour éviter de surcharger le contexte
  });

  if (files.length === 0) return '';

  const context = files
    .map(
      (f) =>
        `--- Document: ${f.filename} (${f.Section.Chapter.title} > ${f.Section.title}) ---\n${f.textContent}`
    )
    .join('\n\n');

  return context;
}

// Récupérer les infos du cours (titre, description, objectif IA)
async function getCourseContext(courseId: string): Promise<string> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      description: true,
      aiObjective: true,
      Subject: { select: { name: true } },
    },
  });

  if (!course) return '';

  let ctx = `Cours: ${course.title}`;
  if (course.Subject) ctx += ` (Matière: ${course.Subject.name})`;
  if (course.description) ctx += `\nDescription: ${course.description}`;
  if (course.aiObjective) ctx += `\nObjectif pédagogique IA: ${course.aiObjective}`;

  return ctx;
}

// Récupérer le contexte d'une section spécifique
async function getSectionContext(sectionId: string): Promise<string> {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: {
      title: true,
      type: true,
      content: true,
      Chapter: {
        select: {
          title: true,
          Course: {
            select: { title: true },
          },
        },
      },
    },
  });

  if (!section) return '';

  let ctx = `Section actuelle: ${section.title} (${section.type})`;
  ctx += `\nChapitre: ${section.Chapter.title}`;
  ctx += `\nCours: ${section.Chapter.Course.title}`;

  return ctx;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { messages, sessionId, courseId, sectionId, contextType } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 });
    }

    // Récupérer les settings IA
    const aiSettings = await prisma.aISettings.findFirst();
    if (!aiSettings) {
      return NextResponse.json(
        { error: 'Configuration IA non trouvée' },
        { status: 500 }
      );
    }

    // Construire le contexte RAG
    let ragContext = '';
    let courseInfo = '';
    let sectionInfo = '';

    if (courseId) {
      // Récupérer les fichiers du cours
      const filesContent = await getCourseFilesContent(courseId);
      if (filesContent) {
        ragContext = `\n\n=== DOCUMENTS DU COURS ===\n${filesContent}\n=== FIN DOCUMENTS ===\n`;
      }

      // Récupérer les infos du cours
      courseInfo = await getCourseContext(courseId);
    }

    if (sectionId) {
      sectionInfo = await getSectionContext(sectionId);
    }

    // System prompt
    const systemPrompt = `Tu es un assistant pédagogique intelligent pour la plateforme ${aiSettings.platformName}.

Ton rôle est d'aider les élèves à apprendre de manière efficace et bienveillante.

RÈGLES:
1. Réponds toujours en français
2. Adapte tes explications au niveau de l'élève
3. Si des documents de cours sont fournis, utilise-les pour enrichir tes réponses
4. Pour les quiz/exercices, guide l'élève sans donner directement les réponses
5. Encourage l'autonomie et la réflexion

${courseInfo ? `\n=== CONTEXTE DU COURS ===\n${courseInfo}` : ''}
${sectionInfo ? `\n=== SECTION ACTUELLE ===\n${sectionInfo}` : ''}
${ragContext}`;

    // Préparer les messages pour Claude
    const anthropicMessages = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Appel à l'API Claude
    const anthropic = new Anthropic({
      apiKey: aiSettings.apiKey,
    });

    const response = await anthropic.messages.create({
      model: aiSettings.model || 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    // Extraire la réponse
    const firstContent = response.content[0];
    const assistantContent =
      firstContent && firstContent.type === 'text'
        ? firstContent.text
        : 'Désolé, je n\'ai pas pu générer de réponse.';

    // Créer ou mettre à jour la session chat
    let chatSessionId = sessionId;
    const allMessages = [
      ...messages,
      { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() },
    ];

    if (!chatSessionId) {
      // Nouvelle session
      chatSessionId = randomUUID();
      await prisma.aIChat.create({
        data: {
          id: chatSessionId,
          userId: session.user.id,
          contextType: contextType || 'GENERAL',
          contextId: courseId || sectionId || null,
          messages: JSON.stringify(allMessages),
          updatedAt: new Date(),
        },
      });
    } else {
      // Mise à jour session existante
      await prisma.aIChat.update({
        where: { id: chatSessionId },
        data: {
          messages: JSON.stringify(allMessages),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: assistantContent,
      sessionId: chatSessionId,
      hasDocuments: !!ragContext, // Indique si des documents ont été utilisés
    });
  } catch (error) {
    console.error('Erreur chat IA:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération de la réponse' },
      { status: 500 }
    );
  }
}

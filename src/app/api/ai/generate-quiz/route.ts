// src/app/api/ai/generate-quiz/route.ts
// API pour générer des questions de quiz avec l'IA

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { geminiService } from '@/lib/ai/gemini';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswers: number[];
  explanation?: string;
}

interface QuizResponse {
  questions: QuizQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { topic, prompt, count = 5 } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });
    }

    const fullPrompt = `
      RÔLE:
      Tu es un assistant pédagogique spécialisé dans la création de quiz éducatifs.
      
      TÂCHE:
      Génère exactement ${count} questions à choix multiples en français.
      
      CONTEXTE:
      ${topic ? `Sujet du cours : ${topic}` : ''}
      Demande spécifique : ${prompt}

      FORMAT DE RÉPONSE OBLIGATOIRE (JSON valide) :
      {
        "questions": [
          {
            "id": "q-1",
            "question": "La question posée",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswers": [0],
            "explanation": "Explication de la bonne réponse"
          }
        ]
      }

      RÈGLES:
      - Chaque question doit avoir 4 options de réponse
      - correctAnswers contient les indices (0-3) des bonnes réponses
      - Une seule bonne réponse par question généralement
      - L'explication doit être claire et pédagogique
      - Adapter le niveau de difficulté au contexte donné
    `;

    const parsed = await geminiService.generateJson<QuizResponse>(fullPrompt);
    const questions: QuizQuestion[] = parsed.questions || [];

    // Valider et nettoyer les questions
    const validQuestions = questions
      .filter((q) => q.question && q.options?.length >= 2)
      .map((q, index) => ({
        id: `q-${Date.now()}-${index}`,
        question: q.question,
        options: q.options.slice(0, 6),
        correctAnswers: q.correctAnswers?.filter((i: number) => i >= 0 && i < q.options.length) || [0],
        explanation: q.explanation || undefined,
      }));

    return NextResponse.json({ questions: validQuestions });
  } catch (error) {
    console.error('Erreur génération quiz:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 });
  }
}

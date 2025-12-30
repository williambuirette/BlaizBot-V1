// src/app/api/ai/generate-exercise/route.ts
// API pour générer des exercices avec l'IA

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { geminiService } from '@/lib/ai/gemini';

interface ExerciseItem {
  id: string;
  question: string;
  answer: string;
  points?: number;
  hint?: string;
}

interface ExerciseResponse {
  instructions: string;
  items: ExerciseItem[];
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
      Tu es un assistant pédagogique spécialisé dans la création d'exercices éducatifs.
      
      TÂCHE:
      Génère exactement ${count} exercices en français avec leurs corrigés.
      
      CONTEXTE:
      ${topic ? `Sujet du cours : ${topic}` : ''}
      Demande spécifique : ${prompt}

      FORMAT DE RÉPONSE OBLIGATOIRE (JSON valide) :
      {
        "instructions": "Consignes générales pour l'exercice",
        "items": [
          {
            "id": "ex-1",
            "question": "L'énoncé de l'exercice",
            "answer": "La réponse attendue avec le développement si nécessaire",
            "points": 2,
            "hint": "Un indice optionnel pour aider l'élève"
          }
        ]
      }

      RÈGLES:
      - Les questions doivent être claires et précises
      - Les réponses doivent être complètes avec le raisonnement si nécessaire
      - Les points reflètent la difficulté (1-5 points)
      - Les indices sont optionnels mais utiles pour les questions difficiles
      - Adapter le niveau de difficulté au contexte donné
      - Varier les types d'exercices (calcul, rédaction, analyse, etc.)
    `;

    const parsed = await geminiService.generateJson<ExerciseResponse>(fullPrompt);
    
    const instructions = parsed.instructions || '';
    const items: ExerciseItem[] = parsed.items || [];

    // Valider et nettoyer les exercices
    const validItems = items
      .filter((item) => item.question && item.answer)
      .map((item, index) => ({
        id: `ex-${Date.now()}-${index}`,
        question: item.question,
        answer: item.answer,
        points: item.points || 1,
        hint: item.hint || undefined,
      }));

    return NextResponse.json({ instructions, items: validItems });
  } catch (error) {
    console.error('Erreur génération exercice:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 });
  }
}
